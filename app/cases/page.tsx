import Link from "next/link";
import { mockCases } from "@/mock/cases";
import { mockEvidenceItems } from "@/mock/evidence";
import { mockPaper } from "@/mock/paper";

const difficultyLabels = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
} as const;

const evidenceCountByCaseId = mockEvidenceItems.reduce<Record<string, number>>(
  (counts, evidence) => {
    counts[evidence.case_id] = (counts[evidence.case_id] ?? 0) + 1;
    return counts;
  },
  {},
);

export default function CasesPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#15201d]">
      <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#d8ded4] pb-5">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.22em] text-[#52635d] uppercase transition hover:text-[#1d352f]"
          >
            Paper Detective
          </Link>
          <span className="hidden border border-[#c7cec4] px-3 py-1 text-xs text-[#52635d] sm:block">
            Case Selection
          </span>
        </header>

        <section className="border-b border-[#d8ded4] py-10">
          <p className="mb-4 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
            Source Paper
          </p>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-[#14211d] sm:text-4xl">
            {mockPaper.title}
          </h1>
          <div className="mt-6 grid gap-4 text-sm text-[#52635d] sm:grid-cols-3">
            <div>
              <div className="mb-1 text-xs font-semibold tracking-[0.16em] text-[#6d7a75] uppercase">
                Journal
              </div>
              <div className="text-[#24342f]">{mockPaper.journal}</div>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold tracking-[0.16em] text-[#6d7a75] uppercase">
                Year
              </div>
              <div className="text-[#24342f]">{mockPaper.year}</div>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold tracking-[0.16em] text-[#6d7a75] uppercase">
                Authors
              </div>
              <div className="text-[#24342f]">
                {mockPaper.authors.join(", ")}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
                AI Case Lines
              </p>
              <h2 className="text-3xl font-semibold text-[#14211d]">
                AI 识别出 {mockCases.length} 条案件主线
              </h2>
            </div>
            <div className="border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-3 text-sm leading-6 text-[#364641]">
              选择一条主线后，将进入对应案件阅读路径。
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            {mockCases.map((detectiveCase, index) => {
              const evidenceCount =
                evidenceCountByCaseId[detectiveCase.case_id] ?? 0;

              return (
                <article
                  key={detectiveCase.case_id}
                  className="border border-[#cfd7cc] bg-white/75 p-5 shadow-[0_14px_40px_rgba(25,35,31,0.06)]"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="border border-[#c7cec4] bg-[#fbfcfa] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[#52635d] uppercase">
                          Case {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="border border-[#c7cec4] bg-[#edf2ef] px-3 py-1 text-xs font-medium text-[#1d352f]">
                          难度 {difficultyLabels[detectiveCase.difficulty]}
                        </span>
                      </div>
                      <h3 className="text-2xl font-semibold leading-snug text-[#14211d]">
                        {detectiveCase.case_title}
                      </h3>
                      <p className="mt-3 max-w-3xl text-base leading-7 text-[#52635d]">
                        {detectiveCase.main_claim}
                      </p>
                    </div>

                    <Link
                      href={`/case/${detectiveCase.case_id}`}
                      className="inline-flex shrink-0 items-center justify-center border border-[#1d352f] bg-[#1d352f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f]"
                    >
                      开始侦破
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-3 border-y border-[#d9dfd5] py-5 sm:grid-cols-3 lg:grid-cols-4">
                    <div>
                      <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                        证据数量
                      </div>
                      <div className="mt-1 text-lg font-semibold text-[#24342f]">
                        {evidenceCount} 条
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                        推荐指数
                      </div>
                      <div className="mt-1 text-lg font-semibold text-[#24342f]">
                        {detectiveCase.recommended}/10
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                        预计阅读
                      </div>
                      <div className="mt-1 text-lg font-semibold text-[#24342f]">
                        {detectiveCase.estimated_minutes} 分钟
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                        结案所需
                      </div>
                      <div className="mt-1 text-lg font-semibold text-[#24342f]">
                        {detectiveCase.evidence_required} 条
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="mb-3 text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                        涉及图表
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {detectiveCase.involved_figures.map((figure) => (
                          <span
                            key={figure}
                            className="border border-[#c7cec4] bg-[#fbfcfa] px-3 py-1 text-sm text-[#364641]"
                          >
                            {figure}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-3 text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                        实验类型
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {detectiveCase.experiment_types.map((experiment) => (
                          <span
                            key={experiment}
                            className="border border-[#d4dbd1] bg-[#edf2ef] px-3 py-1 text-sm text-[#364641]"
                          >
                            {experiment}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
