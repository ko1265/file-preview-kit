import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("release readiness", () => {
  it("keeps the remaining launch-asset gap explicit", async () => {
    const readiness = await readFile(resolve("RELEASE_READINESS.md"), "utf-8");

    expect(readiness).toContain("Public demo framing is covered in the README, launch note, and launch assets.");
    expect(readiness).toContain("Live browser screenshot verification is partially available in this environment:");
    expect(readiness).toContain("No new Office sample breadth should be added in this prep pass.");
  });
});
