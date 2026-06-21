"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mockEvidenceItems } from "@/mock/evidence";
import type { ApiErrorResponse, UploadPaperResponse } from "@/types/api";

const PdfViewer = dynamic(
  () => import("@/components/PdfViewer").then((module) => module.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="mt-5 border border-[#cfd7cc] bg-white/80 px-4 py-6 text-sm text-[#52635d]">
        正在准备 PDF 查看器...
      </div>
    ),
  },
);

const figureEvidenceList = mockEvidenceItems.filter(
  (evidence) => evidence.source_type === "figure",
);

function formatFileSize(size: number): string {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function PaperUploadCard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfObjectUrl, setPdfObjectUrl] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPdfObjectUrl("");
      return;
    }

    const nextObjectUrl = URL.createObjectURL(selectedFile);
    setPdfObjectUrl(nextObjectUrl);

    return () => {
      URL.revokeObjectURL(nextObjectUrl);
    };
  }, [selectedFile]);

  function acceptFile(file: File) {
    if (!isPdfFile(file)) {
      setSelectedFile(null);
      setError("当前仅支持 PDF 论文文件。");
      return;
    }

    setSelectedFile(file);
    setError("");
  }

  async function uploadDemoPaper() {
    if (!selectedFile) {
      setError("请选择 PDF 文件");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/papers/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as
        | UploadPaperResponse
        | ApiErrorResponse;

      if (!response.ok) {
        setError("error" in payload ? payload.error : "上传失败，请重试。");
        return;
      }

      const uploadPayload = payload as UploadPaperResponse;
      const nextUrl =
        uploadPayload.next_url ??
        `/papers/${uploadPayload.paper_id}/processing`;
      const processingSearchParams = new URLSearchParams();

      processingSearchParams.set("jobId", uploadPayload.job_id);
      processingSearchParams.set("startedAt", uploadPayload.started_at);

      router.push(`${nextUrl}?${processingSearchParams.toString()}`);
    } catch {
      setError("上传失败，请重试。");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files[0];

        if (file) {
          acceptFile(file);
        }
      }}
      className={`border p-5 transition ${
        isDragging
          ? "border-[#1d352f] bg-[#edf2ef] shadow-[0_16px_45px_rgba(25,35,31,0.12)]"
          : "border-[#cfd7cc] bg-white/75 shadow-[0_18px_55px_rgba(25,35,31,0.08)]"
      }`}
    >
      <div className="border border-dashed border-[#bcc7c0] bg-[#fbfcfa] p-5">
        <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
          Upload Paper
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[#14211d]">
          上传论文
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#52635d]">
          拖拽 PDF 到这里，或点击选择文件。当前 MVP 会使用 Demo
          解析结果演示完整证据推理流程。
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              acceptFile(file);
            }
          }}
        />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center border border-[#1d352f] bg-[#1d352f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f]"
          >
            选择 PDF 文件
          </button>
          <Link
            href="/cases?paperId=paper_001"
            className="inline-flex items-center justify-center border border-[#9aa69f] px-5 py-3 text-sm font-semibold text-[#1d352f] transition hover:border-[#1d352f] hover:bg-white"
          >
            直接体验 Demo 案件
          </Link>
        </div>

        {error ? (
          <div className="mt-4 border-l-4 border-[#9a4b2e] bg-[#f4ede8] px-4 py-3 text-sm font-semibold text-[#4d3329]">
            {error}
          </div>
        ) : null}

        {selectedFile ? (
          <>
            <div className="mt-4 border border-[#d9dfd5] bg-[#edf2ef] px-4 py-4">
              <div className="text-xs font-semibold tracking-[0.14em] text-[#52635d] uppercase">
                已选择论文
              </div>
              <div className="mt-2 text-sm font-semibold text-[#24342f]">
                已选择：{selectedFile.name}
              </div>
              <div className="mt-1 text-xs text-[#52635d]">
                文件大小：{formatFileSize(selectedFile.size)}
              </div>
              <p className="mt-3 text-sm leading-6 text-[#52635d]">
                当前版本暂不解析真实 PDF，将使用 Demo 案件继续体验。
              </p>
              <button
                type="button"
                disabled={isUploading}
                onClick={uploadDemoPaper}
                className="mt-4 inline-flex w-full items-center justify-center border border-[#1d352f] bg-[#1d352f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f] disabled:cursor-wait disabled:border-[#8aa79a] disabled:bg-[#8aa79a]"
              >
                {isUploading
                  ? "正在启动 AI 分析流程..."
                  : "使用 Demo 解析结果继续"}
              </button>
            </div>

            {pdfObjectUrl ? (
              <PdfViewer
                fileUrl={pdfObjectUrl}
                fileName={selectedFile.name}
                figureEvidenceList={figureEvidenceList}
                showBboxOverlay={true}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
