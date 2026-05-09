declare module "*?url" {
  const value: string;
  export default value;
}

declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export const GlobalWorkerOptions: {
    workerSrc?: string;
  };

  export function getDocument(options: {
    data: Uint8Array;
  }): {
    promise: Promise<{
      numPages: number;
      getPage(pageNumber: number): Promise<{
        getViewport(options: { scale: number }): {
          width: number;
          height: number;
        };
        render(options: {
          canvasContext: CanvasRenderingContext2D;
          viewport: {
            width: number;
            height: number;
          };
        }): { promise: Promise<void> };
      }>;
      destroy?(): Promise<void> | void;
    }>;
    destroy?(): Promise<void> | void;
  };
}

declare module "mammoth/mammoth.browser.js" {
  const mammoth: {
    convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<{
      value: string;
      messages: Array<{ message: string; type: string }>;
    }>;
  };

  export default mammoth;
}
