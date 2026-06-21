import type { AiMode } from "@/lib/ai/types";

export function getAiMode(): AiMode {
  const mode = process.env.PAPER_DETECTIVE_AI_MODE;

  if (mode === "disabled" || mode === "real") {
    return mode;
  }

  return "mock";
}

export async function callRealModelDisabled(): Promise<never> {
  throw new Error("真实模型调用尚未启用。本版本默认使用 mock AI pipeline。");
}
