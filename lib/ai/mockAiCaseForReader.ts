import { mockPaper } from "@/mock/paper";
import type { PaperAnalysisOutput } from "@/lib/ai/types";
import type { EvidenceItem } from "@/types/evidence";
import type { ReadablePaperContent, ReadableSentence } from "@/types/reader";

type BuildMockAiAnalysisForReaderInput = {
  paperId: string;
  readableContent?: ReadablePaperContent;
};

function getReadableSentences(
  readableContent?: ReadablePaperContent,
): Array<ReadableSentence & { sectionTitle?: string }> {
  if (!readableContent) {
    return [];
  }

  return readableContent.sections.flatMap((section) =>
    section.sentences.map((sentence) => ({
      ...sentence,
      sectionTitle: section.title,
    })),
  );
}

function getFallbackSentences(): Array<ReadableSentence & { sectionTitle: string }> {
  return [
    {
      id: "sent_dev_1",
      section_id: "section_dev",
      sectionTitle: "Reader Debug",
      page: 1,
      text: "This development sentence verifies that the RealPaperViewer can display extracted paper text and respond to sentence clicks.",
      source_label: "Reader Debug · Page 1",
    },
    {
      id: "sent_dev_2",
      section_id: "section_dev",
      sectionTitle: "Reader Debug",
      page: 1,
      text: "Candidate evidence matching is shown only as debug information and does not collect evidence or update game state.",
      source_label: "Reader Debug · Page 1",
    },
    {
      id: "sent_dev_3",
      section_id: "section_dev",
      sectionTitle: "Reader Debug",
      page: 1,
      text: "This mock AI case is intended for local verification without calling DeepSeek or any external model provider.",
      source_label: "Reader Debug · Page 1",
    },
  ];
}

function pickEvidenceSentences(
  readableContent?: ReadablePaperContent,
): Array<ReadableSentence & { sectionTitle?: string }> {
  const readableSentences = getReadableSentences(readableContent)
    .filter((sentence) => sentence.text.length >= 60)
    .slice(0, 3);

  if (readableSentences.length >= 3) {
    return readableSentences;
  }

  return [...readableSentences, ...getFallbackSentences()].slice(0, 3);
}

export function buildMockAiAnalysisForReader({
  paperId,
  readableContent,
}: BuildMockAiAnalysisForReaderInput): PaperAnalysisOutput {
  const evidenceSentences = pickEvidenceSentences(readableContent);
  const evidenceItems: EvidenceItem[] = evidenceSentences.map(
    (sentence, index) => ({
      id: `ai_evidence_${String(index + 1).padStart(3, "0")}`,
      case_id: "ai_case_001",
      type: "functional",
      title: `网页化阅读器点击候选证据 ${index + 1}`,
      source_type: "text",
      source_label:
        sentence.source_label ??
        sentence.sectionTitle ??
        `Page ${sentence.page ?? 1}`,
      page: sentence.page ?? 1,
      text_anchor: sentence.text,
      explanation: "用于验证网页化阅读器句子点击与候选证据匹配。",
      strength: "medium",
      limitation: "这是开发测试用 mock AI evidence，不代表真实模型分析。",
      found: false,
      confidence: 0.5,
    }),
  );

  return {
    paper: {
      ...mockPaper,
      paper_id: paperId,
      title: readableContent?.title ?? mockPaper.title,
    },
    cases: [
      {
        case_id: "ai_case_001",
        paper_id: paperId,
        case_title: "AI 测试案件：从网页化论文中定位关键证据",
        main_claim:
          "该测试案件用于验证 RealPaperViewer 能否在 AI case 页面展示并响应句子点击。",
        difficulty: "easy",
        evidence_required: 3,
        recommended: 8,
        estimated_minutes: 8,
        involved_figures: [],
        experiment_types: ["reader_debug"],
      },
    ],
    evidence_items: evidenceItems,
    metadata: {
      mode: "mock",
      provider: "mock",
      model_label: "Paper Detective Mock AI Case For Reader",
      generated_at: new Date().toISOString(),
      warnings: [
        "这是用于验证 RealPaperViewer 的开发测试 AI case，不是真实模型输出。",
      ],
    },
  };
}
