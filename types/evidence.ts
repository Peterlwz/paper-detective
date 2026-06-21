export type EvidenceType =
  | "expression"
  | "mechanism"
  | "functional"
  | "animal"
  | "clinical"
  | "omics"
  | "drug_intervention"
  | "limitation";

export interface EvidenceBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EvidenceItem {
  id: string;
  case_id: string;
  type: EvidenceType;
  title: string;
  source_type: "text" | "figure";
  source_label: string;
  page: number;
  text_anchor?: string;
  bbox?: EvidenceBBox;
  explanation: string;
  strength: "weak" | "medium" | "strong";
  limitation: string;
  found: boolean;
  confidence: number;
}
