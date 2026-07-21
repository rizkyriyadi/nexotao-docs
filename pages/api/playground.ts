import type { NextApiRequest, NextApiResponse } from "next"

// Server-side proxy for the docs Playground. The browser posts here (same origin,
// no CORS), and we forward to Nexotao's OpenAI-compatible endpoint with the user's
// own key. The key is theirs and bills their own balance; nothing is stored.
export const config = { maxDuration: 60 }

type Body = {
  apiKey?: string
  model?: string
  system?: string
  message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }
  const { apiKey, model, system, message } = (req.body || {}) as Body

  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-nexo-")) {
    res.status(200).json({ error: "Masukkan API key yang valid (diawali sk-nexo-). / Enter a valid sk-nexo- key." })
    return
  }
  if (!model || !message || !String(message).trim()) {
    res.status(200).json({ error: "Pilih model dan tulis pesan. / Pick a model and type a message." })
    return
  }

  const messages: { role: string; content: string }[] = []
  if (system && String(system).trim()) messages.push({ role: "system", content: String(system) })
  messages.push({ role: "user", content: String(message) })

  try {
    const upstream = await fetch("https://api.nexotao.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 1024, messages }),
    })

    const costRp = upstream.headers.get("x-cost-rp") || ""
    const requestId = upstream.headers.get("x-request-id") || ""
    const raw = await upstream.text()
    let data: any = null
    try {
      data = JSON.parse(raw)
    } catch {
      /* non-JSON upstream body */
    }

    if (!upstream.ok) {
      const m = data?.error?.message ?? data?.error ?? raw ?? `HTTP ${upstream.status}`
      res.status(200).json({
        error: typeof m === "string" ? m : JSON.stringify(m),
        status: upstream.status,
      })
      return
    }

    const content = data?.choices?.[0]?.message?.content ?? ""
    res.status(200).json({
      content,
      costRp,
      requestId,
      usage: data?.usage ?? null,
      model: data?.model ?? model,
    })
  } catch {
    res.status(200).json({ error: "Gagal menghubungi API — coba lagi. / Could not reach the API — try again." })
  }
}
