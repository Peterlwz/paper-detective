import Link from "next/link";
import { CorrectionPanel } from "@/components/CorrectionPanel";
import type { DetectiveCase } from "@/types/case";
import type { EvidenceItem } from "@/types/evidence";
import {
  getEvidenceStrengthLabel,
  getEvidenceTypeLabel,
} from "@/utils/evidenceLabels";

interface AiVerdictReportProps {
  paperId: string;
  detectiveCase: DetectiveCase;
  evidenceList: EvidenceItem[];
  analysisMode?: string;
  analysisProvider?: string;
}

const sourceTypeLabels: Record<EvidenceItem["source_type"], string> = {
  text: "正文",
  figure: "图表",
};

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-4 text-center">
      <div className="text-3xl font-semibold text-[#1d352f]">{value}</div>
      <div className="mt-2 text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
        {label}
      </div>
    </div>
  );
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

export function AiVerdictReport({
  paperId,
  detectiveCase,
  evidenceList,
  analysisMode,
  analysisProvider,
}: AiVerdictReportProps) {
  const strengthCounts = evidenceList.reduce(
    (counts, evidence) => ({
      ...counts,
      [evidence.strength]: counts[evidence.strength] + 1,
    }),
    { strong: 0, medium: 0, weak: 0 },
  );
  const limitationCount = evidenceList.filter(
    (evidence) => evidence.type === "limitation" || evidence.limitation.trim(),
  ).length;
  const limitations = evidenceList
    .filter((evidence) => evidence.limitation.trim())
    .map((evidence) => ({
      id: evidence.id,
      title: evidence.title,
      limitation: evidence.limitation,
    }));

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#15201d]">
      <section className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-4 border-b border-[#d8ded4] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.22em] text-[#52635d] uppercase transition hover:text-[#1d352f]"
          >
            Paper Detective
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/case/${detectiveCase.case_id}?paperId=${encodeURIComponent(paperId)}`}
              className="border border-[#1d352f] px-3 py-2 text-xs font-semibold text-[#1d352f] transition hover:bg-[#1d352f] hover:text-white"
            >
              返回案件详情
            </Link>
            <Link
              href={`/cases?paperId=${encodeURIComponent(paperId)}`}
              className="border border-[#c7cec4] px-3 py-2 text-xs font-semibold text-[#52635d] transition hover:border-[#1d352f] hover:text-[#1d352f]"
            >
              返回案件列表
            </Link>
          </div>
        </header>

        <div className="space-y-8 py-8">
          <section className="border border-[#cfd7cc] bg-white/80 p-6 shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
            <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
              AI Verdict
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#14211d] sm:text-4xl">
              AI 基础结案报告
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#52635d]">
              该报告基于 AI 生成的证据链自动整理。当前版本尚未接入真实 PDF
              交互式证据捕获，因此不包含游戏化找证记录。
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#52635d]">
              <span className="border border-[#c7cec4] bg-[#fbfcfa] px-3 py-1">
                mode: {analysisMode ?? "unknown"}
              </span>
              <span className="border border-[#c7cec4] bg-[#fbfcfa] px-3 py-1">
                provider: {analysisProvider ?? "unknown"}
              </span>
            </div>
          </section>

          <section className="border border-[#cfd7cc] bg-white/80 p-6">
            <SectionTitle eyebrow="Final Conclusion" title="最终结论" />
            <p className="mt-5 text-base leading-8 text-[#364641]">
              本案件围绕「{detectiveCase.main_claim}」。当前证据链显示，该主张主要由以下正文/图表证据支持，但仍需要结合实验设计、样本量和局限性进一步判断。
            </p>
          </section>

          <section className="border border-[#cfd7cc] bg-white/80 p-6">
            <SectionTitle eyebrow="Evidence Summary" title="证据链摘要" />
            {evidenceList.length > 0 ? (
              <div className="mt-5 space-y-4">
                {evidenceList.map((evidence) => (
                  <article
                    key={evidence.id}
                    className="border border-[#d9dfd5] bg-[#fbfcfa] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                          {evidence.id}
                        </div>
                        <h3 className="mt-2 text-lg font-semibold leading-snug text-[#14211d]">
                          {evidence.title}
                        </h3>
                      </div>
                      <span className="shrink-0 border border-[#1d352f] bg-white px-2 py-1 text-xs font-semibold text-[#1d352f]">
                        置信度 {Math.round(evidence.confidence * 100)}%
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="border border-[#c7cec4] bg-white px-2 py-1 text-[#52635d]">
                        {sourceTypeLabels[evidence.source_type]}
                      </span>
                      <span className="border border-[#c7cec4] bg-white px-2 py-1 text-[#52635d]">
                        {evidence.source_label}
                      </span>
                      <span className="border border-[#c7cec4] bg-white px-2 py-1 text-[#52635d]">
                        Page {evidence.page}
                      </span>
                      <span className="border border-[#c7cec4] bg-white px-2 py-1 text-[#52635d]">
                        {getEvidenceTypeLabel(evidence.type)}
                      </span>
                      <span className="border border-[#c7cec4] bg-white px-2 py-1 text-[#52635d]">
                        强度 {getEvidenceStrengthLabel(evidence.strength)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#364641]">
                      {evidence.explanation}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-4 text-sm leading-7 text-[#52635d]">
                当前案件暂无证据数据。建议返回案件详情或重新上传论文检查分析结果。
              </p>
            )}
          </section>

          <section className="border border-[#cfd7cc] bg-white/80 p-6">
            <SectionTitle eyebrow="Strength Distribution" title="证据强度分布" />
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <StatItem label="强证据" value={strengthCounts.strong} />
              <StatItem label="中等证据" value={strengthCounts.medium} />
              <StatItem label="弱证据" value={strengthCounts.weak} />
              <StatItem label="局限性" value={limitationCount} />
            </div>
          </section>

          <section className="border border-[#cfd7cc] bg-white/80 p-6">
            <SectionTitle eyebrow="Limitations" title="局限性总结" />
            {limitations.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {limitations.map((item) => (
                  <div
                    key={`${item.id}-${item.limitation}`}
                    className="border-l-4 border-[#9a4b2e] bg-[#f4ede8] px-4 py-3"
                  >
                    <div className="text-sm font-semibold text-[#4d3329]">
                      {item.id} · {item.title}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[#4d3329]">
                      {item.limitation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-4 text-sm leading-7 text-[#52635d]">
                AI 未明确标出局限性，建议人工复核。
              </p>
            )}
          </section>

          <section className="border border-[#cfd7cc] bg-white/80 p-6">
            <SectionTitle eyebrow="Human Review" title="人工复核建议" />
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[#364641]">
              <li className="border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-3">
                检查证据是否来自关键结果部分。
              </li>
              <li className="border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-3">
                检查图表证据是否对应 main claim。
              </li>
              <li className="border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-3">
                检查是否存在反例或限制条件。
              </li>
              <li className="border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-3">
                检查是否过度推断机制因果关系。
              </li>
            </ul>
          </section>

          <section className="border border-[#cfd7cc] bg-white/80 p-6">
            <SectionTitle eyebrow="Correction" title="对结案报告纠错 / 补充" />
            <CorrectionPanel
              paperId={paperId}
              caseId={detectiveCase.case_id}
              targetType="verdict"
            />
          </section>

          <section className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/case/${detectiveCase.case_id}?paperId=${encodeURIComponent(paperId)}`}
              className="inline-flex items-center justify-center border border-[#1d352f] bg-[#1d352f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f]"
            >
              返回案件详情
            </Link>
            <Link
              href={`/cases?paperId=${encodeURIComponent(paperId)}`}
              className="inline-flex items-center justify-center border border-[#9aa69f] px-5 py-3 text-sm font-semibold text-[#1d352f] transition hover:border-[#1d352f] hover:bg-white"
            >
              挑战其他案件主线
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
