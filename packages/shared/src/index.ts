export type FilePreviewKind =
  | "pdf"
  | "text"
  | "code"
  | "markdown"
  | "json"
  | "xml"
  | "yaml"
  | "csv"
  | "image"
  | "audio"
  | "video"
  | "docx"
  | "xlsx"
  | "pptx"
  | "unknown";

export interface FileSource {
  url: string;
  fileName?: string;
  mimeType?: string;
  request?: FilePreviewRequestConfig;
}

export interface ResolvedFileSource extends FileSource {
  extension: string;
  normalizedName: string;
}

export interface FilePreviewMatchContext {
  source: ResolvedFileSource;
}

export interface FilePreviewRenderContext {
  source: ResolvedFileSource;
  signal?: AbortSignal;
  request?: FilePreviewRequestConfig;
  fetcher: FilePreviewFetcher;
}

export interface FilePreviewCapabilities {
  textFetch?: boolean;
  sandboxedEmbed?: boolean;
  mediaStreaming?: boolean;
}

export interface FilePreviewDescriptor {
  id: string;
  kind: FilePreviewKind;
  label: string;
  priority?: number;
  extensions?: string[];
  mimeTypes?: string[];
  capabilities?: FilePreviewCapabilities;
}

export interface FilePreviewPlugin {
  descriptor: FilePreviewDescriptor;
  canPreview(context: FilePreviewMatchContext): boolean;
  render(context: FilePreviewRenderContext): Promise<HTMLElement>;
}

export interface FilePreviewResolution {
  plugin: FilePreviewPlugin;
  source: ResolvedFileSource;
}

export interface FilePreviewRequestConfig {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  cache?: RequestCache;
  redirect?: RequestRedirect;
  referrerPolicy?: ReferrerPolicy;
  integrity?: string;
  authToken?: string;
  authScheme?: string;
}

export interface FilePreviewFetchContext {
  source: ResolvedFileSource;
  request?: FilePreviewRequestConfig;
  signal?: AbortSignal;
}

export type FilePreviewFetcher = (
  input: string,
  init: RequestInit,
  context: FilePreviewFetchContext
) => Promise<Response>;
