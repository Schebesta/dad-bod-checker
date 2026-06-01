import { NextResponse, type NextRequest } from "next/server";
import {
  type AnalyzeRequest,
  type AnalyzeErrorResponse,
  type DadBodResult,
} from "@/lib/types";
import {
  UserInputError,
  parseImageDataUrl,
  assertSafeUrl,
  extractImageFromUrl,
  analyzeImage,
  mockResult,
  hasApiKey,
  type ImagePayload,
} from "@/lib/vision";

// Node runtime (Anthropic SDK + Buffer); never cache — every analysis is dynamic.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json<AnalyzeErrorResponse>({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  // 1. Parse the JSON body.
  let body: AnalyzeRequest;
  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return errorResponse("Send a JSON body with an `imageDataUrl` or a `url`.", 400);
  }

  const imageDataUrl = body?.imageDataUrl?.trim();
  const url = body?.url?.trim();

  if (!imageDataUrl && !url) {
    return errorResponse("Upload a photo or paste a link to get your rating.", 400);
  }

  // 2. Cheap, no-network validation so malformed input fails fast (even offline).
  //    A data URL is fully parsed here; a URL is only checked for shape — the
  //    expensive og:image fetch is deferred to the live path below.
  let image: ImagePayload | null = null;
  try {
    if (imageDataUrl) {
      image = parseImageDataUrl(imageDataUrl);
    } else {
      assertSafeUrl(url!);
    }
  } catch (err) {
    if (err instanceof UserInputError) return errorResponse(err.message, 400);
    console.error("[analyze] input validation failed:", err);
    return errorResponse("That input didn't look right. Try uploading the photo instead.", 400);
  }

  // 3. No key → deterministic offline mock. There's nothing to analyze without a
  //    key, so we don't hit the network for a URL — the mock is keyed on input.
  const seed = imageDataUrl ?? url ?? "dad";
  if (!hasApiKey()) {
    return NextResponse.json<DadBodResult>(mockResult(seed), { status: 200 });
  }

  // 4. Live path: resolve a URL's og:image now (unreadable → friendly 400)…
  try {
    if (!image) image = await extractImageFromUrl(url!);
  } catch (err) {
    if (err instanceof UserInputError) return errorResponse(err.message, 400);
    console.error("[analyze] image resolution failed:", err);
    return errorResponse(
      "Something went wrong reading that link. Try uploading the photo instead.",
      400,
    );
  }

  // 5. …then analyze. Any provider error degrades to the mock so the UI never
  //    hard-fails; raw provider errors and the API key are never leaked.
  try {
    const result = await analyzeImage(image);
    return NextResponse.json<DadBodResult>(result, { status: 200 });
  } catch (err) {
    console.error("[analyze] vision call failed; serving mock:", err);
    return NextResponse.json<DadBodResult>(mockResult(seed), { status: 200 });
  }
}
