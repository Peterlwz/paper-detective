import type {
  AiProvider,
  AnalysisResultMode,
  PaperAnalysisOutput,
} from "@/lib/ai/types";
import type { DetectiveCase } from "@/types/case";
import type {
  EvidenceBBox,
  EvidenceItem,
  EvidenceType,
} from "@/types/evidence";
import type { Paper, PaperFigure, PaperSection } from "@/types/paper";

const validAnalysisModes = new Set<AnalysisResultMode>([
  "mock",
  "real",
  "fallback",
]);
const validProviders = new Set<AiProvider>([
  "mock",
  "openai",
  "qwen",
  "deepseek",
  "custom",
]);
const validDifficulties = new Set<DetectiveCase["difficulty"]>([
  "easy",
  "medium",
  "hard",
]);
const validEvidenceTypes = new Set<EvidenceType>([
  "expression",
  "mechanism",
  "functional",
  "animal",
  "clinical",
  "omics",
  "drug_intervention",
  "limitation",
]);
const validStrengths = new Set<EvidenceItem["strength"]>([
  "weak",
  "medium",
  "strong",
]);
const demoCaseIdPattern = /^case_\d+$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`AI 分析结果格式错误：${label} 必须是对象。`);
  }

  return value;
}

function normalizeString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim() || fallback;
  }

  return fallback;
}

function normalizeStringArray(value: unknown): string[] {
  const splitText = (text: string) =>
    text
      .split(/[,;；、\n\r]+/)
      .map((item) => item.trim())
      .filter(Boolean);

  if (Array.isArray(value)) {
    return value
      .flatMap((item) =>
        typeof item === "string" ? splitText(item) : [normalizeString(item)],
      )
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return splitText(value);
  }

  if (value == null) {
    return [];
  }

  if (isRecord(value)) {
    return Object.values(value)
      .flatMap((item) =>
        typeof item === "string" ? splitText(item) : [normalizeString(item)],
      )
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  return fallback;
}

function normalizeInteger(value: unknown, fallback: number): number {
  return Math.max(0, Math.round(normalizeNumber(value, fallback)));
}

function normalizeYear(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);

    return Number.isFinite(parsed) ? String(parsed) : value.trim();
  }

  return "";
}

function normalizeAnalysisMode(value: unknown): AnalysisResultMode {
  const mode = normalizeString(value);

  return validAnalysisModes.has(mode as AnalysisResultMode)
    ? (mode as AnalysisResultMode)
    : "fallback";
}

function normalizeProvider(value: unknown): AiProvider {
  const provider = normalizeString(value);

  return validProviders.has(provider as AiProvider)
    ? (provider as AiProvider)
    : "mock";
}

function normalizeDifficulty(value: unknown): DetectiveCase["difficulty"] {
  const difficulty = normalizeString(value).toLowerCase();

  return validDifficulties.has(difficulty as DetectiveCase["difficulty"])
    ? (difficulty as DetectiveCase["difficulty"])
    : "medium";
}

function normalizeRecommended(value: unknown): number {
  if (typeof value === "boolean") {
    return value ? 8 : 5;
  }

  const normalized = normalizeNumber(value, 6);

  return Math.min(10, Math.max(0, Math.round(normalized)));
}

function normalizeEvidenceType(value: unknown): EvidenceType {
  const type = normalizeString(value).toLowerCase();

  return validEvidenceTypes.has(type as EvidenceType)
    ? (type as EvidenceType)
    : "functional";
}

function normalizeStrength(value: unknown): EvidenceItem["strength"] {
  const strength = normalizeString(value).toLowerCase();

  return validStrengths.has(strength as EvidenceItem["strength"])
    ? (strength as EvidenceItem["strength"])
    : "medium";
}

function normalizeSourceType(value: unknown): EvidenceItem["source_type"] {
  return normalizeString(value).toLowerCase() === "figure" ? "figure" : "text";
}

function normalizeConfidence(value: unknown): number {
  const confidence = normalizeNumber(value, 0.5);

  return Math.min(1, Math.max(0, confidence));
}

function normalizeBBox(value: unknown): EvidenceBBox | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const x = normalizeNumber(value.x, Number.NaN);
  const y = normalizeNumber(value.y, Number.NaN);
  const width = normalizeNumber(value.width, Number.NaN);
  const height = normalizeNumber(value.height, Number.NaN);

  if (![x, y, width, height].every(Number.isFinite)) {
    return undefined;
  }

  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
    width: Math.min(1, Math.max(0, width)),
    height: Math.min(1, Math.max(0, height)),
  };
}

