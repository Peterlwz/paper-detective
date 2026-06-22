import { NextResponse } from "next/server";
import { buildMockAiAnalysisForReader } from "@/lib/ai/mockAiCaseForReader";
import {
  getCachedPaperAnalysis,
  setCachedPaperAnalysis,
} from "@/lib/server/analysisCache";
import type { ApiErrorResponse } from "@/types/api";
import type { ReadablePaperContent } from "@/types/reader";

export const runtime = "nodejs";

type SeedAiCaseRequest = {
  paper_id?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPaperId(body: unknown): string {
  if (!isRecord(body) || typeof body.paper_id !== "string") {
    return "paper_001";
  }

  return body.paper_id.trim() || "paper_001";
}

function buildFallbackReadableContent(paperId: string): ReadablePaperContent {
  const sentences = [
    "This development sentence verifies that the RealPaperViewer can display extracted paper text and respond to sentence clicks.",
    "Candidate evidence matching is shown only as debug information and does not collect evidence or update game state.",
    "This mock AI case is intended for local verification without calling DeepSeek or any external model provider.",
  ];

  return {
    paper_id: paperId,
    title: "Development reader verification paper",
    sections: [
      {
        id: "section_dev",
        title: "Reader Debug",
        page_start: 1,
        page_end: 1,
        sentences: sentences.map((text, index) => ({
          id: `sent_dev_${index + 1}`,
          section_id: "section_dev",
          page: 1,
          text,
          source_label: "Reader Debug · Page 1",
        })),
      },
    ],
    stats: {
      section_count: 1,
      sentence_count: sentences.length,
      char_count: sentences.reduce((total, text) => total + text.length, 0),
      was_truncated: false,
    },
  };
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json<ApiErrorResponse>(
      { error: "该开发测试入口在生产环境不可用" },
      { status: 403 },
    );
  }

  let body: SeedAiCaseRequest | undefined;

  try {
    body = (await request.json()) as SeedAiCaseRequest;
  } catch {
    body = undefined;
  }

  const paperId = getPaperId(body);
  const cachedAnalysis = getCachedPaperAnalysis(paperId);
  const readableContent =
    cachedAnalysis?.readableContent ?? buildFallbackReadableContent(paperId);
  const analysisOutput = buildMockAiAnalysisForReader({
    paperId,
    readableContent,
  });
  const jobId = cachedAnalysis?.jobId ?? `job_dev_seed_${paperId}`;

  setCachedPaperAnalysis({
    paperId,
    jobId,
    fileName: cachedAnalysis?.fileName ?? "dev-reader-test.pdf",
    extractedTextStats: cachedAnalysis?.extractedTextStats,
    readableContent,
    analysisOutput,
    createdAt: Date.now(),
  });

  return NextResponse.json({
    ok: true,
    paper_id: paperId,
    case_id: "ai_case_001",
    next_url: `/case/ai_case_001?paperId=${encodeURIComponent(paperId)}`,
    cases_url: `/cases?paperId=${encodeURIComponent(paperId)}`,
    message: "已生成用于 RealPaperViewer 验证的 mock AI case",
  });
}
