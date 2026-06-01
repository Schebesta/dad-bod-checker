// Shared API contract for Dad Bod Checker.
// Imported by BOTH the landing page UI and the /api/analyze route.
// Treat this file as FROZEN: do not change the shape of these types or the
// values of these constants without coordinating the UI and API together.

/** Request body for POST /api/analyze. Provide at least one of the two inputs. */
export interface AnalyzeRequest {
  /** A base64 data URL of an uploaded image, e.g. "data:image/jpeg;base64,/9j/...". */
  imageDataUrl?: string;
  /** An Instagram / Facebook (or any) post URL to pull a photo from. */
  url?: string;
}

/** A successful Dad Bod analysis. This is what the result card renders. */
export interface DadBodResult {
  /** The headline Dad Bod Rating as a whole-number percentage, 0–100. */
  rating: number;
  /** Short punchy verdict / title, e.g. "Certified Dad Bod". */
  verdict: string;
  /** A cheeky, good-natured multi-sentence review of the physique. */
  review: string;
  /** A single emoji that captures the vibe, e.g. "🍔". */
  emoji: string;
  /** 2–4 short, funny "improvement" tips. */
  tips: string[];
  /** True when produced by the offline mock instead of the live Vision AI. */
  mock?: boolean;
}

/** Error body returned with a non-2xx status. */
export interface AnalyzeErrorResponse {
  error: string;
}

/** Successful response body for POST /api/analyze. */
export type AnalyzeResponse = DadBodResult;

/** Client-side path of the analysis endpoint. */
export const ANALYZE_ENDPOINT = "/api/analyze";

/** Maximum accepted upload size in bytes. Enforced on both client and server. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

/** Inclusive bounds for `rating`. */
export const RATING_MIN = 0;
export const RATING_MAX = 100;
