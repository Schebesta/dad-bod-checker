import { NextRequest, NextResponse } from "next/server";
import {
  type AnalyzeRequest,
  type AnalyzeErrorResponse,
  type DadBodResult,
  MAX_IMAGE_BYTES,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// TEMPORARY MOCK STUB — owned by the "Vision AI API" task.
// That task will REPLACE this file with a real Claude-vision implementation
// (plus lib/vision.ts). It exists now only so the landing-page UI can be built
// and end-to-end tested against a working endpoint that already speaks the
// lib/types.ts contract. The mock is deterministic (same input → same rating)
// and never throws on valid input.
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIERS: { max: number; verdict: string; emoji: string }[] = [
  { max: 20, verdict: "Greek Statue Energy", emoji: "🏛️" },
  { max: 40, verdict: "Suspiciously Gym-Fit", emoji: "💪" },
  { max: 60, verdict: "Dad Bod In Training", emoji: "🏃" },
  { max: 80, verdict: "Certified Dad Bod", emoji: "🍔" },
  { max: 101, verdict: "Grillmaster Supreme", emoji: "🌭" },
];

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function mockResult(seed: string): DadBodResult {
  const rating = 35 + (hash(seed || "dad") % 61); // 35–95
  const tier = TIERS.find((t) => rating < t.max) ?? TIERS[TIERS.length - 1];
  return {
    rating,
    verdict: tier.verdict,
    emoji: tier.emoji,
    review:
      `Our crack team of imaginary scientists ran the numbers and landed on a confident ${rating}%. ` +
      `There's a real "could win a wrestling match, could also nap through it" duality here. ` +
      `The dad-ergy is strong; the snack game is stronger.`,
    tips: [
      "Swap one (1) evening snack for a slightly smaller evening snack.",
      "Stairs count as cardio. So does carrying every grocery bag in one trip.",
      "Keep doing what you're doing — confidence is 90% of the look.",
    ],
    mock: true,
  };
}

export async function POST(request: NextRequest) {
  let body: AnalyzeRequest;
  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "Send a JSON body with an `imageDataUrl` or a `url`." },
      { status: 400 },
    );
  }

  const imageDataUrl = body.imageDataUrl?.trim();
  const url = body.url?.trim();

  if (!imageDataUrl && !url) {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "Upload a photo or paste a link to get your rating." },
      { status: 400 },
    );
  }

  if (imageDataUrl) {
    if (!imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json<AnalyzeErrorResponse>(
        { error: "That doesn't look like an image. Try a JPG or PNG." },
        { status: 400 },
      );
    }
    const base64 = imageDataUrl.split(",")[1] ?? "";
    const approxBytes = Math.floor((base64.length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json<AnalyzeErrorResponse>(
        { error: "That image is a bit chonky. Keep it under 8 MB." },
        { status: 400 },
      );
    }
  }

  return NextResponse.json<DadBodResult>(mockResult(imageDataUrl ?? url ?? ""), {
    status: 200,
  });
}
