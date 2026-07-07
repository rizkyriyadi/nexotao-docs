import React from "react"

/**
 * ToolLogo — brand mark on a white rounded "chip" so monochrome logos stay
 * visible on the dark docs theme. `src` points at /public/logos/*.svg.
 */
export function ToolLogo({
  src,
  alt,
  size = 28,
}: {
  src: string
  alt: string
  size?: number
}) {
  const pad = Math.round(size * 0.22)
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size + pad * 2,
        height: size + pad * 2,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
        flex: "0 0 auto",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={size} height={size} style={{ display: "block" }} />
    </span>
  )
}

type ToolItem = {
  logo: string
  name: string
  desc: string
  href: string
  mode: "anthropic" | "openai" | "both"
}

const MODE_LABEL: Record<ToolItem["mode"], string> = {
  anthropic: "Anthropic-compat",
  openai: "OpenAI-compat",
  both: "Anthropic + OpenAI",
}

const MODE_COLOR: Record<ToolItem["mode"], string> = {
  anthropic: "#D97757",
  openai: "#10A37F",
  both: "#38BDF8",
}

/** ToolGrid — responsive card grid used on the Integrations hub page. */
export function ToolGrid({ items }: { items: ToolItem[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
        gap: 14,
        marginTop: 20,
      }}
    >
      {items.map((it) => (
        <a
          key={it.href + it.name}
          href={it.href}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: 16,
            borderRadius: 14,
            border: "1px solid rgba(148,163,184,0.22)",
            background: "rgba(148,163,184,0.05)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ToolLogo src={it.logo} alt={it.name} size={26} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>{it.name}</span>
          </div>
          <span style={{ fontSize: 13, color: "#A1A1AA", lineHeight: 1.45 }}>{it.desc}</span>
          <span
            style={{
              alignSelf: "flex-start",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 999,
              color: MODE_COLOR[it.mode],
              border: `1px solid ${MODE_COLOR[it.mode]}55`,
              background: `${MODE_COLOR[it.mode]}14`,
            }}
          >
            {MODE_LABEL[it.mode]}
          </span>
        </a>
      ))}
    </div>
  )
}
