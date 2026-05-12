import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("release readiness", () => {
  it("keeps the remaining launch-asset gap explicit", async () => {
    const readiness = await readFile(resolve("RELEASE_READINESS.md"), "utf-8");

    expect(readiness).toContain("Public demo framing is covered in the README, launch note, and launch assets.");
    expect(readiness).toContain("The repository now treats its current API, package boundaries, and browser-only expectations as the `v1.0` baseline.");
    expect(readiness).toContain("The latest public npm packages are aligned on `1.0.0`.");
  });
});
