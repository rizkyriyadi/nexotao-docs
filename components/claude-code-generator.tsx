import React, { useEffect, useId, useMemo, useState } from "react"
import { useRouter } from "nextra/hooks"
import { fetchModels, type Model } from "../lib/models"

const T = {
  id: {
    copy: "Salin",
    copied: "Tersalin",
    keyLabel: "API key Nexotao",
    keyHelp: "Tempel API key milikmu. Diproses di browser, tidak dikirim ke mana pun.",
    balanceLabel: "Saldo yang kamu pakai",
    balancePaid: "Sudah pernah top up",
    balanceTrial: "Masih saldo trial",
    trialHelp: "Saldo trial hanya bisa dipakai model tertentu, jadi semua slot model diisi ",
    osLabel: "Sistem operasi",
    osWindows: "Windows (PowerShell)",
    osUnix: "macOS / Linux",
    modelLabel: "Model utama (ANTHROPIC_MODEL)",
    modelHelpA: "Background task (haiku) dipetakan ke ",
    scriptLabelWin: "Tempel di PowerShell — membuat %USERPROFILE%\\.claude\\settings.json (file lama dicadangkan ke .bak)",
    scriptLabelUnix: "Tempel di terminal — membuat ~/.claude/settings.json (file lama dicadangkan ke .bak)",
    settingsLabel: "Atau salin manual: settings.json",
    savedAt: "Config Nexotao tersimpan di",
  },
  en: {
    copy: "Copy",
    copied: "Copied",
    keyLabel: "Nexotao API key",
    keyHelp: "Paste your own API key. Processed in the browser, never sent anywhere.",
    balanceLabel: "Balance you are using",
    balancePaid: "I have topped up",
    balanceTrial: "Still on the trial balance",
    trialHelp: "The trial balance only works with specific models, so every model slot is set to ",
    osLabel: "Operating system",
    osWindows: "Windows (PowerShell)",
    osUnix: "macOS / Linux",
    modelLabel: "Primary model (ANTHROPIC_MODEL)",
    modelHelpA: "The background task (haiku) is mapped to ",
    scriptLabelWin: "Paste into PowerShell — creates %USERPROFILE%\\.claude\\settings.json (an existing file is backed up to .bak)",
    scriptLabelUnix: "Paste into your terminal — creates ~/.claude/settings.json (an existing file is backed up to .bak)",
    settingsLabel: "Or copy by hand: settings.json",
    savedAt: "Nexotao config saved to",
  },
} as const

type Dict = { [K in keyof (typeof T)["id"]]: string }
type OS = "windows" | "unix"

const ANTHROPIC_BASE_URL = "https://api.nexotao.com"
// Only used when GET /models is unreachable; the live catalog wins otherwise.
const FALLBACK_OPUS = "claude-opus-5-5"
const FALLBACK_SONNET = "claude-sonnet-5"
const FALLBACK_HAIKU = "claude-haiku-4-5"
const FALLBACK_CLAUDE_MODELS = [FALLBACK_SONNET, FALLBACK_OPUS, FALLBACK_HAIKU]
// The signup trial fences spend to trial_config.allowed_models (apps/api), which
// only an authenticated GET /trial exposes. qwen3-coder-next is the one allowed
// model that speaks the Anthropic wire with tool use, which Claude Code needs.
const TRIAL_MODEL = "qwen3-coder-next"
const KEY_PLACEHOLDER = "sk-nexo-..."

function versionOf(id: string): number[] {
  return id
    .split("-")
    .filter((p) => /^\d+$/.test(p))
    .map(Number)
}

function newer(a: string, b: string): boolean {
  const va = versionOf(a)
  const vb = versionOf(b)
  for (let i = 0; i < Math.max(va.length, vb.length); i++) {
    const x = va[i] ?? -1
    const y = vb[i] ?? -1
    if (x !== y) return x > y
  }
  return false
}

function newestOfTier(models: Model[], tier: string, fallback: string): string {
  return models
    .filter((m) => m.tier === tier)
    .reduce<string | undefined>((best, m) => (!best || newer(m.model, best) ? m.model : best), undefined) ?? fallback
}

function buildSettings(token: string, model: string, opus: string, sonnet: string, haiku: string) {
  return JSON.stringify(
    {
      env: {
        ANTHROPIC_BASE_URL,
        ANTHROPIC_AUTH_TOKEN: token,
        ANTHROPIC_MODEL: model,
        ANTHROPIC_DEFAULT_OPUS_MODEL: opus,
        ANTHROPIC_DEFAULT_SONNET_MODEL: sonnet,
        ANTHROPIC_DEFAULT_HAIKU_MODEL: haiku,
        CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS: "1",
      },
    },
    null,
    2
  )
}

