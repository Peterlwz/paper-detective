import type { EvidenceItem, EvidenceType } from "@/types/evidence";

const evidenceTypeLabels: Record<EvidenceType, string> = {
  expression: "表达证据",
  mechanism: "机制证据",
  functional: "功能证据",
  animal: "动物证据",
  clinical: "临床证据",
  omics: "组学证据",
  drug_intervention: "药物干预",
  limitation: "局限证据",
};

const evidenceStrengthLabels: Record<EvidenceItem["strength"], string> = {
  weak: "弱",
  medium: "中",
  strong: "强",
};

export function getEvidenceTypeLabel(type: EvidenceType): string {
  return evidenceTypeLabels[type];
}

export function getEvidenceStrengthLabel(
  strength: EvidenceItem["strength"],
): string {
  return evidenceStrengthLabels[strength];
}
