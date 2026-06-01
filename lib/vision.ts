// lib/vision.ts
// The Vision AI core for Dad Bod Checker: og:image extraction from a pasted
// URL, the Anthropic vision call, and a deterministic offline mock.
//
// Owned by the "Vision AI API" task. The route handler (app/api/analyze/route.ts)
// imports from here; lib/types.ts is the frozen shared contract (read-only).

import Anthropic from "@anthropic-ai/sdk";
import { MAX_IMAGE_BYTES, type DadBodResult } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A user-facing input problem (bad image, unreadable link, …). The route maps
 * these to a 4xx AnalyzeErrorResponse. Anything that is NOT a UserInputError is
 * a server/provider problem and must fall back to the mock instead.
 */
export class UserInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserInputError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Image plumbing
// ─────────────────────────────────────────────────────────────────────────────

export interface ImagePayload {
  /** Raw base64 (no data: prefix). */
  base64: string;
  /** An Anthropic-supported image media type. */
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
}

const SUPPORTED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

/** Normalize a raw content-type / data-url media type to a supported one, or null. */
function normalizeMediaType(raw: string | null | undefined): ImagePayload["mediaType"] | null {
  if (!raw) return null;
  let t = raw.split(";")[0]!.trim().toLowerCase();
  if (t === "image/jpg") t = "image/jpeg";
  return (SUPPORTED_MEDIA_TYPES as readonly string[]).includes(t)
    ? (t as ImagePayload["mediaType"])
    : null;
}

/** Approximate decoded byte length of a base64 string without allocating a Buffer. */
function approxBase64Bytes(base64: string): number {
  const len = base64.length;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((len * 3) / 4) - padding;
}

/**
 * Validate and parse a `data:image/...;base64,...` URL into an ImagePayload.
 * Throws UserInputError on anything malformed or oversized.
 */
export function parseImageDataUrl(imageDataUrl: string): ImagePayload {
  const match = /^data:([^;,]+);base64,([\s\S]*)$/.exec(imageDataUrl.trim());
  if (!match || !match[1].toLowerCase().startsWith("image/")) {
    throw new UserInputError("That doesn't look like an image. Try a JPG, PNG, GIF, or WebP.");
  }
  const mediaType = normalizeMediaType(match[1]);
  if (!mediaType) {
    throw new UserInputError("That image format isn't supported. Try a JPG, PNG, GIF, or WebP.");
  }
  const base64 = match[2].replace(/\s/g, "");
  if (!base64) {
    throw new UserInputError("That image looks empty. Try uploading it again.");
  }
  if (approxBase64Bytes(base64) > MAX_IMAGE_BYTES) {
    throw new UserInputError("That image is a bit chonky. Keep it under 8 MB.");
  }
  return { base64, mediaType };
}

// ─────────────────────────────────────────────────────────────────────────────
// URL → og:image extraction
// ─────────────────────────────────────────────────────────────────────────────

// Instagram, Facebook, and most sites only emit Open Graph <meta> tags (og:image)
// to recognized link-preview crawlers. A normal browser User-Agent gets the
// logged-out app shell / login wall with NO og:image at all — which is exactly why
// a pasted IG/FB page used to fail with "couldn't read that link". So we identify
// as Facebook's external-hit crawler for the PAGE fetch, the same UA that
// Messenger / WhatsApp / Slack use to unfurl link previews.
const CRAWLER_UA =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
// The og:image itself lives on a public CDN that serves bytes to anyone, so a
// vanilla browser UA is the most broadly compatible choice for the raw download.
const IMAGE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 8000;
// ScrapingBee adds a proxy round-trip, so give it more time than a direct fetch.
const SCRAPINGBEE_TIMEOUT_MS = 15000;
const LINK_HELP =
  "Couldn't read that link — it may be private or login-only. Try uploading the photo instead.";

// ── Optional residential-proxy fallback ──────────────────────────────────────
// Instagram/Facebook serve a login wall (no og:image) to many datacenter IPs —
// notably Vercel's — so a direct server-side fetch can't read public IG/FB photos.
// When SCRAPINGBEE_API_KEY is set, the page fetch for those hosts is routed through
// ScrapingBee (render_js off → 1 credit), which reaches them from unblocked IPs.
// Unset → direct fetch only (still works locally and for non-walled sites).
function scrapingBeeKey(): string | null {
  const k = process.env.SCRAPINGBEE_API_KEY;
  return k && k.trim() ? k.trim() : null;
}

/** Hosts that login-wall datacenter IPs and need the proxy to read their og:image. */
function needsProxy(host: string): boolean {
  const h = host.toLowerCase();
  return (
    /(^|\.)instagram\.com$/.test(h) ||
    /(^|\.)facebook\.com$/.test(h) ||
    /(^|\.)fb\.(com|watch)$/.test(h)
  );
}

/** Wrap a target URL in a ScrapingBee request (no JS render → cheapest, 1 credit). */
function scrapingBeeUrl(target: string, key: string): string {
  const params = new URLSearchParams({ api_key: key, url: target, render_js: "false" });
  return `https://app.scrapingbee.com/api/v1/?${params.toString()}`;
}