// PowerShell 5.1 (the Windows default) writes a BOM with Set-Content -Encoding
// UTF8, which breaks JSON parsers; WriteAllText writes UTF-8 without one.
function buildScript(os: OS, settings: string, savedAt: string) {
  if (os === "windows") {
    return `$dir = Join-Path $env:USERPROFILE ".claude"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$file = Join-Path $dir "settings.json"
if (Test-Path $file) { Copy-Item $file "$file.bak" -Force }
$body = @'
${settings}
'@
[System.IO.File]::WriteAllText($file, $body)
Write-Host "${savedAt} $file"`
  }
  return `mkdir -p ~/.claude
[ -f ~/.claude/settings.json ] && cp ~/.claude/settings.json ~/.claude/settings.json.bak
cat > ~/.claude/settings.json <<'EOF'
${settings}
EOF
echo "${savedAt} ~/.claude/settings.json"`
}

function detectOS(): OS {
  if (typeof navigator === "undefined") return "unix"
  const ua = `${navigator.userAgent} ${navigator.platform ?? ""}`
  return /win/i.test(ua) && !/darwin|mac/i.test(ua) ? "windows" : "unix"
}

function CopyBox({ label, code, t }: { label: string; code: string; t: Dict }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div style={{ marginTop: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
        <span className="nx-note">{label}</span>
        <button className="nx-btn secondary" style={{ height: "1.9rem", flexShrink: 0 }} onClick={copy}>
          {copied ? t.copied : t.copy}
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

function Field({ id, label, children, help }: { id: string; label: string; children: React.ReactNode; help?: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="nx-note" style={{ display: "block", marginBottom: 6, color: "#FAFAFA" }}>
        {label}
      </label>
      {children}
      {help && (
        <p className="nx-note" style={{ marginTop: 6 }}>
          {help}
        </p>
      )}
    </div>
  )
}

// Generator config Claude Code untuk Nexotao. Publik: pilih model Claude (live
// dari GET /models) + tempel API key sendiri, lalu salin satu perintah yang
// menulis settings.json. Tak ada data ter-auth.
export function ClaudeCodeGenerator() {
  const { locale } = useRouter()
  const t = locale === "en" ? T.en : T.id
  const uid = useId()
  const [models, setModels] = useState<Model[]>([])
  const [model, setModel] = useState("")
  const [key, setKey] = useState("")
  const [trial, setTrial] = useState(false)
  const [os, setOS] = useState<OS>("unix")

  useEffect(() => setOS(detectOS()), [])

  useEffect(() => {
    let alive = true
    fetchModels()
      .then((m) => alive && setModels(m.filter((x) => x.modality === "text")))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const claudeModels = models.filter((m) => m.provider === "anthropic" && m.api_style !== "openai")
  const opus = newestOfTier(claudeModels, "opus", FALLBACK_OPUS)
  const sonnet = newestOfTier(claudeModels, "sonnet", FALLBACK_SONNET)
  const haiku = newestOfTier(claudeModels, "haiku", FALLBACK_HAIKU)
  const selected = trial ? TRIAL_MODEL : model || sonnet
  const slots = trial ? [TRIAL_MODEL, TRIAL_MODEL, TRIAL_MODEL] : [opus, sonnet, haiku]
  const token = key.trim() || KEY_PLACEHOLDER

  const settings = useMemo(
    () => buildSettings(token, selected, slots[0], slots[1], slots[2]),
    [token, selected, slots[0], slots[1], slots[2]]
  )
  const script = useMemo(() => buildScript(os, settings, t.savedAt), [os, settings, t.savedAt])

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
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Field id={`${uid}-key`} label={t.keyLabel} help={t.keyHelp}>
          <input
            id={`${uid}-key`}
            className="nx-field"
            placeholder={KEY_PLACEHOLDER}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            spellCheck={false}
          />
        </Field>
        <Field id={`${uid}-os`} label={t.osLabel}>
          <select id={`${uid}-os`} className="nx-field" value={os} onChange={(e) => setOS(e.target.value as OS)}>
            <option value="windows">{t.osWindows}</option>
            <option value="unix">{t.osUnix}</option>
          </select>
        </Field>
        <Field
          id={`${uid}-balance`}
          label={t.balanceLabel}
          help={trial ? `${t.trialHelp}${TRIAL_MODEL}.` : undefined}
        >
          <select
            id={`${uid}-balance`}
            className="nx-field"
            value={trial ? "trial" : "paid"}
            onChange={(e) => setTrial(e.target.value === "trial")}
          >
            <option value="paid">{t.balancePaid}</option>
            <option value="trial">{t.balanceTrial}</option>
          </select>
        </Field>
        {!trial && (
          <Field id={`${uid}-model`} label={t.modelLabel} help={`${t.modelHelpA}${haiku}.`}>
            <select id={`${uid}-model`} className="nx-field" value={selected} onChange={(e) => setModel(e.target.value)}>
              {claudeModels.length === 0 &&
                FALLBACK_CLAUDE_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              {claudeModels.map((m) => (
                <option key={m.model} value={m.model}>
                  {m.display_name} — {m.model}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <CopyBox label={os === "windows" ? t.scriptLabelWin : t.scriptLabelUnix} code={script} t={t} />
      <CopyBox label={t.settingsLabel} code={settings} t={t} />
    </div>
  )
}
