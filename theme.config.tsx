import React from "react"
import { useRouter } from "next/router"
import { useConfig, type DocsThemeConfig } from "nextra-theme-docs"

const SITE_URL = "https://docs.nexotao.com"
const OG_IMAGE = "https://www.nexotao.com/opengraph-image"

const Logo = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/nexotao-logo.svg" alt="Nexotao" width={22} height={22} style={{ borderRadius: 6 }} />
    <span>
      Nexotao <span style={{ color: "#A1A1AA", fontWeight: 400 }}>Docs</span>
    </span>
  </span>
)

const config: DocsThemeConfig = {
  logo: Logo,
  project: { link: "https://nexotao.com" },
  docsRepositoryBase: "https://github.com/rizkyriyadi/nexotao-docs/tree/main",
  color: { hue: 199, saturation: 90 },
  darkMode: true,
  nextThemes: { defaultTheme: "dark", forcedTheme: undefined },
  search: { placeholder: "Cari dokumentasi…" },
  feedback: { content: null },
  editLink: { content: null },
  gitTimestamp: null,
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: { title: "Di halaman ini", backToTop: true },
  navigation: { prev: true, next: true },
  footer: {
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
        <span>
          © {new Date().getFullYear()} Nexotao — reseller akses model AI. Bayar pakai Rupiah.
        </span>
        <span style={{ color: "#A1A1AA" }}>
          <a href="https://nexotao.com" style={{ color: "#BAE6FD" }}>
            nexotao.com
          </a>{" "}
          · Dokumentasi publik.
        </span>
      </div>
    ),
  },
  head: function Head() {
    const { frontMatter, title } = useConfig()
    const { asPath } = useRouter()
    const pageTitle = title && title !== "Index" ? `${title} — Nexotao Docs` : "Nexotao Docs"
    const description =
      frontMatter.description ||
      "Dokumentasi Nexotao: akses API model AI (Claude, GPT, DeepSeek), generate gambar, dan transcribe dengan saldo Rupiah."
    const url = `${SITE_URL}${asPath === "/" ? "" : asPath.split("#")[0].split("?")[0]}`
    return (
      <>
        <title>{pageTitle}</title>
        <meta httpEquiv="Content-Language" content="id" />
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Nexotao Docs" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <link rel="icon" href="/nexotao-logo.svg" />
      </>
    )
  },
}

export default config
