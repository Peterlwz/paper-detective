import { CorrectionPanel } from "@/components/CorrectionPanel";
import type { DetectiveCase } from "@/types/case";
import type { EvidenceItem } from "@/types/evidence";
import {
  getEvidenceStrengthLabel,
  getEvidenceTypeLabel,
} from "@/utils/evidenceLabels";

interface VerdictReportProps {
  detectiveCase: DetectiveCase;
  evidenceList: EvidenceItem[];
}

function hasEvidenceType(
  evidenceList: EvidenceItem[],
  type: EvidenceItem["type"],
): boolean {
  return evidenceList.some((evidence) => evidence.type === type);
}

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="border-b border-[#d9dfd5] pb-4">
      <p className="text-xs font-semibold tracking-[0.16em] text-[#6d7a75] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[#14211d]">{title}</h2>
    </div>
  );
}

export function VerdictReport({
  detectiveCase,
  evidenceList,
}: VerdictReportProps) {
  const hasLimitationEvidence = hasEvidenceType(evidenceList, "limitation");
  const primaryLimitations = evidenceList.filter(
    (evidence) => evidence.type === "limitation",
  );
  const otherLimitations = evidenceList.filter(
    (evidence) => evidence.type !== "limitation" && evidence.limitation,
  );

  return (
    <div className="space-y-8">
      <section className="border border-[#cfd7cc] bg-white/80 p-6 shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
        <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
          Evidence Verdict
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#14211d] sm:text-4xl">
          案件结论页 / Evidence Verdict
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#52635d]">
          展示该案件的核心结论、证据链、证据强度、局限性和阅读复盘。
        </p>
      </section>

      <section className="border border-[#cfd7cc] bg-white/80 p-6">
        <SectionTitle eyebrow="Final Conclusion" title="最终结论" />
        <div className="mt-5 space-y-4 text-base leading-8 text-[#364641]">
          <p>
            本案件围绕：{detectiveCase.main_claim}
            当前证据链显示，该主张获得了若干实验结果支持。功能实验、机制证据和动物实验共同构成主要支撑；临床相关性证据提供外部关联；但局限性证据提示该结论仍需要进一步验证。
          </p>
          {hasLimitationEvidence ? (
            <p>
              不过，该案件仍存在结论边界，尤其是缺少进一步临床验证或长期安全性证据。
            </p>
          ) : null}
        </div>
        <CorrectionPanel
          paperId={detectiveCase.paper_id}
          caseId={detectiveCase.case_id}
          targetType="verdict"
          triggerLabel="对结案结论纠错 / 补充"
        />
      </section>

      <section className="border border-[#cfd7cc] bg-white/80 p-6">
        <SectionTitle eyebrow="Evidence Chain" title="证据链" />
        <div className="mt-4 flex flex-wrap items-center gap-2 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3 text-sm font-semibold text-[#52635d]">
          {evidenceList.map((evidence, index) => (
            <div key={evidence.id} className="flex items-center gap-2">
              <span className="border border-[#1d352f] bg-white px-3 py-1 text-[#1d352f]">
                {evidence.id}
              </span>
              {index < evidenceList.length - 1 ? (
                <span className="text-[#9aa69f]">-</span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-4">
          {evidenceList.map((evidence, index) => (
            <article
              key={evidence.id}
              className="grid gap-4 border border-[#d9dfd5] bg-[#fbfcfa] p-4 lg:grid-cols-[80px_minmax(0,1fr)]"
            >
              <div className="flex items-center gap-3 lg:block">
                <div className="flex h-12 w-12 items-center justify-center border border-[#1d352f] bg-[#1d352f] text-sm font-semibold text-white">
                  {evidence.id}
                </div>
                <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase lg:mt-3">
                  Step {index + 1}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold leading-snug text-[#14211d]">
                  {evidence.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="border border-[#c7cec4] bg-white px-2 py-1 text-[#52635d]">
                    {getEvidenceTypeLabel(evidence.type)}
                  </span>
                  <span className="border border-[#c7cec4] bg-white px-2 py-1 text-[#52635d]">
                    {evidence.source_label}
                  </span>
                  <span className="border border-[#c7cec4] bg-white px-2 py-1 text-[#52635d]">
                    强度 {getEvidenceStrengthLabel(evidence.strength)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[#364641]">
                  {evidence.explanation}
                </p>
                <CorrectionPanel
                  paperId={detectiveCase.paper_id}
                  caseId={detectiveCase.case_id}
                  evidenceId={evidence.id}
                  targetType="evidence"
                  compact={true}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border border-[#cfd7cc] bg-white/80 p-6">
        <SectionTitle eyebrow="Strength Matrix" title="证据强度表" />
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#d9dfd5] bg-[#edf2ef] text-[#24342f]">
                <th className="px-3 py-3 font-semibold">证据编号</th>
                <th className="px-3 py-3 font-semibold">类型</th>
                <th className="px-3 py-3 font-semibold">来源</th>
                <th className="px-3 py-3 font-semibold">强度</th>
                <th className="px-3 py-3 font-semibold">作用说明</th>
              </tr>
            </thead>
            <tbody>
              {evidenceList.map((evidence) => (
                <tr key={evidence.id} className="border-b border-[#e4e9e1]">
                  <td className="px-3 py-3 font-semibold text-[#1d352f]">
                    {evidence.id}
                  </td>
                  <td className="px-3 py-3 text-[#364641]">
                    {getEvidenceTypeLabel(evidence.type)}
                  </td>
                  <td className="px-3 py-3 text-[#364641]">
                    {evidence.source_label}
                  </td>
                  <td className="px-3 py-3 text-[#364641]">
                    {getEvidenceStrengthLabel(evidence.strength)}
                  </td>
                  <td className="px-3 py-3 leading-6 text-[#52635d]">
                    {evidence.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-[#cfd7cc] bg-white/80 p-6">
        <SectionTitle eyebrow="Boundary Check" title="局限性总结" />
        <p className="mt-4 text-base leading-8 text-[#364641]">
          这篇论文/这个案件不是被无脑证明了，它有边界。下面这些限制决定了结论应如何被谨慎解读。
        </p>

        {primaryLimitations.length > 0 ? (
          <div className="mt-5 space-y-3">
            {primaryLimitations.map((evidence) => (
              <div
                key={evidence.id}
                className="border-l-4 border-[#9a4b2e] bg-[#f4ede8] px-4 py-3"
              >
                <div className="text-sm font-semibold text-[#4d3329]">
                  {evidence.id} · {evidence.title}
                </div>
                <p className="mt-2 text-sm leading-7 text-[#4d3329]">
                  {evidence.limitation}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {otherLimitations.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {otherLimitations.map((evidence) => (
              <div
                key={evidence.id}
                className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3"
              >
                <div className="text-sm font-semibold text-[#24342f]">
                  {evidence.id} 的解释边界
                </div>
                <p className="mt-2 text-sm leading-7 text-[#52635d]">
                  {evidence.limitation}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="border border-[#cfd7cc] bg-white/80 p-6">
        <SectionTitle eyebrow="Reading Review" title="用户阅读复盘" />
        <div className="mt-5 space-y-3 text-base leading-8 text-[#364641]">
          {hasEvidenceType(evidenceList, "functional") ? (
            <p>
              你已经完成了功能实验证据的收集，这有助于理解因果层面的支持。
            </p>
          ) : null}
          {hasEvidenceType(evidenceList, "animal") ? (
            <p>
              动物实验提供了体内层面的支持，但仍不等同于临床有效。
            </p>
          ) : null}
          {hasEvidenceType(evidenceList, "clinical") ? (
            <p>
              临床相关性证据帮助你把机制发现和患者样本联系起来。
            </p>
          ) : null}
          {hasLimitationEvidence ? (
            <p>
              你也看到了局限性证据，这说明阅读不只是找支持结论的结果，也要判断结论边界。
            </p>
          ) : null}
          <p className="border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-3 font-semibold text-[#24342f]">
            下一步建议：尝试用 3 句话复述该论文如何从现象、机制、干预和局限性构成完整论证。
          </p>
        </div>
      </section>

      <section className="border border-[#cfd7cc] bg-white/80 p-6">
        <SectionTitle eyebrow="Export" title="导出占位" />
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled
            className="border border-[#c7cec4] bg-[#d9dfd5] px-4 py-3 text-sm font-semibold text-[#6d7a75]"
          >
            导出 Markdown（暂未开放）
          </button>
          <button
            type="button"
            disabled
            className="border border-[#c7cec4] bg-[#d9dfd5] px-4 py-3 text-sm font-semibold text-[#6d7a75]"
          >
            导出 PDF（暂未开放）
          </button>
          <button
            type="button"
            disabled
            className="border border-[#c7cec4] bg-[#d9dfd5] px-4 py-3 text-sm font-semibold text-[#6d7a75]"
          >
            Journal Club 提纲（暂未开放）
          </button>
        </div>
      </section>
    </div>
  );
}
