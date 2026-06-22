import type { AiProvider } from "@/lib/ai/types";
import type { DetectiveCase } from "@/types/case";
import type { EvidenceItem } from "@/types/evidence";
import type { Paper } from "@/types/paper";
import type { ReadablePaperContent } from "@/types/reader";

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
  extraction: UploadPaperExtraction;
  reader: ReadablePaperContent["stats"];
  analysis_mode: PaperAnalysisMetadata["mode"];
  analysis_provider: AiProvider;
  warnings: string[];
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
  extraction?: PaperExtractionStats;
  reader?: ReadablePaperContent;
}

export interface PaperExtractionStats {
  page_count: number;
  extracted_page_count: number;
  char_count: number;
  was_page_limited: boolean;
}

export interface UploadPaperExtraction extends PaperExtractionStats {
  has_text: boolean;
}
