import type { PaperAnalysisInput } from "@/lib/ai/types";

export function buildPaperAnalysisPrompt(input: PaperAnalysisInput): string {
  return [
    "You are Paper Detective's scientific paper analyst.",
    "Analyze the provided paper content and return structured JSON only.",
    "",
    `Paper ID: ${input.paperId}`,
    input.fileName ? `File name: ${input.fileName}` : "File name: unknown",
    "",
    "Future task requirements:",
    "1. Identify the paper title, abstract, main conclusions, and experimental structure.",
    "2. Generate multiple scientific case lines from major claims.",
    "3. For each case, generate evidence items grounded in text anchors or figure anchors.",
    "4. Each evidence item must include source type, source label, page, explanation, limitation, confidence, and strength.",
    "5. Figure evidence should include normalized bbox coordinates when available.",
    "6. Output valid JSON matching Paper Detective's paper, cases, and evidence_items schema.",
    "",
    "Do not invent unsupported evidence. Mark uncertainty and conclusion boundaries explicitly.",
  ].join("\n");
}
