import type {
  PipelineResponse,
  PipelineStage,
  PipelineStageStatus,
  PipelineStatus,
} from "@/types/pipeline";

type MockPipelineStageConfig = {
  id: string;
  label: string;
  description: string;
  durationMs: number;
};

type MockPipelineStatusParams = {
  paperId: string;
  jobId?: string;
  startedAt?: string;
};

const mockPipelineStages: MockPipelineStageConfig[] = [
  {
    id: "receive_paper",
    label: "接收论文",
    description: "检查文件格式并创建分析任务",
    durationMs: 800,
  },
  {
    id: "extract_text",
    label: "抽取文本",
    description: "模拟提取标题、摘要、正文与参考结构",
    durationMs: 1500,
  },
  {
    id: "detect_figures",
    label: "识别图表与图注",
    description: "模拟定位 Figure、Table 和图注区域",
    durationMs: 1500,
  },
  {
    id: "generate_cases",
    label: "生成案件主线",
    description: "模拟从论文中生成多个科学 claim",
    durationMs: 1800,
  },
  {
    id: "link_evidence",
    label: "链接证据",
    description: "模拟把正文、图表和结论连接成证据链",
    durationMs: 1800,
  },
  {
    id: "prepare_view",
    label: "准备阅读体验",
    description: "生成可点击证据、提示和结案报告结构",
    durationMs: 1000,
  },
];

function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getStartedAtMs(startedAt?: string): number {
  if (!startedAt) {
    return Date.now();
  }

  const parsedTime = Date.parse(startedAt);

  if (Number.isNaN(parsedTime)) {
    return Date.now();
  }

  return parsedTime;
}

export function getMockPipelineStatus({
  paperId,
  jobId,
  startedAt,
}: MockPipelineStatusParams): PipelineResponse {
  const totalDurationMs = mockPipelineStages.reduce(
    (total, stage) => total + stage.durationMs,
    0,
  );
  const elapsedMs = Math.max(0, Date.now() - getStartedAtMs(startedAt));

  if (elapsedMs >= totalDurationMs) {
    return {
      paper_id: paperId,
      job_id: jobId ?? `job_${paperId}`,
      status: "ready",
      progress: 100,
      current_stage_id: null,
      current_message: "分析完成，已生成案件主线和证据链",
      stages: mockPipelineStages.map((stage) => ({
        id: stage.id,
        label: stage.label,
        description: stage.description,
        status: "done",
        progress: 100,
      })),
      result_available: true,
    };
  }

  let consumedMs = 0;
  let currentStageId: string | null = null;
  let currentMessage = "任务已排队，等待开始分析";

  const stages: PipelineStage[] = mockPipelineStages.map((stage) => {
    const stageStartMs = consumedMs;
    const stageEndMs = consumedMs + stage.durationMs;
    consumedMs = stageEndMs;

    let status: PipelineStageStatus = "pending";
    let progress = 0;

    if (elapsedMs >= stageEndMs) {
      status = "done";
      progress = 100;
    } else if (elapsedMs >= stageStartMs) {
      status = "running";
      progress = clampProgress(
        ((elapsedMs - stageStartMs) / stage.durationMs) * 100,
      );
      currentStageId = stage.id;
      currentMessage = `${stage.label}中：${stage.description}`;
    }

    return {
      id: stage.id,
      label: stage.label,
      description: stage.description,
      status,
      progress,
    };
  });

  const status: PipelineStatus =
    currentStageId === "receive_paper" && elapsedMs < 200
      ? "queued"
      : "processing";

  return {
    paper_id: paperId,
    job_id: jobId ?? `job_${paperId}`,
    status,
    progress: clampProgress((elapsedMs / totalDurationMs) * 100),
    current_stage_id: currentStageId,
    current_message: currentMessage,
    stages,
    result_available: false,
  };
}
