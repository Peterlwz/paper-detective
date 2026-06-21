"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { EvidenceItem } from "@/types/evidence";
import type { PdfPageClick, PdfTextClick } from "@/types/pdf";
import { findFigureEvidenceHits } from "@/utils/pdfBbox";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerProps {
  fileUrl: string;
  fileName?: string;
  figureEvidenceList?: EvidenceItem[];
  showBboxOverlay?: boolean;
  onFigureEvidenceHit?: (hits: EvidenceItem[]) => void;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function normalizeCoordinate(value: number): number {
  return Number(clamp(value).toFixed(3));
}

function formatRatio(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function getClickedTextElement(target: HTMLElement): HTMLElement | null {
  const textLayer = target.closest(
    ".react-pdf__Page__textContent, .textLayer",
  );

  if (!textLayer) {
    return null;
  }

  const textElement = target.closest("span");

  if (!textElement || !textLayer.contains(textElement)) {
    return null;
  }

  return textElement as HTMLElement;
}

export function PdfViewer({
  fileUrl,
  fileName,
  figureEvidenceList,
  showBboxOverlay = false,
  onFigureEvidenceHit,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [lastClickPoint, setLastClickPoint] = useState<PdfPageClick | null>(
    null,
  );
  const [lastTextClick, setLastTextClick] = useState<PdfTextClick | null>(null);
  const [lastFigureHitResult, setLastFigureHitResult] = useState<{
    page: number;
    hits: EvidenceItem[];
  } | null>(null);
  const [loadError, setLoadError] = useState("");
  const currentPageFigureEvidence = (figureEvidenceList ?? []).filter(
    (evidence) =>
      evidence.source_type === "figure" &&
      evidence.page === pageNumber &&
      evidence.bbox,
  );

  function handlePageClick(event: React.MouseEvent<HTMLDivElement>) {
    const pageRect = event.currentTarget.getBoundingClientRect();

    if (pageRect.width === 0 || pageRect.height === 0) {
      return;
    }

    const target =
      event.target instanceof HTMLElement ? event.target : null;
    const textElement = target ? getClickedTextElement(target) : null;

    if (textElement) {
      const clickedText = normalizeText(textElement.textContent ?? "");

      if (clickedText) {
        const textRect = textElement.getBoundingClientRect();
        const textClick: PdfTextClick = {
          page: pageNumber,
          source_type: "pdf_text",
          clicked_text: clickedText,
          bbox: {
            x: normalizeCoordinate((textRect.left - pageRect.left) / pageRect.width),
            y: normalizeCoordinate((textRect.top - pageRect.top) / pageRect.height),
            width: normalizeCoordinate(textRect.width / pageRect.width),
            height: normalizeCoordinate(textRect.height / pageRect.height),
          },
        };

        console.log("PDF text click:", textClick);
        setLastTextClick(textClick);
        return;
      }
    }

    const clickPoint = {
      page: pageNumber,
      x: normalizeCoordinate((event.clientX - pageRect.left) / pageRect.width),
      y: normalizeCoordinate((event.clientY - pageRect.top) / pageRect.height),
    };

    console.log("PDF page click:", clickPoint);
    setLastClickPoint(clickPoint);

    if (figureEvidenceList) {
      const hits = findFigureEvidenceHits({
        page: clickPoint.page,
        x: clickPoint.x,
        y: clickPoint.y,
        evidenceList: figureEvidenceList,
      });

      console.log("PDF figure bbox hits:", hits);
      setLastFigureHitResult({ page: clickPoint.page, hits });
      onFigureEvidenceHit?.(hits);
    }
  }

  return (
    <section className="mt-5 border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(25,35,31,0.08)]">
      <div className="flex flex-col gap-4 border-b border-[#d9dfd5] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#6d7a75] uppercase">
            PDF Viewer
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#14211d]">
            {fileName ?? "上传论文预览"}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((currentPage) => currentPage - 1)}
            className="border border-[#9aa69f] px-3 py-2 text-xs font-semibold text-[#1d352f] transition hover:border-[#1d352f] hover:bg-[#edf2ef] disabled:cursor-not-allowed disabled:border-[#d9dfd5] disabled:text-[#9aa69f]"
          >
            上一页
          </button>
          <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-3 py-2 text-xs font-semibold text-[#52635d]">
            第 {pageNumber} 页 / 共 {numPages ?? "--"} 页
          </div>
          <button
            type="button"
            disabled={Boolean(numPages && pageNumber >= numPages)}
            onClick={() => setPageNumber((currentPage) => currentPage + 1)}
            className="border border-[#9aa69f] px-3 py-2 text-xs font-semibold text-[#1d352f] transition hover:border-[#1d352f] hover:bg-[#edf2ef] disabled:cursor-not-allowed disabled:border-[#d9dfd5] disabled:text-[#9aa69f]"
          >
            下一页
          </button>
          <button
            type="button"
            disabled={scale <= 0.6}
            onClick={() =>
              setScale((currentScale) =>
                Math.max(0.6, Number((currentScale - 0.1).toFixed(1))),
              )
            }
            className="border border-[#9aa69f] px-3 py-2 text-xs font-semibold text-[#1d352f] transition hover:border-[#1d352f] hover:bg-[#edf2ef] disabled:cursor-not-allowed disabled:border-[#d9dfd5] disabled:text-[#9aa69f]"
          >
            缩小
          </button>
          <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-3 py-2 text-xs font-semibold text-[#52635d]">
            {formatRatio(scale)}
          </div>
          <button
            type="button"
            disabled={scale >= 1.8}
            onClick={() =>
              setScale((currentScale) =>
                Math.min(1.8, Number((currentScale + 0.1).toFixed(1))),
              )
            }
            className="border border-[#9aa69f] px-3 py-2 text-xs font-semibold text-[#1d352f] transition hover:border-[#1d352f] hover:bg-[#edf2ef] disabled:cursor-not-allowed disabled:border-[#d9dfd5] disabled:text-[#9aa69f]"
          >
            放大
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="mt-4 border-l-4 border-[#9a4b2e] bg-[#f4ede8] px-4 py-3 text-sm font-semibold text-[#4d3329]">
          {loadError}
        </div>
      ) : null}

      <div className="mt-5 overflow-auto border border-[#d9dfd5] bg-[#edf2ef] p-4">
        <Document
          file={fileUrl}
          loading={
            <div className="px-4 py-10 text-center text-sm text-[#52635d]">
              正在加载 PDF...
            </div>
          }
          error={
            <div className="px-4 py-10 text-center text-sm text-[#4d3329]">
              PDF 加载失败，请重新选择文件。
            </div>
          }
          onLoadSuccess={({ numPages: loadedPages }) => {
            setNumPages(loadedPages);
            setPageNumber(1);
            setLoadError("");
          }}
          onLoadError={() => {
            setNumPages(null);
            setLoadError("PDF 加载失败，请重新选择文件。");
          }}
        >
          <div
            onClick={handlePageClick}
            className="relative inline-block cursor-crosshair bg-white shadow-[0_12px_32px_rgba(25,35,31,0.18)]"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={true}
              loading={
                <div className="px-4 py-10 text-center text-sm text-[#52635d]">
                  正在渲染页面...
                </div>
              }
            />
            {showBboxOverlay
              ? currentPageFigureEvidence.map((evidence) => {
                  const bbox = evidence.bbox;

                  if (!bbox) {
                    return null;
                  }

                  return (
                    <div
                      key={evidence.id}
                      className="pointer-events-none absolute z-20 border-2 border-[#c96b2c] bg-[#f2b05e]/20"
                      style={{
                        left: `${bbox.x * 100}%`,
                        top: `${bbox.y * 100}%`,
                        width: `${bbox.width * 100}%`,
                        height: `${bbox.height * 100}%`,
                      }}
                    >
                      <div className="absolute left-1 top-1 max-w-[calc(100%-0.5rem)] bg-[#c96b2c] px-1.5 py-1 text-[10px] font-semibold leading-tight text-white shadow-sm">
                        <span>{evidence.id}</span>
                        <span className="ml-1">{evidence.source_label}</span>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        </Document>
      </div>

      {showBboxOverlay ? (
        <div className="mt-3 border border-[#d9dfd5] bg-[#fffaf2] px-4 py-3 text-xs leading-6 text-[#6f4d28]">
          当前为 bbox 调试层，使用 Demo evidence 坐标。当前页有{" "}
          {currentPageFigureEvidence.length} 个图表证据 bbox。
        </div>
      ) : null}

      <div className="mt-4 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3 text-sm text-[#52635d]">
        {lastClickPoint ? (
          <span>
            最近一次点击：Page {lastClickPoint.page}, x=
            {lastClickPoint.x.toFixed(3)}, y={lastClickPoint.y.toFixed(3)}
          </span>
        ) : (
          <span>点击 PDF 页面后，这里会显示归一化坐标。</span>
        )}
      </div>

      <div className="mt-3 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3 text-sm text-[#52635d]">
        {lastFigureHitResult ? (
          lastFigureHitResult.hits.length > 0 ? (
            <div className="space-y-2">
              <div className="font-semibold text-[#24342f]">
                命中图表证据区域：Page {lastFigureHitResult.page}
              </div>
              <div className="space-y-1">
                {lastFigureHitResult.hits.map((evidence) => (
                  <div key={evidence.id} className="break-words text-xs">
                    <span className="font-semibold text-[#1d352f]">
                      {evidence.id}
                    </span>{" "}
                    {evidence.title} · {evidence.source_label} · Page{" "}
                    {evidence.page}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <span>
              未命中任何图表证据区域：Page {lastFigureHitResult.page}
            </span>
          )
        ) : (
          <span>点击 PDF 非文本区域后，这里会显示 bbox 命中结果。</span>
        )}
      </div>

      <div className="mt-3 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3 text-sm text-[#52635d]">
        {lastTextClick ? (
          <div className="space-y-2">
            <div className="font-semibold text-[#24342f]">
              最近一次文本点击：Page {lastTextClick.page}
            </div>
            <div className="line-clamp-2 break-words">
              文本：{lastTextClick.clicked_text}
            </div>
            <div className="text-xs font-semibold text-[#6d7a75]">
              bbox: x={lastTextClick.bbox.x.toFixed(3)}, y=
              {lastTextClick.bbox.y.toFixed(3)}, w=
              {lastTextClick.bbox.width.toFixed(3)}, h=
              {lastTextClick.bbox.height.toFixed(3)}
            </div>
          </div>
        ) : (
          <span>点击 PDF 文本后，这里会显示文本和 bbox。</span>
        )}
      </div>
    </section>
  );
}
