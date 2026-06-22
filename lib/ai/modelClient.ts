import type { AiMode, AiProvider } from "@/lib/ai/types";

export function getAiMode(): AiMode {
  const mode = process.env.PAPER_DETECTIVE_AI_MODE;

  return mode === "real" ? "real" : "mock";
}

export function getAiProvider(): AiProvider {
  const provider = process.env.PAPER_DETECTIVE_AI_PROVIDER;

  if (provider === "deepseek") {
    return "deepseek";
  }

  return "mock";
}

export async function callRealModelDisabled(): Promise<never> {
  throw new Error("真实模型调用尚未启用。本版本默认使用 mock AI pipeline。");
}
