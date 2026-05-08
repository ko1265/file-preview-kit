import { describe, expect, it, vi } from "vitest";
import { FilePreviewService, officePlugin } from "../packages/core/src/index";
import { registerFilePreviewElement } from "../packages/web-components/src/file-preview";
import { createWorkbookFixture } from "./fixtures/office";

const testTag = "test-file-preview";
registerFilePreviewElement(testTag);

describe("FilePreviewElement", () => {
  it("renders an empty state before a source is provided", () => {
    const element = document.createElement(testTag);
    document.body.append(element);

    const viewport = (element as HTMLElement).shadowRoot?.querySelector(".empty");
    expect(viewport?.textContent).toContain("Set the src attribute");
  });

  it("supports overriding the preview service through a property", async () => {
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: () => Promise<HTMLElement> };
      setAttribute(name: string, value: string): void;
      shadowRoot: ShadowRoot;
    };

    element.previewService = {
      async render() {
        const node = document.createElement("div");
        node.textContent = "Custom preview";
        return node;
      }
    };

    document.body.append(element);
    element.setAttribute("src", "https://example.com/custom.txt");

    await Promise.resolve();
    await Promise.resolve();

    expect(element.shadowRoot.querySelector(".viewport")?.textContent).toContain("Custom preview");
  });

  it("passes request configuration from attributes to the preview service", async () => {
    let capturedRequest: unknown;
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: (source: { request?: unknown }) => Promise<HTMLElement> };
      setAttribute(name: string, value: string): void;
    };

    element.previewService = {
      async render(source) {
        capturedRequest = source.request;
        const node = document.createElement("div");
        node.textContent = "Configured preview";
        return node;
      }
    };

    document.body.append(element);
    element.setAttribute("headers", '{"X-Test":"1"}');
    element.setAttribute("credentials", "include");
    element.setAttribute("auth-token", "token-123");
    element.setAttribute("auth-scheme", "Digest");
    element.setAttribute("src", "https://example.com/private.txt");

    await Promise.resolve();
    await Promise.resolve();

    expect(capturedRequest).toEqual({
      headers: {
        "X-Test": "1"
      },
      credentials: "include",
      authToken: "token-123",
      authScheme: "Digest"
    });
  });

  it("passes workbook limit requestConfig through to the preview service", async () => {
    let capturedRequest: unknown;
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: (source: { request?: unknown }) => Promise<HTMLElement> };
      requestConfig: unknown;
      setAttribute(name: string, value: string): void;
    };

    element.previewService = {
      async render(source) {
        capturedRequest = source.request;
        const node = document.createElement("div");
        node.textContent = "Configured preview";
        return node;
      }
    };

    document.body.append(element);
    element.requestConfig = {
      office: {
        workbook: {
          maxSheets: 2,
          maxRows: 11,
          maxColumns: 7
        }
      }
    };
    element.setAttribute("src", "https://example.com/report.xlsx");

    await Promise.resolve();
    await Promise.resolve();

    expect(capturedRequest).toEqual({
      headers: {},
      office: {
        workbook: {
          maxSheets: 2,
          maxRows: 11,
          maxColumns: 7
        }
      }
    });
  });

  it("lets requestConfig property workbook values override matching attributes", async () => {
    let capturedRequest: unknown;
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: (source: { request?: unknown }) => Promise<HTMLElement> };
      requestConfig: unknown;
      setAttribute(name: string, value: string): void;
    };

    element.previewService = {
      async render(source) {
        capturedRequest = source.request;
        const node = document.createElement("div");
        node.textContent = "Configured preview";
        return node;
      }
    };

    element.requestConfig = {
      office: {
        workbook: {
          maxSheets: 5,
          maxRows: 9
        }
      }
    };

    document.body.append(element);
    element.setAttribute("workbook-max-sheets", "2");
    element.setAttribute("workbook-max-rows", "11");
    element.setAttribute("src", "https://example.com/report.xlsx");

    await Promise.resolve();
    await Promise.resolve();

    expect(capturedRequest).toEqual({
      headers: {},
      office: {
        workbook: {
          maxSheets: 5,
          maxRows: 9
        }
      }
    });
  });

  it("lets requestConfig property values override matching attributes", async () => {
    let capturedRequest: unknown;
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: (source: { request?: unknown }) => Promise<HTMLElement> };
      requestConfig: unknown;
      setAttribute(name: string, value: string): void;
    };

    element.previewService = {
      async render(source) {
        capturedRequest = source.request;
        const node = document.createElement("div");
        node.textContent = "Configured preview";
        return node;
      }
    };

    element.requestConfig = {
      headers: {
        "X-Test": "property",
        "X-Only": "property"
      },
      credentials: "omit",
      authToken: "property-token",
      authScheme: "Digest"
    };

    document.body.append(element);
    element.setAttribute("headers", '{"X-Test":"attribute","X-Attr":"1"}');
    element.setAttribute("credentials", "include");
    element.setAttribute("auth-token", "attribute-token");
    element.setAttribute("auth-scheme", "Bearer");
    element.setAttribute("src", "https://example.com/private.txt");

    await Promise.resolve();
    await Promise.resolve();

    expect(capturedRequest).toEqual({
      headers: {
        "X-Test": "property",
        "X-Attr": "1",
        "X-Only": "property"
      },
      credentials: "omit",
      authToken: "property-token",
      authScheme: "Digest"
    });
  });

  it("does not surface abort errors during rapid attribute updates", async () => {
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: (source: { url: string }, signal?: AbortSignal) => Promise<HTMLElement> };
      setAttribute(name: string, value: string): void;
      shadowRoot: ShadowRoot;
    };

    element.previewService = {
      async render(_source, signal) {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, 20);
          signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
          });
        });

        const node = document.createElement("div");
        node.textContent = "Final preview";
        return node;
      }
    };

    document.body.append(element);
    element.setAttribute("mime-type", "text/markdown");
    element.setAttribute("src", "https://example.com/first");
    element.setAttribute("mime-type", "image/jpeg");
    element.setAttribute("src", "https://example.com/second");

    await vi.waitFor(() => {
      expect(element.shadowRoot.querySelector(".viewport")?.textContent).toContain("Final preview");
    });
    expect(element.shadowRoot.textContent).not.toContain("AbortError");
  });

  it("renders workbook previews inside the custom element with compact office limits", async () => {
    const workbook = createWorkbookFixture({ sheetCount: 4 });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(workbook, {
          status: 200
        })
      )
    );

    const element = document.createElement(testTag) as HTMLElement & {
      previewService: FilePreviewService;
      requestConfig: {
        office: {
          workbook: {
            maxSheets: number;
            maxRows: number;
            maxColumns: number;
          };
        };
      };
      setAttribute(name: string, value: string): void;
      shadowRoot: ShadowRoot;
    };

    element.previewService = new FilePreviewService({
      plugins: [officePlugin],
      fetcher: async (input, init) => fetch(input, init)
    });
    element.requestConfig = {
      office: {
        workbook: {
          maxSheets: 2,
          maxRows: 2,
          maxColumns: 2
        }
      }
    };

    document.body.append(element);
    element.setAttribute("src", "https://example.com/report.xlsx");

    await vi.waitFor(() => {
      expect(element.shadowRoot.querySelector(".fpk-sheet-tab")).not.toBeNull();
    });

    expect(element.shadowRoot.querySelectorAll(".fpk-sheet-tab")).toHaveLength(2);
    expect(element.shadowRoot.textContent).toContain("Workbook trimmed");
    expect(element.shadowRoot.textContent).toContain("Large sheet truncated");
  });

});
