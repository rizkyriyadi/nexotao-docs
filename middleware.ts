export { middleware } from "nextra/locales"

export const config = {
  // Match all paths except Next internals, the API, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|nexotao-logo.svg|sitemap.xml|robots.txt).*)"],
}
