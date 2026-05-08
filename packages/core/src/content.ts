import type { FilePreviewRenderContext } from "@file-preview-kit/shared";
import { createRequestInit } from "./request";

function createFetchInit(context: FilePreviewRenderContext): RequestInit | undefined {
  return createRequestInit(context.request, context.signal);
}

async function assertResponse(response: Response): Promise<Response> {
  if (!response.ok) {
    throw new Error(`Failed to fetch preview content: ${response.status}`);
  }

  return response;
}

export async function fetchTextContent(context: FilePreviewRenderContext): Promise<string> {
  const init = createFetchInit(context) ?? {};
  const response = await context.fetcher(context.source.url, init, {
    source: context.source,
    ...(context.request ? { request: context.request } : {}),
    ...(context.signal ? { signal: context.signal } : {})
  });
  await assertResponse(response);
  return response.text();
}

export async function fetchBinaryContent(context: FilePreviewRenderContext): Promise<ArrayBuffer> {
  const init = createFetchInit(context) ?? {};
  const response = await context.fetcher(context.source.url, init, {
    source: context.source,
    ...(context.request ? { request: context.request } : {}),
    ...(context.signal ? { signal: context.signal } : {})
  });
  await assertResponse(response);
  return response.arrayBuffer();
}
