import type { EvidenceItem } from "@/types/evidence";
import {
  getEvidenceStrengthLabel,
  getEvidenceTypeLabel,
} from "@/utils/evidenceLabels";

interface EvidenceDetailPanelProps {
  selectedEvidence?: EvidenceItem | null;
}

function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-3 py-2">
      <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[#24342f]">{value}</div>
    </div>
  );
}

export function EvidenceDetailPanel({
  selectedEvidence = null,
}: EvidenceDetailPanelProps) {
  return (
    <aside className="border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(25,35,31,0.06)] lg:sticky lg:top-6">
      <div className="border-b border-[#d9dfd5] pb-4">
        <p className="mb-2 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
          Evidence Detail
        </p>
        <h2 className="text-2xl font-semibold text-[#14211d]">证据详情</h2>
      </div>

      {selectedEvidence ? (
        <div className="pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                {selectedEvidence.id}
              </div>
              <h3 className="mt-2 text-xl font-semibold leading-snug text-[#14211d]">
                {selectedEvidence.title}
              </h3>
            </div>
            <span className="border border-[#1d352f] bg-[#1d352f] px-2 py-1 text-xs font-semibold text-white">
              已找到
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MetaItem
              label="类型"
              value={getEvidenceTypeLabel(selectedEvidence.type)}
            />
            <MetaItem label="来源" value={selectedEvidence.source_label} />
            <MetaItem label="页码" value={`Page ${selectedEvidence.page}`} />
            <MetaItem
              label="证据强度"
              value={getEvidenceStrengthLabel(selectedEvidence.strength)}
            />
          </div>

          <div className="mt-5 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-4">
            <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
              证据解释
            </div>
            <p className="mt-2 text-sm leading-7 text-[#364641]">
              {selectedEvidence.explanation}
            </p>
          </div>

          <div className="mt-4 border-l-4 border-[#9a4b2e] bg-[#f4ede8] px-4 py-4">
            <div className="text-xs font-semibold tracking-[0.14em] text-[#8a442a] uppercase">
              局限性
            </div>
            <p className="mt-2 text-sm leading-7 text-[#4d3329]">
              {selectedEvidence.limitation}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="mt-8 border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-4">
            <p className="text-base font-semibold leading-7 text-[#24342f]">
              点击论文中的可疑证据开始侦破。
            </p>
            <p className="mt-3 text-sm leading-7 text-[#52635d]">
              命中证据后，这里会展示证据解释、证据强度和局限性。
            </p>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-[#52635d]">
            <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
              证据解释等待解锁
            </div>
            <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
              证据强度等待判断
            </div>
            <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
              局限性等待补全
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
