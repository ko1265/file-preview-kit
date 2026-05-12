import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sveltePackageRoot = resolve("packages/svelte");
const sveltePackageExists = existsSync(sveltePackageRoot);
const describeSveltePackage = sveltePackageExists ? describe : describe.skip;

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

async function readSvelteFile(path: string): Promise<string> {
  expect(existsSync(join(sveltePackageRoot, path))).toBe(true);

  return await readFile(join(sveltePackageRoot, path), "utf-8");
}

async function readSveltePackageJson(): Promise<PackageJson> {
  return JSON.parse(await readSvelteFile("package.json"));
}

async function listSourceFiles(dir = join(sveltePackageRoot, "src")): Promise<string[]> {
  expect(existsSync(dir)).toBe(true);

  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        return await listSourceFiles(path);
      }

      return /\.(ts|js|svelte)$/.test(entry.name) ? [path] : [];
    })
  );

  return files.flat();
}

async function readSvelteSource(): Promise<string> {
  const files = await listSourceFiles();
  expect(files.length).toBeGreaterThan(0);

  return (await Promise.all(files.map((file) => readFile(file, "utf-8")))).join("\n");
}

describeSveltePackage("Svelte adapter contract", () => {
  it("publishes a typed Svelte package with narrow runtime dependencies", async () => {
    const packageJson = await readSveltePackageJson();

    expect(packageJson.name).toBe("@ko1265/file-preview-kit-svelte");
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
    expect(packageJson.peerDependencies?.svelte).toBeTruthy();
    expect(packageJson.dependencies?.svelte).toBeUndefined();
  });

  it("keeps the wrapper thin and browser-safe", async () => {
    const source = await readSvelteSource();

    expect(source).toContain("@ko1265/file-preview-kit-web-components");
    expect(source).toContain("registerFilePreviewElement");
    expect(source).not.toContain("new FilePreviewService");
    expect(source).not.toMatch(/import\s+(?!type\b)[^;]*@ko1265\/file-preview-kit-core/);
    expect(source).not.toMatch(
      /shadowRoot|attachShadow|innerHTML\s*=|createElement\(["'](?:iframe|img|video|audio|canvas|table)/
    );
    expect(source).toMatch(
      /(onMount|typeof window\s*(?:===|!==)\s*["']undefined["']|typeof customElements\s*(?:===|!==)\s*["']undefined["']|"customElements"\s+in\s+window|\$app\/environment)/
    );
  });

  it("auto-registers the custom element and maps object props as DOM properties", async () => {
    const source = await readSvelteSource();

    expect(source).toMatch(/registerFilePreviewElement\s*\(/);
    expect(source).toMatch(/\.requestConfig\s*=/);
    expect(source).toMatch(/\.previewService\s*=/);
    expect(source).not.toMatch(/setAttribute\(["']request-?config["']/);
    expect(source).not.toMatch(/setAttribute\(["']preview-?service["']/);
    expect(source).not.toMatch(/JSON\.stringify\([^)]*(requestConfig|previewService)/);
  });

  it("keeps native custom events wired to callback props", async () => {
    const source = await readSvelteSource();

    expect(source).toContain("addEventListener");
    expect(source).toContain("removeEventListener");
    expect(source).toContain("file-preview:loadstart");
    expect(source).toContain("file-preview:load");
    expect(source).toContain("file-preview:error");
    expect(source).not.toMatch(/createEventDispatcher/);
  });

  it("documents SvelteKit client-only guidance", async () => {
    const [packageReadme, frameworkGuide] = await Promise.all([
      readSvelteFile("README.md"),
      readFile(resolve("docs/frameworks/svelte.md"), "utf-8")
    ]);

    expect(packageReadme).toMatch(/SvelteKit/i);
    expect(packageReadme).toMatch(/client-only|browser-only|SSR|server-side/i);
    expect(packageReadme).toMatch(/onMount|\$app\/environment|browser/);
    expect(frameworkGuide).toContain("SvelteKit");
    expect(frameworkGuide).toContain("import { browser } from \"$app/environment\"");
    expect(frameworkGuide).toContain("if (!browser)");
  });
});
