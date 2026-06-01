import type { Metadata } from "next";
import Link from "next/link";
import { GiftBuilder } from "./GiftBuilder";
import { GiftCardArt } from "./GiftCardArt";

export const metadata: Metadata = {
  title: "Give Dad his years back — The HALO Father’s Day Gift Card",
  description:
    "Socks fade. Years don’t. Gift Dad a HALO biological-age check — the premium, doctor-reviewed blood test that tells him how old his body really is. The Father’s Day gift that could add years, not inches.",
  openGraph: {
    title: "Give Dad his years back — The HALO Gift Card",
    description:
      "The Father’s Day gift that could add years to his life. A premium, doctor-reviewed HALO biological-age check — 50 biomarkers, 21 panels, AHPRA-reviewed.",
    type: "website",
  },
};

/* ----------------------------------------------------------------------------
   Inline icons (no icon-library dependency)
   -------------------------------------------------------------------------- */
function HaloRing({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.1" fill="currentColor" />
    </svg>
  );
}
function IconPulse() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12h4l2.5-6 4 13 2.5-7H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconStethoscope() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 3v6a4 4 0 0 0 8 0V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 13v2a5 5 0 0 0 10 0v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s-7-4.5-9.2-9C1 7.5 3 4.5 6.2 4.5c2 0 3.2 1.1 3.8 2 .6-.9 1.8-2 3.8-2C17 4.5 19 7.5 17.2 11 15 15.5 12 20 12 20z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
   Small building blocks
   -------------------------------------------------------------------------- */
function HaloMark({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className={`halo-mark${onDark ? " halo-mark--ondark" : ""}`}>
      <HaloRing className="halo-mark__ring" />
      HALO
    </span>
  );
}

function Tile({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="halo-tile">
      <span className="halo-tile__icon">{icon}</span>
      <h3 className="halo-h3">{title}</h3>
      <p className="halo-muted mt-2 leading-relaxed">{children}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="halo-step__num">{n}</div>
      <h3 className="halo-h3 mt-3">{title}</h3>
      <p className="halo-muted mt-2 leading-relaxed">{children}</p>
    </div>
  );
}

function CompareRow({ label, them, halo, head = false }: { label: string; them: string; halo: string; head?: boolean }) {
  return (
    <div className={`halo-compare__row${head ? " halo-compare__head" : ""}`}>
      <div className="halo-compare__cell halo-compare__cell--label">{label}</div>
      <div className="halo-compare__cell halo-compare__cell--them">{them}</div>
      <div className="halo-compare__cell halo-compare__cell--halo">{halo}</div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--halo-line-dark)" }}>
      <div className="text-2xl font-semibold tracking-tight text-white">{value}</div>
      <div className="halo-muted mt-1 text-sm">{label}</div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="halo-faq__item">
      <summary className="halo-faq__q">
        {q}
        <span className="halo-faq__sign">
          <IconPlus />
        </span>
      </summary>
      <div className="halo-faq__a">{children}</div>
    </details>
  );
}

/* ----------------------------------------------------------------------------
   Page
   -------------------------------------------------------------------------- */
