@AGENTS.md

# Dad Bod Checker

A fun, mobile-first Next.js web app: upload a photo (or paste an Instagram/Facebook
link) and get a humorous, percentage-based "Dad Bod Rating" with a cheeky AI review.

## Stack
- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4
- Tailwind v4 has **no `tailwind.config.js`** — the theme lives in `app/globals.css`
  via `@import "tailwindcss"` and `@theme`.
- This Next.js version has breaking changes vs older training data. See `AGENTS.md`
  and `node_modules/next/dist/docs/` before writing framework code.
- Path alias: `@/*` → repo root (e.g. `import { DadBodResult } from "@/lib/types"`).

## Contract
- `lib/types.ts` is the **frozen** shared contract between the UI and the API
  (`AnalyzeRequest`, `DadBodResult`, `AnalyzeResponse`, `AnalyzeErrorResponse`,
  `ANALYZE_ENDPOINT`, `MAX_IMAGE_BYTES`). Don't change its shape without updating
  both sides.

## Vision API
- `POST /api/analyze` (`app/api/analyze/route.ts`) takes an uploaded image or an
  `og:image` extracted from an IG/FB URL and returns a `DadBodResult`.
- With no `ANTHROPIC_API_KEY` it returns a deterministic **mock** (`mock: true`) so
  the app runs offline. Copy `.env.example` → `.env.local` to configure a real key.
