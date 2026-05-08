import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const targetDir = process.argv[2];

if (!targetDir) {
  throw new Error("Expected a target directory argument.");
}

const EXTENSIONLESS_RELATIVE_SPECIFIER =
  /((?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?|import\s*\()\s*(['"])(\.\.?\/[^"'()]+?)\2/g;

const SKIP_SUFFIXES = [".js", ".mjs", ".cjs", ".json", ".node", ".css"];
const TARGET_SUFFIXES = [".js", ".d.ts"];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function shouldRewriteSpecifier(specifier) {
  return !SKIP_SUFFIXES.some((suffix) => specifier.endsWith(suffix));
}

function rewriteContents(contents) {
  return contents.replace(EXTENSIONLESS_RELATIVE_SPECIFIER, (match, prefix, quote, specifier) => {
    if (!shouldRewriteSpecifier(specifier)) {
      return match;
    }

    return `${prefix}${quote}${specifier}.js${quote}`;
  });
}

async function main() {
  const resolvedDir = path.resolve(targetDir);
  const dirStat = await stat(resolvedDir);
  if (!dirStat.isDirectory()) {
    throw new Error(`Target is not a directory: ${resolvedDir}`);
  }

  const files = await walk(resolvedDir);
  const candidates = files.filter((filePath) => TARGET_SUFFIXES.some((suffix) => filePath.endsWith(suffix)));

  await Promise.all(
    candidates.map(async (filePath) => {
      const contents = await readFile(filePath, "utf8");
      const rewritten = rewriteContents(contents);
      if (rewritten !== contents) {
        await writeFile(filePath, rewritten, "utf8");
      }
    })
  );
}

await main();