/** Only http/https, and (nice-to-have) refuse obvious localhost / private hosts. */
export function assertSafeUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new UserInputError("That doesn't look like a valid link. Double-check the URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UserInputError("Only http(s) links work here.");
  }
  const host = parsed.hostname.toLowerCase();
  const isPrivate =
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "[::1]" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (isPrivate) {
    throw new UserInputError("That link points somewhere we can't reach.");
  }
  return parsed;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#47;/g, "/")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Scan HTML for the first matching <meta> content, checking the given
 * property/name keys in priority order. Attribute order is not assumed.
 */
function extractMetaContent(html: string, keys: string[]): string | null {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const key of keys) {
    for (const tag of metaTags) {
      const prop = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
      if (prop !== key) continue;
      const content = /content\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1];
      if (content) return decodeHtmlEntities(content.trim());
    }
  }
  return null;
}

/** Find the og:image (then twitter:image, then first <img>) URL within a page's HTML. */
function findImageUrl(html: string, pageUrl: URL): string | null {
  const candidate =
    extractMetaContent(html, [
      "og:image",
      "og:image:url",
      "og:image:secure_url",
      "twitter:image",
      "twitter:image:src",
    ]) ?? firstImgSrc(html);
  if (!candidate) return null;
  try {
    const resolved = new URL(candidate, pageUrl);
    // Ignore non-http(s) candidates (e.g. data:-URI placeholders inside a login wall).
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
    return resolved.toString();
  } catch {
    return null;
  }
}

