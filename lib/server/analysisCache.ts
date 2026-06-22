import type { PaperAnalysisOutput } from "@/lib/ai/types";
import type { ExtractedPdfTextStats } from "@/lib/pdf/extractPdfText";

// MVP-only in-memory cache. It does not store PDF files and is not durable
// across Vercel serverless instances, deployments, or cold starts.
export type CachedPaperAnalysis = {
  paperId: string;
  jobId: string;
  fileName?: string;
  extractedTextStats?: ExtractedPdfTextStats;
  analysisOutput?: PaperAnalysisOutput;
  createdAt: number;
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const analysisCache = new Map<string, CachedPaperAnalysis>();

export function setCachedPaperAnalysis(entry: CachedPaperAnalysis) {
  clearExpiredCachedPaperAnalysis();
  analysisCache.set(entry.paperId, entry);
}

export function getCachedPaperAnalysis(
  paperId: string,
): CachedPaperAnalysis | null {
  clearExpiredCachedPaperAnalysis();
  return analysisCache.get(paperId) ?? null;
}

export function clearExpiredCachedPaperAnalysis() {
  const now = Date.now();

  for (const [paperId, entry] of analysisCache.entries()) {
    if (now - entry.createdAt > CACHE_TTL_MS) {
      analysisCache.delete(paperId);
    }
  }
}
