import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const rootPackageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
const version = rootPackageJson.version;

const packages = [
  {
    name: "@ko1265/file-preview-kit-shared",
    dir: "packages/shared",
    tarball: `ko1265-file-preview-kit-shared-${version}.tgz`,
    internalDependencies: {}
  },
  {
    name: "@ko1265/file-preview-kit-core",
    dir: "packages/core",
    tarball: `ko1265-file-preview-kit-core-${version}.tgz`,
    internalDependencies: {
      "@ko1265/file-preview-kit-shared": version
    }
  },
  {
    name: "@ko1265/file-preview-kit-web-components",
    dir: "packages/web-components",
    tarball: `ko1265-file-preview-kit-web-components-${version}.tgz`,
    internalDependencies: {
      "@ko1265/file-preview-kit-core": version,
      "@ko1265/file-preview-kit-shared": version
    }
  },
  {
    name: "@ko1265/file-preview-kit-react",
    dir: "packages/react",
    tarball: `ko1265-file-preview-kit-react-${version}.tgz`,
    internalDependencies: {
      "@ko1265/file-preview-kit-core": version,
      "@ko1265/file-preview-kit-shared": version,
      "@ko1265/file-preview-kit-web-components": version
    }
  }
];

if (existsSync(path.join(repoRoot, "packages", "vue"))) {
  packages.push({
    name: "@ko1265/file-preview-kit-vue",
    dir: "packages/vue",
    tarball: `ko1265-file-preview-kit-vue-${version}.tgz`,
    internalDependencies: {
      "@ko1265/file-preview-kit-core": version,
      "@ko1265/file-preview-kit-shared": version,
      "@ko1265/file-preview-kit-web-components": version
    }
  });
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

async function readPackedPackage(tarballPath) {
  const compressed = await readFile(path.join(repoRoot, tarballPath));
  const { gunzipSync } = await import("node:zlib");
  const tarBuffer = gunzipSync(compressed);
  const entries = readTarEntries(tarBuffer);
  const packageJsonBuffer = entries.get("package/package.json");

  assert(packageJsonBuffer, `${tarballPath}: missing package/package.json`);

  return {
    entries,
    packageJson: JSON.parse(packageJsonBuffer.toString("utf8"))
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const packageInfo of packages) {
  const tarballPath = path.join(packageInfo.dir, packageInfo.tarball);
  const { entries, packageJson } = await readPackedPackage(tarballPath);

  assert(entries.has("package/package.json"), `${packageInfo.name}: missing package.json in tarball`);
  assert(entries.has("package/README.md"), `${packageInfo.name}: missing README.md in tarball`);
  assert(entries.has("package/LICENSE"), `${packageInfo.name}: missing LICENSE in tarball`);

  const entrypoints = [
    packageJson.main,
    packageJson.module,
    packageJson.types,
    packageJson.exports?.["."]?.import,
    packageJson.exports?.["."]?.types
  ].filter(Boolean);

  for (const entrypoint of entrypoints) {
    const normalized = `package/${String(entrypoint).replace(/^\.\//, "")}`;
    assert(entries.has(normalized), `${packageInfo.name}: missing published entrypoint ${entrypoint}`);
  }

  for (const [dependencyName, expectedVersion] of Object.entries(packageInfo.internalDependencies)) {
    assert(
      packageJson.dependencies?.[dependencyName] === expectedVersion,
      `${packageInfo.name}: expected ${dependencyName} to be rewritten to ${expectedVersion}`
    );
  }
}

console.log("Packed package verification passed.");
