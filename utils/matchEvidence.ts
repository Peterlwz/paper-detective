import type { ClickEvent, ClickResult } from "@/types/click";
import type { EvidenceBBox, EvidenceItem } from "@/types/evidence";

const relatedKeywords = [
  "akt",
  "pi3k",
  "sorafenib",
  "resistance",
  "hcc",
  "hepatocellular carcinoma",
  "pathway",
  "tumor",
  "apoptosis",
  "liver cancer",
];

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function createValidEvidenceResult(
  clickEvent: ClickEvent,
  evidence: EvidenceItem,
): ClickResult {
  return {
    click_id: clickEvent.click_id,
    result_type: "valid_evidence",
    matched_evidence_id: evidence.id,
    feedback: `找到证据 ${evidence.id}：${evidence.title}`,
    score_delta: 2,
    highlight: true,
  };
}

function isRelatedInfo(clickEvent: ClickEvent): boolean {
  const haystack = normalize(
    [clickEvent.clicked_text, clickEvent.source_label].filter(Boolean).join(" "),
  );

  return relatedKeywords.some((keyword) => haystack.includes(keyword));
}

export function isPointInBBox(
  point: { x: number; y: number },
  bbox: EvidenceBBox,
): boolean {
  return (
    point.x >= bbox.x &&
    point.x <= bbox.x + bbox.width &&
    point.y >= bbox.y &&
    point.y <= bbox.y + bbox.height
  );
}

export function isClickInsideEvidenceBBox(
  clickedBBox: EvidenceBBox,
  evidenceBBox: EvidenceBBox,
): boolean {
  const clickCenter = {
    x: clickedBBox.x + clickedBBox.width / 2,
    y: clickedBBox.y + clickedBBox.height / 2,
  };

  return isPointInBBox(clickCenter, evidenceBBox);
}

export function matchEvidence(
  clickEvent: ClickEvent,
  evidenceList: EvidenceItem[],
): ClickResult {
  if (clickEvent.target_type === "text" && clickEvent.clicked_text) {
    const clickedText = normalize(clickEvent.clicked_text);
    const matchedEvidence = evidenceList.find((evidence) => {
      if (evidence.source_type !== "text" || !evidence.text_anchor) {
        return false;
      }

      const textAnchor = normalize(evidence.text_anchor);

      return (
        clickedText.includes(textAnchor) || textAnchor.includes(clickedText)
      );
    });

    if (matchedEvidence) {
      return createValidEvidenceResult(clickEvent, matchedEvidence);
    }
  }

  if (clickEvent.target_type === "figure") {
    const figureCandidates = evidenceList.filter(
      (evidence) =>
        evidence.source_type === "figure" &&
        clickEvent.source_label === evidence.source_label,
    );
    const bboxCandidates = figureCandidates.filter(
      (evidence) => evidence.bbox,
    );

    if (clickEvent.clicked_bbox && bboxCandidates.length > 0) {
      const matchedByBBox = bboxCandidates.find(
        (evidence) =>
          evidence.bbox &&
          clickEvent.clicked_bbox &&
          isClickInsideEvidenceBBox(clickEvent.clicked_bbox, evidence.bbox),
      );

      if (matchedByBBox) {
        return createValidEvidenceResult(clickEvent, matchedByBBox);
      }
    }

    const matchedByLabel = figureCandidates.find(
      (evidence) => !evidence.bbox,
    );

    if (matchedByLabel) {
      return createValidEvidenceResult(clickEvent, matchedByLabel);
    }
  }

  if (isRelatedInfo(clickEvent)) {
    return {
      click_id: clickEvent.click_id,
      result_type: "related_info",
      feedback:
        "这是相关背景信息，但不是当前案件的核心证据。继续寻找包含实验结果、对照组、显著性变化或图表数据的内容。",
      score_delta: 0,
      highlight: false,
    };
  }

  return {
    click_id: clickEvent.click_id,
    result_type: "invalid_click",
    feedback:
      "这不是有效证据。请回到 Results、Figure、Figure legend 或 Discussion 中寻找带有实验组、变化趋势、显著性或结论性描述的内容。",
    score_delta: -1,
    highlight: false,
  };
}
