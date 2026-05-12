import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("adapter release prep", () => {
  it("records React/Vue dry-run evidence without implying a real publish", async () => {
    const [releasePrep, publishChecklist, runbook] = await Promise.all([
      readFile(resolve("NPM_ADAPTER_RELEASE_PREP.md"), "utf-8"),
      readFile(resolve("NPM_PUBLISH_CHECKLIST.md"), "utf-8"),
      readFile(resolve("NPM_RELEASE_RUNBOOK.md"), "utf-8")
    ]);

    expect(releasePrep).toContain("does not authorize or record a real npm publish");
    expect(releasePrep).toContain("npm view @ko1265/file-preview-kit-web-components version");
    expect(releasePrep).toContain("returned `0.1.0`");
    expect(releasePrep).toContain("npm view @ko1265/file-preview-kit-react version");
    expect(releasePrep).toContain("npm view @ko1265/file-preview-kit-vue version");
    expect(releasePrep).toContain("returned `404 Not Found`");
    expect(releasePrep).toContain("@ko1265/file-preview-kit-react@1.0.0");
    expect(releasePrep).toContain("@ko1265/file-preview-kit-vue@1.0.0");
    expect(releasePrep).toContain("pnpm build");
    expect(releasePrep).toContain("pnpm test");
    expect(releasePrep).toContain("pnpm pack:verify");
    expect(releasePrep).toContain("pnpm smoke:consumer");
    expect(releasePrep).toContain("publish --dry-run");
    expect(releasePrep).toContain("no package becomes available on the public registry");
    expect(releasePrep).not.toContain("@ko1265/file-preview-kit-angular");
    expect(releasePrep).not.toContain("@ko1265/file-preview-kit-svelte");

    expect(publishChecklist).toContain("NPM_ADAPTER_RELEASE_PREP.md");
    expect(publishChecklist).toContain("Do not list `@ko1265/file-preview-kit-react` or `@ko1265/file-preview-kit-vue`");
    expect(runbook).toContain("If the release includes React, verify the adapter import and minimal render path:");
    expect(runbook).toContain("If the release includes Vue, verify the adapter import and minimal render path:");
  });
});
