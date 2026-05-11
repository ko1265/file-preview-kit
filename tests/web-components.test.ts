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

  it("aborts an in-flight render when src is cleared", async () => {
    let aborted = false;
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: (source: { url: string }, signal?: AbortSignal) => Promise<HTMLElement> };
      removeAttribute(name: string): void;
      setAttribute(name: string, value: string): void;
      shadowRoot: ShadowRoot;
    };

    element.previewService = {
      async render(_source, signal) {
        await new Promise((resolve, reject) => {
          signal?.addEventListener("abort", () => {
            aborted = true;
            reject(new DOMException("Aborted", "AbortError"));
          });
        });

        const node = document.createElement("div");
        node.textContent = "Should not render";
        return node;
      }
    };

    document.body.append(element);
    element.setAttribute("src", "https://example.com/report.pdf");
    await Promise.resolve();
    element.removeAttribute("src");

    await vi.waitFor(() => {
      expect(aborted).toBe(true);
      expect(element.shadowRoot.querySelector(".viewport")?.textContent).toContain(
        "Set the src attribute to start previewing a file."
      );
    });
  });

  it("emits load lifecycle events for successful previews", async () => {
    const events: Array<{ type: string; detail: unknown }> = [];
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: () => Promise<HTMLElement> };
      setAttribute(name: string, value: string): void;
    };

    element.previewService = {
      async render() {
        const node = document.createElement("div");
        node.textContent = "Loaded preview";
        return node;
      }
    };

    element.addEventListener("file-preview:loadstart", (event) => {
      events.push({ type: event.type, detail: (event as CustomEvent).detail });
    });
    element.addEventListener("file-preview:load", (event) => {
      events.push({ type: event.type, detail: (event as CustomEvent).detail });
    });

    document.body.append(element);
    element.setAttribute("src", "https://example.com/guide.md");

    await Promise.resolve();
    await Promise.resolve();

    expect(events.map((event) => event.type)).toEqual([
      "file-preview:loadstart",
      "file-preview:load"
    ]);
    expect(events[0]?.detail).toMatchObject({
      source: {
        url: "https://example.com/guide.md"
      }
    });
    expect(events[1]?.detail).toMatchObject({
      source: {
        url: "https://example.com/guide.md"
      }
    });
  });

  it("lets parent containers observe bubbling lifecycle events", async () => {
    const container = document.createElement("div");
    const events: string[] = [];
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: () => Promise<HTMLElement> };
      setAttribute(name: string, value: string): void;
    };

    element.previewService = {
      async render() {
        const node = document.createElement("div");
        node.textContent = "Loaded preview";
        return node;
      }
    };

    container.addEventListener("file-preview:loadstart", () => {
      events.push("file-preview:loadstart");
    });
    container.addEventListener("file-preview:load", () => {
      events.push("file-preview:load");
    });

    container.append(element);
    document.body.append(container);
    element.setAttribute("src", "https://example.com/guide.md");

    await Promise.resolve();
    await Promise.resolve();

    expect(events).toEqual(["file-preview:loadstart", "file-preview:load"]);
  });

  it("suppresses stale completion events when src changes mid-render", async () => {
    const events: Array<{ type: string; detail: unknown }> = [];
    let resolveFirstRender: ((node: HTMLElement) => void) | undefined;
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: (source: { url: string }) => Promise<HTMLElement> };
      setAttribute(name: string, value: string): void;
      shadowRoot: ShadowRoot;
    };

    element.previewService = {
      async render(source) {
        if (source.url.endsWith("first.txt")) {
          return await new Promise<HTMLElement>((resolve) => {
            resolveFirstRender = resolve;
          });
        }

        const node = document.createElement("div");
        node.textContent = "Second preview";
        return node;
      }
    };

    element.addEventListener("file-preview:loadstart", (event) => {
      events.push({ type: event.type, detail: (event as CustomEvent).detail });
    });
    element.addEventListener("file-preview:load", (event) => {
      events.push({ type: event.type, detail: (event as CustomEvent).detail });
    });
    element.addEventListener("file-preview:error", (event) => {
      events.push({ type: event.type, detail: (event as CustomEvent).detail });
    });

    document.body.append(element);
    element.setAttribute("src", "https://example.com/first.txt");
    await Promise.resolve();
    element.setAttribute("src", "https://example.com/second.txt");

    await vi.waitFor(() => {
      expect(element.shadowRoot.querySelector(".viewport")?.textContent).toContain("Second preview");
    });

    const staleNode = document.createElement("div");
    staleNode.textContent = "First preview";
    resolveFirstRender?.(staleNode);
    await Promise.resolve();
    await Promise.resolve();

    expect(events.map((event) => event.type)).toEqual([
      "file-preview:loadstart",
      "file-preview:loadstart",
      "file-preview:load"
    ]);
    expect(events[2]?.detail).toMatchObject({
      source: {
        url: "https://example.com/second.txt"
      }
    });
    expect(element.shadowRoot.querySelector(".viewport")?.textContent).toContain("Second preview");
    expect(element.shadowRoot.querySelector(".viewport")?.textContent).not.toContain("First preview");
  });

  it("emits an error event when preview rendering fails", async () => {
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: () => Promise<HTMLElement> };
      setAttribute(name: string, value: string): void;
    };
    const captured: Array<CustomEvent> = [];

    element.previewService = {
      async render() {
        throw new Error("Boom");
      }
    };

    element.addEventListener("file-preview:error", (event) => {
      captured.push(event as CustomEvent);
    });

    document.body.append(element);
    element.setAttribute("src", "https://example.com/failure.txt");

    await Promise.resolve();
    await Promise.resolve();

    expect(captured).toHaveLength(1);
    expect(captured[0]?.detail).toMatchObject({
      source: {
        url: "https://example.com/failure.txt"
      },
      message: "Boom"
    });
    expect(element.shadowRoot?.textContent).toContain("Boom");
  });

  it("surfaces a clear error when the headers attribute is not valid JSON", async () => {
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: () => Promise<HTMLElement> };
      setAttribute(name: string, value: string): void;
      shadowRoot: ShadowRoot;
    };
    const captured: Array<CustomEvent> = [];
    let renderCalled = false;

    element.previewService = {
      async render() {
        renderCalled = true;
        const node = document.createElement("div");
        return node;
      }
    };

    element.addEventListener("file-preview:error", (event) => {
      captured.push(event as CustomEvent);
    });

    document.body.append(element);
    element.setAttribute("headers", '{"X-Test":');
    element.setAttribute("src", "https://example.com/failure.txt");

    await Promise.resolve();
    await Promise.resolve();

    expect(renderCalled).toBe(false);
    expect(captured).toHaveLength(1);
    expect(captured[0]?.detail).toMatchObject({
      source: null,
      message: "Invalid headers attribute JSON"
    });
    expect(element.shadowRoot?.textContent).toContain("Invalid headers attribute JSON");
  });

  it("suppresses stale error events when src changes before a failure resolves", async () => {
    const events: Array<{ type: string; detail: unknown }> = [];
    let rejectFirstRender: ((error: Error) => void) | undefined;
    const element = document.createElement(testTag) as HTMLElement & {
      previewService: { render: (source: { url: string }) => Promise<HTMLElement> };
      setAttribute(name: string, value: string): void;
      shadowRoot: ShadowRoot;
    };

    element.previewService = {
      async render(source) {
        if (source.url.endsWith("first.txt")) {
          return await new Promise<HTMLElement>((_resolve, reject) => {
            rejectFirstRender = reject;
          });
        }

        const node = document.createElement("div");
        node.textContent = "Recovered preview";
        return node;
      }
    };

    element.addEventListener("file-preview:loadstart", (event) => {
      events.push({ type: event.type, detail: (event as CustomEvent).detail });
    });
    element.addEventListener("file-preview:load", (event) => {
      events.push({ type: event.type, detail: (event as CustomEvent).detail });
    });
    element.addEventListener("file-preview:error", (event) => {
      events.push({ type: event.type, detail: (event as CustomEvent).detail });
    });

    document.body.append(element);
    element.setAttribute("src", "https://example.com/first.txt");
    await Promise.resolve();
    element.setAttribute("src", "https://example.com/second.txt");

    await vi.waitFor(() => {
      expect(element.shadowRoot.querySelector(".viewport")?.textContent).toContain("Recovered preview");
    });

    rejectFirstRender?.(new Error("Stale failure"));
    await Promise.resolve();
    await Promise.resolve();

    expect(events.map((event) => event.type)).toEqual([
      "file-preview:loadstart",
      "file-preview:loadstart",
      "file-preview:load"
    ]);
    expect(element.shadowRoot.querySelector(".viewport")?.textContent).toContain("Recovered preview");
    expect(element.shadowRoot.querySelector(".viewport")?.textContent).not.toContain("Stale failure");
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
