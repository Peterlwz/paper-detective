export type PipelineStageStatus = "pending" | "running" | "done" | "failed";

export type PipelineStatus = "queued" | "processing" | "ready" | "failed";

export interface PipelineStage {
  id: string;
  label: string;
  description: string;
  status: PipelineStageStatus;
  progress: number;
}

export interface PipelineResponse {
  paper_id: string;
  job_id: string;
  status: PipelineStatus;
  progress: number;
  current_stage_id: string | null;
  current_message: string;
  stages: PipelineStage[];
  result_available: boolean;
}
