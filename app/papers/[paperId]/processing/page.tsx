import { PipelineProcessingClient } from "@/components/PipelineProcessingClient";

type ProcessingPageProps = {
  params: Promise<{
    paperId: string;
  }>;
  searchParams: Promise<{
    jobId?: string;
    startedAt?: string;
  }>;
};

export default async function ProcessingPage({
  params,
  searchParams,
}: ProcessingPageProps) {
  const { paperId } = await params;
  const { jobId, startedAt } = await searchParams;

  return (
    <PipelineProcessingClient
      paperId={paperId}
      jobId={jobId}
      startedAt={startedAt}
    />
  );
}
