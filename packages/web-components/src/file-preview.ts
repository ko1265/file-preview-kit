import { FilePreviewService } from "@ko1265/file-preview-kit-core";
import type {
  FilePreviewOfficeRequestConfig,
  FilePreviewRequestConfig,
  FileSource
} from "@ko1265/file-preview-kit-shared";
import { previewStyles } from "./styles";

export interface FilePreviewElementAttributes {
  src?: string;
  fileName?: string;
  mimeType?: string;
  headers?: string;
  credentials?: RequestCredentials;
  authToken?: string;
  authScheme?: string;
  workbookMaxSheets?: string;
  workbookMaxRows?: string;
  workbookMaxColumns?: string;
}

export interface FilePreviewLoadStartDetail {
  source: FileSource;
}

export interface FilePreviewLoadDetail {
  source: FileSource;
}

export interface FilePreviewErrorDetail {
  source: FileSource | null;
  message: string;
  error: unknown;
}

export class FilePreviewElement extends HTMLElement {
  static readonly tagName = "file-preview";
  static observedAttributes = [
    "src",
    "file-name",
    "mime-type",
    "headers",
    "credentials",
    "auth-token",
    "auth-scheme",
    "workbook-max-sheets",
    "workbook-max-rows",
    "workbook-max-columns"
  ];

  private readonly root: ShadowRoot;
  private service: FilePreviewService;
  private abortController?: AbortController;
  private explicitRequestConfig: FilePreviewRequestConfig | undefined;
  private refreshVersion = 0;

  constructor() {
    super();
    this.service = new FilePreviewService();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.renderShell();
    void this.refresh();
  }

