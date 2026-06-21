import type { EvidenceBBox } from "@/types/evidence";

export interface PdfPageClick {
  page: number;
  x: number;
  y: number;
}

export interface PdfTextClick {
  page: number;
  source_type: "pdf_text";
  clicked_text: string;
  bbox: EvidenceBBox;
}
