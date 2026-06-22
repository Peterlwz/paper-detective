"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AiVerdictReport } from "@/components/AiVerdictReport";
import type { PaperAnalysisResponse } from "@/types/api";

interface AiVerdictLoaderProps {
  caseId: string;
  paperId: string;
}

function AiVerdictFallback({
  caseId,
  paperId,
  title,
  message,
}: AiVerdictLoaderProps & {
  title: string;
  message: string;
}) {
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
              href={`/case/${caseId}?paperId=${encodeURIComponent(paperId)}`}
              className="border border-[#1d352f] px-3 py-2 text-xs font-semibold text-[#1d352f] transition hover:bg-[#1d352f] hover:text-white"
            >
              返回案件阅读页
            </Link>
            <Link
              href={`/cases?paperId=${encodeURIComponent(paperId)}`}
              className="border border-[#c7cec4] px-3 py-2 text-xs font-semibold text-[#52635d] transition hover:border-[#1d352f] hover:text-[#1d352f]"
            >
              返回案件列表
            </Link>
          </div>
        </header>

        <div className="grid min-h-[60vh] place-items-center py-8">
          <div className="w-full max-w-xl border border-[#cfd7cc] bg-white/80 p-8 text-center shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
            <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
              AI Verdict
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-[#14211d]">
              {title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#52635d]">{message}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function AiVerdictLoader({ caseId, paperId }: AiVerdictLoaderProps) {
  const [analysis, setAnalysis] = useState<PaperAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAiVerdict() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/papers/${encodeURIComponent(paperId)}/analysis`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setAnalysis(null);
          setError("未能从当前论文分析结果中读取该 AI 案件。");
          return;
        }

        const payload = (await response.json()) as PaperAnalysisResponse;
        setAnalysis(payload);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setAnalysis(null);
        setError("未能从当前论文分析结果中读取该 AI 案件。");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAiVerdict();

    return () => {
      controller.abort();
    };
  }, [paperId]);

  if (isLoading) {
    return (
      <AiVerdictFallback
        caseId={caseId}
        paperId={paperId}
        title="正在生成 AI 结案报告..."
        message="正在读取当前论文的 AI 分析结果。"
      />
    );
  }

  const detectiveCase =
    analysis?.cases.find((item) => item.case_id === caseId) ?? null;
  const evidenceList =
    analysis?.evidence_items.filter((item) => item.case_id === caseId) ?? [];

  if (error || !analysis || !detectiveCase) {
    return (
      <AiVerdictFallback
        caseId={caseId}
        paperId={paperId}
        title="未找到该案件"
        message={error || "请返回案件列表，确认当前论文分析结果中包含该 AI 案件。"}
      />
    );
  }

  return (
    <AiVerdictReport
      paperId={paperId}
      detectiveCase={detectiveCase}
      evidenceList={evidenceList}
      analysisMode={analysis.analysis?.mode}
      analysisProvider={analysis.analysis?.provider}
    />
  );
}
