import type { EvidenceItem } from "@/types/evidence";
import {
  getEvidenceStrengthLabel,
  getEvidenceTypeLabel,
} from "@/utils/evidenceLabels";

interface AiEvidenceProgressProps {
  evidenceList: EvidenceItem[];
  foundEvidenceIds: string[];
  selectedEvidenceId: string | null;
  onSelectEvidence: (evidenceId: string) => void;
}

export function AiEvidenceProgress({
  evidenceList,
  foundEvidenceIds,
  selectedEvidenceId,
  onSelectEvidence,
}: AiEvidenceProgressProps) {
  const foundEvidenceIdSet = new Set(foundEvidenceIds);
  const foundCount = foundEvidenceIds.length;
  const totalCount = evidenceList.length;
  const progressPercent =
    totalCount > 0 ? Math.round((foundCount / totalCount) * 100) : 0;

  return (
    <section className="border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_12px_30px_rgba(25,35,31,0.05)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
            AI Evidence Track
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#14211d]">
            已发现 {foundCount} / {totalCount} 条证据
          </h2>
        </div>
        {totalCount > 0 && foundCount === totalCount ? (
          <div className="border border-[#8aa79a] bg-[#edf2ef] px-3 py-2 text-sm font-semibold text-[#24342f]">
            证据已找齐，可以生成结案报告
          </div>
        ) : null}
      </div>

      <div className="mt-5 h-2 border border-[#c7cec4] bg-[#edf2ef]">
        <div
          className="h-full bg-[#1d352f]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {evidenceList.map((evidence, index) => {
          const isFound = foundEvidenceIdSet.has(evidence.id);
          const isSelected = selectedEvidenceId === evidence.id;

          return (
            <button
              key={evidence.id}
              type="button"
              disabled={!isFound}
              onClick={() => {
                if (isFound) {
                  onSelectEvidence(evidence.id);
                }
              }}
              className={`min-h-32 border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#8ea39a] ${
                isSelected
                  ? "border-[#1d352f] bg-[#edf2ef] shadow-[0_0_0_2px_rgba(29,53,47,0.12)]"
                  : isFound
                    ? "border-[#8aa79a] bg-white text-[#24342f] hover:border-[#1d352f]"
                    : "cursor-default border-dashed border-[#bcc7c0] bg-[#fbfcfa] text-[#52635d]"
              }`}
            >
              <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                证据 {String(index + 1).padStart(2, "0")}
              </div>
              {isFound ? (
                <div className="mt-3 space-y-2">
                  <div className="font-semibold leading-snug text-[#14211d]">
                    {evidence.id} · {evidence.title}
                  </div>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    <span className="border border-[#c7cec4] bg-[#fbfcfa] px-2 py-1 text-[#52635d]">
                      {getEvidenceTypeLabel(evidence.type)}
                    </span>
                    <span className="border border-[#c7cec4] bg-[#fbfcfa] px-2 py-1 text-[#52635d]">
                      强度 {getEvidenceStrengthLabel(evidence.strength)}
                    </span>
                  </div>
                  <div className="text-xs leading-5 text-[#52635d]">
                    {evidence.source_label}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="text-lg font-semibold text-[#24342f]">?</div>
                  <div className="mt-2 text-sm font-semibold text-[#52635d]">
                    待发现线索
                  </div>
                  <div className="mt-1 text-xs leading-5 text-[#6d7a75]">
                    在网页化论文句子中寻找证据
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
