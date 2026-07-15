import React, { useEffect, useState } from "react"
import { useRouter } from "nextra/hooks"
import { fetchModels, priceLines, modalityLabel, VENDOR, type Model, type Modality, type Locale } from "../lib/models"

const ORDER: Modality[] = ["text", "image", "transcribe"]

const T = {
  id: {
    displayName: "Nama tampilan",
    modelId: "Model ID",
    provider: "Provider",
    rate: "Tarif",
    loadFailed: "Gagal memuat harga live. Lihat harga terkini di",
    loading: "Memuat harga live…",
    note: "Model ID bersifat case-sensitive dan harus disalin persis. Harga diambil langsung dari katalog live.",
  },
  en: {
    displayName: "Display name",
    modelId: "Model ID",
    provider: "Provider",
    rate: "Rate",
    loadFailed: "Failed to load live pricing. See current rates at",
    loading: "Loading live pricing…",
    note: "Model IDs are case-sensitive and must be copied exactly. Prices are pulled directly from the live catalog.",
  },
} as const

// Tabel harga live dari GET /models. Client-side, dengan fallback bila gagal.
// Hanya harga jual — tanpa cost/margin.
export function LivePricing() {
  const { locale } = useRouter()
  const loc: Locale = locale === "en" ? "en" : "id"
  const t = T[loc]
  const [models, setModels] = useState<Model[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    fetchModels()
      .then((m) => alive && setModels(m))
      .catch(() => alive && setError(true))
    return () => {
      alive = false
    }
  }, [])

  if (error) {
    return (
      <p className="nx-note" style={{ marginTop: "1rem" }}>
        {t.loadFailed}{" "}
        <a href="https://nexotao.com/harga" style={{ color: "#BAE6FD" }}>
          nexotao.com/harga
        </a>
        .
      </p>
    )
  }
  if (!models) {
    return (
      <p className="nx-note" style={{ marginTop: "1rem" }}>
        {t.loading}
      </p>
    )
  }

  const groups = ORDER.map((mod) => ({ mod, rows: models.filter((m) => m.modality === mod) })).filter(
    (g) => g.rows.length > 0
  )

  return (
    <div>
      {groups.map((g) => (
        <div key={g.mod}>
          <p className="docs-group-label">{modalityLabel(g.mod, loc)}</p>
          <table className="docs-table">
            <thead>
              <tr>
                <th>{t.displayName}</th>
                <th>{t.modelId}</th>
                <th>{t.provider}</th>
                <th style={{ textAlign: "right" }}>{t.rate}</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((m) => (
                <tr key={m.model}>
                  <td>
                    {m.display_name}
                  </td>
                  <td>
                    <span className="nx-note" style={{ fontFamily: "monospace" }}>
                      {m.model}
                    </span>
                  </td>
                  <td style={{ color: "#A1A1AA" }}>{VENDOR[m.provider] ?? m.provider}</td>
                  <td className="num">
                    {priceLines(m, loc).map((line) => (
                      <div key={line.label}>
                        <span style={{ color: "#A1A1AA" }}>{line.label}: </span>
                        {line.value}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <p className="nx-note" style={{ marginTop: "0.75rem" }}>
        {t.note}
      </p>
    </div>
  )
}
