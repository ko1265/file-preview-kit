import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const vuePackageRoot = resolve("packages/vue");
const vuePackageExists = existsSync(vuePackageRoot);
const describeVuePackage = vuePackageExists ? describe : describe.skip;

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

async function readVueFile(path: string): Promise<string> {
  expect(existsSync(join(vuePackageRoot, path))).toBe(true);

  return await readFile(join(vuePackageRoot, path), "utf-8");
}

async function readVuePackageJson(): Promise<PackageJson> {
  return JSON.parse(await readVueFile("package.json"));
}

async function listSourceFiles(dir = join(vuePackageRoot, "src")): Promise<string[]> {
  expect(existsSync(dir)).toBe(true);

  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        return await listSourceFiles(path);
      }

      return /\.(ts|tsx|vue)$/.test(entry.name) ? [path] : [];
    })
  );

  return files.flat();
}

async function readVueSource(): Promise<string> {
  const files = await listSourceFiles();
  expect(files.length).toBeGreaterThan(0);

  return (await Promise.all(files.map((file) => readFile(file, "utf-8")))).join("\n");
}

describeVuePackage("Vue adapter contract", () => {
  it("publishes a typed Vue package with narrow runtime dependencies", async () => {
    const packageJson = await readVuePackageJson();

    expect(packageJson.name).toBe("@ko1265/file-preview-kit-vue");
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
    expect(packageJson.peerDependencies?.vue).toBeTruthy();
    expect(packageJson.dependencies?.vue).toBeUndefined();
  });

  it("keeps the wrapper thin and delegates preview rendering to the Web Component", async () => {
    const source = await readVueSource();

    expect(source).toContain("@ko1265/file-preview-kit-web-components");
    expect(source).toContain("registerFilePreviewElement");
    expect(source).not.toContain("new FilePreviewService");
    expect(source).not.toMatch(/import\s+(?!type\b)[^;]*@ko1265\/file-preview-kit-core/);
    expect(source).not.toMatch(/shadowRoot|attachShadow|innerHTML\s*=|createElement\(["'](?:iframe|img|video|audio|canvas|table)/);
  });

  it("sets object-valued props as DOM properties instead of serialized attributes", async () => {
    const source = await readVueSource();

    expect(source).toMatch(/\.requestConfig\s*=/);
    expect(source).toMatch(/\.previewService\s*=/);
    expect(source).not.toMatch(/setAttribute\(["']request-?config["']/);
    expect(source).not.toMatch(/setAttribute\(["']preview-?service["']/);
    expect(source).not.toMatch(/JSON\.stringify\([^)]*(requestConfig|previewService)/);
  });

  it("re-exposes Web Component custom events through Vue emits", async () => {
    const source = await readVueSource();

    expect(source).toMatch(/defineEmits|emits\s*:/);
    expect(source).toContain("file-preview:loadstart");
    expect(source).toContain("file-preview:load");
    expect(source).toContain("file-preview:error");
    expect(source).toMatch(/emit\(["']loadstart["']/);
    expect(source).toMatch(/emit\(["']load["']/);
    expect(source).toMatch(/emit\(["']error["']/);
  });

  it("documents Vite usage and Nuxt SSR client-only boundaries", async () => {
    const readme = await readVueFile("README.md");

    expect(readme).toMatch(/Vite/i);
    expect(readme).toMatch(/Nuxt/i);
    expect(readme).toMatch(/SSR|server-side/i);
    expect(readme).toMatch(/client/i);
    expect(readme).toMatch(/ClientOnly|\.client|client-only/i);
  });

  it("is included in static pack verification and consumer smoke coverage", async () => {
    const [packScript, verifyScript, smokeScript, consumerVerify] = await Promise.all([
      readFile(resolve("scripts/pack-publishable-packages.mjs"), "utf-8"),
      readFile(resolve("scripts/verify-packed-packages.mjs"), "utf-8"),
      readFile(resolve("scripts/run-consumer-smoke.mjs"), "utf-8"),
      readFile(resolve("smoke/consumer-smoke/template/verify-consumer.mjs"), "utf-8")
    ]);

    expect(packScript).toContain('join(repoRoot, "packages", "vue")');
    expect(verifyScript).toContain('name: "@ko1265/file-preview-kit-vue"');
    expect(verifyScript).toContain('dir: "packages/vue"');
    expect(smokeScript).toContain('name: "@ko1265/file-preview-kit-vue"');
    expect(consumerVerify).toContain('@ko1265/file-preview-kit-vue');
  });
});
