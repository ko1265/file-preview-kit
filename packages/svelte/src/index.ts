import type { FilePreviewService } from "@ko1265/file-preview-kit-core";
import type { FilePreviewRequestConfig } from "@ko1265/file-preview-kit-shared";
import type {
  FilePreviewElement,
  FilePreviewErrorDetail,
  FilePreviewLoadDetail,
  FilePreviewLoadStartDetail
} from "@ko1265/file-preview-kit-web-components";

export type FilePreviewLoadStartEvent = CustomEvent<FilePreviewLoadStartDetail>;
export type FilePreviewLoadEvent = CustomEvent<FilePreviewLoadDetail>;
export type FilePreviewErrorEvent = CustomEvent<FilePreviewErrorDetail>;

export interface FilePreviewActionOptions {
  src?: string | undefined;
  fileName?: string | undefined;
  mimeType?: string | undefined;
  requestConfig?: FilePreviewRequestConfig | undefined;
  previewService?: FilePreviewService | undefined;
  onLoadStart?: (event: FilePreviewLoadStartEvent) => void;
  onLoad?: (event: FilePreviewLoadEvent) => void;
  onError?: (event: FilePreviewErrorEvent) => void;
}

export interface FilePreviewActionReturn {
  update(options?: FilePreviewActionOptions): void;
  destroy(): void;
}

type FilePreviewElementLike = HTMLElement & {
  requestConfig: FilePreviewRequestConfig | undefined;
  previewService?: FilePreviewService;
};

let registrationPromise: Promise<void> | undefined;

export function ensureFilePreviewElementRegistered(): Promise<void> {
  if (typeof window === "undefined" || !("customElements" in window)) {
    return Promise.resolve();
  }

  registrationPromise ??= import("@ko1265/file-preview-kit-web-components").then(
    ({ registerFilePreviewElement }) => {
      registerFilePreviewElement();
    }
  );

  return registrationPromise;
}

function setOptionalAttribute(element: HTMLElement, name: string, value: string | undefined): void {
  if (value === undefined) {
    if (element.hasAttribute(name)) {
      element.removeAttribute(name);
    }
    return;
  }

  if (element.getAttribute(name) !== value) {
    element.setAttribute(name, value);
  }
}

function applyFilePreviewOptions(element: FilePreviewElementLike, options: FilePreviewActionOptions): void {
  if (options.previewService !== undefined && element.previewService !== options.previewService) {
    element.previewService = options.previewService;
  }

  if (element.requestConfig !== options.requestConfig) {
    element.requestConfig = options.requestConfig;
  }

  setOptionalAttribute(element, "file-name", options.fileName);
  setOptionalAttribute(element, "mime-type", options.mimeType);
  setOptionalAttribute(element, "src", options.src);
}

function addEventListeners(
  element: HTMLElement,
  getOptions: () => FilePreviewActionOptions
): () => void {
  const listeners = [
    [
      "file-preview:loadstart",
      (event: Event) => getOptions().onLoadStart?.(event as FilePreviewLoadStartEvent)
    ],
    ["file-preview:load", (event: Event) => getOptions().onLoad?.(event as FilePreviewLoadEvent)],
    ["file-preview:error", (event: Event) => getOptions().onError?.(event as FilePreviewErrorEvent)]
  ] satisfies [string, EventListener][];

  for (const [type, listener] of listeners) {
    element.addEventListener(type, listener);
  }

  return () => {
    for (const [type, listener] of listeners) {
      element.removeEventListener(type, listener);
    }
  };
}

export function filePreview(
  node: HTMLElement,
  options: FilePreviewActionOptions = {}
): FilePreviewActionReturn {
  const element = node as FilePreviewElementLike;
  let currentOptions = options;
  let disposed = false;

  const removeEventListeners = addEventListeners(element, () => currentOptions);

  function syncOptions(): void {
    void ensureFilePreviewElementRegistered().then(() => {
      if (!disposed) {
        applyFilePreviewOptions(element, currentOptions);
      }
    });
  }

  syncOptions();

  return {
    update(nextOptions: FilePreviewActionOptions = {}) {
      currentOptions = nextOptions;
      syncOptions();
    },
    destroy() {
      disposed = true;
      removeEventListeners();
    }
  };
}

export type {
  FilePreviewElement,
  FilePreviewErrorDetail,
  FilePreviewLoadDetail,
  FilePreviewLoadStartDetail,
  FilePreviewRequestConfig,
  FilePreviewService
};
