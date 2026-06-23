"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PaperAnalysisResponse } from "@/types/api";

const difficultyLabels = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
} as const;

interface CasesClientProps {
  paperId: string;
}

function safeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,;；、\n\r]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function CasesClient({ paperId }: CasesClientProps) {
  const [analysis, setAnalysis] = useState<PaperAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalysis() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/papers/${encodeURIComponent(paperId)}/analysis`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setAnalysis(null);
          setError("未能读取论文分析结果，请返回首页重新上传。");
          return;
        }

        const payload = (await response.json()) as PaperAnalysisResponse;
        setAnalysis(payload);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setAnalysis(null);
        setError("未能读取论文分析结果，请返回首页重新上传。");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAnalysis();

    return () => {
      controller.abort();
    };
  }, [paperId]);

  const evidenceCountByCaseId = useMemo(() => {
    const evidenceItems = Array.isArray(analysis?.evidence_items)
      ? analysis.evidence_items
      : [];

    return evidenceItems.reduce<Record<string, number>>(
      (counts, evidence) => {
        counts[evidence.case_id] = (counts[evidence.case_id] ?? 0) + 1;
        return counts;
      },
      {},
    );
  }, [analysis]);
  const analysisMetadata = analysis?.analysis;
  const safeCases = Array.isArray(analysis?.cases) ? analysis.cases : [];
  const authors = safeStringArray(analysis?.paper.authors);
  const warningMessages = safeStringArray(analysisMetadata?.warnings);
  const analysisModeMessage =
    analysisMetadata?.mode === "real"
      ? "当前案件主线由 DeepSeek 分析生成。"
      : analysisMetadata?.mode === "fallback"
        ? "DeepSeek 未完成真实分析，已安全回退到 mock 分析结果。"
        : "当前使用 Demo / mock AI 分析结果。";

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f6f7f4] text-[#15201d]">
        <section className="mx-auto grid min-h-screen w-full max-w-6xl place-items-center px-6 py-8 sm:px-10 lg:px-12">
          <div className="border border-[#cfd7cc] bg-white/80 p-8 text-center shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
            <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
              Loading Analysis
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-[#14211d]">
              正在读取论文案件...
            </h1>
          </div>
        </section>
      </main>
    );
  }

  if (error || !analysis) {
    return (
      <main className="min-h-screen bg-[#f6f7f4] text-[#15201d]">
        <section className="mx-auto grid min-h-screen w-full max-w-6xl place-items-center px-6 py-8 sm:px-10 lg:px-12">
          <div className="border border-[#cfd7cc] bg-white/80 p-8 text-center shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
            <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
              Analysis Missing
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-[#14211d]">
              未能读取论文分析结果，请返回首页重新上传。
            </h1>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center border border-[#1d352f] bg-[#1d352f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f]"
            >
              返回首页
            </Link>
          </div>
        </section>
      </main>
    );
  }

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
            {analysis.paper.title}
          </h1>
          <div className="mt-6 grid gap-4 text-sm text-[#52635d] sm:grid-cols-3">
            <div>
              <div className="mb-1 text-xs font-semibold tracking-[0.16em] text-[#6d7a75] uppercase">
                Journal
              </div>
              <div className="text-[#24342f]">{analysis.paper.journal}</div>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold tracking-[0.16em] text-[#6d7a75] uppercase">
                Year
              </div>
              <div className="text-[#24342f]">{analysis.paper.year}</div>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold tracking-[0.16em] text-[#6d7a75] uppercase">
                Authors
              </div>
              <div className="text-[#24342f]">
                {authors.length > 0 ? authors.join(", ") : "Unknown authors"}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-3 text-sm leading-6 text-[#364641] sm:flex-row sm:items-center sm:justify-between">
            <span>{analysisModeMessage}</span>
            {analysis.extraction ? (
              <span className="font-semibold">
                已抽取文本约 {analysis.extraction.char_count} 字符
              </span>
            ) : null}
          </div>
          {analysisMetadata ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#52635d]">
              <span className="border border-[#c7cec4] bg-white/70 px-2 py-1">
                mode: {analysisMetadata.mode}
              </span>
              <span className="border border-[#c7cec4] bg-white/70 px-2 py-1">
                provider: {analysisMetadata.provider}
              </span>
              <span className="border border-[#c7cec4] bg-white/70 px-2 py-1">
                model: {analysisMetadata.model_label}
              </span>
              {typeof analysisMetadata.input_char_count === "number" ? (
                <span className="border border-[#c7cec4] bg-white/70 px-2 py-1">
                  input: {analysisMetadata.input_char_count}
                  {typeof analysisMetadata.input_char_limit === "number"
                    ? ` / ${analysisMetadata.input_char_limit}`
                    : ""}
                </span>
              ) : null}
            </div>
          ) : null}
          {analysisMetadata?.fallback_reason ? (
            <div className="mt-3 border-l-4 border-[#9a4b2e] bg-[#f4ede8] px-4 py-3 text-sm leading-6 text-[#4d3329]">
              fallback_reason: {analysisMetadata.fallback_reason}
            </div>
          ) : null}
          {warningMessages.length > 0 ? (
            <div className="mt-3 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3 text-sm leading-6 text-[#52635d]">
              {warningMessages.join(" ")}
            </div>
          ) : null}
        </section>

        <section className="py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
                Case Lines
              </p>
              <h2 className="text-3xl font-semibold text-[#14211d]">
                已拆出 {safeCases.length} 条案件主线
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#52635d]">
                同一篇论文可以拆成多条科学案件主线。每条主线对应不同
                claim，也需要收集不同证据。
              </p>
            </div>
            <div className="border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-3 text-sm leading-6 text-[#364641]">
              当前读取：{paperId}。选择一条主线后，将进入对应案件阅读路径。
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            {safeCases.map((detectiveCase, index) => {
              const evidenceCount =
                evidenceCountByCaseId[detectiveCase.case_id] ?? 0;
              const involvedFigures = safeStringArray(
                detectiveCase.involved_figures,
              );
              const experimentTypes = safeStringArray(
                detectiveCase.experiment_types,
              );

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
                          难度 {difficultyLabels[detectiveCase.difficulty] ?? "中等"}
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
                      href={`/case/${detectiveCase.case_id}?paperId=${encodeURIComponent(paperId)}`}
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
                        {involvedFigures.length > 0 ? (
                          involvedFigures.map((figure) => (
                          <span
                            key={figure}
                            className="border border-[#c7cec4] bg-[#fbfcfa] px-3 py-1 text-sm text-[#364641]"
                          >
                            {figure}
                          </span>
                          ))
                        ) : (
                          <span className="text-sm text-[#6d7a75]">暂无</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="mb-3 text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                        实验类型
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {experimentTypes.length > 0 ? (
                          experimentTypes.map((experiment) => (
                          <span
                            key={experiment}
                            className="border border-[#d4dbd1] bg-[#edf2ef] px-3 py-1 text-sm text-[#364641]"
                          >
                            {experiment}
                          </span>
                          ))
                        ) : (
                          <span className="text-sm text-[#6d7a75]">暂无</span>
                        )}
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
