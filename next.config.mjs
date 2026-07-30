import nextra from "nextra"

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  defaultShowCopyCode: true,
  // Config keys and model ids only ever appear inside code blocks; excluding
  // them made the things users actually search for unfindable.
  search: { codeblocks: true },
})

export default withNextra({
  reactStrictMode: true,
  poweredByHeader: false,
  i18n: { locales: ["id", "en"], defaultLocale: "id" },
})
