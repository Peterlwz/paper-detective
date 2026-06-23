import { mockCases } from "@/mock/cases";
import { mockEvidenceItems } from "@/mock/evidence";
import { mockPaper } from "@/mock/paper";
import { callDeepSeekForPaperAnalysis } from "@/lib/ai/deepseekClient";
import { getAiMode, getAiProvider } from "@/lib/ai/modelClient";
import { parsePaperAnalysisResult } from "@/lib/ai/parseAnalysisResult";
import {
  buildDeepSeekPaperAnalysisPrompt,
  truncateForLowCost,
} from "@/lib/ai/prompts";
import type {
  AiProvider,
  AnalysisResultMode,
  PaperAnalysisInput,
  PaperAnalysisOutput,
} from "@/lib/ai/types";

function getNumberEnv(name: string, defaultValue: number): number {
  const value = Number(process.env[name]);

  if (!Number.isFinite(value) || value <= 0) {
    return defaultValue;
  }

  return value;
}

function createMockAnalysisOutput({
  warnings,
  mode = "mock",
  provider = "mock",
  modelLabel = "Paper Detective Mock Analyst",
  fallbackReason,
  inputCharCount,
  inputCharLimit,
}: {
  warnings: string[];
  mode?: AnalysisResultMode;
  provider?: AiProvider;
  modelLabel?: string;
  fallbackReason?: string;
  inputCharCount?: number;
  inputCharLimit?: number;
}): PaperAnalysisOutput {
  return parsePaperAnalysisResult({
    paper: mockPaper,
    cases: mockCases,
    evidence_items: mockEvidenceItems,
    metadata: {
      mode,
      provider,
      model_label: modelLabel,
      generated_at: new Date().toISOString(),
      warnings,
      fallback_reason: fallbackReason,
      input_char_count: inputCharCount,
      input_char_limit: inputCharLimit,
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDeepSeekPayload(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    throw new Error("DeepSeek JSON 解析失败：顶层结果不是对象。");
  }

  const demoCaseIds = new Set(mockCases.map((detectiveCase) => detectiveCase.case_id));
  const caseIdMap = new Map<string, string>();
  const cases = Array.isArray(raw.cases)
    ? raw.cases.map((item, index) => {
        if (!isRecord(item) || typeof item.case_id !== "string") {
          return item;
        }

        if (!demoCaseIds.has(item.case_id)) {
          return item;
        }

        const nextCaseId = `ai_case_${String(index + 1).padStart(3, "0")}`;
        caseIdMap.set(item.case_id, nextCaseId);

        return {
          ...item,
          case_id: nextCaseId,
        };
      })
    : raw.cases;

  const evidenceItems = Array.isArray(raw.evidence_items)
    ? raw.evidence_items.map((item) => {
        if (!isRecord(item)) {
          return item;
        }

        const normalizedItem =
          typeof item.case_id === "string" && caseIdMap.has(item.case_id)
            ? {
                ...item,
                case_id: caseIdMap.get(item.case_id),
              }
            : item;

        if (normalizedItem.bbox !== null) {
          return normalizedItem;
        }

        const { bbox: _bbox, ...rest } = normalizedItem;
        return rest;
      })
    : raw.evidence_items;

  return {
    ...raw,
    cases,
    evidence_items: evidenceItems,
  };
}

function getDeepSeekFailureReason(error: unknown): string {
  if (error instanceof Error && error.message.includes("请求超时")) {
    return "DeepSeek request timed out.";
  }

  if (error instanceof Error && error.message.includes("status=")) {
    const statusMatch = error.message.match(/status=(\d+)/);

    return statusMatch
      ? `DeepSeek API request failed with status ${statusMatch[1]}.`
      : "DeepSeek API request failed.";
  }

  if (
    error instanceof SyntaxError ||
    (error instanceof Error && error.message.includes("AI 分析结果格式错误"))
  ) {
    return "DeepSeek JSON parse or schema validation failed.";
  }

  return "DeepSeek request failed.";
}

export async function runPaperAnalysis(
  input: PaperAnalysisInput,
): Promise<PaperAnalysisOutput> {
  const mode = getAiMode();
  const provider = getAiProvider();
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const maxInputChars = getNumberEnv("DEEPSEEK_MAX_INPUT_CHARS", 20000);
  const inputCharCount = input.extractedText?.length ?? 0;

  if (mode !== "real") {
    return createMockAnalysisOutput({
      warnings: ["未启用真实 AI，当前返回 mock 分析结果。"],
      inputCharCount,
      inputCharLimit: maxInputChars,
    });
  }

  if (provider !== "deepseek") {
    const fallbackReason =
      "PAPER_DETECTIVE_AI_PROVIDER is not configured as deepseek.";

    return createMockAnalysisOutput({
      warnings: ["AI provider 未配置为 DeepSeek，当前返回 mock 分析结果。"],
      mode: "fallback",
      provider: "mock",
      fallbackReason,
      inputCharCount,
      inputCharLimit: maxInputChars,
    });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    const fallbackReason = "DEEPSEEK_API_KEY is not configured.";

    return createMockAnalysisOutput({
      warnings: ["DeepSeek API key 未配置，当前返回 mock 分析结果。"],
      mode: "fallback",
      provider: "deepseek",
      modelLabel: model,
      fallbackReason,
      inputCharCount,
      inputCharLimit: maxInputChars,
    });
  }

  if (!input.extractedText?.trim()) {
    const fallbackReason = "No extracted text is available for analysis.";

    return createMockAnalysisOutput({
      warnings: ["当前没有可用于真实 AI 分析的论文文本，当前返回 mock 分析结果。"],
      mode: "fallback",
      provider: "deepseek",
      modelLabel: model,
      fallbackReason,
      inputCharCount,
      inputCharLimit: maxInputChars,
    });
  }

  const timeoutMs = getNumberEnv("DEEPSEEK_TIMEOUT_MS", 45000);
  const truncatedInput = truncateForLowCost(input.extractedText, maxInputChars);
  const warnings = truncatedInput.wasTruncated
    ? [
        `输入文本已从 ${truncatedInput.originalChars} 字符截断到 ${truncatedInput.usedChars} 字符以控制成本。`,
      ]
    : undefined;

  try {
    console.info("DeepSeek analysis started", {
      mode,
      provider,
      model,
      input_char_count: truncatedInput.usedChars,
      input_char_limit: maxInputChars,
    });

    const prompt = buildDeepSeekPaperAnalysisPrompt({
      paperId: input.paperId,
      fileName: input.fileName,
      extractedText: truncatedInput.text,
    });
    const rawResult = await callDeepSeekForPaperAnalysis({
      prompt,
      model,
      timeoutMs,
    });
    const normalizedResult = normalizeDeepSeekPayload(rawResult);

    return parsePaperAnalysisResult({
      ...normalizedResult,
      metadata: {
        mode: "real",
        provider: "deepseek",
        model_label: model,
        generated_at: new Date().toISOString(),
        warnings,
        input_char_count: truncatedInput.usedChars,
        input_char_limit: maxInputChars,
      },
    });
  } catch (error) {
    const fallbackReason = getDeepSeekFailureReason(error);

    console.warn("DeepSeek analysis fallback", {
      reason: fallbackReason,
      model,
      input_char_count: truncatedInput.usedChars,
      input_char_limit: maxInputChars,
    });

    return createMockAnalysisOutput({
      warnings: ["DeepSeek 调用失败，已回退到 mock 分析结果。"],
      mode: "fallback",
      provider: "deepseek",
      modelLabel: model,
      fallbackReason,
      inputCharCount: truncatedInput.usedChars,
      inputCharLimit: maxInputChars,
    });
  }
}
