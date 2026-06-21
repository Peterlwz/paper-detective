import type { EvidenceBBox } from "./evidence";

export interface ClickEvent {
  click_id: string;
  case_id: string;
  page: number;
  target_type: "text" | "figure";
  clicked_text?: string;
  clicked_bbox?: EvidenceBBox;
  source_label?: string;
  timestamp: number;
}

export interface ClickResult {
  click_id: string;
  result_type: "valid_evidence" | "related_info" | "invalid_click";
  matched_evidence_id?: string;
  feedback: string;
  score_delta: number;
  highlight: boolean;
}
