import type { PaperAnalysisOutput } from "@/lib/ai/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`AI 分析结果格式错误：${label} 必须是对象。`);
  }

  return value;
}

function assertString(value: unknown, label: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`AI 分析结果格式错误：${label} 必须是非空字符串。`);
  }
}

function assertArray(value: unknown, label: string) {
  if (!Array.isArray(value)) {
    throw new Error(`AI 分析结果格式错误：${label} 必须是数组。`);
  }
}

export function parsePaperAnalysisResult(raw: unknown): PaperAnalysisOutput {
  const payload = assertRecord(raw, "root");
  const paper = assertRecord(payload.paper, "paper");
  const metadata = assertRecord(payload.metadata, "metadata");

  assertString(paper.paper_id, "paper.paper_id");
  assertString(paper.title, "paper.title");
  assertArray(payload.cases, "cases");
  assertArray(payload.evidence_items, "evidence_items");
  assertString(metadata.mode, "metadata.mode");
  assertString(metadata.provider, "metadata.provider");
  assertString(metadata.model_label, "metadata.model_label");
  assertString(metadata.generated_at, "metadata.generated_at");

  if (
    metadata.mode !== "mock" &&
    metadata.mode !== "real" &&
    metadata.mode !== "fallback"
  ) {
    throw new Error(
      "AI 分析结果格式错误：metadata.mode 必须是 mock、real 或 fallback。",
    );
  }

  if (
    metadata.provider !== "mock" &&
    metadata.provider !== "openai" &&
    metadata.provider !== "qwen" &&
    metadata.provider !== "deepseek" &&
    metadata.provider !== "custom"
  ) {
    throw new Error("AI 分析结果格式错误：metadata.provider 不受支持。");
  }

  return payload as unknown as PaperAnalysisOutput;
}
