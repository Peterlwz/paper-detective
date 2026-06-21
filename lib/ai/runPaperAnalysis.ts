import { mockCases } from "@/mock/cases";
import { mockEvidenceItems } from "@/mock/evidence";
import { mockPaper } from "@/mock/paper";
import { callRealModelDisabled, getAiMode } from "@/lib/ai/modelClient";
import { parsePaperAnalysisResult } from "@/lib/ai/parseAnalysisResult";
import type {
  PaperAnalysisInput,
  PaperAnalysisOutput,
} from "@/lib/ai/types";

export async function runPaperAnalysis(
  input: PaperAnalysisInput,
): Promise<PaperAnalysisOutput> {
  const mode = getAiMode();

  if (mode === "mock") {
    return parsePaperAnalysisResult({
      paper: mockPaper,
      cases: mockCases,
      evidence_items: mockEvidenceItems,
      metadata: {
        mode: "mock",
        provider: "mock",
        model_label: "Paper Detective Mock Analyst",
        generated_at: new Date().toISOString(),
        warnings: ["当前使用 mock AI pipeline，尚未启用真实模型调用。"],
      },
    });
  }

  if (mode === "disabled") {
    await callRealModelDisabled();
  }

  throw new Error("真实模型调用适配层已预留，但尚未启用。");
}
