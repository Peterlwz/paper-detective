import type { EvidenceItem } from "@/types/evidence";
import type { EvidenceHint } from "@/types/hint";

function getSectionHint(evidence: EvidenceItem): string {
  if (evidence.type === "limitation") {
    return "这条线索可能出现在 Discussion 或 Limitations 部分，请关注作者对研究边界的描述。";
  }

  if (evidence.source_label.includes("Figure")) {
    return "这条证据可能出现在 Results 部分，请优先查看实验结果相关图表。";
  }

  return "这条证据可能出现在 Results 部分，请优先查看实验结果相关段落。";
}

export function generateHintsForEvidence(
  evidence: EvidenceItem,
): EvidenceHint[] {
  const secondLevelText =
    evidence.source_type === "text"
      ? `请重点查看 ${evidence.source_label} 附近的结果描述。`
      : `请重点查看 ${evidence.source_label} 及其图注。`;

  const thirdLevelText =
    evidence.source_type === "text"
      ? `目标线索就在 ${evidence.source_label} 附近，寻找包含实验组、变化趋势或显著性描述的句子。`
      : `目标线索就在 ${evidence.source_label} 区域附近，请观察图中组间变化或处理效果。`;

  return [
    {
      evidence_id: evidence.id,
      level: 1,
      text: getSectionHint(evidence),
      target_label: evidence.source_label,
    },
    {
      evidence_id: evidence.id,
      level: 2,
      text: secondLevelText,
      target_label: evidence.source_label,
    },
    {
      evidence_id: evidence.id,
      level: 3,
      text: thirdLevelText,
      target_label: evidence.source_label,
    },
  ];
}
