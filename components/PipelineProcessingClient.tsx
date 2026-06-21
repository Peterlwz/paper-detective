"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PipelineResponse, PipelineStageStatus } from "@/types/pipeline";

interface PipelineProcessingClientProps {
  paperId: string;
  jobId?: string;
  startedAt?: string;
}

const stageStatusLabels: Record<PipelineStageStatus, string> = {
  pending: "等待中",
  running: "进行中",
  done: "完成",
  failed: "失败",
};

const stageStatusClasses: Record<PipelineStageStatus, string> = {
  pending: "border-[#d9dfd5] bg-[#fbfcfa] text-[#6d7a75]",
  running: "border-[#c6b16b] bg-[#fbf6df] text-[#4c4224]",
  done: "border-[#8aa79a] bg-[#edf2ef] text-[#24342f]",
  failed: "border-[#c69a82] bg-[#f4ede8] text-[#4d3329]",
};

function buildPipelineUrl({
  paperId,
  jobId,
  startedAt,
}: PipelineProcessingClientProps): string {
  const searchParams = new URLSearchParams();

  if (jobId) {
    searchParams.set("jobId", jobId);
  }

  if (startedAt) {
    searchParams.set("startedAt", startedAt);
  }

  const queryString = searchParams.toString();

  return `/api/papers/${encodeURIComponent(paperId)}/pipeline${
    queryString ? `?${queryString}` : ""
  }`;
}

export function PipelineProcessingClient({
  paperId,
  jobId,
  startedAt,
}: PipelineProcessingClientProps) {
  const [pipeline, setPipeline] = useState<PipelineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function loadPipelineStatus() {
      try {
        const response = await fetch(
          buildPipelineUrl({ paperId, jobId, startedAt }),
        );

        if (!response.ok) {
          throw new Error("pipeline request failed");
        }

        const payload = (await response.json()) as PipelineResponse;

        if (!isMounted) {
          return;
        }

        setPipeline(payload);
        setError("");
        setIsLoading(false);

        if (payload.result_available && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setError("未能读取 AI 分析进度，请返回首页重新上传。");
        setIsLoading(false);

        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }

    void loadPipelineStatus();
    intervalId = setInterval(loadPipelineStatus, 800);

    return () => {
      isMounted = false;

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paperId, jobId, startedAt]);

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#15201d]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-4 border-b border-[#d8ded4] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.22em] text-[#52635d] uppercase transition hover:text-[#1d352f]"
          >
            Paper Detective
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="border border-[#c7cec4] px-3 py-2 text-xs font-semibold text-[#52635d] transition hover:border-[#1d352f] hover:text-[#1d352f]"
            >
              返回首页
            </Link>
            <Link
              href="/cases?paperId=paper_001"
              className="border border-[#1d352f] px-3 py-2 text-xs font-semibold text-[#1d352f] transition hover:bg-[#1d352f] hover:text-white"
            >
              直接体验 Demo
            </Link>
          </div>
        </header>

        <div className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <section>
            <p className="mb-4 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
              Mock AI Pipeline
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-[#14211d] sm:text-5xl">
              AI 正在分析论文
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#52635d]">
              我们正在模拟完整论文理解流程：抽取文本、识别图表、生成案件主线并链接证据。
            </p>
            <div className="mt-7 border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-4 text-sm leading-7 text-[#364641]">
              当前为 mock AI pipeline，用于验证产品流程；下一阶段将替换为真实模型调用。
            </div>

            <div className="mt-6 grid gap-3 text-sm text-[#52635d] sm:grid-cols-2">
              <div className="border border-[#d9dfd5] bg-white/75 px-4 py-3">
                <div className="text-xs font-semibold tracking-[0.16em] uppercase">
                  Paper ID
                </div>
                <div className="mt-1 font-semibold text-[#24342f]">
                  {paperId}
                </div>
              </div>
              <div className="border border-[#d9dfd5] bg-white/75 px-4 py-3">
                <div className="text-xs font-semibold tracking-[0.16em] uppercase">
                  Job ID
                </div>
                <div className="mt-1 font-semibold text-[#24342f]">
                  {jobId ?? `job_${paperId}`}
                </div>
              </div>
            </div>
          </section>

          <section className="border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_18px_55px_rgba(25,35,31,0.08)]">
            {error ? (
              <div className="border-l-4 border-[#9a4b2e] bg-[#f4ede8] px-4 py-4 text-sm font-semibold text-[#4d3329]">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-b border-[#d9dfd5] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[#6d7a75] uppercase">
                  Analysis Progress
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#14211d]">
                  {pipeline?.result_available ? "分析完成" : "生成案件主线中"}
                </h2>
              </div>
              <div className="text-3xl font-semibold text-[#1d352f]">
                {pipeline?.progress ?? 0}%
              </div>
            </div>

            <div className="mt-5 h-3 overflow-hidden bg-[#d9dfd5]">
              <div
                className="h-full bg-[#1d352f] transition-all duration-500"
                style={{ width: `${pipeline?.progress ?? 0}%` }}
              />
            </div>

            <div className="mt-4 min-h-[3rem] text-sm leading-7 text-[#52635d]">
              {isLoading
                ? "正在启动 AI 分析流程..."
                : pipeline?.current_message ??
                  "正在读取论文分析进度，请稍候。"}
            </div>

            <div className="mt-6 grid gap-3">
              {(pipeline?.stages ?? []).map((stage) => (
                <div
                  key={stage.id}
                  className={`border px-4 py-4 ${stageStatusClasses[stage.status]}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-semibold text-[#24342f]">
                        {stage.label}
                      </div>
                      <div className="mt-1 text-sm leading-6">
                        {stage.description}
                      </div>
                    </div>
                    <span className="shrink-0 border border-current px-2 py-1 text-xs font-semibold">
                      {stageStatusLabels[stage.status]}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden bg-white/80">
                    <div
                      className="h-full bg-current transition-all duration-500"
                      style={{ width: `${stage.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {!pipeline && !error ? (
              <div className="mt-6 grid gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse border border-[#d9dfd5] bg-[#fbfcfa]"
                  />
                ))}
              </div>
            ) : null}

            {pipeline?.result_available ? (
              <div className="mt-6 border border-[#8aa79a] bg-[#edf2ef] px-5 py-5">
                <h3 className="text-2xl font-semibold text-[#14211d]">
                  AI 分析完成
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#52635d]">
                  已生成 3 条案件主线和 18 条证据。你可以开始像侦探一样阅读这篇论文。
                </p>
                <Link
                  href={`/cases?paperId=${encodeURIComponent(paperId)}`}
                  className="mt-5 inline-flex w-full items-center justify-center border border-[#1d352f] bg-[#1d352f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f] sm:w-auto"
                >
                  查看案件主线
                </Link>
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
