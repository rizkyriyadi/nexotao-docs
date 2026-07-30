// Guards the two link defects that shipped to production and are invisible to
// `next build`: an English page linking to a bare path silently serves the
// Indonesian page (the default locale owns `/`), and a link to a page that was
// renamed or never created 404s. Neither is a type error, so tsc cannot see them.
//
// Run via `npm run check`. Exits non-zero with a file:line list on failure.
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const PAGES = new URL("../pages/", import.meta.url).pathname
const LOCALES = ["id", "en"]

// Static assets and route handlers are served from the root regardless of
// locale, so a bare path is correct for them.
const ASSET_PREFIXES = ["/logos/", "/api/"]
const ASSET_PATHS = ["/nexotao-logo.svg", "/sitemap.xml", "/robots.txt", "/og.png", "/favicon.ico"]

const slugs = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    new Set(
      readdirSync(join(PAGES, locale))
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => f.replace(/\.mdx$/, "")),
    ),
  ]),
)

const isAsset = (path) =>
  ASSET_PATHS.includes(path) || ASSET_PREFIXES.some((p) => path.startsWith(p))

const errors = []

for (const locale of LOCALES) {
  for (const file of readdirSync(join(PAGES, locale)).filter((f) => f.endsWith(".mdx"))) {
    const rel = `pages/${locale}/${file}`
    const lines = readFileSync(join(PAGES, locale, file), "utf8").split("\n")

    lines.forEach((line, i) => {
      const at = `${rel}:${i + 1}`
      // Markdown links and bare href attributes pointing at an absolute path.
      for (const m of line.matchAll(/\]\((\/[^)\s]*)\)|href="(\/[^"]*)"/g)) {
        const target = (m[1] ?? m[2]).split("#")[0].split("?")[0]
        if (target === "" || isAsset(target)) continue

        const segments = target.split("/").filter(Boolean)
        const prefix = LOCALES.includes(segments[0]) ? segments[0] : null

        if (prefix === null) {
          // The default locale owns bare paths; an English page must not use them.
          if (locale === "en") {
            errors.push(`${at}  EN page links to bare "${target}" — prefix it with /en`)
            continue
          }
        } else if (prefix !== locale) {
          errors.push(`${at}  ${locale.toUpperCase()} page links into /${prefix} — "${target}"`)
          continue
        }

        const slug = (prefix ? segments.slice(1) : segments).join("/") || "index"
        if (!slugs[locale].has(slug)) {
          errors.push(`${at}  link target does not exist: "${target}" (pages/${locale}/${slug}.mdx)`)
        }
      }
    })
  }
}

if (errors.length > 0) {
  console.error(`check-links: ${errors.length} problem(s)\n`)
  for (const e of errors) console.error("  " + e)
  process.exit(1)
}

console.log("check-links: ok")