function normalizeSections(value: unknown): PaperSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((section, index) => {
    const pageStart = normalizeInteger(
      section.page_start ?? section.page ?? section.start_page,
      1,
    );
    const pageEnd = normalizeInteger(
      section.page_end ?? section.page ?? section.end_page,
      pageStart,
    );

    return {
      section_id:
        normalizeString(section.section_id ?? section.id) ||
        `section_${index + 1}`,
      title:
        normalizeString(section.title ?? section.name) ||
        `Section ${index + 1}`,
      page_start: pageStart,
      page_end: pageEnd,
    };
  });
}

function normalizeFigures(value: unknown): PaperFigure[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((figure, index) => {
    const label =
      normalizeString(figure.label ?? figure.figure_label ?? figure.name) ||
      `Figure ${index + 1}`;

    return {
      figure_id:
        normalizeString(figure.figure_id ?? figure.id) || `figure_${index + 1}`,
      label,
      page: normalizeInteger(figure.page, 1),
      caption: normalizeString(figure.caption ?? figure.description),
    };
  });
}

function normalizePaper(
  rawPaper: Record<string, unknown>,
  warnings: string[],
): Paper {
  const authors = normalizeStringArray(rawPaper.authors);
  const keywords = normalizeStringArray(rawPaper.keywords);

  if (!Array.isArray(rawPaper.authors)) {
    warnings.push("Normalized paper.authors to string[].");
  }

  if (
    typeof rawPaper.keywords !== "undefined" &&
    !Array.isArray(rawPaper.keywords)
  ) {
    warnings.push("Normalized paper.keywords to string[].");
  }

  const paper: Paper & { keywords?: string[] } = {
    paper_id: normalizeString(rawPaper.paper_id) || "paper_001",
    title: normalizeString(rawPaper.title) || "Untitled paper",
    authors,
    journal: normalizeString(rawPaper.journal) || "Unknown journal",
    year: normalizeYear(rawPaper.year),
    sections: normalizeSections(rawPaper.sections),
    figures: normalizeFigures(rawPaper.figures),
  };

  if (keywords.length > 0) {
    paper.keywords = keywords;
  }

  return paper;
}

function getCaseId({
  rawCaseId,
  index,
  shouldRewriteDemoIds,
}: {
  rawCaseId: string;
  index: number;
  shouldRewriteDemoIds: boolean;
}) {
  if (!rawCaseId || (shouldRewriteDemoIds && demoCaseIdPattern.test(rawCaseId))) {
    return `ai_case_${String(index + 1).padStart(3, "0")}`;
  }

  return rawCaseId;
}

function normalizeCases({
  value,
  paperId,
  shouldRewriteDemoIds,
  warnings,
}: {
  value: unknown;
  paperId: string;
  shouldRewriteDemoIds: boolean;
  warnings: string[];
}) {
  const caseIdMap = new Map<string, string>();

  if (!Array.isArray(value)) {
    warnings.push("Normalized cases to empty array because it was not an array.");
    return {
      cases: [] as DetectiveCase[],
      caseIdMap,
    };
  }

  const cases = value.flatMap((item, index): DetectiveCase[] => {
    if (!isRecord(item)) {
      warnings.push("Filtered invalid case item.");
      return [];
    }

    const rawCaseId = normalizeString(item.case_id ?? item.id);
    const caseId = getCaseId({
      rawCaseId,
      index,
      shouldRewriteDemoIds,
    });

    if (rawCaseId && rawCaseId !== caseId) {
      caseIdMap.set(rawCaseId, caseId);
      warnings.push(`Normalized case_id ${rawCaseId} to ${caseId}.`);
    }

    const caseTitle =
      normalizeString(item.case_title ?? item.title ?? item.name) ||
      `AI Case ${index + 1}`;
    const mainClaim =
      normalizeString(item.main_claim ?? item.claim ?? item.summary) ||
      caseTitle;

    return [
      {
        case_id: caseId,
        paper_id: normalizeString(item.paper_id) || paperId,
        case_title: caseTitle,
        main_claim: mainClaim,
        difficulty: normalizeDifficulty(item.difficulty),
        evidence_required: normalizeInteger(
          item.evidence_required ?? item.required_evidence_count,
          3,
        ),
        recommended: normalizeRecommended(item.recommended),
        estimated_minutes: normalizeInteger(item.estimated_minutes, 8),
        involved_figures: normalizeStringArray(
          item.involved_figures ?? item.figures,
        ),
        experiment_types: normalizeStringArray(
          item.experiment_types ?? item.experiments,
        ),
      },
    ];
  });

  return { cases, caseIdMap };
}

