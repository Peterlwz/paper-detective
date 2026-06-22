declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export type PdfTextContent = {
    items: Array<unknown>;
  };

  export type PdfPageProxy = {
    getTextContent(): Promise<PdfTextContent>;
    cleanup(): void;
  };

  export type PdfDocumentProxy = {
    numPages: number;
    getPage(pageNumber: number): Promise<PdfPageProxy>;
  };

  export type PdfLoadingTask = {
    promise: Promise<PdfDocumentProxy>;
    destroy(): Promise<void>;
  };

  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(options: {
    data: Uint8Array;
    disableWorker?: boolean;
    useSystemFonts?: boolean;
  }): PdfLoadingTask;
}
