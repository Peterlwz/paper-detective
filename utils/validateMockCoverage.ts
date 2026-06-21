import type { EvidenceBBox, EvidenceItem } from "@/types/evidence";

export interface FakePaperFigureAnchor {
  source_label: string;
  bbox?: EvidenceBBox;
}

export interface FakePaperAnchors {
  textAnchors: string[];
  figureAnchors: FakePaperFigureAnchor[];
}

export interface MockCoverageIssue {
  evidenceId: string;
  issue: string;
}

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function hasMatchingTextAnchor(textAnchor: string, fakeText: string): boolean {
  const normalizedTextAnchor = normalize(textAnchor);
  const normalizedFakeText = normalize(fakeText);

  return (
    normalizedFakeText.includes(normalizedTextAnchor) ||
    normalizedTextAnchor.includes(normalizedFakeText)
  );
}

function hasMatchingFigureAnchor(
  evidence: EvidenceItem,
  figureAnchors: FakePaperFigureAnchor[],
): boolean {
  return figureAnchors.some((anchor) => {
    if (anchor.source_label !== evidence.source_label) {
      return false;
    }

    if (!evidence.bbox) {
      return true;
    }

    return Boolean(anchor.bbox);
  });
}

export function validateMockCoverage(
  evidenceList: EvidenceItem[],
  fakePaperAnchors: FakePaperAnchors,
): MockCoverageIssue[] {
  return evidenceList.flatMap((evidence) => {
    if (evidence.source_type === "text") {
      const hasTextAnchor =
        evidence.text_anchor &&
        fakePaperAnchors.textAnchors.some((fakeText) =>
          hasMatchingTextAnchor(evidence.text_anchor ?? "", fakeText),
        );

      return hasTextAnchor
        ? []
        : [
            {
              evidenceId: evidence.id,
              issue: "Missing clickable text anchor in FakePaperViewer.",
            },
          ];
    }

    return hasMatchingFigureAnchor(evidence, fakePaperAnchors.figureAnchors)
      ? []
      : [
          {
            evidenceId: evidence.id,
            issue: "Missing clickable figure anchor in FakePaperViewer.",
          },
        ];
  });
}
