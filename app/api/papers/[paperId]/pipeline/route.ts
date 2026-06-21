import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "@/types/api";
import type { PipelineResponse } from "@/types/pipeline";
import { getMockPipelineStatus } from "@/utils/mockAiPipeline";

type PipelineRouteContext = {
  params: Promise<{
    paperId: string;
  }>;
};

export async function GET(request: Request, { params }: PipelineRouteContext) {
  const { paperId } = await params;

  if (paperId !== "paper_001") {
    return NextResponse.json<ApiErrorResponse>(
      { error: "未找到论文分析任务" },
      { status: 404 },
    );
  }

  const searchParams = new URL(request.url).searchParams;
  const pipelineStatus = getMockPipelineStatus({
    paperId,
    jobId: searchParams.get("jobId") ?? undefined,
    startedAt: searchParams.get("startedAt") ?? undefined,
  });

  return NextResponse.json<PipelineResponse>(pipelineStatus);
}
