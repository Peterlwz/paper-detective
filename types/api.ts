import type { AiProvider } from "@/lib/ai/types";
import type { DetectiveCase } from "@/types/case";
import type { EvidenceItem } from "@/types/evidence";
import type { Paper } from "@/types/paper";

export interface ApiErrorResponse {
  error: string;
}

export interface UploadPaperResponse {
  paper_id: string;
  job_id: string;
  status: "queued";
  started_at: string;
  message: string;
  next_url: string;
}

export interface PaperAnalysisMetadata {
  mode: "mock" | "real";
  provider: AiProvider;
  generated_at: string;
  model_label: string;
  warnings?: string[];
  note?: string;
}

export interface PaperAnalysisResponse {
  paper: Paper;
  cases: DetectiveCase[];
  evidence_items: EvidenceItem[];
  analysis?: PaperAnalysisMetadata;
}
