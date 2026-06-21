import Link from "next/link";
import { PaperUploadCard } from "@/components/PaperUploadCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#15201d]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#d8ded4] pb-5">
          <div className="text-sm font-semibold tracking-[0.22em] text-[#52635d] uppercase">
            Paper Detective
          </div>
          <div className="hidden rounded-full border border-[#c7cec4] px-3 py-1 text-xs text-[#52635d] sm:block">
            Research Case Lab
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
              Scientific Evidence Game
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-[#14211d] sm:text-5xl lg:text-6xl">
              论文侦探 Paper Detective
            </h1>
            <p className="mt-6 text-xl leading-8 text-[#364641] sm:text-2xl">
              把复杂论文变成一场证据推理游戏。
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#52635d] sm:text-lg">
              上传一篇论文，体验把科学主张拆成多条案件主线的阅读流程。当前线上
              MVP 使用 Demo 解析结果演示证据推理闭环。
            </p>

            <div className="mt-9">
              <Link
                href="/cases?paperId=paper_001"
                className="inline-flex border border-[#9aa69f] px-6 py-3 text-center text-sm font-semibold text-[#1d352f] transition hover:border-[#1d352f] hover:bg-white"
              >
                直接体验 Demo 案件
              </Link>
            </div>
          </div>

          <PaperUploadCard />
        </div>
      </section>
    </main>
  );
}
