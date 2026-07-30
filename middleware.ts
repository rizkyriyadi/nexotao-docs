export { middleware } from "nextra/locales"

export const config = {
  // Match all paths except Next internals, the API, and static files.
  // `api/` must keep its trailing slash: the bare token also matched content
  // routes such as /api-reference, which then never got a locale prefix.
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|logos|nexotao-logo.svg|og.png|sitemap.xml|robots.txt|llms.txt|llms.en.txt|llms-full.txt|llms-full.en.txt).*)",
  ],
}
