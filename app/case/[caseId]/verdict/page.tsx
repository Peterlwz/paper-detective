import Link from "next/link";
import { AiVerdictLoader } from "@/components/AiVerdictLoader";
import { VerdictReport } from "@/components/VerdictReport";
import { mockCases } from "@/mock/cases";
import { mockEvidenceItems } from "@/mock/evidence";

type VerdictPageProps = {
  params: Promise<{
    caseId: string;
  }>;
  searchParams: Promise<{
    paperId?: string;
  }>;
};

function VerdictShell({
  caseId,
  paperId = "paper_001",
  children,
}: {
  caseId: string;
  paperId?: string;
  children: React.ReactNode;
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
              挑战其他案件主线
            </Link>
          </div>
        </header>
        <div className="py-8">{children}</div>
      </section>
    </main>
  );
}

export default async function VerdictPage({
  params,
  searchParams,
}: VerdictPageProps) {
  const { caseId } = await params;
  const { paperId = "paper_001" } = await searchParams;
  const detectiveCase = mockCases.find((item) => item.case_id === caseId);
  const evidenceList = mockEvidenceItems.filter(
    (item) => item.case_id === caseId,
  );

  if (!detectiveCase) {
    return <AiVerdictLoader caseId={caseId} paperId={paperId} />;
  }

  if (evidenceList.length === 0) {
    return (
      <VerdictShell caseId={caseId} paperId={paperId}>
        <div className="border border-[#cfd7cc] bg-white/80 p-8 text-center shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
          <p className="text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
            Empty Evidence
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-[#14211d]">
            该案件暂无证据数据
          </h1>
        </div>
      </VerdictShell>
    );
  }

  return (
    <VerdictShell caseId={caseId} paperId={paperId}>
      <VerdictReport
        detectiveCase={detectiveCase}
        evidenceList={evidenceList}
      />
    </VerdictShell>
  );
}
