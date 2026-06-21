import { NextResponse } from "next/server";
import type { ApiErrorResponse, UploadPaperResponse } from "@/types/api";

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "请选择 PDF 文件" },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "请选择 PDF 文件" },
      { status: 400 },
    );
  }

  if (!isPdfFile(file)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "当前仅支持 PDF 论文文件" },
      { status: 400 },
    );
  }

  return NextResponse.json<UploadPaperResponse>({
    paper_id: "paper_001",
    job_id: "job_paper_001",
    status: "queued",
    started_at: new Date().toISOString(),
    message: "论文已上传，AI 分析流程已启动",
    next_url: "/papers/paper_001/processing",
  });
}
