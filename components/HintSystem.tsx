"use client";

import type { EvidenceItem } from "@/types/evidence";
import type { HintLevel } from "@/types/hint";
import { generateHintsForEvidence } from "@/utils/generateHints";

interface HintSystemProps {
  evidenceList: EvidenceItem[];
  foundEvidenceIds: string[];
  revealedHints: Record<string, number>;
  onRevealHint: (evidenceId: string, nextLevel: HintLevel) => void;
}

export function HintSystem({
  evidenceList,
  foundEvidenceIds,
  revealedHints,
  onRevealHint,
}: HintSystemProps) {
  const currentTarget = evidenceList.find(
    (evidence) => !foundEvidenceIds.includes(evidence.id),
  );

  if (!currentTarget) {
    return (
      <section className="mt-3 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-4">
        <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
          Hint System
        </div>
        <p className="mt-3 text-sm leading-6 text-[#364641]">
          所有证据都已找到，无需提示。
        </p>
      </section>
    );
  }

  const currentIndex = evidenceList.findIndex(
    (evidence) => evidence.id === currentTarget.id,
  );
  const revealedLevel = revealedHints[currentTarget.id] ?? 0;
  const hints = generateHintsForEvidence(currentTarget);
  const visibleHints = hints.filter((hint) => hint.level <= revealedLevel);
  const nextLevel = Math.min(revealedLevel + 1, 3) as HintLevel;
  const isExhausted = revealedLevel >= 3;

  return (
    <section className="mt-3 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
            Hint System
          </div>
          <h3 className="mt-2 text-lg font-semibold text-[#14211d]">
            提示系统
          </h3>
        </div>
        <span className="border border-[#c7cec4] bg-white/75 px-2 py-1 text-xs text-[#52635d]">
          未找到证据 {currentIndex + 1} / {evidenceList.length}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#52635d]">
        当前提示目标：下一条未找到证据
      </p>

      <div className="mt-4 space-y-3">
        {visibleHints.length > 0 ? (
          visibleHints.map((hint) => (
            <div
              key={`${hint.evidence_id}-${hint.level}`}
              className="border-l-4 border-[#1d352f] bg-[#edf2ef] px-3 py-3"
            >
              <div className="text-xs font-semibold tracking-[0.14em] text-[#52635d] uppercase">
                Level {hint.level}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#364641]">
                {hint.text}
              </p>
            </div>
          ))
        ) : (
          <div className="border border-dashed border-[#cfd7cc] bg-white/60 px-3 py-3 text-sm leading-6 text-[#52635d]">
            尚未使用提示。先试着在论文结果和图表中寻找关键证据。
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={isExhausted}
        onClick={() => onRevealHint(currentTarget.id, nextLevel)}
        className="mt-4 w-full border border-[#1d352f] bg-[#1d352f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#27483f] disabled:cursor-not-allowed disabled:border-[#c7cec4] disabled:bg-[#d9dfd5] disabled:text-[#6d7a75]"
      >
        {isExhausted ? "该证据的提示已用完" : "使用提示"}
      </button>
    </section>
  );
}
