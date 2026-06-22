"use client";

import { useMemo, useState } from "react";
import type { EvidenceItem } from "@/types/evidence";
import type {
  ReadablePaperContent,
  ReadableSection,
  ReadableSentence,
} from "@/types/reader";

interface RealPaperViewerProps {
  paperId: string;
  readableContent: ReadablePaperContent;
  evidenceList?: EvidenceItem[];
  foundEvidenceIds?: string[];
  selectedEvidenceId?: string | null;
  onSentenceClick?: (input: {
    sentenceId: string;
    sectionId: string;
    sectionTitle: string;
    page?: number;
    text: string;
  }) => void;
}

type SentenceClickDebug = {
  sectionTitle: string;
  sentence: ReadableSentence;
  candidates: EvidenceItem[];
};

function normalizeMatchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPageRangeLabel(section: ReadableSection): string {
  if (!section.page_start && !section.page_end) {
    return "Page --";
  }

  if (section.page_start === section.page_end || !section.page_end) {
    return `Page ${section.page_start}`;
  }

  if (!section.page_start) {
    return `Page ${section.page_end}`;
  }

  return `Page ${section.page_start}-${section.page_end}`;
}

function findCandidateEvidence(
  clickedText: string,
  evidenceList: EvidenceItem[],
): EvidenceItem[] {
  const normalizedClickedText = normalizeMatchText(clickedText);

  if (!normalizedClickedText) {
    return [];
  }

  return evidenceList.filter((evidence) => {
    if (!evidence.text_anchor) {
      return false;
    }

    const normalizedAnchor = normalizeMatchText(evidence.text_anchor);

    return (
      normalizedClickedText.includes(normalizedAnchor) ||
      normalizedAnchor.includes(normalizedClickedText)
    );
  });
}

function getSentenceEvidence(
  sentenceText: string,
  evidenceList: EvidenceItem[],
): EvidenceItem[] {
  const normalizedSentenceText = normalizeMatchText(sentenceText);

  if (!normalizedSentenceText) {
    return [];
  }

  return evidenceList.filter((evidence) => {
    if (evidence.source_type !== "text" || !evidence.text_anchor) {
      return false;
    }

    const normalizedAnchor = normalizeMatchText(evidence.text_anchor);

    return (
      normalizedSentenceText.includes(normalizedAnchor) ||
      normalizedAnchor.includes(normalizedSentenceText)
    );
  });
}

