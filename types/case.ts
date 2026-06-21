export interface DetectiveCase {
  case_id: string;
  paper_id: string;
  case_title: string;
  main_claim: string;
  difficulty: "easy" | "medium" | "hard";
  evidence_required: number;
  recommended: number;
  estimated_minutes: number;
  involved_figures: string[];
  experiment_types: string[];
}
