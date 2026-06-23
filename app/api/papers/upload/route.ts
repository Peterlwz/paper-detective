import { NextResponse } from "next/server";
import type { ApiErrorResponse, UploadPaperResponse } from "@/types/api";
import { runPaperAnalysis } from "@/lib/ai/runPaperAnalysis";
import { extractPdfTextFromArrayBuffer } from "@/lib/pdf/extractPdfText";
import { buildReadablePaperContent } from "@/lib/reader/buildReadablePaperContent";
import { setCachedPaperAnalysis } from "@/lib/server/analysisCache";

export const runtime = "nodejs";

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export async function POST(request: Request) {
  let formData: FormData;
  const paperId = "paper_001";
  const jobId = "job_paper_001";
  const startedAt = new Date().toISOString();

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "请选择 PDF 文件" },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "请选择 PDF 文件" },
      { status: 400 },
    );
  }

  if (!isPdfFile(file)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "当前仅支持 PDF 论文文件" },
      { status: 400 },
    );
  }

  let extractedText: string | undefined;
  let extractionStats = {
    page_count: 0,
    extracted_page_count: 0,
    char_count: 0,
    was_page_limited: false,
  };
  let readableContent = buildReadablePaperContent({
    paperId,
    title: file.name,
    pages: [],
  });
  const warnings: string[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const extractionResult = await extractPdfTextFromArrayBuffer({
      arrayBuffer,
    });

    extractedText = extractionResult.text;
    extractionStats = extractionResult.stats;
    readableContent = buildReadablePaperContent({
      paperId,
      title: file.name,
      pages: extractionResult.pages,
    });

    if (extractionResult.stats.char_count === 0) {
      warnings.push(
        "该 PDF 可能是扫描版或缺少文本层，当前返回 mock 分析结果。",
      );
      extractedText = undefined;
    }
  } catch (error) {
    const extractionError =
      error instanceof Error ? error.message : "未知错误";

    console.warn("PDF text extraction failed:", extractionError);
    warnings.push("PDF 文本抽取失败，当前返回 mock 分析结果。");
  }

  let analysisOutput = await runPaperAnalysis({
    paperId,
    fileName: file.name,
    extractedText,
  });
  const combinedWarnings = [
    ...warnings,
    ...(analysisOutput.metadata.warnings ?? []),
  ];

  analysisOutput = {
    ...analysisOutput,
    metadata: {
      ...analysisOutput.metadata,
      warnings: combinedWarnings.length > 0 ? combinedWarnings : undefined,
    },
  };

  setCachedPaperAnalysis({
    paperId,
    jobId,
    fileName: file.name,
    extractedTextStats: extractionStats,
    readableContent,
    analysisOutput,
    createdAt: Date.now(),
  });

  return NextResponse.json<UploadPaperResponse>({
    paper_id: paperId,
    job_id: jobId,
    status: "queued",
    started_at: startedAt,
    message: "论文已上传，AI 分析流程已启动",
    next_url: `/papers/${paperId}/processing`,
    extraction: {
      ...extractionStats,
      has_text: extractionStats.char_count > 0,
    },
    reader: readableContent.stats,
    analysis_mode: analysisOutput.metadata.mode,
    analysis_provider: analysisOutput.metadata.provider,
    analysis_fallback_reason: analysisOutput.metadata.fallback_reason,
    analysis_input_char_count: analysisOutput.metadata.input_char_count,
    analysis_input_char_limit: analysisOutput.metadata.input_char_limit,
    warnings: analysisOutput.metadata.warnings ?? [],
  });
}
