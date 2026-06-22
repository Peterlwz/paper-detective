import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  GlobalWorkerOptions,
  getDocument,
} from "pdfjs-dist/legacy/build/pdf.mjs";

export type ExtractedPdfPageText = {
  page: number;
  text: string;
  char_count: number;
};

export type ExtractedPdfTextStats = {
  page_count: number;
  extracted_page_count: number;
  char_count: number;
  was_page_limited: boolean;
};

export type ExtractedPdfTextResult = {
  text: string;
  pages: ExtractedPdfPageText[];
  stats: ExtractedPdfTextStats;
};

type ExtractPdfTextInput = {
  arrayBuffer: ArrayBuffer;
  maxPages?: number;
};

function configurePdfWorker() {
  const workerPath = path.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs",
  );
  GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString();
}

function getTextItemString(item: unknown): string {
  if (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    typeof item.str === "string"
  ) {
    return item.str;
  }

  return "";
}

function normalizePageText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export async function extractPdfTextFromArrayBuffer({
  arrayBuffer,
  maxPages = 40,
}: ExtractPdfTextInput): Promise<ExtractedPdfTextResult> {
  try {
    configurePdfWorker();

    const loadingTask = getDocument({
      data: new Uint8Array(arrayBuffer),
      disableWorker: true,
      useSystemFonts: true,
    });
    const pdfDocument = await loadingTask.promise;
    const pageCount = pdfDocument.numPages;
    const extractedPageCount = Math.min(pageCount, Math.max(1, maxPages));
    const pages: ExtractedPdfPageText[] = [];

    try {
      for (let pageNumber = 1; pageNumber <= extractedPageCount; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = normalizePageText(
          textContent.items.map(getTextItemString).join(" "),
        );

        pages.push({
          page: pageNumber,
          text: pageText,
          char_count: pageText.length,
        });

        page.cleanup();
      }
    } finally {
      await loadingTask.destroy();
    }

    const text = pages
      .map((page) => `\n[Page ${page.page}]\n${page.text}`)
      .join("\n")
      .trim();

    return {
      text,
      pages,
      stats: {
        page_count: pageCount,
        extracted_page_count: extractedPageCount,
        char_count: pages.reduce((total, page) => total + page.char_count, 0),
        was_page_limited: extractedPageCount < pageCount,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "未知 PDF 文本抽取错误";

    throw new Error(`PDF 文本抽取失败：${message}`);
  }
}