function normalizeEvidenceItems({
  value,
  caseIdMap,
  firstCaseId,
  warnings,
}: {
  value: unknown;
  caseIdMap: Map<string, string>;
  firstCaseId: string;
  warnings: string[];
}) {
  if (!Array.isArray(value)) {
    warnings.push(
      "Normalized evidence_items to empty array because it was not an array.",
    );
    return [];
  }

  return value.flatMap((item, index): EvidenceItem[] => {
    if (!isRecord(item)) {
      warnings.push("Filtered invalid evidence item.");
      return [];
    }

    const rawCaseId = normalizeString(item.case_id);
    const caseId = rawCaseId ? (caseIdMap.get(rawCaseId) ?? rawCaseId) : firstCaseId;
    const id =
      normalizeString(item.id ?? item.evidence_id) ||
      `ai_evidence_${String(index + 1).padStart(3, "0")}`;
    const sourceType = normalizeSourceType(item.source_type);
    const textAnchor = normalizeString(
      item.text_anchor ?? item.quote ?? item.sentence ?? item.anchor ?? item.text,
    );
    const bbox = normalizeBBox(item.bbox);
    const evidence: EvidenceItem = {
      id,
      case_id: caseId,
      type: normalizeEvidenceType(item.type),
      title: normalizeString(item.title ?? item.name) || id,
      source_type: sourceType,
      source_label:
        normalizeString(item.source_label ?? item.source) ||
        (sourceType === "figure" ? "Figure evidence" : "Text evidence"),
      page: normalizeInteger(item.page, 1),
      text_anchor: textAnchor || undefined,
      explanation:
        normalizeString(item.explanation ?? item.reason) ||
        "No explanation available.",
      strength: normalizeStrength(item.strength),
      limitation:
        normalizeString(item.limitation ?? item.limitations) ||
        "No limitation available.",
      found: false,
      confidence: normalizeConfidence(item.confidence),
    };

    if (bbox) {
      evidence.bbox = bbox;
    } else if (item.bbox != null) {
      warnings.push(`Normalized invalid bbox for evidence ${id}.`);
    }

    return [evidence];
  });
}

function mergeWarnings(...warningLists: Array<string[] | undefined>) {
  return Array.from(
    new Set(
      warningLists
        .flatMap((warnings) => warnings ?? [])
        .map((warning) => warning.trim())
        .filter(Boolean),
    ),
  );
}

export function parsePaperAnalysisResult(raw: unknown): PaperAnalysisOutput {
  const payload = assertRecord(raw, "root");
  const rawPaper = assertRecord(payload.paper, "paper");
  const rawMetadata = assertRecord(payload.metadata, "metadata");
  const normalizationWarnings: string[] = [];
  const mode = normalizeAnalysisMode(rawMetadata.mode);
  const provider = normalizeProvider(rawMetadata.provider);
  const metadataWarnings = normalizeStringArray(rawMetadata.warnings);
  const paper = normalizePaper(rawPaper, normalizationWarnings);
  const shouldRewriteDemoIds = mode === "real";
  const { cases, caseIdMap } = normalizeCases({
    value: payload.cases,
    paperId: paper.paper_id,
    shouldRewriteDemoIds,
    warnings: normalizationWarnings,
  });
  const evidenceItems = normalizeEvidenceItems({
    value: payload.evidence_items,
    caseIdMap,
    firstCaseId: cases[0]?.case_id ?? "ai_case_001",
    warnings: normalizationWarnings,
  });
  const warnings = mergeWarnings(metadataWarnings, normalizationWarnings);

  return {
    ...(payload as Record<string, unknown>),
    paper,
    cases,
    evidence_items: evidenceItems,
    metadata: {
      mode,
      provider,
      model_label:
        normalizeString(rawMetadata.model_label ?? rawMetadata.model) ||
        "unknown",
      generated_at:
        normalizeString(rawMetadata.generated_at) || new Date().toISOString(),
      warnings: warnings.length > 0 ? warnings : undefined,
      fallback_reason: normalizeString(rawMetadata.fallback_reason) || undefined,
      input_char_count:
        typeof rawMetadata.input_char_count === "undefined"
          ? undefined
          : normalizeInteger(rawMetadata.input_char_count, 0),
      input_char_limit:
        typeof rawMetadata.input_char_limit === "undefined"
          ? undefined
          : normalizeInteger(rawMetadata.input_char_limit, 0),
    },
  } as PaperAnalysisOutput;
}
