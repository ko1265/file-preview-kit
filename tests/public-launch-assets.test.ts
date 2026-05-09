import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("public launch assets", () => {
  it("cover the screenshot-style release card and pairing notes", async () => {
    const assets = await readFile(resolve("PUBLIC_LAUNCH_ASSETS.md"), "utf-8");
    const svg = await readFile(resolve("public-launch-card.svg"), "utf-8");

    expect(assets).toContain("screenshot-level public launch material");
    expect(assets).toContain("LAUNCH_ASSET.svg");
    expect(assets).toContain("SCREENSHOT_CHECKLIST.md");
    expect(svg).toContain("file-preview-kit v1.0-prep launch card");
    expect(svg).toContain("Remote file preview with Web Components");
    expect(svg).toContain("Release framing");
    expect(svg).toContain("Browser-only");
  });
});