export function RealPaperViewer({
  paperId,
  readableContent,
  evidenceList = [],
  foundEvidenceIds = [],
  selectedEvidenceId,
  onSentenceClick,
}: RealPaperViewerProps) {
  const [lastClickDebug, setLastClickDebug] =
    useState<SentenceClickDebug | null>(null);
  const stats = readableContent.stats;
  const sectionCount = readableContent.sections.length;
  const sentenceCount = useMemo(
    () =>
      readableContent.sections.reduce(
        (count, section) => count + section.sentences.length,
        0,
      ),
    [readableContent.sections],
  );
  const foundEvidenceIdSet = useMemo(
    () => new Set(foundEvidenceIds),
    [foundEvidenceIds],
  );

  function handleSentenceClick(
    section: ReadableSection,
    sentence: ReadableSentence,
  ) {
    const candidates = findCandidateEvidence(sentence.text, evidenceList);

    onSentenceClick?.({
      sentenceId: sentence.id,
      sectionId: section.id,
      sectionTitle: section.title,
      page: sentence.page,
      text: sentence.text,
    });

    setLastClickDebug({
      sectionTitle: section.title,
      sentence,
      candidates,
    });
  }

  return (
    <section className="border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
      <div className="border-b border-[#d9dfd5] pb-5">
        <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
          Real Paper Reader
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#14211d]">
          网页化论文阅读器 Beta
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#52635d]">
          这是从 PDF 文本层抽取并重排的阅读版本。当前用于真实论文 AI case 的句子点击证据收集。
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
          <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
            Sections
          </div>
          <div className="mt-1 text-lg font-semibold text-[#24342f]">
            {stats.section_count || sectionCount}
          </div>
        </div>
        <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
          <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
            Sentences
          </div>
          <div className="mt-1 text-lg font-semibold text-[#24342f]">
            {stats.sentence_count || sentenceCount}
          </div>
        </div>
        <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
          <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
            Characters
          </div>
          <div className="mt-1 text-lg font-semibold text-[#24342f]">
            {stats.char_count}
          </div>
        </div>
        <div className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-3">
          <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
            Truncated
          </div>
          <div className="mt-1 text-lg font-semibold text-[#24342f]">
            {stats.was_truncated ? "是" : "否"}
          </div>
        </div>
      </div>

      <div className="mt-4 border-l-4 border-[#c6b16b] bg-[#fbf6df] px-4 py-3 text-sm leading-7 text-[#4c4224]">
        点击句子会交给 AI case 页面管理证据收集；此处仅保留阅读器本地点击调试。Paper ID: {paperId}
      </div>

      {lastClickDebug ? (
        <div className="mt-4 border border-[#cfd7cc] bg-[#fbfcfa] px-4 py-4">
          <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
            最近一次点击
          </div>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#364641]">
            <div>
              <span className="font-semibold text-[#24342f]">Section: </span>
              {lastClickDebug.sectionTitle}
            </div>
            <div>
              <span className="font-semibold text-[#24342f]">Page: </span>
              {lastClickDebug.sentence.page ?? "--"}
            </div>
            <div className="break-words">
              <span className="font-semibold text-[#24342f]">
                clicked_text:{" "}
              </span>
              {lastClickDebug.sentence.text}
            </div>
            <div>
              <span className="font-semibold text-[#24342f]">
                matched evidence anchor 数量:{" "}
              </span>
              {lastClickDebug.candidates.length}
            </div>
          </div>

          {lastClickDebug.candidates.length > 0 ? (
            <div className="mt-4 space-y-2">
              {lastClickDebug.candidates.map((evidence) => (
                <div
                  key={evidence.id}
                  className="border border-[#d9dfd5] bg-white/70 px-3 py-3 text-sm leading-6 text-[#364641]"
                >
                  <div className="font-semibold text-[#1d352f]">
                    {evidence.id} · {evidence.title}
                  </div>
                  <div className="mt-1 text-xs text-[#52635d]">
                    {evidence.source_label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 border border-dashed border-[#cfd7cc] bg-white/60 px-3 py-3 text-sm text-[#52635d]">
              未匹配到候选 evidence anchor。
            </div>
          )}
        </div>
      ) : null}

      {readableContent.sections.length > 0 ? (
        <div className="mt-6 space-y-6">
          {readableContent.sections.map((section) => (
            <article
              key={section.id}
              className="border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-4"
            >
              <div className="flex flex-col gap-2 border-b border-[#d9dfd5] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-semibold text-[#14211d]">
                  {section.title}
                </h3>
                <span className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
                  {getPageRangeLabel(section)}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-base leading-8 text-[#364641]">
                {section.sentences.map((sentence) => {
                  const sentenceEvidence = getSentenceEvidence(
                    sentence.text,
                    evidenceList,
                  );
                  const foundEvidenceForSentence = sentenceEvidence.filter(
                    (evidence) => foundEvidenceIdSet.has(evidence.id),
                  );
                  const isFound = foundEvidenceForSentence.length > 0;
                  const isSelected = sentenceEvidence.some(
                    (evidence) => evidence.id === selectedEvidenceId,
                  );

                  return (
                    <button
                      key={sentence.id}
                      type="button"
                      data-sentence-id={sentence.id}
                      data-section-id={section.id}
                      data-page={sentence.page ?? ""}
                      onClick={() => handleSentenceClick(section, sentence)}
                      className={`block w-full cursor-pointer rounded-sm border px-2 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#8ea39a] ${
                        isSelected
                          ? "border-[#1d352f] bg-[#edf2ef] text-[#14211d]"
                          : isFound
                            ? "border-[#8aa79a] bg-[#eef6f0] text-[#24342f]"
                            : "border-transparent hover:bg-[#e7eee9] hover:text-[#14211d]"
                      }`}
                    >
                      <span>{sentence.text}</span>
                      {isFound ? (
                        <span className="ml-2 inline-flex border border-[#8aa79a] bg-white/80 px-2 py-0.5 text-xs font-semibold text-[#1d352f]">
                          已发现 {foundEvidenceForSentence.map((evidence) => evidence.id).join(", ")}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-[#cfd7cc] bg-[#fbfcfa] px-4 py-5 text-sm leading-7 text-[#52635d]">
          当前没有可展示的网页化论文文本。扫描版 PDF 或缺少文本层的
          PDF 不会在这里生成正文。
        </div>
      )}
    </section>
  );
}
