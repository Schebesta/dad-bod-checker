"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { DadBodResult } from "@/lib/types";
import { GiftCardArt } from "@/app/gift/GiftCardArt";
import { cn } from "./cn";

// The handoff copy below is the approved in-app bridge from DBC-6:
// Dad Bod result → Halo biological-age check. The spine is "the dad bod is the
// cover, your biological age is the story" — cheeky on the way in, warm on the
// way out, never critical. Keep it compliant: no diagnosis / disease claims.

/** Halo "self" destination — founding access on the live site. */
const HALO_SELF_URL = "https://www.yourhalo.health/";

const TRUST: { icon: string; label: string }[] = [
  { icon: "🩸", label: "50 biomarkers" },
  { icon: "🩺", label: "Doctor-reviewed" },
  { icon: "📍", label: "4,000+ centres" },
  { icon: "⚡", label: "Results in 2–4 days" },
];

const FINE_PRINT: { icon: string; text: string }[] = [
  {
    icon: "🔒",
    text: "Your Dad Bod photo was never stored — it's analysed on the spot and gone.",
  },
  {
    icon: "🩺",
    text: "Halo is a wellness blood test that shows how your body's tracking against optimal ranges. It's not a diagnosis — your Halo doctor will tell you if anything needs a chat with your GP.",
  },
  {
    icon: "🎁",
    text: "Halo gift cards are valid for 3 years, redeemable on any Halo test, no extra fees.",
  },
  {
    icon: "😄",
    text: "Dad Bod Checker is a bit of fun. Your bloods are the real thing.",
  },
];

/**
 * Score-aware bridge hook. Keys off `rating` (not the verdict string) so it
 * keeps working if the Vision API renames its archetypes. Bands per DBC-6:
 * 0–39 fit · 40–69 mid · 70–100 high.
 */
function bridgeHook(rating: number): string {
  if (rating < 40)
    return "Looking fit is great — but even the gym-fit get surprised by their bloods. The inside doesn't always match the outside.";
  if (rating < 70)
    return "Right in the dad-bod sweet spot. Looks are the easy bit, though — here's the number that actually counts.";
  return "The dad bod's well and truly earned. 🍔 Good news: it's just the cover — your real age on the inside might surprise you.";
}

type Audience = "gift" | "self";

/** A single CTA block — heading, sub-line, the action button, and microcopy. */
function CtaBlock({
  heading,
  sub,
  button,
  micro,
}: {
  heading: string;
  sub: string;
  button: React.ReactNode;
  micro: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-balance text-xl font-black tracking-tight sm:text-2xl">
        {heading}
      </h3>
      <p className="max-w-prose text-pretty text-sm leading-relaxed text-ink-soft">
        {sub}
      </p>
      <div className="mt-1 w-full">{button}</div>
      <p className="text-xs text-ink-faint">{micro}</p>
    </div>
  );
}

const ctaButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-black tracking-tight text-night shadow-lg shadow-coral/25 transition active:scale-[0.99]";

/**
 * The bio-age bridge + gift CTA that sits directly under the Dad Bod result.
 * It pivots from the joke ("that's the outside sorted") to the real ask
 * ("what's your biological age?") and hands off to Halo — the gift-card landing
 * page (`/gift`) for the "my old man" path, or founding access for "it's mine".
 */
