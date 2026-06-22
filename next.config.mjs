import nextra from "nextra"

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  defaultShowCopyCode: true,
  search: { codeblocks: false },
})

export default withNextra({
  reactStrictMode: true,
  poweredByHeader: false,
  i18n: { locales: ["id", "en"], defaultLocale: "id" },
})
