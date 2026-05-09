import { beforeEach, describe, expect, it, vi } from "vitest";

const demoMarkup = `
  <main>
    <div class="topbar">
      <header>
        <p data-copy="strap">Standalone open-source preview library</p>
        <h1 data-copy="title">Remote file preview with Web Components.</h1>
        <p data-copy="intro">Demo intro</p>
      </header>
      <div class="lang-switch">
        <span data-copy="switch-label">Language:</span>
        <button id="lang-button" type="button">中文</button>
      </div>
    </div>
    <section class="controls">
      <input id="src-input" type="url" placeholder="https://example.com/readme.md" />
      <select id="sample-select"></select>
      <button id="load-button" type="button">Load preview</button>
    </section>
    <div class="grid" id="sample-grid"></div>
    <file-preview id="preview"></file-preview>
  </main>
`;

describe("demo startup", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    document.body.innerHTML = demoMarkup;
    vi.resetModules();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("# Demo\n\nThis is enough for startup initialization.", {
          status: 200
        })
      )
    );
  });

  it("boots the demo shell and selects the first sample", async () => {
    await import("../apps/demo/main");

    const sampleSelect = document.querySelector<HTMLSelectElement>("#sample-select");
    const srcInput = document.querySelector<HTMLInputElement>("#src-input");
    const langButton = document.querySelector<HTMLButtonElement>("#lang-button");
    const preview = document.querySelector<HTMLElement>("#preview");

    expect(document.documentElement.lang).toBe("en");
    expect(sampleSelect?.options).toHaveLength(10);
    expect(sampleSelect?.value).toBe("0");
    expect(srcInput?.value).toBe("https://raw.githubusercontent.com/microsoft/TypeScript/main/README.md");
    expect(langButton?.textContent).toBe("中文");
    expect(preview?.getAttribute("mime-type")).toBe("text/markdown");
  });

  it("can bootstrap a screenshot sample from the query string", async () => {
    window.history.replaceState({}, "", "/?sample=3");

    await import("../apps/demo/main");

    const sampleSelect = document.querySelector<HTMLSelectElement>("#sample-select");
    const srcInput = document.querySelector<HTMLInputElement>("#src-input");
    const preview = document.querySelector<HTMLElement>("#preview");

    expect(sampleSelect?.value).toBe("3");
    expect(srcInput?.value).toBe("/office-screenshot.xlsx");
    expect(preview?.getAttribute("mime-type")).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  });

  it("uses local static office samples for screenshot scenes", async () => {
    window.history.replaceState({}, "", "/");

    await import("../apps/demo/main");

    const sampleSelect = document.querySelector<HTMLSelectElement>("#sample-select");
    const srcInput = document.querySelector<HTMLInputElement>("#src-input");

    sampleSelect!.value = "2";
    sampleSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(srcInput?.value).toBe("/office-screenshot.docx");

    sampleSelect!.value = "3";
    sampleSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(srcInput?.value).toBe("/office-screenshot.xlsx");

    sampleSelect!.value = "4";
    sampleSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(srcInput?.value).toBe("/office-screenshot.pptx");
  });

  it("keeps the current preview state when switching languages", async () => {
    window.history.replaceState({}, "", "/?sample=3");

    await import("../apps/demo/main");

    const sampleSelect = document.querySelector<HTMLSelectElement>("#sample-select");
    const srcInput = document.querySelector<HTMLInputElement>("#src-input");
    const loadButton = document.querySelector<HTMLButtonElement>("#load-button");
    const langButton = document.querySelector<HTMLButtonElement>("#lang-button");
    const preview = document.querySelector<HTMLElement>("#preview");

    expect(sampleSelect?.value).toBe("3");
    expect(srcInput?.value).toBe("/office-screenshot.xlsx");
    expect(preview?.getAttribute("mime-type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    langButton!.click();
    expect(sampleSelect?.value).toBe("3");
    expect(srcInput?.value).toBe("/office-screenshot.xlsx");
    expect(preview?.getAttribute("mime-type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    sampleSelect!.value = "2";
    sampleSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(sampleSelect?.value).toBe("2");
    expect(srcInput?.value).toBe("/office-screenshot.docx");
    expect(preview?.getAttribute("mime-type")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    langButton!.click();
    expect(sampleSelect?.value).toBe("2");
    expect(srcInput?.value).toBe("/office-screenshot.docx");
    expect(preview?.getAttribute("mime-type")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    srcInput!.value = "https://example.com/custom.md";
    loadButton!.click();
    expect(sampleSelect?.value).toBe("2");
    expect(srcInput?.value).toBe("https://example.com/custom.md");
    expect(preview?.getAttribute("mime-type")).toBeNull();
    expect(preview?.getAttribute("src")).toBe("https://example.com/custom.md");

    langButton!.click();
    expect(sampleSelect?.value).toBe("2");
    expect(srcInput?.value).toBe("https://example.com/custom.md");
    expect(preview?.getAttribute("mime-type")).toBeNull();
    expect(preview?.getAttribute("src")).toBe("https://example.com/custom.md");
  });
});
