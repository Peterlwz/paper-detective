import type { EvidenceBBox, EvidenceItem } from "@/types/evidence";

export type Point = {
  x: number;
  y: number;
};

type FindFigureEvidenceHitsOptions = {
  page: number;
  x: number;
  y: number;
  evidenceList: EvidenceItem[];
};

export function isPointInBBox(point: Point, bbox: EvidenceBBox): boolean {
  return (
    point.x >= bbox.x &&
    point.x <= bbox.x + bbox.width &&
    point.y >= bbox.y &&
    point.y <= bbox.y + bbox.height
  );
}

export function findFigureEvidenceHits({
  page,
  x,
  y,
  evidenceList,
}: FindFigureEvidenceHitsOptions): EvidenceItem[] {
  const point = { x, y };

  return evidenceList.filter((evidence) => {
    const bbox = evidence.bbox;

    if (evidence.source_type !== "figure" || evidence.page !== page || !bbox) {
      return false;
    }

    return isPointInBBox(point, bbox);
  });
}
