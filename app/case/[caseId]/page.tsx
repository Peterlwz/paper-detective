"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AiCaseDetail } from "@/components/AiCaseDetail";
import { CaseHeader } from "@/components/CaseHeader";
import { EvidenceDetailPanel } from "@/components/EvidenceDetailPanel";
import { EvidenceProgressBar } from "@/components/EvidenceProgressBar";
import { FakePaperViewer } from "@/components/FakePaperViewer";
import { HintSystem } from "@/components/HintSystem";
import { mockCases } from "@/mock/cases";
import { mockEvidenceItems } from "@/mock/evidence";
import { mockPaper } from "@/mock/paper";
import type { ClickEvent, ClickResult } from "@/types/click";
import type { PaperAnalysisResponse } from "@/types/api";
import type { HintLevel } from "@/types/hint";
import { matchEvidence } from "@/utils/matchEvidence";

const resultTypeLabels: Record<ClickResult["result_type"], string> = {
  valid_evidence: "找到证据",
  related_info: "相关背景",
  invalid_click: "无效点击",
};

const resultToneClasses: Record<ClickResult["result_type"], string> = {
  valid_evidence: "border-[#8aa79a] bg-[#edf2ef] text-[#24342f]",
  related_info: "border-[#c6b16b] bg-[#fbf6df] text-[#4c4224]",
  invalid_click: "border-[#c69a82] bg-[#f4ede8] text-[#4d3329]",
};

function formatScoreDelta(scoreDelta: number): string {
  if (scoreDelta === 0) {
    return "不变";
  }

  if (scoreDelta > 0) {
    return `+${scoreDelta}`;
  }

  return String(scoreDelta);
}

