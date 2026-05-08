import type { FilePreviewPlugin, FilePreviewRenderContext } from "@file-preview-kit/shared";
import { hasExtension, hasMimeType } from "./file-source";
import { fetchBinaryContent } from "./content";
import { createContainer, createMessageCard } from "./render-utils";

type PdfViewport = {
  width: number;
  height: number;
};

type PdfPage = {
  getViewport(options: { scale: number }): PdfViewport;
  render(options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
  }): { promise: Promise<void> };
};

type PdfDocument = {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfPage>;
  destroy?(): Promise<void> | void;
};

type PdfLoadingTask = {
  promise: Promise<PdfDocument>;
  destroy?(): Promise<void> | void;
};

type PdfJsModule = {
  getDocument(options: { data: Uint8Array }): PdfLoadingTask;
  GlobalWorkerOptions: {
    workerSrc?: string;
  };
};

let pdfJsLoaderOverride: (() => Promise<PdfJsModule>) | undefined;

async function loadPdfJs(): Promise<PdfJsModule> {
  if (pdfJsLoaderOverride) {
    return pdfJsLoaderOverride();
  }

  const [{ default: workerSrc }, pdfJs] = await Promise.all([
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    import("pdfjs-dist/legacy/build/pdf.mjs")
  ]);

  pdfJs.GlobalWorkerOptions.workerSrc = workerSrc;
  return pdfJs as PdfJsModule;
}

export function setPdfJsLoaderForTesting(
  loader: (() => Promise<PdfJsModule>) | undefined
): void {
  pdfJsLoaderOverride = loader;
}

function createButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "fpk-pdf-button";
  button.textContent = label;
  return button;
}

function createLink(label: string, href: string): HTMLAnchorElement {
  const link = document.createElement("a");
  link.className = "fpk-pdf-link";
  link.href = href;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = label;
  return link;
}

function createPdfIframeFallback(
  context: FilePreviewRenderContext,
  reason?: string
): HTMLElement {
  const wrapper = createContainer("fpk-pdf-preview");
  const note = createContainer("fpk-pdf-fallback-note");
  const title = document.createElement("strong");
  title.textContent = "Switched to compatibility mode";
  const body = document.createElement("p");
  body.textContent =
    reason ??
    "The PDF stream could not be fetched directly, so the preview fell back to an embedded viewer.";
  const iframe = document.createElement("iframe");
  iframe.src = context.source.url;
  iframe.title = `${context.source.normalizedName} preview`;
  iframe.loading = "lazy";
  note.append(title, body);
  wrapper.append(note, iframe);
  return wrapper;
}

async function renderPdfDocument(context: FilePreviewRenderContext): Promise<HTMLElement> {
  try {
    const buffer = await fetchBinaryContent(context);
    const pdfJs = await loadPdfJs();
    const task = pdfJs.getDocument({
      data: new Uint8Array(buffer)
    });

    const documentProxy = await task.promise;
    const wrapper = createContainer("fpk-pdf-preview");
    const toolbar = createContainer("fpk-pdf-toolbar");
    const viewport = createContainer("fpk-pdf-canvas-wrap");
    const pageCounter = document.createElement("span");
    pageCounter.className = "fpk-pdf-page-counter";
    const status = document.createElement("span");
    status.className = "fpk-pdf-status";
    const previousButton = createButton("Previous");
    const nextButton = createButton("Next");
    const zoomOutButton = createButton("-");
    const zoomResetButton = createButton("100%");
    const zoomInButton = createButton("+");
    const openButton = createLink("Open", context.source.url);
    const canvas = document.createElement("canvas");
    canvas.className = "fpk-pdf-canvas";
    viewport.append(canvas);
    toolbar.append(
      previousButton,
      pageCounter,
      nextButton,
      zoomOutButton,
      zoomResetButton,
      zoomInButton,
      openButton,
      status
    );
    wrapper.append(toolbar, viewport);

    const context2d = canvas.getContext("2d");
    if (!context2d) {
      documentProxy.destroy?.();
      task.destroy?.();
      return createMessageCard(
        "PDF preview unavailable",
        "This environment does not support canvas rendering for PDF previews."
      );
    }
    const renderingContext = context2d;

    let currentPage = 1;
    let scale = 1;
    let renderVersion = 0;

    async function paintPage(pageNumber: number): Promise<void> {
      const version = ++renderVersion;
      status.textContent = "Rendering...";
      previousButton.disabled = true;
      nextButton.disabled = true;
      zoomOutButton.disabled = true;
      zoomResetButton.disabled = true;
      zoomInButton.disabled = true;

      const page = await documentProxy.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      pageCounter.textContent = `Page ${pageNumber} / ${documentProxy.numPages}`;
      await page.render({
        canvasContext: renderingContext,
        viewport
      }).promise;
      if (version !== renderVersion) {
        return;
      }

      previousButton.disabled = pageNumber <= 1;
      nextButton.disabled = pageNumber >= documentProxy.numPages;
      zoomOutButton.disabled = scale <= 0.5;
      zoomResetButton.disabled = scale === 1;
      zoomInButton.disabled = scale >= 2.5;
      status.textContent = `${Math.round(scale * 100)}%`;
      zoomResetButton.textContent = `${Math.round(scale * 100)}%`;
    }

    previousButton.addEventListener("click", () => {
      if (currentPage <= 1) {
        return;
      }

      currentPage -= 1;
      void paintPage(currentPage);
    });

    nextButton.addEventListener("click", () => {
      if (currentPage >= documentProxy.numPages) {
        return;
      }

      currentPage += 1;
      void paintPage(currentPage);
    });

    zoomOutButton.addEventListener("click", () => {
      if (scale <= 0.5) {
        return;
      }

      scale = Math.max(0.5, Number((scale - 0.25).toFixed(2)));
      void paintPage(currentPage);
    });

    zoomResetButton.addEventListener("click", () => {
      if (scale === 1) {
        return;
      }

      scale = 1;
      void paintPage(currentPage);
    });

    zoomInButton.addEventListener("click", () => {
      if (scale >= 2.5) {
        return;
      }

      scale = Math.min(2.5, Number((scale + 0.25).toFixed(2)));
      void paintPage(currentPage);
    });

    await paintPage(currentPage);
    return wrapper;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown PDF fetch error";
    return createPdfIframeFallback(
      context,
      `The PDF could not be fetched for pdf.js rendering (${message}). This usually means the remote server blocks cross-origin fetches, so the preview switched to iframe compatibility mode instead.`
    );
  }
}

export const pdfPlugin: FilePreviewPlugin = {
  descriptor: {
    id: "pdf",
    kind: "pdf",
    label: "PDF",
    priority: 100,
    extensions: ["pdf"],
    mimeTypes: ["application/pdf"],
    capabilities: {
      textFetch: true
    }
  },
  canPreview(context) {
    return hasExtension(context.source, ["pdf"]) || hasMimeType(context.source, ["application/pdf"]);
  },
  async render(context) {
    return renderPdfDocument(context);
  }
};
