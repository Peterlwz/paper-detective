import type { EvidenceItem } from "@/types/evidence";

export type ReaderEvidenceMatchStatus =
  | "valid_evidence"
  | "related_info"
  | "invalid_click";

export type ReaderEvidenceMatchResult = {
  status: ReaderEvidenceMatchStatus;
  matchedEvidence?: EvidenceItem;
  candidateEvidence: EvidenceItem[];
  reason: string;
};

type ScoredEvidence = {
  evidence: EvidenceItem;
  score: number;
  overlapCount: number;
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const seenTokens = new Set<string>();

  return normalizeText(text)
    .split(" ")
    .filter((token) => token.length >= 4)
    .filter((token) => {
      if (seenTokens.has(token)) {
        return false;
      }

      seenTokens.add(token);
      return true;
    });
}

function getTokenOverlapScore(clickedText: string, textAnchor: string) {
  const clickedTokens = tokenize(clickedText);
  const anchorTokens = tokenize(textAnchor);

  if (clickedTokens.length === 0 || anchorTokens.length === 0) {
    return { score: 0, overlapCount: 0 };
  }

  const clickedTokenSet = new Set(clickedTokens);
  const overlapCount = anchorTokens.filter((token) =>
    clickedTokenSet.has(token),
  ).length;
  const score = overlapCount / Math.min(clickedTokens.length, anchorTokens.length);

  return { score, overlapCount };
}

export function matchReaderEvidence({
  clickedText,
  evidenceList,
}: {
  clickedText: string;
  evidenceList: EvidenceItem[];
}): ReaderEvidenceMatchResult {
  const normalizedClickedText = normalizeText(clickedText);
  const textEvidenceList = evidenceList.filter(
    (evidence) => evidence.source_type === "text" && evidence.text_anchor,
  );

  if (!normalizedClickedText) {
    return {
      status: "invalid_click",
      candidateEvidence: [],
      reason: "点击文本为空，无法匹配证据。",
    };
  }

  for (const evidence of textEvidenceList) {
    const normalizedAnchor = normalizeText(evidence.text_anchor ?? "");

    if (
      normalizedAnchor &&
      (normalizedClickedText.includes(normalizedAnchor) ||
        normalizedAnchor.includes(normalizedClickedText))
    ) {
      return {
        status: "valid_evidence",
        matchedEvidence: evidence,
        candidateEvidence: [evidence],
        reason: `命中证据 ${evidence.id}：点击句子与 evidence.text_anchor 存在包含关系。`,
      };
    }
  }

  const scoredEvidence = textEvidenceList
    .map<ScoredEvidence | null>((evidence) => {
      const { score, overlapCount } = getTokenOverlapScore(
        clickedText,
        evidence.text_anchor ?? "",
      );

      if (overlapCount === 0) {
        return null;
      }

      return {
        evidence,
        score,
        overlapCount,
      };
    })
    .filter((item): item is ScoredEvidence => item !== null)
    .sort((a, b) => b.score - a.score || b.overlapCount - a.overlapCount);

  const strongMatch = scoredEvidence.find(
    (item) => item.score >= 0.75 && item.overlapCount >= 6,
  );

  if (strongMatch) {
    return {
      status: "valid_evidence",
      matchedEvidence: strongMatch.evidence,
      candidateEvidence: scoredEvidence.slice(0, 3).map((item) => item.evidence),
      reason: `命中证据 ${strongMatch.evidence.id}：点击句子与 evidence.text_anchor 的关键词重合度较高。`,
    };
  }

  const candidates = scoredEvidence
    .filter((item) => item.score >= 0.35 && item.overlapCount >= 3)
    .slice(0, 3)
    .map((item) => item.evidence);

  if (candidates.length > 0) {
    return {
      status: "related_info",
      candidateEvidence: candidates,
      reason: "点击句子与部分证据关键词相关，但不足以作为已收集证据。",
    };
  }

  return {
    status: "invalid_click",
    candidateEvidence: [],
    reason: "未匹配到当前 AI case 的 text evidence anchor。",
  };
}
