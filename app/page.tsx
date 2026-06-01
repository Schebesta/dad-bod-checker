import { CheckForm } from "@/components/CheckForm";

export default function Home() {
  return (
    <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-stretch gap-8 px-5 pb-16 pt-10 sm:pt-14">
      {/* floating background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="animate-float-slow absolute -left-20 top-24 h-56 w-56 rounded-full bg-grape/20 blur-3xl" />
        <div className="animate-float-slow absolute -right-16 top-72 h-52 w-52 rounded-full bg-mango/15 blur-3xl" />
      </div>

      {/* Hero */}
      <header className="flex flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-night-2/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
          <span aria-hidden="true">🏋️</span> Official &amp; Totally Scientific™
        </span>

        <h1 className="text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
          <span className="text-gradient">Dad Bod</span>
          <br />
          <span className="text-ink">Checker</span>
        </h1>

        <p className="text-balance text-lg font-medium text-ink-soft">
          Upload a pic, get a brutally honest{" "}
          <span className="font-bold text-ink">Dad Bod Rating</span> — a cheeky %
          and a review you&apos;ll want to screenshot.
        </p>

        <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-ink-faint">
          <li className="flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-surface text-[0.7rem] font-bold text-mango">
              1
            </span>
            Add a photo or link
          </li>
          <span aria-hidden="true" className="text-hairline">
            ·
          </span>
          <li className="flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-surface text-[0.7rem] font-bold text-coral">
              2
            </span>
            Hit check
          </li>
          <span aria-hidden="true" className="text-hairline">
            ·
          </span>
          <li className="flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-surface text-[0.7rem] font-bold text-grape">
              3
            </span>
            Share the verdict
          </li>
        </ol>
      </header>

      <CheckForm />

      <footer className="text-center text-xs text-ink-faint">
        Just for fun · no photos are stored · not medical advice.
      </footer>
    </main>
  );
}
