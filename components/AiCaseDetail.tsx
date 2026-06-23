"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AiEvidenceInspector } from "@/components/AiEvidenceInspector";
import type { AiEvidenceClickResult } from "@/components/AiEvidenceInspector";
import { AiEvidenceProgress } from "@/components/AiEvidenceProgress";
import { CorrectionPanel } from "@/components/CorrectionPanel";
import { RealPaperViewer } from "@/components/RealPaperViewer";
import type { DetectiveCase } from "@/types/case";
import type { EvidenceItem } from "@/types/evidence";
import type { ReadablePaperContent } from "@/types/reader";
import { matchReaderEvidence } from "@/utils/matchReaderEvidence";

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

function safeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(String).map((item) => item.trim()).filter(Boolean)
    : [];
}

export function AiCaseDetail({
  paperId,
  detectiveCase,
  evidenceList,
  readableContent,
}: AiCaseDetailProps) {
  const safeEvidenceList = Array.isArray(evidenceList) ? evidenceList : [];
  const involvedFigures = safeStringArray(detectiveCase.involved_figures);
  const experimentTypes = safeStringArray(detectiveCase.experiment_types);
  const [foundEvidenceIds, setFoundEvidenceIds] = useState<string[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    null,
  );
  const [lastClickResult, setLastClickResult] =
    useState<AiEvidenceClickResult | null>(null);
  const selectedEvidence = useMemo(
    () =>
      selectedEvidenceId
        ? safeEvidenceList.find(
            (evidence) => evidence.id === selectedEvidenceId,
          )
        : undefined,
    [safeEvidenceList, selectedEvidenceId],
  );
  const isCaseComplete =
    safeEvidenceList.length > 0 &&
    foundEvidenceIds.length === safeEvidenceList.length;

  useEffect(() => {
    setFoundEvidenceIds([]);
    setSelectedEvidenceId(null);
    setLastClickResult(null);
  }, [detectiveCase.case_id]);

  function handleSentenceClick({
    text,
  }: {
    sentenceId: string;
    sectionId: string;
    sectionTitle: string;
    page?: number;
    text: string;
  }) {
    const result = matchReaderEvidence({
      clickedText: text,
      evidenceList: safeEvidenceList,
    });
    const matchedEvidenceId = result.matchedEvidence?.id;

    setLastClickResult({
      status: result.status,
      clickedText: text,
      matchedEvidenceId,
      reason: result.reason,
    });

    if (result.status === "valid_evidence" && result.matchedEvidence) {
      setSelectedEvidenceId(result.matchedEvidence.id);
      setFoundEvidenceIds((currentIds) =>
        currentIds.includes(result.matchedEvidence!.id)
          ? currentIds
          : [...currentIds, result.matchedEvidence!.id],
      );
      return;
    }

    setSelectedEvidenceId(null);
  }

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

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="难度"
              value={difficultyLabels[detectiveCase.difficulty]}
            />
            <InfoItem label="证据需求" value={`${safeEvidenceList.length} 条`} />
            <InfoItem
              label="预计阅读"
              value={`${detectiveCase.estimated_minutes} 分钟`}
            />
            <InfoItem
              label="推荐指数"
              value={`${detectiveCase.recommended}/10`}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="border border-[#cfd7cc] bg-white/75 p-5">
              <TagList
                label="涉及图表"
                items={involvedFigures}
              />
            </div>
            <div className="border border-[#cfd7cc] bg-white/75 p-5">
              <TagList
                label="实验类型"
                items={experimentTypes}
              />
            </div>
          </div>
        </section>

        <section className="py-6">
          <AiEvidenceProgress
            evidenceList={safeEvidenceList}
            foundEvidenceIds={foundEvidenceIds}
            selectedEvidenceId={selectedEvidenceId}
            onSelectEvidence={setSelectedEvidenceId}
          />
        </section>

        {isCaseComplete ? (
          <section className="border border-[#8aa79a] bg-[#edf2ef] p-5">
            <h2 className="text-2xl font-semibold text-[#14211d]">
              AI case 证据已收集完成
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#364641]">
              当前案件的证据已经找齐，可以进入基础 AI 结案报告查看完整证据链。
            </p>
            <Link
              href={`/case/${detectiveCase.case_id}/verdict?paperId=${encodeURIComponent(paperId)}`}
              className="mt-4 inline-flex items-center justify-center border border-[#1d352f] bg-[#1d352f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f]"
            >
              生成 AI 结案报告
            </Link>
          </section>
        ) : null}

        <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {readableContent ? (
            <RealPaperViewer
              paperId={paperId}
              readableContent={readableContent}
              evidenceList={safeEvidenceList}
              foundEvidenceIds={foundEvidenceIds}
              selectedEvidenceId={selectedEvidenceId}
              onSentenceClick={handleSentenceClick}
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

          <AiEvidenceInspector
            evidence={selectedEvidence}
            lastClickResult={lastClickResult}
          />
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
