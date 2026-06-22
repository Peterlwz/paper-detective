import Link from "next/link";
import { CorrectionPanel } from "@/components/CorrectionPanel";
import { RealPaperViewer } from "@/components/RealPaperViewer";
import type { DetectiveCase } from "@/types/case";
import type { EvidenceItem } from "@/types/evidence";
import type { ReadablePaperContent } from "@/types/reader";
import {
  getEvidenceStrengthLabel,
  getEvidenceTypeLabel,
} from "@/utils/evidenceLabels";

interface AiCaseDetailProps {
  paperId: string;
  detectiveCase: DetectiveCase;
  evidenceList: EvidenceItem[];
  readableContent?: ReadablePaperContent | null;
}

const difficultyLabels: Record<DetectiveCase["difficulty"], string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

const sourceTypeLabels: Record<EvidenceItem["source_type"], string> = {
  text: "正文",
  figure: "图表",
};

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
      <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[#24342f]">{value}</div>
    </div>
  );
}

function TagList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="mb-3 text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              key={item}
              className="border border-[#c7cec4] bg-[#fbfcfa] px-3 py-1 text-sm text-[#364641]"
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-[#6d7a75]">暂无</span>
        )}
      </div>
    </div>
  );
}

export function AiCaseDetail({
  paperId,
  detectiveCase,
  evidenceList,
  readableContent,
}: AiCaseDetailProps) {
  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#15201d]">
      <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-4 border-b border-[#d8ded4] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.22em] text-[#52635d] uppercase transition hover:text-[#1d352f]"
          >
            Paper Detective
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/cases?paperId=${encodeURIComponent(paperId)}`}
              className="border border-[#1d352f] px-3 py-2 text-xs font-semibold text-[#1d352f] transition hover:bg-[#1d352f] hover:text-white"
            >
              返回案件列表
            </Link>
            <Link
              href="/"
              className="border border-[#c7cec4] px-3 py-2 text-xs font-semibold text-[#52635d] transition hover:border-[#1d352f] hover:text-[#1d352f]"
            >
              返回首页
            </Link>
          </div>
        </header>

        <section className="border-b border-[#d8ded4] py-10">
          <p className="mb-4 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
            AI 生成案件主线
          </p>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-[#14211d] sm:text-4xl">
            {detectiveCase.case_title}
          </h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-[#364641]">
            {detectiveCase.main_claim}
          </p>

          <div className="mt-6 border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-4 text-sm leading-7 text-[#364641]">
            当前为 AI 生成的基础证据链视图。真实 PDF
            交互式证据捕获、高亮和注意力机制仍在开发中。
          </div>
        </section>

        <section className="grid gap-5 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                label="难度"
                value={difficultyLabels[detectiveCase.difficulty]}
              />
              <InfoItem
                label="证据需求"
                value={`${detectiveCase.evidence_required} 条`}
              />
              <InfoItem
                label="预计阅读"
                value={`${detectiveCase.estimated_minutes} 分钟`}
              />
              <InfoItem
                label="推荐指数"
                value={`${detectiveCase.recommended}/10`}
              />
            </div>

            <div className="border border-[#cfd7cc] bg-white/75 p-5">
              <TagList
                label="涉及图表"
                items={detectiveCase.involved_figures}
              />
              <div className="mt-5">
                <TagList
                  label="实验类型"
                  items={detectiveCase.experiment_types}
                />
              </div>
            </div>

            <div className="border border-[#cfd7cc] bg-white/75 p-5">
              <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                基础报告
              </div>
              <p className="mt-3 text-sm leading-7 text-[#52635d]">
                AI case 当前可直接查看基础结案报告，交互式找证玩法将在后续接入。
              </p>
              <Link
                href={`/case/${detectiveCase.case_id}/verdict?paperId=${encodeURIComponent(paperId)}`}
                className="mt-4 inline-flex w-full items-center justify-center border border-[#1d352f] bg-[#1d352f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f]"
              >
                查看基础结案报告
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
                Evidence Chain
              </p>
              <h2 className="text-2xl font-semibold text-[#14211d]">
                AI 生成证据链
              </h2>
            </div>

            {evidenceList.length > 0 ? (
              evidenceList.map((evidence) => (
                <article
                  key={evidence.id}
                  className="border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_12px_30px_rgba(25,35,31,0.05)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                        {evidence.id}
                      </div>
                      <h3 className="mt-2 text-xl font-semibold leading-snug text-[#14211d]">
                        {evidence.title}
                      </h3>
                    </div>
                    <span className="shrink-0 border border-[#1d352f] bg-[#1d352f] px-2 py-1 text-xs font-semibold text-white">
                      置信度 {Math.round(evidence.confidence * 100)}%
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="border border-[#c7cec4] bg-[#fbfcfa] px-2 py-1 text-[#52635d]">
                      {sourceTypeLabels[evidence.source_type]}
                    </span>
                    <span className="border border-[#c7cec4] bg-[#fbfcfa] px-2 py-1 text-[#52635d]">
                      {getEvidenceTypeLabel(evidence.type)}
                    </span>
                    <span className="border border-[#c7cec4] bg-[#fbfcfa] px-2 py-1 text-[#52635d]">
                      强度 {getEvidenceStrengthLabel(evidence.strength)}
                    </span>
                    <span className="border border-[#c7cec4] bg-[#fbfcfa] px-2 py-1 text-[#52635d]">
                      {evidence.source_label}
                    </span>
                    <span className="border border-[#c7cec4] bg-[#fbfcfa] px-2 py-1 text-[#52635d]">
                      Page {evidence.page}
                    </span>
                  </div>

                  {evidence.text_anchor ? (
                    <div className="mt-4 border-l-4 border-[#c6b16b] bg-[#fbf6df] px-4 py-3">
                      <div className="text-xs font-semibold tracking-[0.14em] text-[#7a6630] uppercase">
                        Text Anchor
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[#4c4224]">
                        {evidence.text_anchor}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-4">
                    <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                      解释
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[#364641]">
                      {evidence.explanation}
                    </p>
                  </div>

                  <div className="mt-4 border-l-4 border-[#9a4b2e] bg-[#f4ede8] px-4 py-4">
                    <div className="text-xs font-semibold tracking-[0.14em] text-[#8a442a] uppercase">
                      局限性
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[#4d3329]">
                      {evidence.limitation}
                    </p>
                  </div>

                  <CorrectionPanel
                    paperId={paperId}
                    caseId={detectiveCase.case_id}
                    evidenceId={evidence.id}
                    targetType="evidence"
                    compact={true}
                  />
                </article>
              ))
            ) : (
              <div className="border border-[#cfd7cc] bg-white/80 p-6 text-sm leading-7 text-[#52635d]">
                当前案件暂无证据数据。
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-[#d8ded4] py-8">
          {readableContent ? (
            <RealPaperViewer
              paperId={paperId}
              readableContent={readableContent}
              evidenceList={evidenceList}
            />
          ) : (
            <div className="border border-[#cfd7cc] bg-white/80 p-6 shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
              <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
                Real Paper Reader
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#14211d]">
                网页化阅读器 Beta
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#52635d]">
                当前没有可用的网页化论文文本。请重新上传带文本层的 PDF。
              </p>
            </div>
          )}
        </section>

        <section className="border border-[#cfd7cc] bg-white/80 p-6">
          <h2 className="text-2xl font-semibold text-[#14211d]">
            对这条案件主线纠错 / 补充
          </h2>
          <CorrectionPanel
            paperId={paperId}
            caseId={detectiveCase.case_id}
            targetType="case"
          />
        </section>
      </section>
    </main>
  );
}
