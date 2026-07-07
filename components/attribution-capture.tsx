import { useEffect } from "react"
import { captureFirstTouch } from "@/lib/attribution"

// Prod backend is hardcoded across docs (lib/models.ts) — env-first mirrors the
// web-app pattern while defaulting to the same host the rest of the site uses.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.nexotao.com"
// Once-per-visitor guard for the landing beacon. Scoped by anon id so a rotated
// cookie re-fires exactly once.
const BEACON_FLAG = "nex_landing_sent"

// Renders nothing. On first mount it captures first-touch attribution into
// first-party cookies and fires a single best-effort landing beacon. Mounted in
// the Nextra _app so docs.nexotao.com traffic lands in landing_events too —
// measurement only, zero UI impact, never blocks render. Ported from the web app
// (web/components/analytics/attribution-capture.tsx); no "use client" here because
// docs is a Next.js pages-router app (the effect is client-only regardless).
export function AttributionCapture() {
  useEffect(() => {
    let captured: ReturnType<typeof captureFirstTouch>
    try {
      captured = captureFirstTouch()
    } catch {
      return // never let attribution break the page
    }
    const { attr, anonId } = captured
    if (!anonId) return

    // Fire the landing beacon at most once per visitor.
    let alreadySent = false
    try {
      alreadySent = localStorage.getItem(BEACON_FLAG) === anonId
    } catch {
      /* storage blocked (private mode) — fall through and attempt once */
    }
    if (alreadySent) return

    const body = JSON.stringify({
      anon_id: anonId,
      utm_source: attr.utm_source,
      utm_medium: attr.utm_medium,
      utm_campaign: attr.utm_campaign,
      utm_term: attr.utm_term,
      utm_content: attr.utm_content,
      referrer_host: attr.referrer_host,
      landing_path: attr.landing_path,
    })

    // Fire-and-forget. keepalive lets it survive a fast navigation; we swallow
    // all errors (ad-blockers, offline, backend down) — conversion truth is
    // server-side, so a lost beacon only affects the visit-count denominator.
    try {
      fetch(`${API_BASE}/events/landing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        credentials: "omit",
      })
        .then(() => {
          try {
            localStorage.setItem(BEACON_FLAG, anonId)
          } catch {
            /* ignore */
          }
        })
        .catch(() => {
          /* best-effort */
        })
    } catch {
      /* best-effort */
    }
  }, [])

  return null
}
