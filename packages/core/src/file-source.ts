import type { FileSource, ResolvedFileSource } from "@ko1265/file-preview-kit-shared";

const EXTENSION_PATTERN = /\.([a-z0-9]+)$/i;

export function normalizeFileSource(source: FileSource): ResolvedFileSource {
  const url = new URL(source.url, window.location.href);
  const nameFromPath = url.pathname.split("/").filter(Boolean).at(-1) ?? "preview";
  const normalizedName = (source.fileName ?? nameFromPath).trim() || "preview";
  const extensionMatch = normalizedName.match(EXTENSION_PATTERN);
  const extension = extensionMatch?.[1]?.toLowerCase() ?? "";

  return {
    ...source,
    url: url.toString(),
    normalizedName,
    extension
  };
}

export function hasExtension(source: ResolvedFileSource, extensions: string[]): boolean {
  return extensions.includes(source.extension);
}

export function hasMimeType(source: ResolvedFileSource, mimeTypes: string[]): boolean {
  const mimeType = source.mimeType?.toLowerCase();
  return Boolean(mimeType && mimeTypes.includes(mimeType));
}
