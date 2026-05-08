import { describe, expect, it, vi } from "vitest";
import {
  FilePreviewRegistry,
  FilePreviewService,
  createRequestInit,
  mergeRequestConfigs,
  plainTextPlugin
} from "../packages/core/src/index";

describe("FilePreviewRegistry", () => {
  it("resolves markdown files to the markdown plugin", () => {
    const service = new FilePreviewService();
    const resolution = service.resolve({
      url: "https://example.com/docs/readme.md"
    });

    expect(resolution.plugin.descriptor.id).toBe("markdown");
  });

  it("falls back when no specific plugin can handle a file", () => {
    const registry = new FilePreviewRegistry();
    const service = new FilePreviewService();
    const resolution = service.resolve({
      url: "https://example.com/blob.weird"
    });

    expect(resolution.plugin.descriptor.id).toBe("fallback");
    expect(registry.list()).toHaveLength(0);
  });

  it("merges default request config with source request config before fetching", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("secured preview", {
        status: 200
      })
    );
    const service = new FilePreviewService({
      plugins: [plainTextPlugin],
      defaultRequest: {
        headers: {
          "X-App": "demo"
        },
        credentials: "include"
      },
      fetcher
    });

    await service.render({
      url: "https://example.com/secure.txt",
      request: {
        headers: {
          Authorization: "Bearer token"
        }
      }
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    const [, init] = fetcher.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get("X-App")).toBe("demo");
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(init.credentials).toBe("include");
  });

  it("resolves image previews from mime type when the URL has no extension", () => {
    const service = new FilePreviewService();
    const resolution = service.resolve({
      url: "https://images.example.com/photo?id=123",
      mimeType: "image/jpeg"
    });

    expect(resolution.plugin.descriptor.id).toBe("image");
  });

  it("supports async request resolution before fetching", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("resolved preview", {
        status: 200
      })
    );
    const service = new FilePreviewService({
      plugins: [plainTextPlugin],
      fetcher,
      resolveRequest: async (_source, request) => ({
        ...(request ?? {}),
        headers: {
          ...(request?.headers ?? {}),
          Authorization: "Bearer refreshed-token"
        }
      })
    });

    await service.render({
      url: "https://example.com/authenticated.txt",
      request: {
        headers: {
          "X-Base": "demo"
        }
      }
    });

    const [, init] = fetcher.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get("X-Base")).toBe("demo");
    expect(headers.get("Authorization")).toBe("Bearer refreshed-token");
  });

  it("merges nested office workbook request options", () => {
    const merged = mergeRequestConfigs(
      {
        office: {
          workbook: {
            maxSheets: 6,
            maxRows: 100
          }
        }
      },
      {
        office: {
          workbook: {
            maxRows: 12,
            maxColumns: 4
          }
        }
      }
    );

    expect(merged?.office?.workbook).toEqual({
      maxSheets: 6,
      maxRows: 12,
      maxColumns: 4
    });
  });

  it("builds an authorization header from authToken and authScheme", () => {
    const signal = new AbortController().signal;
    const init = createRequestInit(
      {
        headers: {
          "X-App": "demo"
        },
        authToken: "token-123",
        authScheme: "Digest"
      },
      signal
    );

    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Digest token-123");
    expect(headers.get("X-App")).toBe("demo");
    expect(init?.signal).toBe(signal);
  });

  it("keeps an explicit authorization header when authToken is also present", () => {
    const init = createRequestInit(
      {
        headers: {
          Authorization: "Basic abc123"
        },
        authToken: "token-123",
        authScheme: "Digest"
      },
      undefined
    );

    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Basic abc123");
  });

  it("passes merged office workbook options into resolveRequest", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("merged preview", {
        status: 200
      })
    );
    let capturedRequest: unknown;
    const service = new FilePreviewService({
      plugins: [plainTextPlugin],
      defaultRequest: {
        office: {
          workbook: {
            maxSheets: 4,
            maxRows: 40
          }
        }
      },
      fetcher,
      resolveRequest: async (_source, request) => {
        capturedRequest = request;
        return request;
      }
    });

    await service.render({
      url: "https://example.com/report.txt",
      request: {
        office: {
          workbook: {
            maxRows: 8,
            maxColumns: 3
          }
        }
      }
    });

    expect(capturedRequest).toEqual({
      office: {
        workbook: {
          maxSheets: 4,
          maxRows: 8,
          maxColumns: 3
        }
      }
    });
  });
});
