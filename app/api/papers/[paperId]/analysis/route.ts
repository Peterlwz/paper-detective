import { NextResponse } from "next/server";
import type { ApiErrorResponse, PaperAnalysisResponse } from "@/types/api";
import { runPaperAnalysis } from "@/lib/ai/runPaperAnalysis";

type AnalysisRouteContext = {
  params: Promise<{
    paperId: string;
  }>;
};

export async function GET(_request: Request, { params }: AnalysisRouteContext) {
  const { paperId } = await params;

  if (paperId !== "paper_001") {
    return NextResponse.json<ApiErrorResponse>(
      { error: "未找到论文分析结果" },
      { status: 404 },
    );
  }

  try {
    const analysisResult = await runPaperAnalysis({ paperId });

    return NextResponse.json<PaperAnalysisResponse>({
      paper: analysisResult.paper,
      cases: analysisResult.cases,
      evidence_items: analysisResult.evidence_items,
      analysis: {
        ...analysisResult.metadata,
        note: "当前结果由 mock AI pipeline 生成，用于演示完整产品流程。",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "论文分析失败，请稍后重试。";

    return NextResponse.json<ApiErrorResponse>({ error: message }, { status: 500 });
  }
}
