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
    const previousButton = createButton("Previous");
    const nextButton = createButton("Next");
    const canvas = document.createElement("canvas");
    canvas.className = "fpk-pdf-canvas";
    viewport.append(canvas);
    toolbar.append(previousButton, pageCounter, nextButton);
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

    async function paintPage(pageNumber: number): Promise<void> {
      const page = await documentProxy.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.25 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      pageCounter.textContent = `Page ${pageNumber} / ${documentProxy.numPages}`;
      previousButton.disabled = pageNumber <= 1;
      nextButton.disabled = pageNumber >= documentProxy.numPages;
      await page.render({
        canvasContext: renderingContext,
        viewport
      }).promise;
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
