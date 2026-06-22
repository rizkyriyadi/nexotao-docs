import type { AppProps } from "next/app"
import { Analytics } from "@vercel/analytics/react"
import "nextra-theme-docs/style.css"
import "../styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
