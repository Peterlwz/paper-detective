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

function createMockAnalysisOutput(warnings: string[]): PaperAnalysisOutput {
  return parsePaperAnalysisResult({
    paper: mockPaper,
    cases: mockCases,
    evidence_items: mockEvidenceItems,
    metadata: {
      mode: "mock",
      provider: "mock",
      model_label: "Paper Detective Mock Analyst",
      generated_at: new Date().toISOString(),
      warnings,
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

function getDeepSeekFailureWarning(error: unknown): string {
  if (
    error instanceof SyntaxError ||
    (error instanceof Error && error.message.includes("AI 分析结果格式错误"))
  ) {
    return "DeepSeek JSON 解析失败，当前返回 mock 分析结果。";
  }

  return "DeepSeek 调用失败，已回退到 mock 分析结果。";
}

export async function runPaperAnalysis(
  input: PaperAnalysisInput,
): Promise<PaperAnalysisOutput> {
  const mode = getAiMode();
  const provider = getAiProvider();

  if (mode !== "real") {
    return createMockAnalysisOutput([
      "未启用真实 AI，当前返回 mock 分析结果。",
    ]);
  }

  if (provider !== "deepseek") {
    return createMockAnalysisOutput([
      "AI provider 未配置为 DeepSeek，当前返回 mock 分析结果。",
    ]);
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return createMockAnalysisOutput([
      "DeepSeek API key 未配置，当前返回 mock 分析结果。",
    ]);
  }

  if (!input.extractedText?.trim()) {
    return createMockAnalysisOutput([
      "当前没有可用于真实 AI 分析的论文文本，当前返回 mock 分析结果。",
    ]);
  }

  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const maxInputChars = getNumberEnv("DEEPSEEK_MAX_INPUT_CHARS", 60000);
  const timeoutMs = getNumberEnv("DEEPSEEK_TIMEOUT_MS", 45000);
  const truncatedInput = truncateForLowCost(input.extractedText, maxInputChars);
  const warnings = truncatedInput.wasTruncated
    ? [
        `输入文本已从 ${truncatedInput.originalChars} 字符截断到 ${truncatedInput.usedChars} 字符以控制成本。`,
      ]
    : undefined;

  try {
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
      },
    });
  } catch (error) {
    return createMockAnalysisOutput([getDeepSeekFailureWarning(error)]);
  }
}
