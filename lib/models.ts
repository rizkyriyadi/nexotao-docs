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

export const VENDOR: Record<string, string> = {
  "azure-anthropic": "Anthropic",
  "azure-openai": "OpenAI / DeepSeek",
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

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch(`${API_BASE}/models`, { headers: { Accept: "application/json" } })
  if (!res.ok) throw new Error(`models ${res.status}`)
  const data = await res.json()
  return (data.models ?? []) as Model[]
}