function AiCaseDetailLoader({
  caseId,
  paperId,
}: {
  caseId: string;
  paperId: string;
}) {
  const [analysis, setAnalysis] = useState<PaperAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCaseDetail() {
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
          setError("未能读取案件详情，请返回案件列表。");
          return;
        }

        const payload = (await response.json()) as PaperAnalysisResponse;
        setAnalysis(payload);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setAnalysis(null);
        setError("未能读取案件详情，请返回案件列表。");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCaseDetail();

    return () => {
      controller.abort();
    };
  }, [caseId, paperId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f6f7f4] text-[#15201d]">
        <section className="mx-auto grid min-h-screen w-full max-w-6xl place-items-center px-6 py-8 sm:px-10 lg:px-12">
          <div className="border border-[#cfd7cc] bg-white/80 p-8 text-center shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
            <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
              Loading Case
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-[#14211d]">
              正在读取案件详情...
            </h1>
          </div>
        </section>
      </main>
    );
  }

  const analysisCases = Array.isArray(analysis?.cases) ? analysis.cases : [];
  const analysisEvidenceItems = Array.isArray(analysis?.evidence_items)
    ? analysis.evidence_items
    : [];
  const detectiveCase =
    analysisCases.find((item) => item.case_id === caseId) ?? null;
  const evidenceList = analysisEvidenceItems.filter(
    (item) => item.case_id === caseId,
  );

  if (error || !analysis || !detectiveCase) {
    return (
      <main className="min-h-screen bg-[#f6f7f4] text-[#15201d]">
        <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
          <header className="flex items-center justify-between border-b border-[#d8ded4] pb-5">
            <Link
              href="/"
              className="text-sm font-semibold tracking-[0.22em] text-[#52635d] uppercase transition hover:text-[#1d352f]"
            >
              Paper Detective
            </Link>
            <Link
              href={`/cases?paperId=${encodeURIComponent(paperId)}`}
              className="border border-[#c7cec4] px-3 py-1 text-xs font-semibold text-[#52635d] transition hover:border-[#1d352f] hover:text-[#1d352f]"
            >
              返回案件列表
            </Link>
          </header>

          <div className="grid flex-1 place-items-center py-16">
            <div className="w-full max-w-xl border border-[#cfd7cc] bg-white/80 p-8 text-center shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
              <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
                Case Missing
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-[#14211d]">
                未找到该案件
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#52635d]">
                {error || "请返回案件列表，选择一个可用案件继续。"}
              </p>
              <Link
                href={`/cases?paperId=${encodeURIComponent(paperId)}`}
                className="mt-6 inline-flex items-center justify-center border border-[#1d352f] bg-[#1d352f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f]"
              >
                返回案件列表
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <AiCaseDetail
      paperId={paperId}
      detectiveCase={detectiveCase}
      evidenceList={evidenceList}
      readableContent={analysis.reader}
    />
  );
}

export default function CasePage() {
  const params = useParams<{ caseId: string }>();
  const searchParams = useSearchParams();
  const caseId = params.caseId;
  const paperId = searchParams.get("paperId") ?? "paper_001";
  const foundEvidenceIdsRef = useRef<string[]>([]);
  const [foundEvidenceIds, setFoundEvidenceIds] = useState<string[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    null,
  );
  const [focusTick, setFocusTick] = useState(0);
  const [lastClickResult, setLastClickResult] = useState<ClickResult | null>(
    null,
  );
  const [clickCount, setClickCount] = useState(0);
  const [wrongClickCount, setWrongClickCount] = useState(0);
  const [attentionScore, setAttentionScore] = useState(20);
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>(
    {},
  );
  const [hintUsedCount, setHintUsedCount] = useState(0);
  const [hintFocusEvidenceId, setHintFocusEvidenceId] = useState<string | null>(
    null,
  );
  const [hintFocusTick, setHintFocusTick] = useState(0);
  const detectiveCase = mockCases.find((item) => item.case_id === caseId);
  const evidenceList = mockEvidenceItems.filter(
    (item) => item.case_id === caseId,
  );
  const selectedEvidence = selectedEvidenceId
    ? evidenceList.find((item) => item.id === selectedEvidenceId) ?? null
    : null;

  useEffect(() => {
    foundEvidenceIdsRef.current = [];
    setFoundEvidenceIds([]);
    setSelectedEvidenceId(null);
    setFocusTick(0);
    setLastClickResult(null);
    setClickCount(0);
    setWrongClickCount(0);
    setAttentionScore(20);
    setRevealedHints({});
    setHintUsedCount(0);
    setHintFocusEvidenceId(null);
    setHintFocusTick(0);
  }, [caseId]);

  function handleSelectEvidence(evidenceId: string) {
    setSelectedEvidenceId(evidenceId);
    setFocusTick((currentTick) => currentTick + 1);
  }

  function handleRevealHint(evidenceId: string, nextLevel: HintLevel) {
    setRevealedHints((currentHints) => ({
      ...currentHints,
      [evidenceId]: Math.max(currentHints[evidenceId] ?? 0, nextLevel),
    }));
    setHintUsedCount((currentCount) => currentCount + 1);
    setAttentionScore((currentScore) =>
      Math.max(0, currentScore - nextLevel),
    );

    if (nextLevel === 3) {
      setHintFocusEvidenceId(evidenceId);
      setHintFocusTick((currentTick) => currentTick + 1);
    }
  }

  function handlePaperClick(event: ClickEvent) {
    const matchResult = matchEvidence(event, evidenceList);
    let nextClickResult = matchResult;

    setClickCount((currentCount) => currentCount + 1);

    if (
      matchResult.result_type === "valid_evidence" &&
      matchResult.matched_evidence_id
    ) {
      const evidenceId = matchResult.matched_evidence_id;
      const alreadyFound = foundEvidenceIdsRef.current.includes(evidenceId);

      setSelectedEvidenceId(evidenceId);

      if (alreadyFound) {
        nextClickResult = {
          ...matchResult,
          feedback: "这条证据已经收集过了，可以点击顶部证据卡回看。",
          score_delta: 0,
          highlight: true,
        };
      } else {
        const nextFoundEvidenceIds = [
          ...foundEvidenceIdsRef.current,
          evidenceId,
        ];

        foundEvidenceIdsRef.current = nextFoundEvidenceIds;
        setFoundEvidenceIds(nextFoundEvidenceIds);
        setAttentionScore((currentScore) =>
          Math.max(0, currentScore + matchResult.score_delta),
        );
      }
    } else if (matchResult.result_type === "invalid_click") {
      setWrongClickCount((currentCount) => currentCount + 1);
      setAttentionScore((currentScore) =>
        Math.max(0, currentScore + matchResult.score_delta),
      );
    }

    console.log("Paper click event:", event);
    console.log("Match result:", nextClickResult);
    setLastClickResult(nextClickResult);
  }

  if (!detectiveCase) {
    return <AiCaseDetailLoader caseId={caseId} paperId={paperId} />;
  }

  const foundCount = foundEvidenceIds.length;
  const visibleAttentionScore = Math.max(0, attentionScore);
  const caseLineIndex = Math.max(
    0,
    mockCases.findIndex((item) => item.case_id === detectiveCase.case_id),
  );
  const caseLineLabel = `Case ${String(caseLineIndex + 1).padStart(2, "0")}`;
  const isCaseComplete =
    foundEvidenceIds.length === evidenceList.length && evidenceList.length > 0;

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#15201d]">
      <section className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#d8ded4] pb-5">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.22em] text-[#52635d] uppercase transition hover:text-[#1d352f]"
          >
            Paper Detective
          </Link>
          <span className="hidden border border-[#c7cec4] px-3 py-1 text-xs text-[#52635d] sm:block">
            Reading Room
          </span>
        </header>

        <CaseHeader
          detectiveCase={detectiveCase}
          foundCount={foundCount}
          totalCount={evidenceList.length}
        />

        <section className="border-b border-[#d8ded4] py-6">
          <div className="border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_12px_30px_rgba(25,35,31,0.06)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
                  本轮任务
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[#14211d]">
                  找出支持以下主张的关键证据：
                </h2>
                <div className="mt-4 border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-4">
                  <div className="text-sm font-semibold text-[#1d352f]">
                    {detectiveCase.case_title}
                  </div>
                  <p className="mt-2 text-base leading-7 text-[#364641]">
                    {detectiveCase.main_claim}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#52635d]">
                  你需要在正文和图表中点击可疑信息。命中核心证据后，它会进入顶部证据栏；点到背景信息不会收集，点错会扣注意力。
                </p>
                <p className="mt-2 text-sm leading-7 text-[#52635d]">
                  这是当前论文的其中一条主线。完成后可以返回案件列表，挑战其他主线。
                </p>
              </div>
              <div className="grid min-w-56 grid-cols-3 gap-2 text-center lg:grid-cols-1">
                <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-3 py-3">
                  <div className="text-xs text-[#52635d]">当前主线</div>
                  <div className="mt-1 text-sm font-semibold text-[#24342f]">
                    {caseLineLabel}
                  </div>
                </div>
                <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-3 py-3">
                  <div className="text-xs text-[#52635d]">证据目标</div>
                  <div className="mt-1 text-sm font-semibold text-[#24342f]">
                    已找到 {foundCount} / {evidenceList.length}
                  </div>
                </div>
                <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-3 py-3">
                  <div className="text-xs text-[#52635d]">注意力值</div>
                  <div className="mt-1 text-sm font-semibold text-[#24342f]">
                    {visibleAttentionScore}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <EvidenceProgressBar
          evidenceList={evidenceList}
          foundEvidenceIds={foundEvidenceIds}
          selectedEvidenceId={selectedEvidenceId}
          onSelectEvidence={handleSelectEvidence}
        />

        <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <FakePaperViewer
            paper={mockPaper}
            caseId={caseId}
            evidenceList={evidenceList}
            foundEvidenceIds={foundEvidenceIds}
            selectedEvidenceId={selectedEvidenceId}
            focusTick={focusTick}
            hintFocusEvidenceId={hintFocusEvidenceId}
            hintFocusTick={hintFocusTick}
            onPaperClick={handlePaperClick}
          />
          <div>
            <EvidenceDetailPanel
              selectedEvidence={selectedEvidence}
              paperId={detectiveCase.paper_id}
              caseId={caseId}
            />

            <div className="mt-3 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
              <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                侦探状态
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                <div className="border border-[#d9dfd5] bg-white/70 px-2 py-2">
                  <div className="text-xs text-[#52635d]">点击</div>
                  <div className="mt-1 text-lg font-semibold text-[#24342f]">
                    {clickCount}
                  </div>
                </div>
                <div className="border border-[#d9dfd5] bg-white/70 px-2 py-2">
                  <div className="text-xs text-[#52635d]">错误</div>
                  <div className="mt-1 text-lg font-semibold text-[#24342f]">
                    {wrongClickCount}
                  </div>
                </div>
                <div className="border border-[#d9dfd5] bg-white/70 px-2 py-2">
                  <div className="text-xs text-[#52635d]">提示</div>
                  <div className="mt-1 text-lg font-semibold text-[#24342f]">
                    {hintUsedCount}
                  </div>
                </div>
                <div className="border border-[#d9dfd5] bg-white/70 px-2 py-2">
                  <div className="text-xs text-[#52635d]">注意力</div>
                  <div className="mt-1 text-lg font-semibold text-[#24342f]">
                    {visibleAttentionScore}
                  </div>
                </div>
              </div>
            </div>

            {lastClickResult ? (
              <div
                className={`mt-3 border px-4 py-3 text-sm ${resultToneClasses[lastClickResult.result_type]}`}
              >
                <div className="text-xs font-semibold tracking-[0.14em] uppercase">
                  最近一次点击反馈
                </div>
                <div className="mt-2 font-semibold">
                  {resultTypeLabels[lastClickResult.result_type]}
                </div>
                <p className="mt-2 leading-6">{lastClickResult.feedback}</p>
                <div className="mt-2 text-xs font-semibold">
                  注意力 {formatScoreDelta(lastClickResult.score_delta)}
                </div>
              </div>
            ) : null}

            {isCaseComplete ? (
              <div className="mt-3 border border-[#1d352f] bg-[#edf2ef] px-4 py-4 shadow-[0_12px_30px_rgba(25,35,31,0.10)]">
                <div className="text-xs font-semibold tracking-[0.14em] text-[#52635d] uppercase">
                  Case Complete
                </div>
                <h3 className="mt-2 text-xl font-semibold text-[#14211d]">
                  案件证据已收集完成
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#364641]">
                  你已经找齐本案件的全部关键证据，可以生成结案报告，查看完整证据链、证据强度和论文结论边界。
                </p>
                <Link
                  href={`/case/${caseId}/verdict`}
                  className="mt-4 inline-flex w-full items-center justify-center border border-[#1d352f] bg-[#1d352f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f]"
                >
                  生成结案报告
                </Link>
              </div>
            ) : null}

            <HintSystem
              evidenceList={evidenceList}
              foundEvidenceIds={foundEvidenceIds}
              revealedHints={revealedHints}
              onRevealHint={handleRevealHint}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
