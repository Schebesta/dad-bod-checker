"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy, RotateCcw, Share2, Sparkles } from "lucide-react";
import type { DadBodResult } from "@/lib/types";
import { RatingGauge } from "./RatingGauge";

interface ResultCardProps {
  result: DadBodResult;
  onReset: () => void;
}

function shareText(r: DadBodResult): string {
  return `${r.emoji} My Dad Bod Rating is ${r.rating}% — "${r.verdict}". Check yours at Dad Bod Checker!`;
}

export function ResultCard({ result, onReset }: ResultCardProps) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  async function handleShare() {
    const text = shareText(result);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Dad Bod Checker",
          text,
          url: shareUrl,
        });
        return;
      } catch {
        /* user cancelled or unsupported — fall through to copy */
      }
    }
    await handleCopy();
  }

  async function handleCopy() {
    const text = `${shareText(result)} ${shareUrl}`.trim();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing more we can do gracefully */
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <motion.article
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-hairline bg-surface/80 p-6 shadow-2xl shadow-grape/10 backdrop-blur-sm sm:p-8"
      >
        {/* glow accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-coral/25 blur-3xl"
        />

        {/* card header / branding */}
        <div className="relative mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
            <span aria-hidden="true">🏋️</span> Dad Bod Checker
          </span>
          {result.mock && (
            <span
              className="rounded-full border border-hairline bg-night-2 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-faint"
              title="Showing demo data (no AI key configured)"
            >
              demo mode
            </span>
          )}
        </div>

        <div className="relative flex flex-col items-center gap-4 text-center">
          <RatingGauge rating={result.rating} emoji={result.emoji} />

          <h2 className="text-gradient text-3xl font-black tracking-tight sm:text-4xl">
            {result.verdict}
          </h2>

          <p className="max-w-prose text-pretty text-base leading-relaxed text-ink-soft">
            {result.review}
          </p>

          {result.tips.length > 0 && (
            <div className="mt-1 w-full rounded-2xl border border-hairline bg-night-2/70 p-4 text-left">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-mango">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Coach&apos;s notes
              </p>
              <ul className="flex flex-col gap-2">
                {result.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-ink-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 select-none text-coral"
                    >
                      ▸
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="relative mt-5 text-center text-[0.7rem] text-ink-faint">
          100% for laughs · not medical advice · dadbodchecker
        </p>
      </motion.article>

      {/* actions live outside the screenshot-able card */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-base font-bold text-night shadow-lg shadow-coral/20 transition active:scale-[0.98]"
        >
          <Share2 className="h-5 w-5" aria-hidden="true" />
          Share my score
        </button>
        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className="flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface px-5 py-3 text-base font-semibold text-ink transition hover:border-mango/60 active:scale-[0.98]"
        >
          {copied ? (
            <Check className="h-5 w-5 text-mint" aria-hidden="true" />
          ) : (
            <Copy className="h-5 w-5" aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface px-5 py-3 text-base font-semibold text-ink transition hover:border-mango/60 active:scale-[0.98]"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Check another
        </button>
      </div>
    </div>
  );
}
