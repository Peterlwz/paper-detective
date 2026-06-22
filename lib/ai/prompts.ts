import type { PaperAnalysisInput } from "@/lib/ai/types";

type DeepSeekPromptInput = {
  paperId: string;
  fileName?: string;
  extractedText: string;
};

type TruncateResult = {
  text: string;
  wasTruncated: boolean;
  originalChars: number;
  usedChars: number;
};

export function buildPaperAnalysisPrompt(input: PaperAnalysisInput): string {
  return [
    "You are Paper Detective's scientific paper analyst.",
    "Analyze the provided paper content and return structured JSON only.",
    "",
    `Paper ID: ${input.paperId}`,
    input.fileName ? `File name: ${input.fileName}` : "File name: unknown",
    "",
    "Future task requirements:",
    "1. Identify the paper title, abstract, main conclusions, and experimental structure.",
    "2. Generate multiple scientific case lines from major claims.",
    "3. For each case, generate evidence items grounded in text anchors or figure anchors.",
    "4. Each evidence item must include source type, source label, page, explanation, limitation, confidence, and strength.",
    "5. Figure evidence should include normalized bbox coordinates when available.",
    "6. Output valid JSON matching Paper Detective's paper, cases, and evidence_items schema.",
    "",
    "Do not invent unsupported evidence. Mark uncertainty and conclusion boundaries explicitly.",
  ].join("\n");
}

export function truncateForLowCost(
  text: string,
  maxChars = 60000,
): TruncateResult {
  const originalChars = text.length;
  const safeMaxChars = Math.max(1000, maxChars);

  if (originalChars <= safeMaxChars) {
    return {
      text,
      wasTruncated: false,
      originalChars,
      usedChars: originalChars,
    };
  }

  const lowerText = text.toLowerCase();
  const keywords = [
    "abstract",
    "results",
    "figure",
    "fig.",
    "discussion",
    "conclusion",
    "limitations",
  ];
  const ranges: Array<[number, number]> = [[0, Math.min(12000, originalChars)]];
  const windowSize = Math.max(3000, Math.floor(safeMaxChars / 8));

  for (const keyword of keywords) {
    let searchFrom = 0;
    let matchIndex = lowerText.indexOf(keyword, searchFrom);

    while (matchIndex !== -1 && ranges.length < 18) {
      const start = Math.max(0, matchIndex - Math.floor(windowSize * 0.25));
      const end = Math.min(originalChars, matchIndex + windowSize);
      ranges.push([start, end]);
      searchFrom = matchIndex + keyword.length;
      matchIndex = lowerText.indexOf(keyword, searchFrom);
    }
  }

  const mergedRanges = ranges
    .sort((first, second) => first[0] - second[0])
    .reduce<Array<[number, number]>>((merged, current) => {
      const previous = merged[merged.length - 1];

      if (!previous || current[0] > previous[1]) {
        merged.push(current);
      } else {
        previous[1] = Math.max(previous[1], current[1]);
      }

      return merged;
    }, []);

  const chunks: string[] = [];
  let usedChars = 0;

  for (const [start, end] of mergedRanges) {
    if (usedChars >= safeMaxChars) {
      break;
    }

    const remainingChars = safeMaxChars - usedChars;
    const chunk = text.slice(start, end).slice(0, remainingChars);
    chunks.push(`\n[Excerpt ${start}-${start + chunk.length}]\n${chunk}`);
    usedChars += chunk.length;
  }

  const truncatedText = chunks.join("\n").slice(0, safeMaxChars);

  return {
    text: truncatedText,
    wasTruncated: true,
    originalChars,
    usedChars: truncatedText.length,
  };
}

export function buildDeepSeekPaperAnalysisPrompt({
  paperId,
  fileName,
  extractedText,
}: DeepSeekPromptInput): string {
  return [
    "请把下面的生物医学论文文本结构化为 Paper Detective 当前项目可用的 JSON。",
    "只输出合法 JSON，不要 markdown，不要解释，不要代码块。",
    "",
    "JSON 顶层结构必须是：",
    '{ "paper": { ... }, "cases": [ ... ], "evidence_items": [ ... ] }',
    "",
    "paper 字段要求：paper_id, title, authors, journal, year, sections, figures。",
    "cases 至少 3 个。每个 case 必须包含：case_id, paper_id, case_title, main_claim, difficulty, evidence_required, recommended, estimated_minutes, involved_figures, experiment_types。",
    "case_id 必须使用 ai_case_001、ai_case_002、ai_case_003 这类稳定编号，避免与 Demo case_001/case_002/case_003 冲突。",
    "difficulty 只能是 easy、medium、hard。",
    "",
    "evidence_items 每个必须包含：id, case_id, type, title, source_type, source_label, page, text_anchor, bbox, explanation, strength, limitation, found, confidence。",
    "evidence type 只能是 expression、mechanism、functional、animal、clinical、omics、drug_intervention、limitation。",
    "source_type 只能是 text 或 figure。",
    "strength 只能是 weak、medium、strong。",
    "found 必须是 false。",
    "bbox 如果无法确定，填 null；如果能确定，使用 0-1 归一化坐标 { x, y, width, height }。",
    "confidence 使用 0-1 小数。",
    "输出尽量短，不要生成长篇报告。",
    "优先围绕 Abstract、Results、Figure captions、Discussion、Conclusion 生成 evidence。",
    "不要编造论文中没有依据的结果；不确定时在 limitation 中写清楚边界。",
    "",
    `paper_id: ${paperId}`,
    fileName ? `file_name: ${fileName}` : "file_name: unknown",
    "",
    "论文文本：",
    extractedText,
  ].join("\n");
}
