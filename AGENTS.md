# Repository instructions

These instructions apply to the entire Nexotao docs repository.

## What this repository is

- This repository serves **`docs.nexotao.com`**, the public developer
  documentation, built with Nextra 3 on Next.js 14 (**Pages Router**, not App
  Router — do not add `app/`).
- It is deployed by Vercel's Git integration from `origin/main`.
- It is **not** the marketing site and **not** the dashboard.
  `www.nexotao.com` is `apps/landing`; `dashboard.nexotao.com` is `apps/web`.
  The three are confused constantly; a change here never updates the others.

Four sibling repositories, four deployments:

| domain | repository | platform |
| --- | --- | --- |
| `docs.nexotao.com` | this repository (`apps/docs`) | Vercel |
| `www.nexotao.com` | `apps/landing` | Vercel |
| `dashboard.nexotao.com` | `apps/web` | Vercel |
| `api.nexotao.com` | `apps/api` (Go) | Railway |

## Both locales, same slug

- Every page exists twice: `pages/id/<slug>.mdx` and `pages/en/<slug>.mdx`.
  Never add a page to one tree only — the locale switcher swaps the prefix and
  would 404.
- **Slugs stay Indonesian in both trees** (`/en/autentikasi`,
  `/en/model-harga`). Do not "translate" a filename.
- A new page also needs an entry in **both** `_meta.tsx` files, or it will not
  appear in the sidebar.
- `public/sitemap.xml` is hand-maintained, not generated. Adding a page means
  adding its two `<url>` entries; removing one means removing them.

## Documented behaviour must match production

Readers copy-paste from these pages into working code, so a wrong endpoint,
model id, or rate is a support ticket, not a typo.

- Verify endpoints, request shapes, and error codes against the live API
  (`https://api.nexotao.com`) or `apps/api/internal/httpx/` before documenting
  them. Do not describe a route that is not deployed.
- Model IDs are case-sensitive and must match the live catalog exactly:
  `curl -s https://api.nexotao.com/models | jq -r '.models[].model'`.
- Per-token prices are **not** hardcoded. `<LivePricing />`
  (`components/live-pricing.tsx`) fetches `GET /models` at runtime. Keep it that
  way — do not replace it with a static table.
- The "headline per 100 juta token" table in `pages/{id,en}/model-harga.mdx` is
  the one hand-written price snapshot. After editing it, verify against live
  `/models`. Retail source of truth is `apps/api/db/migrations/*.up.sql`, served
  in micro-rupiah (`Rp 1 = 1,000,000 micro`).
- EN prices convert Rupiah at `FX = 18000` (`lib/models.ts`, overridable via
  `NEXT_PUBLIC_FX_DISPLAY`), matching `apps/api/internal/config/config.go`.

## Dated copy

- The changelog is an append-only history: add a new dated section at the top,
  do not rewrite past entries. Correct an outdated entry with an inline
  `> **Update (YYYY-MM-DD):**` note, the way the 2026-06-24 catalog-trim entry
  does.
- **Never leave a "change this manually on <date>" note.** The deadline passes,
  nobody remembers, and the docs advertise an expired price. If a page must
  state a deadline (like the Opus 5 introductory rate), state it as a fact with
  the date in the sentence — never as an instruction to a future editor.

## Working rules

- Nothing here is authenticated and nothing is stored. `pages/api/playground.ts`
  forwards a **user-supplied** key and must never log it, persist it, or
  substitute a server-side key.
- Never commit `.env` or any secret. Only `NEXT_PUBLIC_*` values reach the
  browser.
- Preserve unrelated changes in a dirty working tree.
- Before handoff run `npm run check` (typecheck, build).
- Do not push or deploy unless the user explicitly asks.
