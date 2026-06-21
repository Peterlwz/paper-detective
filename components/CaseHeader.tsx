import Link from "next/link";
import type { DetectiveCase } from "@/types/case";

const difficultyLabels: Record<DetectiveCase["difficulty"], string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

interface CaseHeaderProps {
  detectiveCase: DetectiveCase;
  foundCount: number;
  totalCount: number;
}

export function CaseHeader({
  detectiveCase,
  foundCount,
  totalCount,
}: CaseHeaderProps) {
  return (
    <section className="border-b border-[#d8ded4] py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="border border-[#c7cec4] bg-[#fbfcfa] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[#52635d] uppercase">
              Reading Case
            </span>
            <span className="border border-[#c7cec4] bg-[#edf2ef] px-3 py-1 text-xs font-medium text-[#1d352f]">
              难度 {difficultyLabels[detectiveCase.difficulty]}
            </span>
          </div>

          <h1 className="text-3xl font-semibold leading-tight text-[#14211d] sm:text-4xl">
            {detectiveCase.case_title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#52635d] sm:text-lg">
            {detectiveCase.main_claim}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border border-[#cfd7cc] bg-white/75 p-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
              证据进度
            </div>
            <div className="mt-1 text-2xl font-semibold text-[#24342f]">
              {foundCount} / {totalCount}
            </div>
          </div>
          <Link
            href="/cases"
            className="inline-flex items-center justify-center border border-[#1d352f] px-4 py-2 text-sm font-semibold text-[#1d352f] transition hover:bg-[#1d352f] hover:text-white"
          >
            返回案件列表
          </Link>
        </div>
      </div>
    </section>
  );
}
