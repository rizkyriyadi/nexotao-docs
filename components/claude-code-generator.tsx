import React, { useEffect, useMemo, useState } from "react"
import { fetchModels, type Model } from "../lib/models"

const ANTHROPIC_BASE_URL = "https://api.nexotao.com"
const FALLBACK_OPUS = "claude-opus-4-8"
const FALLBACK_SONNET = "claude-sonnet-4-6"
const KEY_PLACEHOLDER = "sk-nexo-..."

function buildSettings(token: string, model: string, opus: string, sonnet: string) {
  return JSON.stringify(
    {
      env: {
        ANTHROPIC_BASE_URL,
        ANTHROPIC_AUTH_TOKEN: token,
        ANTHROPIC_MODEL: model,
        ANTHROPIC_DEFAULT_OPUS_MODEL: opus,
        ANTHROPIC_DEFAULT_SONNET_MODEL: sonnet,
        ANTHROPIC_DEFAULT_HAIKU_MODEL: sonnet,
        CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS: "1",
      },
      skipDangerousModePermissionPrompt: true,
    },
    null,
    2
  )
}

function buildExports(token: string, model: string, opus: string, sonnet: string) {
  return [
    `export ANTHROPIC_BASE_URL="${ANTHROPIC_BASE_URL}"`,
    `export ANTHROPIC_AUTH_TOKEN="${token}"`,
    `export ANTHROPIC_MODEL="${model}"`,
    `export ANTHROPIC_DEFAULT_OPUS_MODEL="${opus}"`,
    `export ANTHROPIC_DEFAULT_SONNET_MODEL="${sonnet}"`,
    `export ANTHROPIC_DEFAULT_HAIKU_MODEL="${sonnet}"`,
    `export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS="1"`,
  ].join("\n")
}

function CopyBox({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div style={{ marginTop: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span className="nx-note">{label}</span>
        <button className="nx-btn secondary" style={{ height: "1.9rem" }} onClick={copy}>
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <pre
        style={{
          overflowX: "auto",
          borderRadius: "0.6rem",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.4)",
          padding: "0.9rem",
          fontSize: "0.8rem",
          margin: 0,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Generator config Claude Code untuk Nexotao. Publik: pilih model Claude (live
// dari GET /models) + tempel API key sendiri. Tak ada data ter-auth.
export function ClaudeCodeGenerator() {
  const [models, setModels] = useState<Model[]>([])
  const [model, setModel] = useState("")
  const [key, setKey] = useState("")

  useEffect(() => {
    let alive = true
    fetchModels()
      .then((m) => alive && setModels(m.filter((x) => x.modality === "text")))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const claudeModels = models.filter((m) => m.provider === "azure-anthropic")
  const selectedModel =
    model || claudeModels.find((m) => m.tier === "sonnet")?.model || claudeModels[0]?.model || FALLBACK_SONNET
  const opus = models.find((m) => m.tier === "opus")?.model ?? FALLBACK_OPUS
  const sonnet = models.find((m) => m.tier === "sonnet")?.model ?? FALLBACK_SONNET
  const token = key.trim() || KEY_PLACEHOLDER

  const settings = useMemo(() => buildSettings(token, selectedModel, opus, sonnet), [token, selectedModel, opus, sonnet])
  const exports = useMemo(() => buildExports(token, selectedModel, opus, sonnet), [token, selectedModel, opus, sonnet])

  return (
    <div
      style={{
        borderRadius: "0.75rem",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
        padding: "1.1rem",
        marginTop: "1rem",
      }}
    >
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label className="nx-note" style={{ display: "block", marginBottom: 6, color: "#FAFAFA" }}>
            API key Nexotao
          </label>
          <input
            className="nx-field"
            placeholder={KEY_PLACEHOLDER}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            spellCheck={false}
          />
          <p className="nx-note" style={{ marginTop: 6 }}>
            Tempel API key milikmu. Diproses di browser, tidak dikirim ke mana pun.
          </p>
        </div>
        <div>
          <label className="nx-note" style={{ display: "block", marginBottom: 6, color: "#FAFAFA" }}>
            Model utama (ANTHROPIC_MODEL)
          </label>
          <select className="nx-field" value={selectedModel} onChange={(e) => setModel(e.target.value)}>
            {claudeModels.length === 0 && <option value={FALLBACK_SONNET}>{FALLBACK_SONNET}</option>}
            {claudeModels.map((m) => (
              <option key={m.model} value={m.model}>
                {m.display_name} — {m.model}
              </option>
            ))}
          </select>
          <p className="nx-note" style={{ marginTop: 6 }}>
            Claude Code memakai endpoint Anthropic, jadi pilih model Claude. Background task (haiku)
            dipetakan ke {sonnet}.
          </p>
        </div>
      </div>

      <CopyBox label="settings.json (~/.claude/settings.json)" code={settings} />
      <CopyBox label="export (shell)" code={exports} />
    </div>
  )
}
