import React, { useEffect, useState } from "react"
import { fetchModels, priceLines, MODALITY_LABEL, VENDOR, type Model, type Modality } from "../lib/models"

const ORDER: Modality[] = ["text", "image", "transcribe"]

// Tabel harga live dari GET /models. Client-side, dengan fallback bila gagal.
// Hanya harga jual — tanpa cost/margin.
export function LivePricing() {
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
        Gagal memuat harga live. Lihat harga terkini di{" "}
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
        Memuat harga live…
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
          <p className="docs-group-label">{MODALITY_LABEL[g.mod]}</p>
          <table className="docs-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Provider</th>
                <th style={{ textAlign: "right" }}>Tarif</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((m) => (
                <tr key={m.model}>
                  <td>
                    {m.display_name}
                    <br />
                    <span className="nx-note" style={{ fontFamily: "monospace" }}>
                      {m.model}
                    </span>
                  </td>
                  <td style={{ color: "#A1A1AA" }}>{VENDOR[m.provider] ?? m.provider}</td>
                  <td className="num">
                    {priceLines(m).map((line) => (
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
        Harga diambil langsung dari katalog live. Promo: tarif saat ini jauh di bawah harga official.
      </p>
    </div>
  )
}
