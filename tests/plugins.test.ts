import JSZip from "jszip";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  codePlugin,
  markdownPlugin,
  officePlugin,
  pdfPlugin,
  setMammothLoaderForTesting,
  setXlsxLoaderForTesting,
  setPdfJsLoaderForTesting
} from "../packages/core/src/index";
import {
  createDocxConversionFixture,
  createDocxFixture,
  createLargeWorkbookFixture,
  createRealDocxFixture,
  createWideWorkbookFixture,
  createWorkbookFixture
} from "./fixtures/office";

const defaultFetcher = async (input: string, init: RequestInit) => fetch(input, init);

describe("built-in preview plugins", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setMammothLoaderForTesting(undefined);
    setXlsxLoaderForTesting(undefined);
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
    const array = createWorkbookFixture();

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
    expect(element.textContent).toContain("worksheet(s)");
    expect(element.textContent).toContain("A1:D3");
    expect(element.innerHTML).toContain("<table");
    expect(element.textContent).toContain("Summary");
    expect(element.textContent).toContain("3 row(s)");
  });

  it("shows a safe fallback when workbook parsing fails", async () => {
    setXlsxLoaderForTesting(async () => {
      throw new Error("bad workbook");
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]).buffer, {
          status: 200
        })
      )
    );

    const element = await officePlugin.render({
      source: {
        url: "https://example.com/broken.xlsx",
        normalizedName: "broken.xlsx",
        extension: "xlsx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("Workbook preview unavailable");
    expect(element.textContent).toContain("could not be parsed safely");
  });

  it("renders merged-cell and formula-heavy workbooks without crashing", async () => {
    const array = createWorkbookFixture({ sheetCount: 2 });

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
        url: "https://example.com/summary.xlsx",
        normalizedName: "summary.xlsx",
        extension: "xlsx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("Summary");
    expect(element.textContent).toContain("North");
    expect(element.textContent).toContain("30");
    expect(element.textContent).toContain("1 merge(s)");
    expect(element.textContent).toContain("2 formula cell(s)");
    expect(element.querySelector(".fpk-sheet-content thead th")?.textContent).toBe("#");
    expect(element.querySelector("td[colspan='2']")?.textContent).toContain("Region");
    expect(element.querySelector("td[data-formula]")?.getAttribute("title")).toContain("B2+C2");
  });

  it("keeps xlsx previews readable and escapes cell HTML", async () => {
    const array = createLargeWorkbookFixture();

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
        url: "https://example.com/large.xlsx",
        normalizedName: "large.xlsx",
        extension: "xlsx"
      },
      fetcher: defaultFetcher
    });

    expect(element.innerHTML).not.toContain("<script>");
    expect(element.textContent).toContain("<script>alert('x')</script>");
    expect(element.textContent).toContain("Workbook trimmed");
    expect(element.textContent).toContain("Large sheet truncated");
    expect(element.querySelectorAll(".fpk-sheet-tab")).toHaveLength(6);
  });

  it("supports configurable workbook preview limits through request config", async () => {
    const array = createWorkbookFixture({ sheetCount: 4 });

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
        url: "https://example.com/compact.xlsx",
        normalizedName: "compact.xlsx",
        extension: "xlsx"
      },
      request: {
        office: {
          workbook: {
            maxSheets: 2,
            maxRows: 2,
            maxColumns: 2
          }
        }
      },
      fetcher: defaultFetcher
    });

    expect(element.querySelectorAll(".fpk-sheet-tab")).toHaveLength(2);
    expect(element.textContent).toContain("Large sheet truncated");
    expect(element.textContent).toContain("first 2 rows");
    expect(element.textContent).toContain("first 2 columns");
    expect(element.textContent).toContain("Showing the first 2 sheet tabs");
  });

  it("shows a friendly state when a workbook has no worksheets", async () => {
    setXlsxLoaderForTesting(async () => {
      const actual = await import("xlsx");
      return {
        ...actual,
        read() {
          return {
            SheetNames: [],
            Sheets: {}
          } as unknown as ReturnType<typeof actual.read>;
        }
      };
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]).buffer, {
          status: 200
        })
      )
    );

    const element = await officePlugin.render({
      source: {
        url: "https://example.com/empty.xlsx",
        normalizedName: "empty.xlsx",
        extension: "xlsx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("No worksheets found");
    expect(element.textContent).toContain("does not contain any visible sheets");
  });

  it("shows a fallback when a workbook sheet cannot be resolved", async () => {
    setXlsxLoaderForTesting(async () => {
      const actual = await import("xlsx");
      return {
        ...actual,
        read() {
          return {
            SheetNames: ["Ghost"],
            Sheets: {}
          } as unknown as ReturnType<typeof actual.read>;
        }
      };
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]).buffer, {
          status: 200
        })
      )
    );

    const element = await officePlugin.render({
      source: {
        url: "https://example.com/ghost.xlsx",
        normalizedName: "ghost.xlsx",
        extension: "xlsx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("Sheet unavailable");
    expect(element.querySelectorAll(".fpk-sheet-tab")).toHaveLength(1);
  });

  it("switches workbook sheet content when a tab is clicked", async () => {
    const array = createWorkbookFixture({ sheetCount: 1 });

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
        url: "https://example.com/switch.xlsx",
        normalizedName: "switch.xlsx",
        extension: "xlsx"
      },
      fetcher: defaultFetcher
    });

    const tabs = [...element.querySelectorAll(".fpk-sheet-tab")];
    expect(tabs).toHaveLength(2);
    expect(element.textContent).toContain("North");
    expect(element.textContent).not.toContain("extra-1");

    tabs[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(element.textContent).toContain("extra-1");
    expect(element.textContent).not.toContain("North");
  });

  it("sanitizes docx HTML and surfaces conversion warnings", async () => {
    setMammothLoaderForTesting(async () => ({
      convertToHtml: vi.fn().mockResolvedValue(createDocxConversionFixture())
    }));

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]).buffer, {
          status: 200
        })
      )
    );

    const element = await officePlugin.render({
      source: {
        url: "https://example.com/file.docx",
        normalizedName: "file.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    expect(element.innerHTML).toContain("<h1>Title</h1>");
    expect(element.innerHTML).toContain("<table>");
    expect(element.textContent).toContain("Readable bullet");
    expect(element.innerHTML).not.toContain("<script>");
    expect(element.textContent).toContain("Comments were omitted.");
    expect(element.textContent).toContain("Tracked changes were flattened.");
  });

  it("keeps document images while sanitizing image-heavy docx output", async () => {
    setMammothLoaderForTesting(async () => ({
      convertToHtml: vi.fn().mockResolvedValue(createDocxConversionFixture({ includeImages: true }))
    }));

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]).buffer, {
          status: 200
        })
      )
    );

    const element = await officePlugin.render({
      source: {
        url: "https://example.com/gallery.docx",
        normalizedName: "gallery.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    const image = element.querySelector("img");
    expect(image).not.toBeNull();
    expect(image?.getAttribute("alt")).toBe("Preview image");
    expect(element.innerHTML).not.toContain("<script>");
  });

  it("falls back to a friendly docx message when no content is extractable", async () => {
    setMammothLoaderForTesting(async () => ({
      convertToHtml: vi.fn().mockResolvedValue({
        value: "   ",
        messages: []
      })
    }));

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]).buffer, {
          status: 200
        })
      )
    );

    const element = await officePlugin.render({
      source: {
        url: "https://example.com/empty.docx",
        normalizedName: "empty.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("No extractable document content found.");
  });

  it("renders a real binary docx fixture with mammoth parsing", async () => {
    const array = await createRealDocxFixture("simple-list.docx");

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
        url: "https://example.com/real.docx",
        normalizedName: "real.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("Apple");
    expect(element.textContent).toContain("Banana");
    expect(element.querySelector("ul")).not.toBeNull();
    expect(element.innerHTML).not.toContain("<script>");
  });

  it("renders a real docx comments fixture as readable text", async () => {
    const array = await createRealDocxFixture("comments.docx");

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
        url: "https://example.com/comments.docx",
        normalizedName: "comments.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("Ouch.");
    expect(element.innerHTML).not.toContain("<script>");
  });

  it("keeps footnotes readable in a real docx fixture", async () => {
    const array = await createRealDocxFixture("footnotes.docx");

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
        url: "https://example.com/footnotes.docx",
        normalizedName: "footnotes.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    const footnoteRefs = [...element.querySelectorAll("a[href^='#footnote-']")];
    expect(element.textContent).toContain("Ouch");
    expect(element.textContent).toContain("A tachyon walks into a bar.");
    expect(element.textContent).toContain("Fin.");
    expect(footnoteRefs.length).toBeGreaterThan(0);
    expect(footnoteRefs[0]?.getAttribute("rel")).toContain("noopener");
    expect(element.innerHTML).not.toContain("<script>");
  });

  it("keeps endnotes readable in a real docx fixture", async () => {
    const array = await createRealDocxFixture("endnotes.docx");

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
        url: "https://example.com/endnotes.docx",
        normalizedName: "endnotes.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    const endnoteRefs = [...element.querySelectorAll("a[href^='#endnote-']")];
    expect(element.textContent).toContain("Ouch");
    expect(element.textContent).toContain("A tachyon walks into a bar.");
    expect(element.textContent).toContain("Fin.");
    expect(endnoteRefs.length).toBeGreaterThan(0);
    expect(endnoteRefs[0]?.getAttribute("rel")).toContain("noopener");
    expect(element.innerHTML).not.toContain("<script>");
  });

  it("keeps safe hyperlinks from a docx package", async () => {
    const array = await createDocxFixture();

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
        url: "https://example.com/safe-link.docx",
        normalizedName: "safe-link.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    const link = element.querySelector("a");
    expect(link?.getAttribute("href")).toBe("https://example.com");
    expect(link?.getAttribute("rel")).toContain("noopener");
    expect(element.textContent).toContain("Example");
  });

  it("preserves inline images from a real docx fixture", async () => {
    const array = await createRealDocxFixture("tiny-picture.docx");

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
        url: "https://example.com/picture.docx",
        normalizedName: "picture.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    const image = element.querySelector("img");
    expect(image).not.toBeNull();
    expect(image?.getAttribute("src")).toMatch(/^data:image\/png;base64,/);
    expect(element.innerHTML).not.toContain("<script>");
  });

  it("summarizes table-heavy real docx content", async () => {
    const array = await createRealDocxFixture("tables.docx");

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
        url: "https://example.com/tables.docx",
        normalizedName: "tables.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("Above");
    expect(element.textContent).toContain("Below");
    expect(element.textContent).toContain("Top left");
    expect(element.textContent).toContain("Detected 1 table");
    expect(element.querySelector("table")).not.toBeNull();
  });

  it("keeps styled headings readable in real docx output", async () => {
    const array = await createRealDocxFixture("embedded-style-map.docx");

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
        url: "https://example.com/style-map.docx",
        normalizedName: "style-map.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("Walking on imported air");
    expect(element.querySelector("h1")).not.toBeNull();
  });

  it("strips unsafe hyperlinks from a real docx package", async () => {
    const array = await createDocxFixture({ unsafeLink: true });

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
        url: "https://example.com/unsafe.docx",
        normalizedName: "unsafe.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("Example");
    expect(element.querySelector("a")?.getAttribute("href")).toBeNull();
    expect(element.innerHTML).not.toContain("javascript:");
  });

  it("falls back cleanly when a real docx fixture references blocked external images", async () => {
    const array = await createRealDocxFixture("external-picture.docx");

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
        url: "https://example.com/external-picture.docx",
        normalizedName: "external-picture.docx",
        extension: "docx"
      },
      fetcher: defaultFetcher
    });

    expect(element.textContent).toContain("No extractable document content found.");
    expect(element.querySelector("img")).toBeNull();
  });

  it("renders wide xlsx headers beyond Z", async () => {
    const array = createWideWorkbookFixture(27);

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
        url: "https://example.com/wide.xlsx",
        normalizedName: "wide.xlsx",
        extension: "xlsx"
      },
      request: {
        office: {
          workbook: {
            maxColumns: 27
          }
        }
      },
      fetcher: defaultFetcher
    });

    const headers = [...element.querySelectorAll(".fpk-sheet-content thead th")].map((node) => node.textContent);
    expect(headers).toContain("AA");
    expect(element.textContent).toContain("value-27");
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

  it("supports zoom controls in the pdf viewer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]).buffer, {
          status: 200
        })
      )
    );

    setPdfJsLoaderForTesting(async () => ({
      GlobalWorkerOptions: {},
      getDocument() {
        return {
          promise: Promise.resolve({
            numPages: 1,
            async getPage() {
              return {
                getViewport({ scale }) {
                  return { width: 320 * scale, height: 480 * scale };
                },
                render() {
                  return { promise: Promise.resolve() };
                }
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

    const zoomIn = [...element.querySelectorAll("button")].find(
      (button) => button.textContent === "+"
    );
    expect(zoomIn).not.toBeUndefined();
    zoomIn?.click();
    await vi.waitFor(() => {
      expect(element.textContent).toContain("125%");
    });
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
