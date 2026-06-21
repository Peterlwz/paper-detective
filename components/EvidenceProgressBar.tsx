import type { EvidenceItem } from "@/types/evidence";
import {
  getEvidenceStrengthLabel,
  getEvidenceTypeLabel,
} from "@/utils/evidenceLabels";

interface EvidenceProgressBarProps {
  evidenceList: EvidenceItem[];
  foundEvidenceIds: string[];
  selectedEvidenceId: string | null;
  onSelectEvidence?: (evidenceId: string) => void;
}

export function EvidenceProgressBar({
  evidenceList,
  foundEvidenceIds,
  selectedEvidenceId,
  onSelectEvidence,
}: EvidenceProgressBarProps) {
  const foundCount = evidenceList.filter((item) =>
    foundEvidenceIds.includes(item.id),
  ).length;
  const progressPercent =
    evidenceList.length === 0 ? 0 : (foundCount / evidenceList.length) * 100;

  return (
    <section className="border-b border-[#d8ded4] py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
            Evidence Track
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#14211d]">
            证据栏
          </h2>
        </div>
        <div className="text-sm font-semibold text-[#52635d]">
          {foundCount} / {evidenceList.length}
        </div>
      </div>

      <div className="mt-5 h-2 border border-[#c7cec4] bg-[#edf2ef]">
        <div
          className="h-full bg-[#1d352f]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(176px,1fr))] gap-3">
        {evidenceList.map((item, index) => {
          const isFound = foundEvidenceIds.includes(item.id);
          const isSelected = item.id === selectedEvidenceId;
          const baseClass =
            "min-h-28 w-full border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#8ea39a]";
          const stateClass = isFound
            ? isSelected
              ? "cursor-pointer border-[#1d352f] bg-[#edf2ef] shadow-[0_10px_24px_rgba(25,35,31,0.12)] ring-2 ring-[#1d352f]"
              : "cursor-pointer border-[#9fb0a8] bg-white/85 hover:border-[#1d352f] hover:bg-[#fbfcfa]"
            : "cursor-default border-dashed border-[#bcc7c0] bg-[#fbfcfa] text-[#52635d]";

          return (
            <button
              key={item.id}
              type="button"
              aria-disabled={!isFound}
              tabIndex={isFound ? 0 : -1}
              onClick={() => {
                if (isFound) {
                  onSelectEvidence?.(item.id);
                }
              }}
              className={`${baseClass} ${stateClass}`}
            >
              <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                证据 {String(index + 1).padStart(2, "0")}
              </div>
              <div className="mt-3 flex items-start gap-2">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center border text-sm font-semibold ${
                    isFound
                      ? "border-[#1d352f] bg-[#1d352f] text-white"
                      : "border-[#c7cec4] bg-[#fbfcfa] text-lg text-[#52635d]"
                  }`}
                >
                  {isFound ? item.id : "?"}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#24342f]">
                    {isFound ? getEvidenceTypeLabel(item.type) : "待发现线索"}
                  </div>
                  {isFound ? (
                    <div className="mt-1 space-y-1 text-xs leading-5 text-[#52635d]">
                      <div>
                        强度：{getEvidenceStrengthLabel(item.strength)}
                      </div>
                      <div className="truncate">{item.source_label}</div>
                    </div>
                  ) : (
                    <div className="mt-1 text-xs leading-5 text-[#6d7a75]">
                      继续在正文或图表中寻找
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
