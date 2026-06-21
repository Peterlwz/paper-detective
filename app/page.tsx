import Link from "next/link";

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
              上传论文后，AI 会生成科学案件。你需要在正文和图表中点击、捕获、收集证据，最终拼出完整证据链。
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-md bg-[#1d352f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#27483f]">
                上传论文
              </button>
              <Link
                href="/cases"
                className="rounded-md border border-[#9aa69f] px-6 py-3 text-center text-sm font-semibold text-[#1d352f] transition hover:border-[#1d352f] hover:bg-white"
              >
                进入 Demo 案件
              </Link>
            </div>
          </div>

          <div className="border border-[#cfd7cc] bg-white/70 p-5 shadow-[0_18px_55px_rgba(25,35,31,0.08)]">
            <div className="border border-[#d9dfd5] bg-[#fbfcfa] p-5">
              <div className="flex items-center justify-between border-b border-[#d9dfd5] pb-4">
                <span className="text-sm font-semibold text-[#1d352f]">
                  Case File 001
                </span>
                <span className="text-xs tracking-[0.16em] text-[#66746f] uppercase">
                  Draft
                </span>
              </div>
              <div className="space-y-4 py-6">
                <div className="h-3 w-4/5 rounded-full bg-[#c7d2cd]" />
                <div className="h-3 w-full rounded-full bg-[#dfe5dc]" />
                <div className="h-3 w-3/5 rounded-full bg-[#dfe5dc]" />
              </div>
              <div className="grid grid-cols-3 gap-3 border-t border-[#d9dfd5] pt-5">
                <div className="aspect-square border border-[#cfd7cc] bg-[#eef2ec]" />
                <div className="aspect-square border border-[#cfd7cc] bg-[#e4ebe6]" />
                <div className="aspect-square border border-[#cfd7cc] bg-[#eef2ec]" />
              </div>
              <div className="mt-5 border-l-4 border-[#1d352f] bg-[#edf2ef] px-4 py-3 text-sm leading-6 text-[#364641]">
                Evidence chain waits for discovery.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
