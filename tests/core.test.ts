import { describe, expect, it, vi } from "vitest";
import {
  FilePreviewRegistry,
  FilePreviewService,
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
});
