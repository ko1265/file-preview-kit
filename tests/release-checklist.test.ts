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
  });
});
