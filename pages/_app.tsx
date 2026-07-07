import type { AppProps } from "next/app"
import { Analytics } from "@vercel/analytics/react"
import { AttributionCapture } from "@/components/attribution-capture"
import "nextra-theme-docs/style.css"
import "../styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <AttributionCapture />
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
