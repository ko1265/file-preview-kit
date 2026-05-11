import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("public demo note", () => {
  it("covers the release-facing demo story and caveats", async () => {
    const note = await readFile(resolve("PUBLIC_DEMO_NOTE.md"), "utf-8");

    expect(note).toContain("remote README preview");
    expect(note).toContain("Auth-shaped request handling");
    expect(note).toContain("Readable Office extracts for `docx`, `xlsx`, and `pptx`");
    expect(note).toContain("Native media previews for image, audio, and video");
    expect(note).toContain("Office previews are extraction-oriented browser previews, not fidelity renderers.");
    expect(note).toContain("server conversion");
  });
});
