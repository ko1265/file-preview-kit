import { spawn } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const smokeRoot = path.join(repoRoot, "smoke", "consumer-smoke");
const templateDir = path.join(smokeRoot, "template");
const artifactsDir = path.join(smokeRoot, ".artifacts");
const workspaceRoot = path.join(smokeRoot, ".workspace");
const workspaceDir = path.join(workspaceRoot, `consumer-app-${Date.now()}`);
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const offline = process.argv.includes("--offline");
const tscCommand =
  process.platform === "win32"
    ? path.join(repoRoot, "node_modules", ".bin", "tsc.cmd")
    : path.join(repoRoot, "node_modules", ".bin", "tsc");

const publishablePackages = [
  {
    name: "@ko1265/file-preview-kit-shared",
    dir: path.join(repoRoot, "packages", "shared")
  },
  {
    name: "@ko1265/file-preview-kit-core",
    dir: path.join(repoRoot, "packages", "core")
  },
  {
    name: "@ko1265/file-preview-kit-web-components",
    dir: path.join(repoRoot, "packages", "web-components")
  }
];

function isInsideSmokeRoot(targetPath) {
  const relative = path.relative(smokeRoot, targetPath);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function recreateDir(targetPath) {
  if (!isInsideSmokeRoot(targetPath)) {
    throw new Error(`Refusing to reset a directory outside the smoke workspace: ${targetPath}`);
  }

  await rm(targetPath, { force: true, recursive: true });
  await mkdir(targetPath, { recursive: true });
}

async function run(command, args, cwd) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: process.platform === "win32",
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed (${code}): ${command} ${args.join(" ")}`));
    });
  });
}

async function packPackage(pkg) {
  const before = new Set((await readdir(artifactsDir)).filter((entry) => entry.endsWith(".tgz")));
  await run(pnpmCommand, ["pack", "--pack-destination", artifactsDir], pkg.dir);
  const after = (await readdir(artifactsDir)).filter((entry) => entry.endsWith(".tgz"));
  const created = after.filter((entry) => !before.has(entry));

  if (created.length !== 1) {
    throw new Error(`Expected one tarball for ${pkg.name}, received ${created.length}.`);
  }

  return path.join(artifactsDir, created[0]);
}

async function buildPublishablePackages() {
  await run(
    tscCommand,
    [
      "-b",
      "packages/shared/tsconfig.json",
      "packages/core/tsconfig.json",
      "packages/web-components/tsconfig.json"
    ],
    repoRoot
  );
  await run("node", ["./scripts/fix-relative-esm-extensions.mjs", "packages/core/dist"], repoRoot);
  await run("node", ["./scripts/fix-relative-esm-extensions.mjs", "packages/web-components/dist"], repoRoot);
}

function normalizeForPackageJson(value) {
  return value.replace(/\\/g, "/");
}

function readTarEntries(buffer) {
  const entries = new Map();
  let offset = 0;

  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");

    if (!name) {
      break;
    }

    const sizeOctal = header.subarray(124, 136).toString("utf8").replace(/\0.*$/, "").trim();
    const size = sizeOctal ? Number.parseInt(sizeOctal, 8) : 0;
    const dataStart = offset + 512;
    const dataEnd = dataStart + size;
    entries.set(name, buffer.subarray(dataStart, dataEnd));
    offset = dataStart + Math.ceil(size / 512) * 512;
  }

  return entries;
}

async function prepareConsumerPackage(tarballs) {
  await cp(path.join(repoRoot, "pnpm-lock.yaml"), path.join(workspaceDir, "pnpm-lock.yaml"));

  const packageJsonPath = path.join(workspaceDir, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const tarballDependencies = Object.fromEntries(
    tarballs.map((tarballPath, index) => {
      const specifier = `file:${normalizeForPackageJson(path.relative(workspaceDir, tarballPath))}`;
      return [publishablePackages[index].name, specifier];
    })
  );
  packageJson.dependencies = tarballDependencies;
  packageJson.pnpm = {
    ...(packageJson.pnpm ?? {}),
    overrides: {
      ...(packageJson.pnpm?.overrides ?? {}),
      ...tarballDependencies
    }
  };

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
}

async function installPackedTarballs(tarballs) {
  const nodeModulesDir = path.join(workspaceDir, "node_modules");
  await mkdir(nodeModulesDir, { recursive: true });

  for (const tarballPath of tarballs) {
    const compressed = await readFile(tarballPath);
    const tarEntries = readTarEntries(gunzipSync(compressed));
    const packageJsonBuffer = tarEntries.get("package/package.json");

    if (!packageJsonBuffer) {
      throw new Error(`Packed artifact is missing package/package.json: ${tarballPath}`);
    }

    const packageJson = JSON.parse(packageJsonBuffer.toString("utf8"));
    const installDir = path.join(nodeModulesDir, packageJson.name);

    for (const [entryName, entryBuffer] of tarEntries.entries()) {
      if (!entryName.startsWith("package/")) {
        continue;
      }

      const relativePath = entryName.slice("package/".length);
      if (!relativePath) {
        continue;
      }

      const targetPath = path.join(installDir, relativePath);
      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, entryBuffer);
    }
  }
}

async function main() {
  console.log("==> Building publishable packages");
  await buildPublishablePackages();

  console.log("==> Resetting consumer smoke directories");
  await recreateDir(artifactsDir);
  await mkdir(workspaceRoot, { recursive: true });

  console.log("==> Copying consumer template");
  await cp(templateDir, workspaceDir, { recursive: true });

  console.log("==> Packing publishable packages");
  const tarballs = [];
  for (const pkg of publishablePackages) {
    const tarball = await packPackage(pkg);
    tarballs.push(tarball);
  }

  console.log("==> Preparing clean consumer package manifest");
  await prepareConsumerPackage(tarballs);

  console.log("==> Materializing packed tarballs into clean consumer app");
  await installPackedTarballs(tarballs);

  console.log("==> Verifying consumer imports and minimal usage");
  await run("node", ["./verify-consumer.mjs"], workspaceDir);

  console.log("==> Consumer smoke test passed");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
