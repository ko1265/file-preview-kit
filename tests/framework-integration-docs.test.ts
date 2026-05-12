import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(".");
const sveltePackageRoot = join(repoRoot, "packages/svelte");
const angularPackageRoot = join(repoRoot, "packages/angular");
const sveltePackageExists = existsSync(sveltePackageRoot);

async function readRepoFile(path: string): Promise<string> {
  const absolutePath = resolve(repoRoot, path);
  expect(existsSync(absolutePath)).toBe(true);

  return await readFile(absolutePath, "utf-8");
}

async function readOptionalRepoFile(path: string): Promise<string | null> {
  const absolutePath = resolve(repoRoot, path);

  if (!existsSync(absolutePath)) {
    return null;
  }

  return await readFile(absolutePath, "utf-8");
}

async function listPackageNames(): Promise<string[]> {
  const packagesRoot = resolve(repoRoot, "packages");
  const entries = await readdir(packagesRoot, { withFileTypes: true });

  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function readFrameworkSmokeStrategyDoc(): Promise<{ path: string; content: string } | null> {
  const candidatePaths = [
    "docs/frameworks/smoke-strategy.md",
    "docs/frameworks/framework-smoke-strategy.md",
    "docs/frameworks/angular-svelte-smoke-strategy.md",
    "docs/frameworks/framework-integration-smoke-strategy.md",
    "FRAMEWORK_SMOKE_STRATEGY.md"
  ];

  for (const path of candidatePaths) {
    const content = await readOptionalRepoFile(path);

    if (content !== null) {
      return { path, content };
    }
  }

  return null;
}

describe("framework integration docs", () => {
  it("keeps Angular and Svelte on documented web-components integration paths", async () => {
    const [frameworksIndex, angularGuide, svelteGuide, readme, roadmap, plan] = await Promise.all([
      readRepoFile("docs/frameworks/README.md"),
      readRepoFile("docs/frameworks/angular.md"),
      readRepoFile("docs/frameworks/svelte.md"),
      readRepoFile("README.md"),
      readRepoFile("ROADMAP.md"),
      readRepoFile("V2_DEVELOPMENT_PLAN.md")
    ]);

    expect(frameworksIndex).toContain("@ko1265/file-preview-kit-web-components");
    expect(angularGuide).toContain("@ko1265/file-preview-kit-web-components");
    expect(svelteGuide).toContain("@ko1265/file-preview-kit-svelte");
    expect(readme).toContain("@ko1265/file-preview-kit-web-components");
    expect(readme).toContain("Framework Integration Notes");
    expect(readme).not.toContain("@ko1265/file-preview-kit-angular");

    expect(readme).toContain("@ko1265/file-preview-kit-svelte");

    expect(roadmap).toContain("Svelte lightweight adapter");
    expect(roadmap).toContain("thin action/helper package");
    expect(roadmap).toContain("Angular integration path");
    expect(roadmap).toContain("Do not add a placeholder Angular package");

    expect(plan).toContain("Svelte through a lightweight action/helper");
    expect(plan).toContain("Angular through integration docs/smoke examples");
    expect(plan).toContain("Keep `@ko1265/file-preview-kit-web-components` as the stable browser-native foundation.");
    expect(plan).toContain("`@ko1265/file-preview-kit-angular` only after Angular demand is proven");

    expect(plan).toContain("Svelte through a lightweight action/helper");
    expect(plan).toContain("without adding a compiler scaffold");
  });

  it("documents Angular as a CUSTOM_ELEMENTS_SCHEMA integration on top of the custom element", async () => {
    const [angularGuide, readme, plan, webComponentsReadme] = await Promise.all([
      readRepoFile("docs/frameworks/angular.md"),
      readRepoFile("README.md"),
      readRepoFile("V2_DEVELOPMENT_PLAN.md"),
      readRepoFile("packages/web-components/README.md")
    ]);

    expect(angularGuide).toContain("There is no Angular adapter package yet.");
    expect(angularGuide).toContain("CUSTOM_ELEMENTS_SCHEMA");
    expect(angularGuide).toContain("registerFilePreviewElement()");
    expect(angularGuide).toContain("preview.requestConfig =");
    expect(angularGuide).toContain("preview.previewService =");
    expect(angularGuide).toContain("preview.addEventListener(\"file-preview:load\"");
    expect(angularGuide).toContain("preview.addEventListener(\"file-preview:error\"");
    expect(angularGuide).toContain("Do not try to serialize them into template attributes.");
    expect(readme).toContain("Web Components first");
    expect(readme).toContain("browser-only / client-only package");
    expect(plan).toContain("Angular integration guide using the Web Component and `CUSTOM_ELEMENTS_SCHEMA`");
    expect(webComponentsReadme).toContain("the `requestConfig` property");
    expect(webComponentsReadme).toContain("file-preview:loadstart");
    expect(webComponentsReadme).toContain("file-preview:error");
  });

  it("documents Svelte and SvelteKit as client-only browser integrations", async () => {
    const [svelteGuide, readme, plan, webComponentsReadme] = await Promise.all([
      readRepoFile("docs/frameworks/svelte.md"),
      readRepoFile("README.md"),
      readRepoFile("V2_DEVELOPMENT_PLAN.md"),
      readRepoFile("packages/web-components/README.md")
    ]);

    expect(svelteGuide).toContain("lightweight action adapter");
    expect(svelteGuide).toContain("import { browser } from \"$app/environment\"");
    expect(svelteGuide).toContain("{#if browser}");
    expect(svelteGuide).toContain("use:filePreview");
    expect(svelteGuide).toContain("preview.requestConfig =");
    expect(svelteGuide).toContain("preview.previewService = previewService");
    expect(svelteGuide).toContain("file-preview:loadstart");
    expect(svelteGuide).toContain("Do not try to pass `requestConfig` or `previewService` as serialized attributes.");
    expect(readme).toContain("browser-only / client-only package");
    expect(readme).toContain("keep it behind a clear client boundary");
    expect(webComponentsReadme).toContain("This package is browser-only / client-only.");
    expect(webComponentsReadme).toContain("Do not execute it on a pure Node.js path");
    expect(webComponentsReadme).toContain("keep it behind a clear client boundary");
  });

  it("keeps DOM property and custom event guidance anchored in the web-components docs", async () => {
    const [angularGuide, svelteGuide, readme, webComponentsReadme] = await Promise.all([
      readRepoFile("docs/frameworks/angular.md"),
      readRepoFile("docs/frameworks/svelte.md"),
      readRepoFile("README.md"),
      readRepoFile("packages/web-components/README.md")
    ]);

    expect(angularGuide).toContain("Use DOM properties for `requestConfig` and `previewService`.");
    expect(angularGuide).toContain("Custom events come from the underlying element");
    expect(svelteGuide).toContain("DOM property assignment");
    expect(svelteGuide).toContain("Custom events are still native DOM events underneath");
    expect(readme).toContain("Element attributes and the `requestConfig` property are merged");
    expect(readme).toContain("The custom element emits `file-preview:loadstart`, `file-preview:load`, and `file-preview:error`");

    expect(webComponentsReadme).toContain("Use the `requestConfig` property");
    expect(webComponentsReadme).toContain("property API is the more complete integration surface");
    expect(webComponentsReadme).toContain("The custom element emits `file-preview:loadstart`, `file-preview:load`, and `file-preview:error` events");
    expect(webComponentsReadme).toContain("preview.addEventListener(\"file-preview:loadstart\"");
    expect(webComponentsReadme).toContain("preview.addEventListener(\"file-preview:error\"");
  });

  it("keeps Angular deferred and ships the lightweight Svelte package", async () => {
    const [angularGuide, svelteGuide, packageNames, plan] = await Promise.all([
      readRepoFile("docs/frameworks/angular.md"),
      readRepoFile("docs/frameworks/svelte.md"),
      listPackageNames(),
      readRepoFile("V2_DEVELOPMENT_PLAN.md")
    ]);

    expect(packageNames).toContain("core");
    expect(packageNames).toContain("shared");
    expect(packageNames).toContain("web-components");
    expect(packageNames).not.toContain("angular");

    expect(angularGuide).toContain("There is no Angular adapter package yet.");
    expect(existsSync(angularPackageRoot)).toBe(false);
    expect(plan).toContain("only after Angular demand is proven");

    expect(sveltePackageExists).toBe(true);
    expect(packageNames).toContain("svelte");
    expect(svelteGuide).toContain("@ko1265/file-preview-kit-svelte");
    expect(existsSync(sveltePackageRoot)).toBe(true);
    expect(plan).toContain("`@ko1265/file-preview-kit-svelte` as a thin action/helper package");
  });

  it("keeps any dedicated Angular/Svelte smoke strategy doc focused on future lightweight proof points", async () => {
    const smokeStrategyDoc = await readFrameworkSmokeStrategyDoc();

    if (!smokeStrategyDoc) {
      return;
    }

    const { content, path } = smokeStrategyDoc;

    expect(content, `${path} should describe the Angular/Svelte smoke slice`).toMatch(/Angular/i);
    expect(content, `${path} should describe the Angular/Svelte smoke slice`).toMatch(/Svelte/i);
    expect(
      content,
      `${path} should keep the current PR scoped away from heavyweight Angular/Svelte smoke`
    ).toMatch(
      /((current|this)\s+pr[\s\S]{0,160}(does not add|doesn't add|keeps|avoid|avoids|without adding)[\s\S]{0,160}(heavyweight|full|broad|e2e|end-to-end)\s+.*smoke|(do not add|don't add)[\s\S]{0,80}(heavyweight|full|broad|e2e|end-to-end)[\s\S]{0,80}(Angular|Svelte)[\s\S]{0,80}smoke)/i
    );
    expect(content, `${path} should require registration proof in future smoke`).toMatch(
      /(register|registration)[\s\S]{0,80}(element|custom element|file-preview)/i
    );
    expect(content, `${path} should require DOM property assignment proof in future smoke`).toMatch(
      /(dom propert|property assignment|assign)[\s\S]{0,120}(requestConfig|previewService)/i
    );
    expect(content, `${path} should require custom event proof in future smoke`).toMatch(
      /(custom events?|native preview lifecycle events?|file-preview:(loadstart|load|error))/i
    );
    expect(content, `${path} should require client-only or SSR-boundary proof in future smoke`).toMatch(
      /(client-only|browser-only|ssr|server-side|server path|client boundary)/i
    );
    expect(content, `${path} should keep Angular heavy package smoke deferred and Svelte lightweight`).toMatch(
      /(Angular[\s\S]{0,120}(does not exist|defer|deferred|not add|not added|before creating)|Svelte[\s\S]{0,160}(thin action\/helper|lightweight|broadening))/i
    );
  });
});