function firstImgSrc(html: string): string | null {
  const m = /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/i.exec(html);
  return m ? decodeHtmlEntities(m[1].trim()) : null;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch a URL directly, or via ScrapingBee when `key` is given. Returns the
 * Response only if it's ok, else null (never throws) so callers can fall back.
 */
async function tryFetch(
  target: string,
  headers: Record<string, string>,
  key?: string,
): Promise<Response | null> {
  const url = key ? scrapingBeeUrl(target, key) : target;
  const timeoutMs = key ? SCRAPINGBEE_TIMEOUT_MS : FETCH_TIMEOUT_MS;
  try {
    const res = await fetchWithTimeout(url, { headers }, timeoutMs);
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

/**
 * Fetch a page server-side, pull out its og:image, then fetch that image and
 * return it as an ImagePayload. Throws UserInputError (friendly) on any failure,
 * since the most common cause is a private / login-walled IG/FB post.
 */
export async function extractImageFromUrl(rawUrl: string): Promise<ImagePayload> {
  const pageUrl = assertSafeUrl(rawUrl);
  const key = scrapingBeeKey() ?? undefined;
  const pageHeaders = {
    "User-Agent": CRAWLER_UA,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  // Known login-walled hosts (IG/FB) go straight through the proxy when configured.
  // Everything else is fetched directly, then retried through the proxy if a direct
  // read came back empty or without an extractable image (an unanticipated wall).
  const proxyFirst = Boolean(key) && needsProxy(pageUrl.hostname);
  let pageRes = await tryFetch(pageUrl.toString(), pageHeaders, proxyFirst ? key : undefined);
  let html = pageRes ? await pageRes.text() : null;

  if (key && !proxyFirst && (!html || !findImageUrl(html, pageUrl))) {
    pageRes = await tryFetch(pageUrl.toString(), pageHeaders, key);
    if (pageRes) html = await pageRes.text();
  }
  if (!html) throw new UserInputError(LINK_HELP);

  const imageUrl = findImageUrl(html, pageUrl);
  if (!imageUrl) throw new UserInputError(LINK_HELP);

  let safeImageUrl: URL;
  try {
    safeImageUrl = assertSafeUrl(imageUrl);
  } catch {
    // A malformed / non-http(s) image reference is an unreadable link, not a bad
    // user URL — surface the friendly message instead of a raw validation error.
    throw new UserInputError(LINK_HELP);
  }

  // The og:image lives on a public CDN, so fetch it directly; if that fails and a
  // proxy is configured, retry through it (covers CDNs that also block the server).
  const imageHeaders = { "User-Agent": IMAGE_UA, Accept: "image/*,*/*;q=0.8" };
  let imgRes = await tryFetch(safeImageUrl.toString(), imageHeaders);
  if (!imgRes && key) imgRes = await tryFetch(safeImageUrl.toString(), imageHeaders, key);
  if (!imgRes) throw new UserInputError(LINK_HELP);

  // Guard against oversized downloads (content-length first, then actual bytes).
  const declared = Number(imgRes.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_IMAGE_BYTES) {
    throw new UserInputError("That photo is a bit chonky. Try a smaller one or upload it directly.");
  }

  const buf = Buffer.from(await imgRes.arrayBuffer());
  if (buf.byteLength === 0) throw new UserInputError(LINK_HELP);
  if (buf.byteLength > MAX_IMAGE_BYTES) {
    throw new UserInputError("That photo is a bit chonky. Try a smaller one or upload it directly.");
  }

  const mediaType =
    normalizeMediaType(imgRes.headers.get("content-type")) ?? inferMediaTypeFromUrl(safeImageUrl);
  if (!mediaType) throw new UserInputError(LINK_HELP);

  return { base64: buf.toString("base64"), mediaType };
}

function inferMediaTypeFromUrl(url: URL): ImagePayload["mediaType"] | null {
  const ext = url.pathname.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Anthropic vision call
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are the Dad Bod Inspector: a witty, good-natured judge of "dad bod" energy in photos.

Rate the most prominent person's physique with a playful, body-positive eye. Your whole vibe is teasing-but-kind — like a friend who roasts you over a beer and then tells you you're great. Never cruel, never harassing, never sexual, no medical or weight-loss claims, keep it PG.

The "rating" is a 0-100 "Dad Bod Rating" where HIGHER means MORE classic dad bod (cozy, soft, grillmaster energy) and LOWER means more gym-sculpted / athletic. It is a fun vibe score, not a health metric.

If no clear human torso/body is visible (e.g. a landscape, a pet, an object, a close-up face only), DON'T refuse — return a light-hearted "no dad detected" style result: a low-ish rating, a verdict like "No Dad Detected", and a cheeky review noting you couldn't find a dad bod to inspect.

Always return:
- rating: integer 0-100
- verdict: a short, punchy title (a few words), e.g. "Certified Dad Bod"
- review: 2-4 sentences, cheeky but kind
- emoji: a SINGLE emoji capturing the vibe
- tips: 2-4 short, funny, encouraging "improvement" tips`;

const USER_PROMPT =
  "Inspect this photo and deliver the official Dad Bod Rating. Keep it fun, warm, and PG.";

// JSON Schema for structured output. Matches DadBodResult minus the `mock` flag.
const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    rating: { type: "integer" },
    verdict: { type: "string" },
    review: { type: "string" },
    emoji: { type: "string" },
    tips: { type: "array", items: { type: "string" } },
  },
  required: ["rating", "verdict", "review", "emoji", "tips"],
} as const;

/** True when a usable Anthropic API key is configured. */
export function hasApiKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim() !== "";
}

/**
 * Run the live vision analysis. Caller is responsible for the no-key / error
 * fallback to mockResult — this throws on provider errors so the route can log
 * and degrade gracefully.
 */
export async function analyzeImage(image: ImagePayload): Promise<DadBodResult> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.VISION_MODEL ?? DEFAULT_MODEL;

  const response = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    // Vibe-judging needs no deep reasoning — disable thinking for speed/cost.
    thinking: { type: "disabled" },
    // Static instructions → cache_control so repeated calls reuse the prefix.
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { format: { type: "json_schema", schema: RESULT_SCHEMA } },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.base64 } },
          { type: "text", text: USER_PROMPT },
        ],
      },
    ],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return sanitizeResult(parseResultText(text));
}

/** Strip code fences if present, then JSON.parse. */
function parseResultText(text: string): unknown {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return JSON.parse(t);
}

const FALLBACK_TIPS = [
  "Keep doing you — confidence carries the whole look.",
  "Stairs count as cardio. So does carrying all the bags in one trip.",
];

/** Coerce a possibly-imperfect model object into a valid DadBodResult. */
function sanitizeResult(raw: unknown): DadBodResult {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  let rating = Math.round(Number(obj.rating));
  if (!Number.isFinite(rating)) rating = 50;
  rating = Math.min(100, Math.max(0, rating));

  const verdict = nonEmptyString(obj.verdict, "Dad Bod Detected");
  const review = nonEmptyString(
    obj.review,
    "Our imaginary panel of experts ran the numbers and came away grinning. Strong dad energy, even stronger snack game.",
  );
  const emoji = firstEmoji(typeof obj.emoji === "string" ? obj.emoji : "");

  let tips = Array.isArray(obj.tips)
    ? obj.tips.filter((t): t is string => typeof t === "string" && t.trim() !== "").map((t) => t.trim())
    : [];
  for (const t of FALLBACK_TIPS) {
    if (tips.length >= 2) break;
    if (!tips.includes(t)) tips.push(t);
  }
  tips = tips.slice(0, 4);

  return { rating, verdict, review, emoji, tips };
}

function nonEmptyString(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;
}

/** Return the first grapheme (handles ZWJ emoji), falling back to a shrug. */
function firstEmoji(s: string): string {
  const t = s.trim();
  if (!t) return "🤷";
  try {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const first = seg.segment(t)[Symbol.iterator]().next().value;
    return first?.segment ?? "🤷";
  } catch {
    return Array.from(t)[0] ?? "🤷";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic offline mock (no key, or provider failure)
// ─────────────────────────────────────────────────────────────────────────────

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

/** A valid, deterministic DadBodResult with `mock: true`. Same seed → same rating. */
export function mockResult(seed: string): DadBodResult {
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