export function HaloHandoff({ result }: { result: DadBodResult }) {
  const reduce = useReducedMotion();
  // Default to the gift path during the Father's Day window.
  const [audience, setAudience] = useState<Audience>("gift");

  return (
    <motion.section
      aria-label="What's your biological age?"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      {/* Act break — the pivot from the joke to the real thing. */}
      <div className="flex items-center gap-3 text-ink-faint" aria-hidden="true">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-hairline" />
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em]">
          now the bit that counts
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-hairline" />
      </div>

      {/* ① The bridge + ② the explainer. */}
      <div className="relative overflow-hidden rounded-3xl border border-hairline bg-surface/80 p-6 shadow-2xl shadow-grape/10 backdrop-blur-sm sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-grape/25 blur-3xl"
        />

        {/* Bridge */}
        <p className="relative text-sm font-bold uppercase tracking-[0.18em] text-ink-faint">
          That&apos;s the outside sorted. 👀
        </p>
        <h2 className="relative mt-2 text-balance text-2xl font-black leading-tight tracking-tight sm:text-3xl">
          But your dad bod can&apos;t tell you the{" "}
          <span className="text-gradient">one number that actually matters.</span>
        </h2>
        <p className="relative mt-3 text-pretty text-base leading-relaxed text-ink-soft">
          {bridgeHook(result.rating)}
        </p>
        <p className="relative mt-3 text-pretty text-base leading-relaxed text-ink-soft">
          Two blokes the same age can be{" "}
          <strong className="text-ink">years apart on the inside.</strong> Your dad
          bod is chronological. What&apos;s your{" "}
          <em className="font-semibold not-italic text-mango">biological</em> age?
        </p>

        {/* Explainer */}
        <div className="relative mt-6 rounded-2xl border border-hairline bg-night-2/70 p-5">
          <h3 className="text-lg font-black tracking-tight">
            Meet Halo.{" "}
            <span className="font-bold text-ink-soft">Pathology, optimised.</span>
          </h3>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
            Your <strong className="text-ink">biological age</strong> is how old your
            body&apos;s actually running — read from your blood, not your bathroom
            scales. Halo measures{" "}
            <strong className="text-ink">50 biomarkers across 21 panels</strong> —
            hormones, metabolism, recovery, inflammation and the big organs — each
            against the standard lab range and the{" "}
            <strong className="text-ink">optimal</strong> range that defines peak
            performance. Every result is reviewed by an Australian
            (AHPRA-registered) doctor.
          </p>

          {/* Trust strip */}
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TRUST.map((t) => (
              <li
                key={t.label}
                className="flex items-center gap-1.5 rounded-xl border border-hairline bg-surface/60 px-2.5 py-2 text-xs font-semibold text-ink-soft"
              >
                <span aria-hidden="true">{t.icon}</span>
                {t.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ③ The fork + ④ the CTA. */}
      <div className="relative overflow-hidden rounded-3xl border border-coral/30 bg-gradient-to-br from-surface/90 to-night-2/90 p-6 shadow-2xl shadow-coral/10 sm:p-8">
        {/* Fork toggle — "who did you just rate?" */}
        <p className="text-center text-sm font-bold text-ink">
          Make it real. Who&apos;s this dad bod?
        </p>
        <div
          role="group"
          aria-label="Who did you just rate?"
          className="mx-auto mt-3 grid max-w-xs grid-cols-2 gap-1 rounded-2xl border border-hairline bg-night-2 p-1"
        >
          {(
            [
              { id: "gift", label: "It's my old man", emoji: "🎁" },
              { id: "self", label: "It's mine", emoji: "💪" },
            ] as const
          ).map((opt) => {
            const selected = audience === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setAudience(opt.id)}
                className={cn(
                  "relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition active:scale-[0.98]",
                  selected ? "text-night" : "text-ink-soft hover:text-ink",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="halo-fork-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-brand"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span aria-hidden="true">{opt.emoji}</span>
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* CTA — swaps with the fork. */}
        <div className="mt-6 text-center">
          {audience === "gift" ? (
            <CtaBlock
              heading="This Father's Day, give Dad his years back."
              sub="Socks fade. Years don't. Turn the laugh into the gift that tells him how he's really doing — a Halo biological age check, wrapped and ready."
              button={
                <Link href="/gift" className={ctaButtonClass}>
                  Give Dad his years back
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              }
              micro="$229 founding price · emailed instantly · he books when he's ready · valid 3 years"
            />
          ) : (
            <CtaBlock
              heading="Alright — what's your real age?"
              sub="You've seen the dad bod. Now get the number underneath it. 50 biomarkers, one doctor-reviewed report, your actual biological age."
              button={
                <a
                  href={HALO_SELF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ctaButtonClass}
                >
                  Find out my real age
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
              }
              micro="$229 founding access · 50 biomarkers · doctor-reviewed · results in 2–4 days"
            />
          )}

          {/* Quiet secondary link to the other path. */}
          <button
            type="button"
            onClick={() => setAudience(audience === "gift" ? "self" : "gift")}
            className="mt-4 text-sm font-semibold text-ink-faint underline-offset-4 transition hover:text-mango hover:underline"
          >
            {audience === "gift"
              ? "Just want it for yourself? Find your real age →"
              : "Actually, it's for my old man — gift it →"}
          </button>
        </div>
      </div>

      {/* The gift-card close — landing-page (#why) conversion, with the real
          HALO gift card front and centre. Sits at the bottom of the handoff. */}
      <div className="relative overflow-hidden rounded-3xl border border-hairline bg-night-2/60 p-6 text-center shadow-2xl shadow-grape/10 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-mango/15 blur-3xl"
        />

        <p className="relative text-sm font-bold uppercase tracking-[0.18em] text-ink-faint">
          🎁 The Father&apos;s Day gift card
        </p>
        <h3 className="relative mx-auto mt-2 max-w-md text-balance text-2xl font-black leading-tight tracking-tight sm:text-3xl">
          The gift that could <span className="text-gradient">add years</span>, not
          inches.
        </h3>
        <p className="relative mx-auto mt-3 max-w-prose text-pretty text-base leading-relaxed text-ink-soft">
          A blood test sounds like a strange present — until you realise what it&apos;s
          really saying:{" "}
          <em className="font-semibold not-italic text-ink">
            I want more mornings with you.
          </em>{" "}
          This Father&apos;s Day, give Dad a Halo biological-age check.
        </p>

        {/* The actual HALO gift card. yourhalo.css (loaded in the root layout)
            styles `.halo-giftcard`; supply the one --halo-* var its ring uses. */}
        <div
          className="relative mt-6 flex justify-center"
          style={{ "--halo-teal-bright": "#2fd6c4" } as React.CSSProperties}
        >
          <GiftCardArt
            amount={229}
            to="Dad"
            from="You"
            message="Happy Father's Day — here's to many more."
          />
        </div>

        <Link href="/gift" className={cn(ctaButtonClass, "relative mt-6")}>
          Gift Dad a HALO check — A$229
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
        <p className="relative mt-3 text-xs leading-relaxed text-ink-faint">
          A doctor-reviewed wellness snapshot, not a diagnosis · HALO gift cards valid 3
          years.
        </p>
      </div>

      {/* ⑤ Reassurance & fine print. */}
      <ul className="flex flex-col gap-2 px-1">
        {FINE_PRINT.map((f) => (
          <li
            key={f.text}
            className="flex items-start gap-2 text-xs leading-relaxed text-ink-faint"
          >
            <span aria-hidden="true" className="select-none">
              {f.icon}
            </span>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
