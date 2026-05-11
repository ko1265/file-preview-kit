import {
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithoutRef,
  type Ref
} from "react";
import type { FilePreviewService } from "@ko1265/file-preview-kit-core";
import type { FilePreviewRequestConfig } from "@ko1265/file-preview-kit-shared";
import type {
  FilePreviewElement,
  FilePreviewErrorDetail,
  FilePreviewLoadDetail,
  FilePreviewLoadStartDetail
} from "@ko1265/file-preview-kit-web-components";

type FilePreviewHostProps = Omit<
  ComponentPropsWithoutRef<"div">,
  | "children"
  | "dangerouslySetInnerHTML"
  | "onError"
  | "onLoad"
  | "onLoadStart"
>;

export type FilePreviewLoadStartEvent = CustomEvent<FilePreviewLoadStartDetail>;
export type FilePreviewLoadEvent = CustomEvent<FilePreviewLoadDetail>;
export type FilePreviewErrorEvent = CustomEvent<FilePreviewErrorDetail>;

export interface FilePreviewProps extends FilePreviewHostProps {
  src?: string | undefined;
  fileName?: string | undefined;
  mimeType?: string | undefined;
  requestConfig?: FilePreviewRequestConfig | undefined;
  previewService?: FilePreviewService | undefined;
  onLoadStart?: (event: FilePreviewLoadStartEvent) => void;
  onLoad?: (event: FilePreviewLoadEvent) => void;
  onError?: (event: FilePreviewErrorEvent) => void;
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

function applyFilePreviewProps(element: FilePreviewElementLike, props: FilePreviewProps): void {
  if (props.previewService !== undefined && element.previewService !== props.previewService) {
    element.previewService = props.previewService;
  }

  if (element.requestConfig !== props.requestConfig) {
    element.requestConfig = props.requestConfig;
  }

  setOptionalAttribute(element, "file-name", props.fileName);
  setOptionalAttribute(element, "mime-type", props.mimeType);
  setOptionalAttribute(element, "src", props.src);
}

function addEventListeners(element: HTMLElement, getProps: () => FilePreviewProps): () => void {
  const listeners = [
    ["file-preview:loadstart", (event: Event) => getProps().onLoadStart?.(event as FilePreviewLoadStartEvent)],
    ["file-preview:load", (event: Event) => getProps().onLoad?.(event as FilePreviewLoadEvent)],
    ["file-preview:error", (event: Event) => getProps().onError?.(event as FilePreviewErrorEvent)]
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

export const FilePreview = forwardRef<FilePreviewElement, FilePreviewProps>(function FilePreview(
  props,
  ref: Ref<FilePreviewElement>
) {
  const {
    src,
    fileName,
    mimeType,
    requestConfig,
    previewService,
    onLoadStart,
    onLoad,
    onError,
    ...hostProps
  } = props;
  const elementRef = useRef<FilePreviewElementLike | null>(null);
  const latestProps = useRef<FilePreviewProps>(props);

  latestProps.current = props;

  useImperativeHandle(ref, () => elementRef.current as FilePreviewElement, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const removeEventListeners = addEventListeners(element, () => latestProps.current);

    return () => {
      removeEventListeners();
    };
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    void ensureFilePreviewElementRegistered().then(() => {
      applyFilePreviewProps(element, latestProps.current);
    });
  }, [src, fileName, mimeType, requestConfig, previewService]);

  return createElement("file-preview", {
    ...hostProps,
    ref: elementRef
  });
});

FilePreview.displayName = "FilePreview";

export type {
  FilePreviewElement,
  FilePreviewErrorDetail,
  FilePreviewLoadDetail,
  FilePreviewLoadStartDetail,
  FilePreviewRequestConfig,
  FilePreviewService
};
