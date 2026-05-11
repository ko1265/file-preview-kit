import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const reactPackageRoot = resolve("packages/react");
const reactPackageExists = existsSync(reactPackageRoot);
const describeReactPackage = reactPackageExists ? describe : describe.skip;

interface PackageJson {
  name?: string;
  type?: string;
  main?: string;
  module?: string;
  types?: string;
  exports?: {
    "."?: {
      import?: string;
      types?: string;
    };
  };
  files?: string[];
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

async function readReactFile(path: string): Promise<string> {
  expect(existsSync(join(reactPackageRoot, path))).toBe(true);

  return await readFile(join(reactPackageRoot, path), "utf-8");
}

async function readReactPackageJson(): Promise<PackageJson> {
  return JSON.parse(await readReactFile("package.json"));
}

async function listSourceFiles(dir = join(reactPackageRoot, "src")): Promise<string[]> {
  expect(existsSync(dir)).toBe(true);

  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        return await listSourceFiles(path);
      }

      return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
    })
  );

  return files.flat();
}

async function readReactSource(): Promise<string> {
  const files = await listSourceFiles();
  expect(files.length).toBeGreaterThan(0);

  return (await Promise.all(files.map((file) => readFile(file, "utf-8")))).join("\n");
}

describeReactPackage("React adapter contract", () => {
  it("publishes a typed React package with narrow runtime dependencies", async () => {
    const packageJson = await readReactPackageJson();

    expect(packageJson.name).toBe("@ko1265/file-preview-kit-react");
    expect(packageJson.type).toBe("module");
    expect(packageJson.main).toBe("./dist/index.js");
    expect(packageJson.module).toBe("./dist/index.js");
    expect(packageJson.types).toBe("./dist/index.d.ts");
    expect(packageJson.exports?.["."]).toMatchObject({
      import: "./dist/index.js",
      types: "./dist/index.d.ts"
    });
    expect(packageJson.files).toContain("dist");

    expect(packageJson.dependencies).toMatchObject({
      "@ko1265/file-preview-kit-web-components": "workspace:*"
    });
    expect(packageJson.peerDependencies?.react).toBeTruthy();
    expect(packageJson.dependencies?.react).toBeUndefined();
    expect(packageJson.dependencies?.["react-dom"]).toBeUndefined();
  });

  it("keeps the wrapper thin and delegates preview rendering to the Web Component", async () => {
    const source = await readReactSource();

    expect(source).toContain("@ko1265/file-preview-kit-web-components");
    expect(source).toContain("registerFilePreviewElement");
    expect(source).not.toContain("new FilePreviewService");
    expect(source).not.toMatch(/import\s+(?!type\b)[^;]*@ko1265\/file-preview-kit-core/);
    expect(source).not.toMatch(/shadowRoot|attachShadow|innerHTML\s*=|createElement\(["'](?:iframe|img|video|audio|canvas|table)/);
  });

  it("sets object-valued props as DOM properties instead of serialized attributes", async () => {
    const source = await readReactSource();

    expect(source).toMatch(/\.requestConfig\s*=/);
    expect(source).toMatch(/\.previewService\s*=\s*props\.previewService/);
    expect(source).not.toMatch(/setAttribute\(["']request-?config["']/);
    expect(source).not.toMatch(/setAttribute\(["']preview-?service["']/);
    expect(source).not.toMatch(/JSON\.stringify\([^)]*(requestConfig|previewService)/);
  });

  it("maps Web Component custom events to React callback props", async () => {
    const source = await readReactSource();

    expect(source).toContain("addEventListener");
    expect(source).toContain("removeEventListener");
    expect(source).toContain("file-preview:loadstart");
    expect(source).toContain("file-preview:load");
    expect(source).toContain("file-preview:error");
    expect(source).toMatch(/\bonLoadStart\b/);
    expect(source).toMatch(/\bonLoad\b/);
    expect(source).toMatch(/\bonError\b/);
  });

  it("documents Vite usage and SSR client-only boundaries", async () => {
    const readme = await readReactFile("README.md");

    expect(readme).toMatch(/Vite/i);
    expect(readme).toMatch(/Next\.?js/i);
    expect(readme).toMatch(/SSR|server-side/i);
    expect(readme).toMatch(/client/i);
    expect(readme).toMatch(/use client|ssr:\s*false/i);
  });

  it("is included in static pack verification coverage", async () => {
    const [packScript, verifyScript] = await Promise.all([
      readFile(resolve("scripts/pack-publishable-packages.mjs"), "utf-8"),
      readFile(resolve("scripts/verify-packed-packages.mjs"), "utf-8")
    ]);

    expect(packScript).toContain('join(repoRoot, "packages", "react")');
    expect(verifyScript).toContain('name: "@ko1265/file-preview-kit-react"');
    expect(verifyScript).toContain('dir: "packages/react"');
  });
});
