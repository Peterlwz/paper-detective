export type CorrectionType =
  | "irrelevant_evidence"
  | "wrong_explanation"
  | "wrong_strength"
  | "missing_limitation"
  | "add_evidence"
  | "other";

export type CorrectionTargetType =
  | "evidence"
  | "case"
  | "verdict"
  | "pdf_text"
  | "pdf_region";

export type CorrectionStatus = "draft" | "submitted" | "mock_received";

export interface CorrectionPayload {
  id: string;
  paper_id: string;
  case_id?: string;
  evidence_id?: string;
  target_type: CorrectionTargetType;
  correction_type: CorrectionType;
  user_comment: string;
  selected_text?: string;
  page?: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  created_at: string;
  status: CorrectionStatus;
}
