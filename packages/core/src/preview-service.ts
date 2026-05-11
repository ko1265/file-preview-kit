import type {
  FilePreviewFetcher,
  FilePreviewPlugin,
  FilePreviewRequestConfig,
  FilePreviewRequestResolver,
  FilePreviewResolution,
  FileSource
} from "@ko1265/file-preview-kit-shared";
import { FilePreviewRegistry } from "./preview-registry";
import { createDefaultPlugins } from "./plugins";
import { defaultPreviewFetcher, mergeRequestConfigs } from "./request";

export interface FilePreviewServiceOptions {
  plugins?: FilePreviewPlugin[];
  defaultRequest?: FilePreviewRequestConfig;
  fetcher?: FilePreviewFetcher;
  resolveRequest?: FilePreviewRequestResolver;
}

export class FilePreviewService {
  readonly registry: FilePreviewRegistry;
  readonly defaultRequest: FilePreviewRequestConfig | undefined;
  readonly fetcher: FilePreviewFetcher;
  readonly resolveRequest: FilePreviewRequestResolver | undefined;

  constructor(options: FilePreviewServiceOptions = {}) {
    this.registry = new FilePreviewRegistry();
    this.defaultRequest = options.defaultRequest;
    this.fetcher = options.fetcher ?? defaultPreviewFetcher;
    this.resolveRequest = options.resolveRequest;
    for (const plugin of options.plugins ?? createDefaultPlugins()) {
      this.registry.register(plugin);
    }
  }

  register(plugin: FilePreviewPlugin): this {
    this.registry.register(plugin);
    return this;
  }

  resolve(source: FileSource): FilePreviewResolution {
    const resolution = this.registry.resolve(source);
    if (!resolution) {
      throw new Error("No preview plugin registered.");
    }
    return resolution;
  }

  async render(source: FileSource, signal?: AbortSignal): Promise<HTMLElement> {
    const resolution = this.resolve(source);
    const mergedRequest = mergeRequestConfigs(this.defaultRequest, resolution.source.request);
    const request = this.resolveRequest
      ? await this.resolveRequest(resolution.source, mergedRequest)
      : mergedRequest;
    return resolution.plugin.render(
      {
        source: resolution.source,
        fetcher: this.fetcher,
        ...(request ? { request } : {}),
        ...(signal ? { signal } : {})
      }
    );
  }
}
