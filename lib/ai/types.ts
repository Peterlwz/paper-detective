import type { DetectiveCase } from "@/types/case";
import type { EvidenceItem } from "@/types/evidence";
import type { Paper } from "@/types/paper";

export type AiProvider = "mock" | "openai" | "qwen" | "deepseek" | "custom";

export type AiMode = "mock" | "real";
export type AnalysisResultMode = "mock" | "real" | "fallback";

export interface PaperAnalysisInput {
  paperId: string;
  fileName?: string;
  extractedText?: string;
  figures?: unknown[];
}

export interface PaperAnalysisOutput {
  paper: Paper;
  cases: DetectiveCase[];
  evidence_items: EvidenceItem[];
  metadata: {
    mode: AnalysisResultMode;
    provider: AiProvider;
    model_label: string;
    generated_at: string;
    warnings?: string[];
    fallback_reason?: string;
    input_char_count?: number;
    input_char_limit?: number;
  };
}

export interface AiAnalysisError {
  code: string;
  message: string;
  recoverable: boolean;
}
