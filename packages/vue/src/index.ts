import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType, type VNode } from "vue";
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

export interface FilePreviewProps {
  src?: string | undefined;
  fileName?: string | undefined;
  mimeType?: string | undefined;
  requestConfig?: FilePreviewRequestConfig | undefined;
  previewService?: FilePreviewService | undefined;
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

export const FilePreview = defineComponent({
  name: "FilePreview",
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: false
    },
    fileName: {
      type: String,
      required: false
    },
    mimeType: {
      type: String,
      required: false
    },
    requestConfig: {
      type: Object as PropType<FilePreviewRequestConfig | undefined>,
      required: false
    },
    previewService: {
      type: Object as PropType<FilePreviewService | undefined>,
      required: false
    }
  },
  emits: {
    loadstart: (_event: FilePreviewLoadStartEvent) => true,
    load: (_event: FilePreviewLoadEvent) => true,
    error: (_event: FilePreviewErrorEvent) => true
  },
  setup(props, { attrs, emit, expose }): () => VNode {
    const elementRef = ref<FilePreviewElementLike | null>(null);
    let removeEventListeners: (() => void) | undefined;

    function syncProps(): void {
      const element = elementRef.value;
      if (!element) {
        return;
      }

      void ensureFilePreviewElementRegistered().then(() => {
        applyFilePreviewProps(element, props);
      });
    }

    onMounted(() => {
      const element = elementRef.value;
      if (!element) {
        return;
      }

      const listeners = [
        ["file-preview:loadstart", (event: Event) => emit("loadstart", event as FilePreviewLoadStartEvent)],
        ["file-preview:load", (event: Event) => emit("load", event as FilePreviewLoadEvent)],
        ["file-preview:error", (event: Event) => emit("error", event as FilePreviewErrorEvent)]
      ] satisfies [string, EventListener][];

      for (const [type, listener] of listeners) {
        element.addEventListener(type, listener);
      }

      removeEventListeners = () => {
        for (const [type, listener] of listeners) {
          element.removeEventListener(type, listener);
        }
      };

      syncProps();
    });

    onBeforeUnmount(() => {
      removeEventListeners?.();
    });

    watch(
      () => [props.src, props.fileName, props.mimeType, props.requestConfig, props.previewService] as const,
      () => {
        syncProps();
      }
    );

    expose({
      el: elementRef
    });

    return () =>
      h("file-preview", {
        ...attrs,
        ref: elementRef
      });
  }
});

export type {
  FilePreviewElement,
  FilePreviewErrorDetail,
  FilePreviewLoadDetail,
  FilePreviewLoadStartDetail,
  FilePreviewRequestConfig,
  FilePreviewService
};
