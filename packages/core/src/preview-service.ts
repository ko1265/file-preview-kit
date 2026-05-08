import type {
  FilePreviewFetcher,
  FilePreviewPlugin,
  FilePreviewRequestConfig,
  FilePreviewResolution,
  FileSource
} from "@file-preview-kit/shared";
import { FilePreviewRegistry } from "./preview-registry";
import { createDefaultPlugins } from "./plugins";
import { defaultPreviewFetcher, mergeRequestConfigs } from "./request";

export interface FilePreviewServiceOptions {
  plugins?: FilePreviewPlugin[];
  defaultRequest?: FilePreviewRequestConfig;
  fetcher?: FilePreviewFetcher;
}

export class FilePreviewService {
  readonly registry: FilePreviewRegistry;
  readonly defaultRequest: FilePreviewRequestConfig | undefined;
  readonly fetcher: FilePreviewFetcher;

  constructor(options: FilePreviewServiceOptions = {}) {
    this.registry = new FilePreviewRegistry();
    this.defaultRequest = options.defaultRequest;
    this.fetcher = options.fetcher ?? defaultPreviewFetcher;
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
    const request = mergeRequestConfigs(this.defaultRequest, resolution.source.request);
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
