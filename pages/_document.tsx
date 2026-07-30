import Document, { Head, Html, Main, NextScript, type DocumentContext, type DocumentInitialProps } from "next/document"

const LOCALES = ["id", "en"] as const
const DEFAULT_LOCALE = "id"

type Props = DocumentInitialProps & { lang: string }

/**
 * Nextra unsets `nextConfig.i18n` at build time so it can own routing itself,
 * which means Next never injects `lang` on <html>. Derive it from the URL
 * prefix instead (WCAG 2.1 SC 3.1.1).
 */
function langFromPath(path: string | undefined): string {
  const first = (path ?? "").split(/[?#]/)[0].split("/").filter(Boolean)[0]
  return LOCALES.includes(first as (typeof LOCALES)[number]) ? (first as string) : DEFAULT_LOCALE
}

export default class NexotaoDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext): Promise<Props> {
    const initialProps = await Document.getInitialProps(ctx)
    const fromLocale = LOCALES.includes(ctx.locale as (typeof LOCALES)[number]) ? (ctx.locale as string) : undefined
    return { ...initialProps, lang: fromLocale ?? langFromPath(ctx.asPath ?? ctx.pathname) }
  }

  render() {
    return (
      <Html lang={this.props.lang}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
