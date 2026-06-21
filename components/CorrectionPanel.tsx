"use client";

import { useState } from "react";
import type {
  CorrectionPayload,
  CorrectionTargetType,
  CorrectionType,
} from "@/types/correction";

interface CorrectionPanelProps {
  paperId: string;
  caseId?: string;
  evidenceId?: string;
  targetType: CorrectionTargetType;
  selectedText?: string;
  page?: number;
  bbox?: CorrectionPayload["bbox"];
  compact?: boolean;
  triggerLabel?: string;
}

const correctionTypeLabels: Record<CorrectionType, string> = {
  irrelevant_evidence: "这条证据不相关",
  wrong_explanation: "解释不准确",
  wrong_strength: "证据强度判断不对",
  missing_limitation: "遗漏了局限性",
  add_evidence: "我要补充证据",
  other: "其他问题",
};

const correctionTypeOptions = Object.entries(correctionTypeLabels) as Array<
  [CorrectionType, string]
>;

export function CorrectionPanel({
  paperId,
  caseId,
  evidenceId,
  targetType,
  selectedText,
  page,
  bbox,
  compact = false,
  triggerLabel = "纠错 / 补充",
}: CorrectionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [correctionType, setCorrectionType] =
    useState<CorrectionType>("wrong_explanation");
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submitCorrection() {
    if (!userComment.trim()) {
      setError("请填写你的纠错说明。");
      setMessage("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/corrections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paper_id: paperId,
          case_id: caseId,
          evidence_id: evidenceId,
          target_type: targetType,
          correction_type: correctionType,
          user_comment: userComment,
          selected_text: selectedText,
          page,
          bbox,
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "纠错提交失败，请稍后重试。");
        return;
      }

      setMessage(
        payload.message ??
          "已收到你的纠错。当前为 mock 模式，暂未写入数据库。",
      );
      setUserComment("");
    } catch {
      setError("纠错提交失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={
        compact
          ? "mt-3 border border-[#d9dfd5] bg-white/70 px-3 py-3"
          : "mt-5 border border-[#d9dfd5] bg-[#fbfcfa] px-4 py-4"
      }
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={
          compact
            ? "text-xs font-semibold text-[#1d352f] underline-offset-4 transition hover:underline"
            : "inline-flex items-center justify-center border border-[#1d352f] px-3 py-2 text-sm font-semibold text-[#1d352f] transition hover:bg-[#1d352f] hover:text-white"
        }
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-6 text-[#52635d]">
            AI 可能会误判证据、解释或局限性。你可以在这里纠正它，后续版本会用这些反馈改进案件主线。
          </p>

          {selectedText ? (
            <div className="border-l-4 border-[#c6b16b] bg-[#fbf6df] px-3 py-2 text-xs leading-5 text-[#4c4224]">
              选中文本：{selectedText}
            </div>
          ) : null}

          <label className="block">
            <span className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
              纠错类型
            </span>
            <select
              value={correctionType}
              onChange={(event) =>
                setCorrectionType(event.target.value as CorrectionType)
              }
              className="mt-2 w-full border border-[#cfd7cc] bg-white px-3 py-2 text-sm text-[#24342f] outline-none transition focus:border-[#1d352f]"
            >
              {correctionTypeOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
              你的说明
            </span>
            <textarea
              value={userComment}
              onChange={(event) => setUserComment(event.target.value)}
              rows={compact ? 3 : 4}
              placeholder="例如：这条证据只能说明相关性，不能证明因果关系。"
              className="mt-2 w-full resize-y border border-[#cfd7cc] bg-white px-3 py-2 text-sm leading-6 text-[#24342f] outline-none transition focus:border-[#1d352f]"
            />
          </label>

          {error ? (
            <div className="border-l-4 border-[#9a4b2e] bg-[#f4ede8] px-3 py-2 text-sm font-semibold text-[#4d3329]">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="border-l-4 border-[#1d352f] bg-[#edf2ef] px-3 py-2 text-sm font-semibold text-[#24342f]">
              {message}
            </div>
          ) : null}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={submitCorrection}
            className="inline-flex w-full items-center justify-center border border-[#1d352f] bg-[#1d352f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#27483f] disabled:cursor-wait disabled:border-[#8aa79a] disabled:bg-[#8aa79a] sm:w-auto"
          >
            {isSubmitting ? "正在提交..." : "提交纠错"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
