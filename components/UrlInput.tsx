"use client";

import { useId } from "react";
import { Link2, AtSign, Globe } from "lucide-react";

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Loose client-side check — the API does the real extraction. */
export function isProbablyUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  try {
    const u = new URL(v.startsWith("http") ? v : `https://${v}`);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function UrlInput({ value, onChange, disabled }: UrlInputProps) {
  const id = useId();
  const valid = value.trim() === "" || isProbablyUrl(value);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        Paste a public post link
      </label>
      <div className="relative">
        <Link2
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <input
          id={id}
          type="url"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="instagram.com/p/…  or  facebook.com/…"
          aria-invalid={!valid}
          className="w-full rounded-xl border border-hairline bg-night-2 py-3 pl-11 pr-3 text-base text-ink placeholder:text-ink-faint transition focus:border-mango focus:outline-none disabled:opacity-50"
        />
      </div>
      <p className="flex items-center gap-1.5 text-xs text-ink-faint">
        <AtSign className="h-3.5 w-3.5" aria-hidden="true" />
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        <span>
          Works with <strong className="text-ink-soft">public</strong> IG/FB
          posts — we grab the preview photo.
        </span>
      </p>
      {!valid && (
        <p role="alert" className="text-xs font-medium text-coral">
          Hmm, that doesn&apos;t look like a link. Try a full post URL.
        </p>
      )}
    </div>
  );
}
