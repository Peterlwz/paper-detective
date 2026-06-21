export type HintLevel = 1 | 2 | 3;

export interface EvidenceHint {
  evidence_id: string;
  level: HintLevel;
  text: string;
  target_label?: string;
}

export interface CaseHintState {
  usedHintCount: number;
  revealedHints: Record<string, number>;
}
