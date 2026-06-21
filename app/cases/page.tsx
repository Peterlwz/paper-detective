import { CasesClient } from "@/components/CasesClient";

type CasesPageProps = {
  searchParams: Promise<{
    paperId?: string;
  }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const { paperId } = await searchParams;

  return <CasesClient paperId={paperId ?? "paper_001"} />;
}
