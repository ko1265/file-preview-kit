import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("screenshot checklist", () => {
  it("covers the live screenshot order and manual fallback", async () => {
    const checklist = await readFile(resolve("SCREENSHOT_CHECKLIST.md"), "utf-8");
    const note = await readFile(resolve("PUBLIC_DEMO_NOTE.md"), "utf-8");

    expect(checklist).toContain("Public URL sample");
    expect(checklist).toContain("Auth-shaped request sample");
    expect(checklist).toContain("Office sample");
    expect(checklist).toContain("Media sample");
    expect(checklist).toContain("Manual Fallback");
    expect(checklist).toContain("If automated browser capture is unavailable, take the screenshot manually from the demo page.");
    expect(note).toContain("## What To Show");
    expect(checklist).toContain("The Office screenshot path now uses local static demo files");
  });
});
