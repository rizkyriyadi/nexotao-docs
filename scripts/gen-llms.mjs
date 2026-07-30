// Emits /llms.txt and /llms-full.txt (the llmstxt.org convention that
// Anthropic, Stripe and Vercel already publish) so an AI agent pointed at
// docs.nexotao.com gets the real source text instead of scraping rendered HTML.
//
// Runs from `prebuild`, so the output always matches the .mdx actually shipping.
// The generated files are committed too, which keeps `next dev` honest.
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const SITE = "https://docs.nexotao.com"

// `id` is the default locale, so it takes the conventional /llms.txt filename
// and English gets the suffixed variant.
const LOCALES = {
  id: {
    file: "llms.txt",
    full: "llms-full.txt",
    blurb:
      "Nexotao adalah reseller akses API model AI (Claude, GPT, Grok, DeepSeek) dengan satu saldo Rupiah. Kompatibel dengan SDK Anthropic dan OpenAI. Dokumentasi ini berbahasa Indonesia; versi Inggris ada di " +
      `${SITE}/llms.en.txt.`,
    section: "## Halaman",
    fullLine: (url) => `Teks lengkap semua halaman dalam satu berkas: ${url}`,
  },
  en: {
    file: "llms.en.txt",
    full: "llms-full.en.txt",
    blurb:
      "Nexotao resells AI model API access (Claude, GPT, Grok, DeepSeek) against a single Rupiah balance, compatible with the Anthropic and OpenAI SDKs. This is the English documentation; the Indonesian version is at " +
      `${SITE}/llms.txt.`,
    section: "## Pages",
    fullLine: (url) => `Full text of every page in one file: ${url}`,
  },
}

// Parse the YAML-ish frontmatter every page in this repo carries. A real YAML
// parser would be overkill: the only keys are title and description, both flat.
function frontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { meta: {}, body: source }
  const meta = {}
  for (const line of match[1].split("\n")) {
    const at = line.indexOf(":")
    if (at === -1) continue
    meta[line.slice(0, at).trim()] = line
      .slice(at + 1)
      .trim()
      .replace(/^["']|["']$/g, "")
  }
  return { meta, body: source.slice(match[0].length) }
}

// The sidebar order in _meta.tsx is the order a reader should follow, so reuse
// it rather than sorting alphabetically. Separators and hidden pages drop out.
function orderedSlugs(locale) {
  const meta = readFileSync(join(ROOT, "pages", locale, "_meta.tsx"), "utf8")
  const order = []
  const hidden = new Set()
  for (const m of meta.matchAll(/^\s{2}"?([\w-]+)"?:\s*(.*)$/gm)) {
    const [, slug, rest] = m
    if (slug.startsWith("--")) continue
    // Retired pages stay reachable so old links land on a notice instead of a
    // 404, but they are not part of the documentation an agent should read.
    if (rest.includes('display: "hidden"')) {
      hidden.add(slug)
      continue
    }
    order.push(slug)
  }
  const present = new Set(
    readdirSync(join(ROOT, "pages", locale))
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, "")),
  )
  const known = order.filter((s) => present.has(s))
  // Anything added to pages/ but not yet to _meta.tsx still belongs in the index.
  const extra = [...present].filter((s) => !known.includes(s) && !hidden.has(s)).sort()
  return [...known, ...extra]
}

for (const [locale, copy] of Object.entries(LOCALES)) {
  const slugs = orderedSlugs(locale)
  const pages = slugs.map((slug) => {
    const source = readFileSync(join(ROOT, "pages", locale, `${slug}.mdx`), "utf8")
    const { meta, body } = frontmatter(source)
    return {
      slug,
      url: `${SITE}/${locale}/${slug === "index" ? "" : slug}`.replace(/\/$/, ""),
      title: meta.title ?? slug,
      description: meta.description ?? "",
      body: body.trim(),
    }
  })

  const index = [
    "# Nexotao Docs",
    "",
    `> ${copy.blurb}`,
    "",
    copy.section,
    "",
    ...pages.map((p) => `- [${p.title}](${p.url})${p.description ? `: ${p.description}` : ""}`),
    "",
    copy.fullLine(`${SITE}/${copy.full}`),
    "",
  ].join("\n")

  const full = [
    "# Nexotao Docs",
    "",
    `> ${copy.blurb}`,
    "",
    ...pages.flatMap((p) => [`---`, ``, `# ${p.title}`, ``, `Source: ${p.url}`, ``, p.body, ``]),
  ].join("\n")

  writeFileSync(join(ROOT, "public", copy.file), index)
  writeFileSync(join(ROOT, "public", copy.full), full)
  console.log(`gen-llms: ${locale} — ${pages.length} pages`)
}
