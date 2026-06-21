"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CaseHeader } from "@/components/CaseHeader";
import { EvidenceDetailPanel } from "@/components/EvidenceDetailPanel";
import { EvidenceProgressBar } from "@/components/EvidenceProgressBar";
import { FakePaperViewer } from "@/components/FakePaperViewer";
import { HintSystem } from "@/components/HintSystem";
import { mockCases } from "@/mock/cases";
import { mockEvidenceItems } from "@/mock/evidence";
import { mockPaper } from "@/mock/paper";
import type { ClickEvent, ClickResult } from "@/types/click";
import type { HintLevel } from "@/types/hint";
import { matchEvidence } from "@/utils/matchEvidence";

const resultTypeLabels: Record<ClickResult["result_type"], string> = {
  valid_evidence: "有效证据",
  related_info: "相关信息",
  invalid_click: "无效点击",
};

const resultToneClasses: Record<ClickResult["result_type"], string> = {
  valid_evidence: "border-[#8aa79a] bg-[#edf2ef] text-[#24342f]",
  related_info: "border-[#c6b16b] bg-[#fbf6df] text-[#4c4224]",
  invalid_click: "border-[#c69a82] bg-[#f4ede8] text-[#4d3329]",
};

function formatScoreDelta(scoreDelta: number): string {
  if (scoreDelta > 0) {
    return `+${scoreDelta}`;
  }

  return String(scoreDelta);
}

export default function CasePage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
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
              href="/cases"
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
                请返回案件列表，选择一个可用的 Demo 案件继续侦破。
              </p>
              <Link
                href="/cases"
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

  const foundCount = foundEvidenceIds.length;
  const visibleAttentionScore = Math.max(0, attentionScore);
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
            <EvidenceDetailPanel selectedEvidence={selectedEvidence} />

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
                  注意力变化：{formatScoreDelta(lastClickResult.score_delta)}
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
