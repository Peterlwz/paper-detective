import type { DetectiveCase } from "@/types/case";
import type { EvidenceItem } from "@/types/evidence";
import type { Paper } from "@/types/paper";

export type AiProvider = "mock" | "openai" | "qwen" | "custom";

export type AiMode = "mock" | "disabled" | "real";

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
    mode: "mock" | "real";
    provider: AiProvider;
    model_label: string;
    generated_at: string;
    warnings?: string[];
  };
}

export interface AiAnalysisError {
  code: string;
  message: string;
  recoverable: boolean;
}
