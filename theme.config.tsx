import React from "react"
import { useRouter } from "nextra/hooks"
import { useConfig, type DocsThemeConfig } from "nextra-theme-docs"

const SITE_URL = "https://docs.nexotao.com"
const OG_IMAGE = "https://docs.nexotao.com/og.png"

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
  i18n: [
    { locale: "id", name: "Bahasa Indonesia" },
    { locale: "en", name: "English" },
  ],
  search: {
    // Nextra renders this inside the Search component, so hooks are legal here.
    // Reading globalThis.location instead would differ between SSR and client
    // and break hydration.
    placeholder: function SearchPlaceholder() {
      const { locale } = useRouter()
      return locale === "en" ? "Search documentation…" : "Cari dokumentasi…"
    },
  },
  // Both link to GitHub issues / file paths on a private repo — a dead link is
  // worse than no link, so they stay off until the repo is public.
  feedback: { content: null },
  editLink: { content: null },
  gitTimestamp: function GitTimestamp({ timestamp }) {
    const { locale } = useRouter()
    const isEn = locale === "en"
    return (
      <>
        {isEn ? "Last updated on" : "Terakhir diperbarui"}{" "}
        <time dateTime={timestamp.toISOString()}>
          {timestamp.toLocaleDateString(isEn ? "en" : "id", { day: "numeric", month: "long", year: "numeric" })}
        </time>
      </>
    )
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    title: function TocTitle() {
      const { locale } = useRouter()
      return locale === "en" ? "On this page" : "Di halaman ini"
    },
    backToTop: true,
  },
  navigation: { prev: true, next: true },
  footer: {
    content: function Footer() {
      const { locale } = useRouter()
      const year = new Date().getFullYear()
      if (locale === "en") {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
            <span>© {year} Nexotao — reseller for AI model access. Pay in Rupiah.</span>
            <span style={{ color: "#A1A1AA" }}>
              <a href="https://nexotao.com" style={{ color: "#BAE6FD" }}>
                nexotao.com
              </a>{" "}
              · Public documentation.
            </span>
          </div>
        )
      }
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
          <span>© {year} Nexotao — reseller akses model AI. Bayar pakai Rupiah.</span>
          <span style={{ color: "#A1A1AA" }}>
            <a href="https://nexotao.com" style={{ color: "#BAE6FD" }}>
              nexotao.com
            </a>{" "}
            · Dokumentasi publik.
          </span>
        </div>
      )
    },
  },
  head: function Head() {
    const { frontMatter, title } = useConfig()
    const { asPath, locale } = useRouter()
    const isEn = locale === "en"
    const pageTitle = title && title !== "Index" ? `${title} — Nexotao Docs` : "Nexotao Docs"
    const description =
      frontMatter.description ||
      (isEn
        ? "Nexotao documentation: access AI model APIs (Claude, DeepSeek) with a Rupiah balance."
        : "Dokumentasi Nexotao: akses API model AI (Claude, DeepSeek) dengan saldo Rupiah.")
    const raw = asPath.split("#")[0].split("?")[0]
    // With Nextra folder-based i18n the path is prefixed with /id or /en; strip it
    // to get the bare slug, then re-attach the locale below.
    const bare = raw.replace(/^\/(id|en)(?=\/|$)/, "")
    const path = bare === "/" || bare === "" ? "" : bare
    // Always locale-prefixed. The bare URL 307-redirects and resolves by cookie
    // or Accept-Language, so it can serve EN content under an ID canonical.
    const idUrl = `${SITE_URL}/id${path}`
    const enUrl = `${SITE_URL}/en${path}`
    const url = isEn ? enUrl : idUrl
    // Retired pages stay reachable so old inbound links land on the migration
    // notice rather than a 404, but they are out of the sidebar and out of the
    // sitemap — keeping them out of the index too avoids advertising a product
    // we no longer sell.
    const retired = /^\/(gambar|transcribe)$/.test(path)
    return (
      <>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        {retired && <meta name="robots" content="noindex, follow" />}
        <link rel="canonical" href={url} />
        <link rel="alternate" hrefLang="id" href={idUrl} />
        <link rel="alternate" hrefLang="en" href={enUrl} />
        <link rel="alternate" hrefLang="x-default" href={idUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Nexotao Docs" />
        <meta property="og:locale" content={isEn ? "en_US" : "id_ID"} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Nexotao Docs" />
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
