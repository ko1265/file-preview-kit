import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("release checklist", () => {
  it("covers the final release checks and steps", async () => {
    const checklist = await readFile(resolve("RELEASE_CHECKLIST.md"), "utf-8");

    expect(checklist).toContain("pnpm build");
    expect(checklist).toContain("pnpm test");
    expect(checklist).toContain("pnpm pack:verify");
    expect(checklist).toContain("pnpm smoke:consumer");
    expect(checklist).toContain("PUBLIC_DEMO_NOTE.md");
    expect(checklist).toContain("no new Office sample breadth was added beyond the current extraction-oriented scope");
    expect(checklist).toContain("browser-only preview story");
    expect(checklist).toContain("pnpm --filter @ko1265/file-preview-kit-react build");
    expect(checklist).toContain("tests/react-adapter-contract.test.ts");
    expect(checklist).toContain("pnpm --filter @ko1265/file-preview-kit-vue build");
    expect(checklist).toContain("tests/vue-adapter-contract.test.ts");
    expect(checklist).toContain("React and Vue tarball");
    expect(checklist).toContain("packed React and Vue adapter imports");
  });

  it("keeps npm publish docs aligned with the framework adapter release path", async () => {
    const [publishChecklist, runbook] = await Promise.all([
      readFile(resolve("NPM_PUBLISH_CHECKLIST.md"), "utf-8"),
      readFile(resolve("NPM_RELEASE_RUNBOOK.md"), "utf-8")
    ]);

    expect(publishChecklist).toContain("@ko1265/file-preview-kit-react");
    expect(publishChecklist).toContain("@ko1265/file-preview-kit-vue");
    expect(publishChecklist).toContain("validated in-repo for release readiness");
    expect(publishChecklist).toContain("pnpm smoke:consumer");
    expect(publishChecklist).toContain("pnpm pack:verify");
    expect(publishChecklist).toContain("Do not list `@ko1265/file-preview-kit-react` or `@ko1265/file-preview-kit-vue`");

    expect(runbook).toContain("pnpm --filter @ko1265/file-preview-kit-react build");
    expect(runbook).toContain("pnpm --filter @ko1265/file-preview-kit-vue build");
    expect(runbook).toContain("tests/react-adapter-contract.test.ts");
    expect(runbook).toContain("tests/vue-adapter-contract.test.ts");
    expect(runbook).toContain("packages/react");
    expect(runbook).toContain("packages/vue");
    expect(runbook).toContain("stop before `vue`");
  });
});
