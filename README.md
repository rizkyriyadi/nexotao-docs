# Nexotao Docs

Nextra 3 (Next.js 14, Pages Router) site serving **`docs.nexotao.com`** — the
public developer documentation: quickstart, endpoints, authentication, the
integration guides (Claude Code, Codex, VS Code, Aider/OpenCode), the model &
pricing reference, the FAQ, and the changelog.

This repository is documentation-only. It has no authenticated routes and no
database. Its single server route is `pages/api/playground.ts`, a same-origin
proxy that forwards a **user-supplied** `sk-nexo-` key to the live API so the
Playground page works without CORS; nothing is stored.

Four sibling repositories, four deployments:

| domain | repository | platform |
| --- | --- | --- |
| `docs.nexotao.com` | this repository (`apps/docs`) | Vercel |
| `www.nexotao.com` | `apps/landing` | Vercel |
| `dashboard.nexotao.com` | `apps/web` | Vercel |
| `api.nexotao.com` | `apps/api` (Go) | Railway |

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run check    # typecheck + build — run before handoff
```

## Layout

| what | where |
| --- | --- |
| Indonesian pages (default locale) | `pages/id/*.mdx` |
| English pages | `pages/en/*.mdx` |
| Sidebar order and labels | `pages/id/_meta.tsx`, `pages/en/_meta.tsx` |
| Live pricing table | `components/live-pricing.tsx` + `lib/models.ts` |
| Playground UI / proxy | `components/playground.tsx`, `pages/api/playground.ts` |
| Theme, SEO, locale switcher | `theme.config.tsx` |
| Sitemap (hand-maintained) | `public/sitemap.xml` |

Locales are Next.js i18n (`next.config.mjs`), default `id`, routed by
`middleware.ts` (`nextra/locales`). **Every page exists in both `pages/id` and
`pages/en` under the same slug** — the slugs stay Indonesian in both trees
(`/en/autentikasi`, not `/en/authentication`) so the locale switcher can swap
the prefix and land on the same page.

## Prices

Prices are not stored here. `<LivePricing />` fetches
`GET https://api.nexotao.com/models` in the browser and renders it, so the
per-million-token table is always in sync with the live catalog.

The one exception is the "headline per 100 juta token" table in
`pages/{id,en}/model-harga.mdx` — a hand-written marketing snapshot. Verify it
against live `/models` after any catalog change. The true source of truth for
the retail catalog is `apps/api/db/migrations/*.up.sql`.

## Deployment

Vercel deploys `origin/main` automatically. `public/sitemap.xml` is not
generated at build time — when you add or remove a page, add or remove its two
`<url>` entries (`/id/<slug>` and `/en/<slug>`) by hand.

Pushing here does not deploy the landing site, the dashboard, or the API.
