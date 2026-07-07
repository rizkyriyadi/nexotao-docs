// First-touch funnel attribution (NEX-12 / NEX-7 plan).
// Measurement only: no user-facing copy, no money. We capture UTM + referrer on
// the first visit into a first-party cookie (`nex_attr`, first-touch wins) and a
// stable anonymous id (`nex_anon`), then a best-effort landing beacon joins the
// pre-signup visit to the eventual signup.
//
// Ported verbatim from the web app (web/lib/attribution.ts) so docs.nexotao.com
// traffic also lands in landing_events. Cookies (`nex_attr`/`nex_anon`) are scoped
// by origin, so the docs subdomain captures its own first touch.

export const ATTR_COOKIE = "nex_attr"
export const ANON_COOKIE = "nex_anon"

// ~180 days. First-touch attribution should outlive a typical consideration window.
export const ATTR_MAX_AGE_SEC = 180 * 24 * 60 * 60

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const
type UtmKey = (typeof UTM_KEYS)[number]

export type Attribution = Partial<Record<UtmKey, string>> & {
  referrer_host?: string
  landing_path: string
}

// Keys forwarded to the landing beacon body.
export type AttributionPayload = Partial<Attribution> & { anon_id: string }

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${ATTR_MAX_AGE_SEC}; SameSite=Lax${secure}`
}

// Trim and length-cap a captured value; drop empties. Mirrors the backend's
// strict input caps so we never ship oversized junk to the beacon.
function clean(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const v = value.trim().slice(0, 256)
  return v.length ? v : undefined
}

// Capture first-touch attribution from the current URL + document.referrer.
// First-touch wins: existing cookies are never overwritten. Returns the active
// attribution + anon id (existing or freshly generated) for the caller to use.
export function captureFirstTouch(): { attr: Attribution; anonId: string } {
  let anonId = readCookie(ANON_COOKIE)
  if (!anonId) {
    anonId = crypto.randomUUID()
    writeCookie(ANON_COOKIE, anonId)
  }

  const existing = readAttribution()
  if (existing) return { attr: existing, anonId }

  const params = new URLSearchParams(typeof location !== "undefined" ? location.search : "")
  const attr: Attribution = { landing_path: typeof location !== "undefined" ? location.pathname : "/" }
  for (const key of UTM_KEYS) {
    const v = clean(params.get(key))
    if (v) attr[key] = v
  }
  let referrerHost: string | undefined
  if (typeof document !== "undefined" && document.referrer) {
    try {
      const host = new URL(document.referrer).host
      // Ignore same-origin referrers — first-touch should reflect the inbound channel.
      if (host && host !== location.host) referrerHost = host
    } catch {
      /* malformed referrer — ignore */
    }
  }
  if (referrerHost) attr.referrer_host = referrerHost

  writeCookie(ATTR_COOKIE, JSON.stringify(attr))
  return { attr, anonId }
}

// Parse the first-touch cookie, if present and valid.
export function readAttribution(): Attribution | undefined {
  const raw = readCookie(ATTR_COOKIE)
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object") return parsed as Attribution
  } catch {
    /* corrupt cookie — treat as absent */
  }
  return undefined
}

// Build the payload of attribution keys to forward (beacon).
export function attributionPayload(): AttributionPayload {
  const anonId = readCookie(ANON_COOKIE)
  const attr = readAttribution()
  return { ...(attr ?? {}), anon_id: anonId ?? "" }
}
