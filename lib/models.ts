// Katalog model publik dari GET /models (hanya harga jual + metadata; tanpa
// cost/margin). Harga micro-rupiah (1 Rp = 1.000.000 micro).
export const API_BASE = "https://api.nexotao.com"

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

export const VENDOR: Record<string, string> = {
  "azure-anthropic": "Anthropic",
  "azure-openai": "OpenAI / DeepSeek",
}

export function rp(value: number): string {
  const abs = Math.abs(value)
  const frac = Number.isInteger(value) ? 0 : abs < 1 ? 4 : 2
  return "Rp " + value.toLocaleString("id-ID", { maximumFractionDigits: frac })
}

// Baris harga per model, sesuai satuan modality-nya.
export function priceLines(m: Model): { label: string; value: string }[] {
  if (m.modality === "image") {
    if (m.per_megapixel_micro > 0) return [{ label: "Per megapiksel", value: `${rp(m.per_megapixel_micro / 1e6)} / MP` }]
    return [{ label: "Per gambar", value: rp(m.per_image_micro / 1e6) }]
  }
  if (m.modality === "transcribe") {
    if (m.per_minute_micro > 0) return [{ label: "Audio", value: `${rp(m.per_minute_micro / 1e6)} / menit` }]
    return [
      { label: "Audio in", value: `${rp(m.audio_input_per_million_micro / 1e6)} / 1jt token` },
      { label: "Teks out", value: `${rp(m.output_per_million_micro / 1e6)} / 1jt token` },
    ]
  }
  return [
    { label: "Input", value: `${rp(m.input_per_million_micro / 1e6)} / 1jt token` },
    { label: "Output", value: `${rp(m.output_per_million_micro / 1e6)} / 1jt token` },
  ]
}

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch(`${API_BASE}/models`, { headers: { Accept: "application/json" } })
  if (!res.ok) throw new Error(`models ${res.status}`)
  const data = await res.json()
  return (data.models ?? []) as Model[]
}
