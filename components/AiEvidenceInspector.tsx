import type { EvidenceItem } from "@/types/evidence";
import {
  getEvidenceStrengthLabel,
  getEvidenceTypeLabel,
} from "@/utils/evidenceLabels";
import type { ReaderEvidenceMatchStatus } from "@/utils/matchReaderEvidence";

export type AiEvidenceClickResult = {
  status: ReaderEvidenceMatchStatus;
  clickedText: string;
  matchedEvidenceId?: string;
  reason: string;
};

interface AiEvidenceInspectorProps {
  evidence?: EvidenceItem;
  lastClickResult?: AiEvidenceClickResult | null;
}

const statusLabels: Record<ReaderEvidenceMatchStatus, string> = {
  valid_evidence: "命中证据",
  related_info: "相关信息",
  invalid_click: "无效点击",
};

const statusClasses: Record<ReaderEvidenceMatchStatus, string> = {
  valid_evidence: "border-[#8aa79a] bg-[#edf2ef] text-[#24342f]",
  related_info: "border-[#c6b16b] bg-[#fbf6df] text-[#4c4224]",
  invalid_click: "border-[#c69a82] bg-[#f4ede8] text-[#4d3329]",
};

export function AiEvidenceInspector({
  evidence,
  lastClickResult,
}: AiEvidenceInspectorProps) {
  if (evidence) {
    return (
      <aside className="border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(25,35,31,0.06)] lg:sticky lg:top-6">
        <div className="border-b border-[#d9dfd5] pb-4">
          <p className="mb-2 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
            AI Evidence Inspector
          </p>
          <h2 className="text-2xl font-semibold text-[#14211d]">
            {evidence.id}
          </h2>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <h3 className="text-xl font-semibold leading-snug text-[#14211d]">
              {evidence.title}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="border border-[#c7cec4] bg-[#fbfcfa] px-2 py-1 text-[#52635d]">
                {getEvidenceTypeLabel(evidence.type)}
              </span>
              <span className="border border-[#c7cec4] bg-[#fbfcfa] px-2 py-1 text-[#52635d]">
                强度 {getEvidenceStrengthLabel(evidence.strength)}
              </span>
              <span className="border border-[#c7cec4] bg-[#fbfcfa] px-2 py-1 text-[#52635d]">
                置信度 {Math.round(evidence.confidence * 100)}%
              </span>
            </div>
          </div>

          <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
            <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
              来源
            </div>
            <div className="mt-2 text-sm leading-6 text-[#364641]">
              {evidence.source_label} · Page {evidence.page}
            </div>
          </div>

          {evidence.text_anchor ? (
            <div className="border-l-4 border-[#c6b16b] bg-[#fbf6df] px-4 py-3">
              <div className="text-xs font-semibold tracking-[0.14em] text-[#7a6630] uppercase">
                Text Anchor
              </div>
              <p className="mt-2 text-sm leading-7 text-[#4c4224]">
                {evidence.text_anchor}
              </p>
            </div>
          ) : null}

          <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
            <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
              解释
            </div>
            <p className="mt-2 text-sm leading-7 text-[#364641]">
              {evidence.explanation}
            </p>
          </div>

          <div className="border-l-4 border-[#9a4b2e] bg-[#f4ede8] px-4 py-3">
            <div className="text-xs font-semibold tracking-[0.14em] text-[#8a442a] uppercase">
              局限性
            </div>
            <p className="mt-2 text-sm leading-7 text-[#4d3329]">
              {evidence.limitation}
            </p>
          </div>
        </div>
      </aside>
    );
  }

  if (lastClickResult) {
    return (
      <aside className="border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(25,35,31,0.06)] lg:sticky lg:top-6">
        <div className="border-b border-[#d9dfd5] pb-4">
          <p className="mb-2 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
            AI Evidence Inspector
          </p>
          <h2 className="text-2xl font-semibold text-[#14211d]">
            最近点击反馈
          </h2>
        </div>

        <div
          className={`mt-5 border-l-4 px-4 py-4 text-sm leading-7 ${
            statusClasses[lastClickResult.status]
          }`}
        >
          <div className="font-semibold">
            {statusLabels[lastClickResult.status]}
          </div>
          <p className="mt-2">{lastClickResult.reason}</p>
          {lastClickResult.matchedEvidenceId ? (
            <p className="mt-2">匹配证据：{lastClickResult.matchedEvidenceId}</p>
          ) : null}
        </div>

        <div className="mt-4 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
          <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
            clicked_text
          </div>
          <p className="mt-2 break-words text-sm leading-7 text-[#364641]">
            {lastClickResult.clickedText}
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(25,35,31,0.06)] lg:sticky lg:top-6">
      <div className="border-b border-[#d9dfd5] pb-4">
        <p className="mb-2 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
          AI Evidence Inspector
        </p>
        <h2 className="text-2xl font-semibold text-[#14211d]">证据详情</h2>
      </div>
      <div className="mt-8 border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-4">
        <p className="text-base font-semibold leading-7 text-[#24342f]">
          点击网页化论文中的句子，寻找支持当前案件主线的证据。
        </p>
      </div>
    </aside>
  );
}
