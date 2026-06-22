type DeepSeekPaperAnalysisInput = {
  prompt: string;
  model?: string;
  timeoutMs?: number;
};

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function getBaseUrl(): string {
  return (process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com").replace(
    /\/+$/,
    "",
  );
}

export async function callDeepSeekForPaperAnalysis({
  prompt,
  model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
  timeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 45000),
}: DeepSeekPaperAnalysisInput): Promise<unknown> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DeepSeek API key 未配置。");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "你是严谨的生物医学论文分析助手，只输出合法 JSON。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 6000,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API 请求失败，status=${response.status}`);
    }

    const payload = (await response.json()) as DeepSeekChatResponse;
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("DeepSeek API 响应缺少 message.content。");
    }

    return JSON.parse(content);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("DeepSeek API 请求超时。");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
