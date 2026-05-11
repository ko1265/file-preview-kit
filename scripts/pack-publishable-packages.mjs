import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const publishablePackages = [
  join(repoRoot, "packages", "shared"),
  join(repoRoot, "packages", "core"),
  join(repoRoot, "packages", "web-components"),
  join(repoRoot, "packages", "react")
];

const optionalPublishablePackages = [join(repoRoot, "packages", "vue")];

for (const packageDir of optionalPublishablePackages) {
  if (existsSync(packageDir)) {
    publishablePackages.push(packageDir);
  }
}

await main();

async function main() {
  for (const packageDir of publishablePackages) {
    await run(pnpmCommand, ["pack"], packageDir);
  }
}

async function run(command, args, cwd) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      shell: process.platform === "win32",
      stdio: "inherit"
    });

    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`Command failed (${code}): ${command} ${args.join(" ")}`));
    });
  });
}
