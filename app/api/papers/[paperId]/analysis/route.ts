import { NextResponse } from "next/server";
import { mockPaper } from "@/mock/paper";
import type { ApiErrorResponse, PaperAnalysisResponse } from "@/types/api";
import { runPaperAnalysis } from "@/lib/ai/runPaperAnalysis";
import { getCachedPaperAnalysis } from "@/lib/server/analysisCache";

export const runtime = "nodejs";

type AnalysisRouteContext = {
  params: Promise<{
    paperId: string;
  }>;
};

function buildDemoExtractedText(): string {
  return [
    `Title: ${mockPaper.title}`,
    `Authors: ${mockPaper.authors.join(", ")}`,
    `Journal: ${mockPaper.journal}`,
    `Year: ${mockPaper.year}`,
    "",
    "Abstract",
    "This study investigates whether PI3K/AKT signaling contributes to acquired sorafenib resistance in hepatocellular carcinoma and whether AKT inhibition can restore drug sensitivity.",
    "",
    "Results",
    "AKT phosphorylation was significantly increased in sorafenib-resistant HCC cells.",
    "Resistant cells showed elevated phosphorylation of GSK3β and reduced cleaved PARP after sorafenib exposure.",
    "High tumoral p-AKT staining was associated with shorter progression-free survival in sorafenib-treated HCC patients.",
    "Treatment with the AKT inhibitor markedly reduced p-AKT levels without changing total AKT abundance.",
    "MK-2206 restored sorafenib-induced apoptosis in resistant HCC cells, as indicated by increased cleaved caspase-3 and Annexin V positivity.",
    "The combination of sorafenib and MK-2206 produced greater tumor growth inhibition than either agent alone.",
    "",
    "Figure captions",
    ...mockPaper.figures.map(
      (figure) => `${figure.label} Page ${figure.page}: ${figure.caption}`,
    ),
    "",
    "Discussion",
    "These findings support vertical targeting of RAF and PI3K/AKT signaling as a candidate strategy for patients who develop acquired resistance to sorafenib.",
    "",
    "Limitations",
    "Additional resistance mechanisms, including MAPK reactivation and altered drug transport, may coexist with PI3K/AKT activation.",
    "The therapeutic window of AKT inhibition requires further optimization to minimize toxicity in non-malignant hepatocytes.",
    "Future studies should evaluate the combination in orthotopic and immune-competent HCC models before clinical translation.",
  ].join("\n");
}

export async function GET(request: Request, { params }: AnalysisRouteContext) {
  const { paperId } = await params;
  const cachedAnalysis = getCachedPaperAnalysis(paperId);

  if (cachedAnalysis?.analysisOutput) {
    const { analysisOutput } = cachedAnalysis;

    return NextResponse.json<PaperAnalysisResponse>({
      paper: analysisOutput.paper,
      cases: analysisOutput.cases,
      evidence_items: analysisOutput.evidence_items,
      analysis: {
        ...analysisOutput.metadata,
        note:
          analysisOutput.metadata.mode === "real"
            ? "当前结果由 DeepSeek 文本结构化分析生成。"
            : "当前结果由 mock AI pipeline 生成，用于演示完整产品流程。",
      },
      extraction: cachedAnalysis.extractedTextStats,
    });
  }

  if (paperId !== "paper_001") {
    return NextResponse.json<ApiErrorResponse>(
      { error: "未找到论文分析结果" },
      { status: 404 },
    );
  }

  try {
    const searchParams = new URL(request.url).searchParams;
    const useDemoText = searchParams.get("useDemoText") === "1";
    const analysisResult = await runPaperAnalysis({
      paperId,
      fileName: useDemoText ? "paper-detective-demo.txt" : undefined,
      extractedText: useDemoText ? buildDemoExtractedText() : undefined,
    });

    return NextResponse.json<PaperAnalysisResponse>({
      paper: analysisResult.paper,
      cases: analysisResult.cases,
      evidence_items: analysisResult.evidence_items,
      analysis: {
        ...analysisResult.metadata,
        note:
          analysisResult.metadata.mode === "real"
            ? "当前结果由 DeepSeek 文本结构化分析生成。"
            : "当前结果由 mock AI pipeline 生成，用于演示完整产品流程。",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "论文分析失败，请稍后重试。";

    return NextResponse.json<ApiErrorResponse>({ error: message }, { status: 500 });
  }
}
