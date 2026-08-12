// Katalog model publik dari GET /models (hanya harga jual + metadata; tanpa
// cost/margin). Harga micro-rupiah (1 Rp = 1.000.000 micro).
export const API_BASE = "https://api.nexotao.com"

export type Locale = "id" | "en"

const FX = Number(process.env.NEXT_PUBLIC_FX_DISPLAY ?? 18000)

export type Modality = "text" | "image" | "transcribe"

export type Model = {
  model: string
  display_name: string
  tier: string
  provider: string
  api_style?: "anthropic" | "openai" | ""
  supports_tools?: boolean
  agentic?: boolean
  supports_vision: boolean
  modality: Modality
  input_per_million_micro: number
  output_per_million_micro: number
  audio_input_per_million_micro: number
  per_minute_micro: number
  per_image_micro: number
  per_megapixel_micro: number
}

export const MODALITY_LABEL: Record<Modality, string> = {
  text: "Teks",
  image: "Gambar",
  transcribe: "Transcribe",
}

const MODALITY_LABEL_EN: Record<Modality, string> = {
  text: "Text",
  image: "Image",
  transcribe: "Transcribe",
}

export function modalityLabel(modality: Modality, locale: Locale = "id"): string {
  return locale === "en" ? MODALITY_LABEL_EN[modality] : MODALITY_LABEL[modality]
}

// Public vendor ids returned by GET /models.
export const VENDOR: Record<string, string> = {
  amazon: "Amazon",
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
  google: "Google",
  meta: "Meta",
  minimax: "MiniMax",
  mistral: "Mistral AI",
  moonshot: "Moonshot AI",
  nvidia: "NVIDIA",
  openai: "OpenAI",
  qwen: "Qwen",
  zai: "Z.AI",
}

export function vendorLabel(provider: string): string {
  return VENDOR[provider] ?? "—"
}

export function rp(value: number, locale: Locale = "id"): string {
  if (locale === "en") {
    const usd = value / FX
    const abs = Math.abs(usd)
    const frac = abs > 0 && abs < 1 ? 4 : 2
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: frac,
      minimumFractionDigits: usd === 0 ? 0 : undefined,
    }).format(usd)
  }
  const abs = Math.abs(value)
  const frac = Number.isInteger(value) ? 0 : abs < 1 ? 4 : 2
  return "Rp " + value.toLocaleString("id-ID", { maximumFractionDigits: frac })
}

type PriceStrings = {
  input: string
  output: string
  perMegapixel: string
  perImage: string
  audio: string
  audioIn: string
  textOut: string
  unitTokens: string
  unitMp: string
  unitMin: string
}

const STR: Record<Locale, PriceStrings> = {
  id: {
    input: "Input",
    output: "Output",
    perMegapixel: "Per megapiksel",
    perImage: "Per gambar",
    audio: "Audio",
    audioIn: "Audio in",
    textOut: "Teks out",
    unitTokens: "/ 1jt token",
    unitMp: "/ MP",
    unitMin: "/ menit",
  },
  en: {
    input: "Input",
    output: "Output",
    perMegapixel: "Per megapixel",
    perImage: "Per image",
    audio: "Audio",
    audioIn: "Audio in",
    textOut: "Text out",
    unitTokens: "/ 1M tokens",
    unitMp: "/ MP",
    unitMin: "/ min",
  },
}

// Baris harga per model, sesuai satuan modality-nya.
export function priceLines(m: Model, locale: Locale = "id"): { label: string; value: string }[] {
  const s = STR[locale]
  if (m.modality === "image") {
    if (m.per_megapixel_micro > 0)
      return [{ label: s.perMegapixel, value: `${rp(m.per_megapixel_micro / 1e6, locale)} ${s.unitMp}` }]
    return [{ label: s.perImage, value: rp(m.per_image_micro / 1e6, locale) }]
  }
  if (m.modality === "transcribe") {
    if (m.per_minute_micro > 0)
      return [{ label: s.audio, value: `${rp(m.per_minute_micro / 1e6, locale)} ${s.unitMin}` }]
    return [
      { label: s.audioIn, value: `${rp(m.audio_input_per_million_micro / 1e6, locale)} ${s.unitTokens}` },
      { label: s.textOut, value: `${rp(m.output_per_million_micro / 1e6, locale)} ${s.unitTokens}` },
    ]
  }
  return [
    { label: s.input, value: `${rp(m.input_per_million_micro / 1e6, locale)} ${s.unitTokens}` },
    { label: s.output, value: `${rp(m.output_per_million_micro / 1e6, locale)} ${s.unitTokens}` },
  ]
}

// Older API revisions used `provider` for the wire format. Preserve support for
// those responses while keeping the new vendor/api_style contract.
function normalizeModel(model: Model): Model {
  const legacyProvider = model.provider.startsWith("azure-")
    ? model.provider.slice("azure-".length)
    : model.provider
  const apiStyle = model.api_style || (legacyProvider === "anthropic" || legacyProvider === "openai" ? legacyProvider : "")
  const supportsTools = model.supports_tools ?? model.agentic ?? false
  return {
    ...model,
    provider: model.api_style ? model.provider : legacyProvider,
    api_style: apiStyle,
    supports_tools: supportsTools,
    agentic: model.agentic ?? supportsTools,
  }
}

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch(`${API_BASE}/models`, { headers: { Accept: "application/json" } })
  if (!res.ok) throw new Error(`models ${res.status}`)
  const data = await res.json()
  const models = (data.models ?? []) as Model[]
  return models.map(normalizeModel)
}
