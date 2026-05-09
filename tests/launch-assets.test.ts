import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("public launch assets", () => {
  it("keeps the asset index aligned with the screenshot caption", async () => {
    const assets = await readFile(resolve("PUBLIC_LAUNCH_ASSETS.md"), "utf-8");

    expect(assets).toContain("LAUNCH_ASSET.svg");
    expect(assets).toContain(
      "A compact browser-only preview demo covering public URL, auth-shaped request handling, Office extracts, and media previews."
    );
    expect(assets).toContain("not imply layout-faithful Office rendering or guaranteed public endpoint availability");
  });

  it("keeps the launch card text aligned with the public demo story", async () => {
    const svg = await readFile(resolve("LAUNCH_ASSET.svg"), "utf-8");

    expect(svg).toContain("file-preview-kit v1.0-prep launch card");
    expect(svg).toContain("Browser-only remote file preview");
    expect(svg).toContain("public URL, auth-shaped request handling");
    expect(svg).toContain("Office extracts");
    expect(svg).toContain("Media previews");
  });
});
