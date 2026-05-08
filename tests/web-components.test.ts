import { describe, expect, it, vi } from "vitest";
import { registerFilePreviewElement } from "../packages/web-components/src/file-preview";

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
    element.setAttribute("src", "https://example.com/private.txt");

    await Promise.resolve();
    await Promise.resolve();

    expect(capturedRequest).toEqual({
      headers: {
        "X-Test": "1"
      },
      credentials: "include",
      authToken: "token-123"
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
});
