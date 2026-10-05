import { useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { captureFirstTouch, readAnonId } from "@/lib/attribution"

// Prod backend is hardcoded across docs (lib/models.ts) — env-first mirrors the
// web-app pattern while defaulting to the same host the rest of the site uses.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.nexotao.com"

// Renders nothing. Captures first-touch attribution into first-party cookies
// (shared with www and dashboard) and records a page_view product event (POST
// /events, source "docs") for every route. The first one of a load carries the
// first-touch UTM and referrer. Mounted in the Nextra _app; pages router, so the
// effect is client-only without "use client". Measurement only.
export function AttributionCapture() {
  const { asPath } = useRouter()
  const path = asPath.split(/[?#]/)[0]
  const first = useRef(true)

  useEffect(() => {
    let attr: ReturnType<typeof captureFirstTouch>["attr"] | undefined
    try {
      attr = captureFirstTouch().attr
    } catch {
      // never let attribution break the page
    }
    const body: Record<string, unknown> = {
      source: "docs",
      anon_id: readAnonId() ?? "",
      events: [{ name: "page_view", path }],
    }
    if (first.current && attr) {
      const { referrer_host, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = attr
      const utm = Object.fromEntries(
        Object.entries({ utm_source, utm_medium, utm_campaign, utm_term, utm_content }).filter(([, v]) => v),
      )
      body.referrer_host = referrer_host
      if (Object.keys(utm).length) body.utm = utm
    }
    first.current = false
    try {
      fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
        credentials: "omit",
      }).catch(() => {
        /* best-effort */
      })
    } catch {
      /* best-effort */
    }
  }, [path])

  return null
}