  disconnectedCallback(): void {
    this.abortController?.abort();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) {
      void this.refresh();
    }
  }

  get src(): string | null {
    return this.getAttribute("src");
  }

  set src(value: string | null) {
    if (value === null) {
      this.removeAttribute("src");
    } else {
      this.setAttribute("src", value);
    }
  }

  get previewService(): FilePreviewService {
    return this.service;
  }

  set previewService(value: FilePreviewService) {
    this.service = value;
    if (this.isConnected) {
      void this.refresh();
    }
  }

  get requestConfig(): FilePreviewRequestConfig | undefined {
    return this.explicitRequestConfig;
  }

  set requestConfig(value: FilePreviewRequestConfig | undefined) {
    this.explicitRequestConfig = value;
    if (this.isConnected) {
      void this.refresh();
    }
  }

  private get source(): FileSource | null {
    const src = this.getAttribute("src");
    if (!src) {
      return null;
    }

    const fileName = this.getAttribute("file-name");
    const mimeType = this.getAttribute("mime-type");
    const request = this.resolveRequestConfig();

    return {
      url: src,
      ...(fileName ? { fileName } : {}),
      ...(mimeType ? { mimeType } : {}),
      ...(request ? { request } : {})
    };
  }

  private resolveRequestConfig(): FilePreviewRequestConfig | undefined {
    const attributeHeaders = this.parseHeadersAttribute();
    const credentials = this.getAttribute("credentials") as RequestCredentials | null;
    const authToken = this.getAttribute("auth-token");
    const authScheme = this.getAttribute("auth-scheme");
    const office = this.parseWorkbookAttributes();

    const attributeConfig: FilePreviewRequestConfig | undefined =
      attributeHeaders || credentials || authToken || authScheme || office
        ? {
            ...(attributeHeaders ? { headers: attributeHeaders } : {}),
            ...(credentials ? { credentials } : {}),
            ...(authToken ? { authToken } : {}),
            ...(authScheme ? { authScheme } : {}),
            ...(office ? { office } : {})
          }
        : undefined;

    if (!this.explicitRequestConfig && !attributeConfig) {
      return undefined;
    }

    const mergedOffice = {
      ...(attributeConfig?.office ?? {}),
      ...(this.explicitRequestConfig?.office ?? {}),
      ...(attributeConfig?.office?.workbook || this.explicitRequestConfig?.office?.workbook
        ? {
            workbook: {
              ...(attributeConfig?.office?.workbook ?? {}),
              ...(this.explicitRequestConfig?.office?.workbook ?? {})
            }
          }
        : {})
    };

    return {
      ...(attributeConfig ?? {}),
      ...(this.explicitRequestConfig ?? {}),
      ...(Object.keys(mergedOffice).length > 0 ? { office: mergedOffice } : {}),
      headers: {
        ...(attributeConfig?.headers ?? {}),
        ...(this.explicitRequestConfig?.headers ?? {})
      }
    };
  }

  private parseHeadersAttribute(): Record<string, string> | undefined {
    const raw = this.getAttribute("headers");
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed;
  }

  private parseWorkbookAttributes(): FilePreviewOfficeRequestConfig | undefined {
    const maxSheets = this.parsePositiveIntegerAttribute("workbook-max-sheets");
    const maxRows = this.parsePositiveIntegerAttribute("workbook-max-rows");
    const maxColumns = this.parsePositiveIntegerAttribute("workbook-max-columns");

    const workbook: FilePreviewOfficeRequestConfig["workbook"] = {};

    if (maxSheets !== undefined) {
      workbook.maxSheets = maxSheets;
    }

    if (maxRows !== undefined) {
      workbook.maxRows = maxRows;
    }

    if (maxColumns !== undefined) {
      workbook.maxColumns = maxColumns;
    }

    return Object.keys(workbook).length > 0 ? { workbook } : undefined;
  }

  private parsePositiveIntegerAttribute(name: string): number | undefined {
    const raw = this.getAttribute(name);
    if (!raw) {
      return undefined;
    }

    const value = Number.parseInt(raw, 10);
    return Number.isInteger(value) && value > 0 ? value : undefined;
  }

  private renderShell(): void {
    this.root.innerHTML = `
      <style>${previewStyles}</style>
      <section class="frame">
        <div class="meta">
          <div class="status"><span class="status-dot"></span><span>Remote preview</span></div>
          <div class="file-name">Waiting for source</div>
        </div>
        <div class="viewport"><div class="empty">Set the <code>src</code> attribute to start previewing a file.</div></div>
      </section>
    `;
  }

  private setViewport(node: HTMLElement): void {
    const viewport = this.root.querySelector(".viewport");
    if (!viewport) {
      return;
    }

    viewport.replaceChildren(node);
  }

  private setFileName(label: string): void {
    const fileName = this.root.querySelector(".file-name");
    if (fileName) {
      fileName.textContent = label;
    }
  }

  private dispatchLoadStart(source: FileSource): void {
    this.dispatchEvent(
      new CustomEvent<FilePreviewLoadStartDetail>("file-preview:loadstart", {
        detail: { source }
      })
    );
  }

  private dispatchLoad(source: FileSource): void {
    this.dispatchEvent(
      new CustomEvent<FilePreviewLoadDetail>("file-preview:load", {
        detail: { source }
      })
    );
  }

  private dispatchError(source: FileSource | null, error: unknown, message: string): void {
    this.dispatchEvent(
      new CustomEvent<FilePreviewErrorDetail>("file-preview:error", {
        detail: {
          source,
          message,
          error
        }
      })
    );
  }

  async refresh(): Promise<void> {
    const refreshVersion = ++this.refreshVersion;

    try {
      const source = this.source;
      if (!source) {
        this.setFileName("Waiting for source");
        this.setViewport(this.createState("empty", "Set the src attribute to start previewing a file."));
        return;
      }

      this.abortController?.abort();
      this.abortController = new AbortController();
      const currentController = this.abortController;
      this.setFileName(
        source.fileName ?? new URL(source.url, window.location.href).pathname.split("/").at(-1) ?? source.url
      );
      this.setViewport(this.createState("loading", "Loading preview..."));
      this.dispatchLoadStart(source);

      const node = await this.service.render(source, currentController.signal);
      if (refreshVersion !== this.refreshVersion || currentController.signal.aborted) {
        return;
      }
      this.setViewport(node);
      this.dispatchLoad(source);
    } catch (error) {
      if (
        refreshVersion !== this.refreshVersion ||
        (error instanceof DOMException && error.name === "AbortError") ||
        (error instanceof Error && /aborted/i.test(error.message))
      ) {
        return;
      }

      const message = error instanceof Error ? error.message : "Unknown preview error";
      this.setViewport(this.createState("error", message));
      this.dispatchError(this.source, error, message);
    }
  }

  private createState(className: string, message: string): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.className = className;
    wrapper.textContent = message;
    return wrapper;
  }
}

export function registerFilePreviewElement(tagName = FilePreviewElement.tagName): typeof FilePreviewElement {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, FilePreviewElement);
  }

  return FilePreviewElement;
}
