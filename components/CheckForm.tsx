"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ImageIcon, LinkIcon, Loader2 } from "lucide-react";
import {
  ANALYZE_ENDPOINT,
  type AnalyzeErrorResponse,
  type AnalyzeRequest,
  type DadBodResult,
} from "@/lib/types";
import { Dropzone } from "./Dropzone";
import { UrlInput, isProbablyUrl } from "./UrlInput";
import { ResultCard } from "./ResultCard";
import { HaloHandoff } from "./HaloHandoff";
import { cn } from "./cn";

type Tab = "photo" | "link";

const LOADING_LINES = [
  "Measuring the dad-ness…",
  "Calibrating the snack-to-muscle ratio…",
  "Consulting the council of grillmasters…",
  "Detecting cargo-short energy…",
  "Running it past imaginary scientists…",
];

export function CheckForm() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>("photo");

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DadBodResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Rotate the loading copy for a livelier wait.
  useEffect(() => {
    if (!loading || reduce) return;
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % LOADING_LINES.length;
      setLoadingLine(LOADING_LINES[i]);
    }, 1600);
    return () => window.clearInterval(id);
  }, [loading, reduce]);

  // Bring the result into view once it arrives.
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [result, reduce]);

  const hasPhoto = !!imageDataUrl;
  const hasUrl = url.trim().length > 0;
  const activeInputReady = tab === "photo" ? hasPhoto : hasUrl && isProbablyUrl(url);
  const canSubmit = activeInputReady && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // guard against double-submit

    setError(null);

    const payload: AnalyzeRequest =
      tab === "photo"
        ? { imageDataUrl: imageDataUrl ?? undefined }
        : { url: url.trim() };

    if (tab === "photo" && !payload.imageDataUrl) {
      setError("Add a photo first — then we'll do our thing.");
      return;
    }
    if (tab === "link" && !payload.url) {
      setError("Paste a public post link first.");
      return;
    }

    setLoading(true);
    setLoadingLine(LOADING_LINES[0]);
    try {
      const res = await fetch(ANALYZE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Something went sideways. Give it another go.";
        try {
          const err = (await res.json()) as AnalyzeErrorResponse;
          if (err?.error) message = err.error;
        } catch {
          /* non-JSON error body */
        }
        setError(message);
        return;
      }

      const data = (await res.json()) as DadBodResult;
      setResult(data);
    } catch {
      setError("Couldn't reach the lab. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setImageDataUrl(null);
    setFileName(null);
    setUrl("");
    setTab("photo");
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  if (result) {
    return (
      <div ref={resultRef} className="flex w-full flex-col gap-10 scroll-mt-6">
        <ResultCard result={result} onReset={handleReset} />
        <HaloHandoff result={result} />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-3xl border border-hairline bg-surface/70 p-4 shadow-2xl shadow-grape/10 backdrop-blur-sm sm:p-6"
    >
      {/* Tab switch — the obvious OR between the two inputs. */}
      <div
        role="tablist"
        aria-label="Choose how to submit"
        className="mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-hairline bg-night-2 p-1"
      >
        {(
          [
            { id: "photo", label: "Upload photo", Icon: ImageIcon },
            { id: "link", label: "Paste a link", Icon: LinkIcon },
          ] as const
        ).map(({ id, label, Icon }) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={selected}
              aria-controls={`panel-${id}`}
              disabled={loading}
              onClick={() => {
                setTab(id);
                setError(null);
              }}
              className={cn(
                "relative flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition disabled:opacity-50",
                selected ? "text-night" : "text-ink-soft hover:text-ink",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-brand"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div
        id="panel-photo"
        role="tabpanel"
        aria-labelledby="tab-photo"
        hidden={tab !== "photo"}
      >
        <Dropzone
          value={imageDataUrl}
          fileName={fileName}
          onChange={(dataUrl, name) => {
            setImageDataUrl(dataUrl);
            setFileName(name);
            if (dataUrl) setError(null);
          }}
          onError={setError}
          disabled={loading}
        />
      </div>

      <div
        id="panel-link"
        role="tabpanel"
        aria-labelledby="tab-link"
        hidden={tab !== "link"}
      >
        <UrlInput value={url} onChange={setUrl} disabled={loading} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex items-start gap-2 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2.5 text-sm font-medium text-coral"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-lg font-black tracking-tight transition active:scale-[0.99]",
          canSubmit
            ? "bg-brand text-night shadow-lg shadow-coral/25"
            : "cursor-not-allowed bg-surface-2 text-ink-faint",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span aria-live="polite">{loadingLine}</span>
          </>
        ) : (
          <>Check my Dad Bod 🔥</>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-ink-faint">
        Either input works — pick one and hit the button.
      </p>
    </form>
  );
}
