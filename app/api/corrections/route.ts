import { NextResponse } from "next/server";
import type {
  CorrectionPayload,
  CorrectionTargetType,
  CorrectionType,
} from "@/types/correction";
import type { ApiErrorResponse } from "@/types/api";

export const runtime = "nodejs";

const correctionTypes: CorrectionType[] = [
  "irrelevant_evidence",
  "wrong_explanation",
  "wrong_strength",
  "missing_limitation",
  "add_evidence",
  "other",
];

const correctionTargetTypes: CorrectionTargetType[] = [
  "evidence",
  "case",
  "verdict",
  "pdf_text",
  "pdf_region",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCorrectionType(value: unknown): value is CorrectionType {
  return (
    typeof value === "string" &&
    correctionTypes.includes(value as CorrectionType)
  );
}

function isCorrectionTargetType(value: unknown): value is CorrectionTargetType {
  return (
    typeof value === "string" &&
    correctionTargetTypes.includes(value as CorrectionTargetType)
  );
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "请提交有效的 JSON 纠错内容" },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "请提交有效的纠错内容" },
      { status: 400 },
    );
  }

  const paperId = optionalString(body.paper_id);
  const userComment = optionalString(body.user_comment);

  if (!paperId) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "paper_id 为必填字段" },
      { status: 400 },
    );
  }

  if (!isCorrectionTargetType(body.target_type)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "target_type 为必填字段" },
      { status: 400 },
    );
  }

  if (!isCorrectionType(body.correction_type)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "correction_type 为必填字段" },
      { status: 400 },
    );
  }

  if (!userComment) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "user_comment 为必填字段" },
      { status: 400 },
    );
  }

  const correction: CorrectionPayload = {
    id: `correction_mock_${Date.now()}`,
    paper_id: paperId,
    case_id: optionalString(body.case_id),
    evidence_id: optionalString(body.evidence_id),
    target_type: body.target_type,
    correction_type: body.correction_type,
    user_comment: userComment,
    selected_text: optionalString(body.selected_text),
    page: typeof body.page === "number" ? body.page : undefined,
    bbox: isRecord(body.bbox)
      ? {
          x: typeof body.bbox.x === "number" ? body.bbox.x : 0,
          y: typeof body.bbox.y === "number" ? body.bbox.y : 0,
          width: typeof body.bbox.width === "number" ? body.bbox.width : 0,
          height: typeof body.bbox.height === "number" ? body.bbox.height : 0,
        }
      : undefined,
    created_at: new Date().toISOString(),
    status: "mock_received",
  };

  return NextResponse.json({
    correction,
    message: "纠错已收到。当前为 mock 模式，暂未写入数据库。",
  });
}