export default function GiftPage() {
  return (
    <div className="halo">
      {/* Announcement */}
      <div className="halo-announce">
        <div className="halo-container flex items-center justify-center gap-2 py-2 text-center">
          <span className="font-medium">Father’s Day, Sunday 6 September.</span>
          <span className="halo-muted hidden sm:inline">Delivered by email — instantly, or on the morning.</span>
        </div>
      </div>

      {/* Nav */}
      <header className="halo-nav">
        <div className="halo-container flex h-16 items-center justify-between gap-6">
          <Link href="/gift" aria-label="HALO gift cards home">
            <HaloMark />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a className="halo-nav__link" href="#why">Why it’s the gift</a>
            <a className="halo-nav__link" href="#test">The test</a>
            <a className="halo-nav__link" href="#how">How it works</a>
            <a className="halo-nav__link" href="#faq">FAQ</a>
          </nav>
          <a href="#create" className="halo-btn halo-btn--primary" style={{ padding: "0.7rem 1.1rem" }}>
            Buy a gift card
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="halo-container grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="max-w-xl">
            <span className="halo-eyebrow halo-rise">Father’s Day · The HALO Gift Card</span>
            <h1 className="halo-display halo-rise halo-rise-2 mt-5">
              Give Dad his <span className="halo-mark-underline">years</span> back.
            </h1>
            <p className="halo-lead halo-rise halo-rise-3 mt-6">
              Socks fade. Years don’t. Gift him a HALO biological-age check — the premium, doctor-reviewed blood
              test that reveals how old his body really is, and how to wind the clock back.
            </p>
            <div className="halo-rise halo-rise-3 mt-8 flex flex-wrap gap-3">
              <a href="#create" className="halo-btn halo-btn--primary">
                Buy a gift card — A$229 <IconArrow />
              </a>
              <a href="#how" className="halo-btn halo-btn--ghost">
                See how it works
              </a>
            </div>
            <div className="halo-trust halo-rise halo-rise-4 mt-9">
              <span className="halo-trust__item">AHPRA-registered doctors</span>
              <span className="halo-trust__item">21 panels</span>
              <span className="halo-trust__item">50 biomarkers</span>
              <span className="halo-trust__item">4,000+ collection centres</span>
            </div>
          </div>

          <div className="halo-rise halo-rise-2 flex justify-center lg:justify-end">
            <GiftCardArt amount={229} to="Dad" from="The kids" message="Happy Father’s Day — here’s to many more." />
          </div>
        </section>

        {/* Bridge: from dad bod to data */}
        <section className="border-y" style={{ borderColor: "var(--halo-line)", background: "var(--halo-paper)" }}>
          <div className="halo-container flex flex-col items-start gap-5 py-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="halo-eyebrow halo-eyebrow--muted">From dad bod to data</span>
              <p className="halo-h3 mt-3 font-medium" style={{ letterSpacing: "-0.015em" }}>
                You rated his dad bod for the laugh. This is the part that loves him back — his real, biological
                age, measured properly by a doctor.
              </p>
            </div>
            <Link href="/" className="halo-btn halo-btn--ghost whitespace-nowrap">
              Back to the Dad Bod Checker
            </Link>
          </div>
        </section>

        {/* Why it's the gift */}
        <section id="why" className="halo-container py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="halo-eyebrow">Why it’s the gift</span>
            <h2 className="halo-h2 mt-4">The gift that could add years, not inches.</h2>
            <p className="halo-lead mt-5">
              A blood test sounds like a strange present — until you realise what it’s really saying:{" "}
              <em>I want more mornings with you.</em>
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Tile icon={<IconPulse />} title="His real age, in numbers">
              50 biomarkers across 21 panels reveal his HALO biological age — not the candles on the cake, how old
              his body is actually running.
            </Tile>
            <Tile icon={<IconStethoscope />} title="Read by a real doctor">
              Every result is personally reviewed by an AHPRA-registered doctor against optimal ranges — not just
              whether it’s “normal”.
            </Tile>
            <Tile icon={<IconBolt />} title="Effortless for him">
              Order online, a quick fasted blood draw at one of 4,000+ centres, results in 2–4 days. No clinics to
              chase down.
            </Tile>
            <Tile icon={<IconHeart />} title="A gift, never a verdict">
              It’s celebratory, not critical. The dad bod was the joke — this is the love behind it.
            </Tile>
          </div>
        </section>

        {/* The test (dark band) */}
        <section id="test" className="halo-band-ink">
          <div className="halo-container grid gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="halo-eyebrow halo-eyebrow--ondark">Inside the gift</span>
              <h2 className="halo-h2 mt-4 text-white">The HALO Performance Test.</h2>
              <p className="halo-muted mt-5 leading-relaxed">
                A premium 21-panel blood test that returns 50 individual biomarker values across five systems —
                each shown against two ranges: the standard range your lab uses, and the functional-medicine
                optimal range that defines peak performance.
              </p>
              <p className="mt-5 text-lg font-medium text-white">
                Not “is this normal?”, but “is this optimal?”.
              </p>
              <p className="halo-muted mt-5 text-sm">
                Testosterone · cortisol · DHEA · fasting glucose · insulin · IGF-1 · hs-CRP · kidney · liver — and
                41 more.
              </p>
              <a href="#create" className="halo-btn halo-btn--light mt-8">
                Gift the test — A$229 <IconArrow />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4 self-center sm:grid-cols-3 lg:grid-cols-2">
              <Stat value="Hormones" label="11 markers" />
              <Stat value="Metabolic" label="3 markers" />
              <Stat value="Recovery" label="3 markers" />
              <Stat value="Inflammation" label="1 marker" />
              <Stat value="Organ function" label="3 markers" />
              <Stat value="50 in all" label="across 21 panels" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="halo-container py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="halo-eyebrow">How it works</span>
            <h2 className="halo-h2 mt-4">Order. Collect. Read.</h2>
            <p className="halo-lead mt-5">Two minutes for you. A genuinely good gift for him.</p>
          </div>
          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
            <Step n="01" title="You gift it">
              Pick an amount, add a message and choose the day. We email a beautifully designed HALO gift card —
              instantly, or on Father’s Day morning.
            </Step>
            <Step n="02" title="He books it">
              He redeems at yourhalo.health and picks a collection centre from 4,000+ across Australia. A quick
              fasted draw — eight minutes, done.
            </Step>
            <Step n="03" title="He knows his number">
              Within 2–4 days his HALO dashboard reveals his biological-age snapshot and all 50 biomarkers —
              doctor-reviewed, with exactly what to do next.
            </Step>
          </div>
        </section>

        {/* Comparison */}
        <section className="border-t" style={{ borderColor: "var(--halo-line)", background: "var(--halo-paper)" }}>
          <div className="halo-container py-20 sm:py-28">
            <div className="max-w-2xl">
              <span className="halo-eyebrow">The difference, line by line</span>
              <h2 className="halo-h2 mt-4">Another tie, or another decade?</h2>
            </div>
            <div className="halo-compare mt-10">
              <CompareRow head label="" them="Another tie" halo="The HALO gift" />
              <CompareRow label="Lasts" them="A season, tops" halo="A lifetime of more mornings" />
              <CompareRow label="Says" them="“Here’s a thing.”" halo="“I want more years with you.”" />
              <CompareRow label="Tells him" them="Nothing" halo="His biological age + 50 biomarkers" />
              <CompareRow label="Backed by" them="—" halo="An AHPRA-registered doctor" />
              <CompareRow label="Come October" them="Forgotten" halo="He’s working on his health" />
            </div>
          </div>
        </section>

        {/* Build the gift */}
        <section id="create" className="halo-container py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="halo-eyebrow">Build his gift</span>
            <h2 className="halo-h2 mt-4">Make it his.</h2>
            <p className="halo-lead mt-5">
              Choose the amount, write the note, pick the day it lands. You’ll see it come together on the right.
            </p>
          </div>
          <div className="mt-12">
            <GiftBuilder />
          </div>
          <p className="halo-faint mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed">
            HALO gift cards are valid for 3 years from purchase, carry no fees, and are redeemable toward the HALO
            Performance Test at yourhalo.health.
          </p>
        </section>

        {/* Founding scarcity */}
        <section className="halo-band-ink">
          <div className="halo-container py-16">
            <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
              <div>
                <span className="halo-eyebrow halo-eyebrow--ondark">Founding 500</span>
                <h2 className="halo-h2 mt-4 text-white">Lock the founding price — for life.</h2>
                <p className="halo-muted mt-4 max-w-xl leading-relaxed">
                  Gift a founding place before public pricing rises. Dad joins the first 500 HALO members at A$229
                  — the price that never goes up, for as long as he stays.
                </p>
              </div>
              <div>
                <div className="flex items-end justify-between text-sm text-white">
                  <span>Founding places claimed</span>
                  <span className="font-semibold">317 / 500</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.14)" }}>
                  <div className="h-full rounded-full" style={{ width: "63%", background: "linear-gradient(90deg, var(--halo-teal), var(--halo-teal-bright))" }} />
                </div>
                <a href="#create" className="halo-btn halo-btn--light mt-6 w-full">
                  Claim a founding place — A$229
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="halo-container py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <span className="halo-eyebrow">Good questions</span>
              <h2 className="halo-h2 mt-4">The honest answers.</h2>
              <p className="halo-lead mt-5">
                A health gift should come with no small print you’d be embarrassed by. Here’s the lot.
              </p>
            </div>
            <div className="halo-faq">
              <Faq q="What actually is a biological age check?">
                It’s a snapshot of how old your body is functioning — built from 50 blood biomarkers across
                hormones, metabolism, recovery, inflammation and organ health, and reviewed by a doctor against
                optimal ranges. Two people born the same year can have very different biological ages.
              </Faq>
              <Faq q="Is this a medical diagnosis?">
                No. HALO is a pathology and wellness service: results are reviewed by an AHPRA-registered doctor,
                but a biological-age snapshot is for insight and optimisation — it isn’t intended to diagnose,
                treat or prevent disease. If something needs follow-up, he’ll be pointed to his GP.
              </Faq>
              <Faq q="How does Dad redeem the gift card?">
                He gets an email with a code and a link. He enters it at yourhalo.health, books a collection centre
                near him, and the gift value comes straight off the price. That’s the whole job.
              </Faq>
              <Faq q="Can I have it arrive on Father’s Day?">
                Yes. Choose any delivery date — including Sunday 6 September — and we’ll email it that morning. Pick
                today’s date to send it right now.
              </Faq>
              <Faq q="How long is it valid?">
                Three years from purchase, with no expiry fees, as Australian gift-card law requires. Unused gift
                cards are fully refundable.
              </Faq>
              <Faq q="What if he’s not in a capital city?">
                There are 4,000+ collection centres across Australia. Most dads have one within a short drive.
              </Faq>
              <Faq q="Is his health data private?">
                Yes. His results are his — handled under Australian privacy law and visible only to him and the
                reviewing doctor.
              </Faq>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="halo-band-ink">
          <div className="halo-container py-24 text-center sm:py-32">
            <span className="halo-eyebrow halo-eyebrow--ondark">Father’s Day · Sunday 6 September</span>
            <h2 className="halo-h2 mx-auto mt-5 max-w-2xl text-white">This year, give him more time.</h2>
            <p className="halo-muted mx-auto mt-5 max-w-xl leading-relaxed">
              The dad bod was the laugh. The HALO gift is the part that could add years to it.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a href="#create" className="halo-btn halo-btn--light">
                Buy a gift card — A$229 <IconArrow />
              </a>
              <a href="#faq" className="halo-btn halo-btn--outline-light">
                Read the FAQ
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="halo-container py-14">
        <div className="flex flex-col gap-8 border-b pb-10 md:flex-row md:items-start md:justify-between" style={{ borderColor: "var(--halo-line)" }}>
          <div className="max-w-xs">
            <HaloMark />
            <p className="halo-faint mt-3 text-sm">Pathology, optimised. Know your optimal.</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol title="Gift" links={["Buy a gift card", "How it works", "Redeem a card"]} />
            <FooterCol title="HALO" links={["The Performance Test", "What we measure", "Founding access"]} />
            <FooterCol title="Legal" links={["Gift-card terms", "Privacy", "Contact"]} />
          </div>
        </div>
        <p className="halo-faint mt-8 text-xs leading-relaxed">
          HALO is an Australian premium blood-testing service. The HALO Performance Test is reviewed by
          AHPRA-registered doctors. A HALO biological age is a wellness snapshot derived from your biomarker
          results; it is not a medical diagnosis and is not intended to diagnose, treat, cure or prevent any
          disease. Gift cards are valid for 3 years from purchase with no fees. This page is part of the Dad Bod
          Checker × HALO Father’s Day campaign. © 2026 HALO.
        </p>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold" style={{ letterSpacing: "-0.01em" }}>{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#create" className="halo-nav__link text-sm">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
