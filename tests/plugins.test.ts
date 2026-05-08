import JSZip from "jszip";
import * as XLSX from "xlsx";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  codePlugin,
  markdownPlugin,
  officePlugin,
  pdfPlugin,
  setPdfJsLoaderForTesting
} from "../packages/core/src/index";

const defaultFetcher = async (input: string, init: RequestInit) => fetch(input, init);

describe("built-in preview plugins", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setPdfJsLoaderForTesting(undefined);
  });

  it("sanitizes markdown HTML output", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("# Title\n\n<script>alert('x')</script>\n\nSafe text", {
          status: 200
        })
      )
    );

    const element = await markdownPlugin.render({
      source: {
        url: "https://example.com/readme.md",
        normalizedName: "readme.md",
        extension: "md"
      },
      fetcher: defaultFetcher
    });

    expect(element.innerHTML).toContain("<h1>Title</h1>");
    expect(element.innerHTML).toContain("Safe text");
    expect(element.innerHTML).not.toContain("<script>");
  });

  it("applies syntax highlighting to code previews", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("const answer = 42;", {
          status: 200
        })
      )
    );

    const element = await codePlugin.render({
      source: {
        url: "https://example.com/example.ts",
        normalizedName: "example.ts",
        extension: "ts"
      },
      fetcher: defaultFetcher
    });

    expect(element.querySelector("code")?.innerHTML).toContain("hljs");
  });

  it("renders workbook previews from xlsx files", async () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet([
      { name: "Ada", score: 10 },
      { name: "Linus", score: 9 }
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Scores");
    const array = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(array, {
          status: 200
        })
      )
    );

    const element = await officePlugin.render({
      source: {
        url: "https://example.com/scores.xlsx",
        normalizedName: "scores.xlsx",
        extension: "xlsx"
      },
      fetcher: defaultFetcher
    });

    expect(element.innerHTML).toContain("Workbook preview");
    expect(element.innerHTML).toContain("<table");
    expect(element.textContent).toContain("Scores");
  });

  it("extracts slide text from basic pptx files", async () => {
    const zip = new JSZip();
    zip.file(
      "ppt/slides/slide1.xml",
      `<?xml version="1.0" encoding="UTF-8"?>
      <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
        xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Hello slide</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
      </p:sld>`
    );
    const array = await zip.generateAsync({ type: "arraybuffer" });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(array, {
          status: 200
        })
      )
    );

    const element = await officePlugin.render({
      source: {
        url: "https://example.com/deck.pptx",
        normalizedName: "deck.pptx",
        extension: "pptx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("Presentation preview");
    expect(element.textContent).toContain("Hello slide");
  });

  it("renders pdf pages with pdf.js", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]).buffer, {
          status: 200
        })
      )
    );

    const renderPromise = Promise.resolve();
    const renderMock = vi.fn(() => ({ promise: renderPromise }));
    setPdfJsLoaderForTesting(async () => ({
      GlobalWorkerOptions: {},
      getDocument() {
        return {
          promise: Promise.resolve({
            numPages: 2,
            async getPage() {
              return {
                getViewport() {
                  return { width: 320, height: 480 };
                },
                render: renderMock
              };
            }
          })
        };
      }
    }));

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      canvas: document.createElement("canvas")
    } as unknown as CanvasRenderingContext2D);

    const element = await pdfPlugin.render({
      source: {
        url: "https://example.com/file.pdf",
        normalizedName: "file.pdf",
        extension: "pdf"
      },
      fetcher: defaultFetcher
    });

    expect(renderMock).toHaveBeenCalled();
    expect(element.textContent).toContain("Page 1 / 2");
    expect(element.querySelector("canvas")).not.toBeNull();
  });

  it("falls back to iframe mode when pdf fetching fails", async () => {
    const element = await pdfPlugin.render({
      source: {
        url: "https://example.com/file.pdf",
        normalizedName: "file.pdf",
        extension: "pdf"
      },
      fetcher: async () => {
        throw new Error("Failed to fetch");
      }
    });

    expect(element.textContent).toContain("compatibility mode");
    expect(element.querySelector("iframe")?.getAttribute("src")).toBe("https://example.com/file.pdf");
  });
});
