import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "nextra/hooks"
import { fetchModels, type Model, type Locale } from "../lib/models"

const T = {
  id: {
    key: "API key",
    keyPh: "sk-nexo-...",
    keyHint: "Disimpan hanya di browser kamu. Belum punya key? Buat di dashboard nexotao.com.",
    model: "Model",
    system: "Instruksi sistem (opsional)",
    systemPh: "mis. Kamu asisten yang ringkas dan ramah.",
    message: "Pesan kamu",
    messagePh: "Tulis sesuatu, mis. Jelaskan apa itu QRIS dalam 2 kalimat.",
    send: "Kirim",
    sending: "Mengirim…",
    response: "Jawaban",
    cost: "Biaya",
    tokens: "token",
    reqid: "ID request",
    emptyKey: "Masukkan API key kamu dulu.",
    emptyMsg: "Tulis pesan dulu.",
    loadingModels: "Memuat daftar model…",
    modelsFailed: "Gagal memuat model — pilih dari daftar bawaan.",
    note: "Playground memakai endpoint /v1/chat/completions dan memotong saldo Rupiah kamu sesuai token yang dipakai (dibatasi 1024 token output).",
  },
  en: {
    key: "API key",
    keyPh: "sk-nexo-...",
    keyHint: "Stored only in your browser. No key yet? Create one in the nexotao.com dashboard.",
    model: "Model",
    system: "System instruction (optional)",
    systemPh: "e.g. You are a concise, friendly assistant.",
    message: "Your message",
    messagePh: "Type something, e.g. Explain consistent hashing in 2 sentences.",
    send: "Send",
    sending: "Sending…",
    response: "Response",
    cost: "Cost",
    tokens: "tokens",
    reqid: "Request ID",
    emptyKey: "Enter your API key first.",
    emptyMsg: "Type a message first.",
    loadingModels: "Loading model list…",
    modelsFailed: "Couldn't load models — pick from the built-in list.",
    note: "The playground uses the /v1/chat/completions endpoint and deducts your Rupiah balance by the tokens used (output capped at 1024 tokens).",
  },
} as const

const FALLBACK_MODELS = [
  "claude-opus-4-8",
  "claude-sonnet-4-6",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
  "gpt-5-mini",
  "DeepSeek-V4-Pro",
  "DeepSeek-V4-Flash",
]

type Result = {
  content?: string
  costRp?: string
  requestId?: string
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null
  model?: string
  error?: string
  status?: number
}

export function Playground() {
  const { locale } = useRouter()
  const loc: Locale = locale === "en" ? "en" : "id"
  const t = T[loc]

  const [apiKey, setApiKey] = useState("")
  const [models, setModels] = useState<string[] | null>(null)
  const [model, setModel] = useState("claude-opus-4-8")
  const [system, setSystem] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  // Restore the key from localStorage (convenience — browser-only, never sent anywhere but the proxy).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("nx_pg_key")
      if (saved) setApiKey(saved)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    let alive = true
    fetchModels()
      .then((ms: Model[]) => {
        if (!alive) return
        const ids = ms.filter((m) => m.modality === "text").map((m) => m.model)
        setModels(ids.length ? ids : FALLBACK_MODELS)
      })
      .catch(() => alive && setModels(FALLBACK_MODELS))
    return () => {
      alive = false
    }
  }, [])

  const modelList = models ?? FALLBACK_MODELS
  const canSend = useMemo(() => apiKey.trim() && message.trim() && !loading, [apiKey, message, loading])

  async function run() {
    if (!apiKey.trim()) {
      setResult({ error: t.emptyKey })
      return
    }
    if (!message.trim()) {
      setResult({ error: t.emptyMsg })
      return
    }
    try {
      window.localStorage.setItem("nx_pg_key", apiKey.trim())
    } catch {
      /* ignore */
    }
    setLoading(true)
    setResult(null)
    try {
      const r = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim(), model, system, message }),
      })
      setResult(await r.json())
    } catch {
      setResult({ error: t.modelsFailed })
    } finally {
      setLoading(false)
    }
  }

  const border = "1px solid rgba(148,163,184,0.28)"
  const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }
  const field: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 11px",
    borderRadius: 8,
    border,
    background: "transparent",
    color: "inherit",
    fontSize: 14,
    fontFamily: "inherit",
  }

  return (
    <div style={{ border, borderRadius: 14, padding: 18, marginTop: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>{t.key}</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={t.keyPh}
          style={{ ...field, fontFamily: "ui-monospace,Menlo,Consolas,monospace" }}
          autoComplete="off"
          spellCheck={false}
        />
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 5 }}>{t.keyHint}</div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label}>{t.model}</label>
        <select value={model} onChange={(e) => setModel(e.target.value)} style={field}>
          {modelList.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {!models && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 5 }}>{t.loadingModels}</div>}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label}>{t.system}</label>
        <input value={system} onChange={(e) => setSystem(e.target.value)} placeholder={t.systemPh} style={field} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label}>{t.message}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.messagePh}
          rows={4}
          style={{ ...field, resize: "vertical" }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSend) run()
          }}
        />
      </div>

      <button
        onClick={run}
        disabled={!canSend}
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          background: canSend ? "#0ea5e9" : "rgba(148,163,184,0.35)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          cursor: canSend ? "pointer" : "not-allowed",
        }}
      >
        {loading ? t.sending : t.send}
      </button>

      {result && (
        <div style={{ marginTop: 18 }}>
          {result.error ? (
            <div
              style={{
                border: "1px solid rgba(239,68,68,0.4)",
                background: "rgba(239,68,68,0.08)",
                color: "#fca5a5",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              {result.error}
              {result.status ? ` (HTTP ${result.status})` : ""}
            </div>
          ) : (
            <>
              <label style={label}>{t.response}</label>
              <div
                style={{
                  border,
                  borderRadius: 10,
                  padding: "12px 14px",
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                  lineHeight: 1.6,
                  background: "rgba(148,163,184,0.06)",
                }}
              >
                {result.content || "—"}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {result.costRp && (
                  <span>
                    {t.cost}: <strong style={{ color: "#5ea500" }}>Rp {result.costRp}</strong>
                  </span>
                )}
                {result.model && <span>model: {result.model}</span>}
                {result.usage?.total_tokens != null && (
                  <span>
                    {result.usage.total_tokens} {t.tokens}
                  </span>
                )}
                {result.requestId && <span>{t.reqid}: {result.requestId}</span>}
              </div>
            </>
          )}
        </div>
      )}

      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 16, marginBottom: 0, lineHeight: 1.55 }}>{t.note}</p>
    </div>
  )
}
