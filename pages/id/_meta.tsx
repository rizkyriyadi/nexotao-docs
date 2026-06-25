export default {
  index: "Pengantar",
  quickstart: "Quickstart",
  autentikasi: "Autentikasi",
  penagihan: "Penagihan & Harga",
  "-- modality": {
    type: "separator",
    title: "Modality",
  },
  teks: "Teks & Chat",
  // Gambar + transcribe dipotong di trim katalog 2-model. Disembunyikan dari
  // sidebar tapi tetap bisa diakses agar link lama mengarah ke notice "dihentikan"
  // dan bukan 404.
  gambar: { display: "hidden", title: "Generate Gambar" },
  transcribe: { display: "hidden", title: "Transcribe" },
  "-- integrasi": {
    type: "separator",
    title: "Integrasi",
  },
  "claude-code": "Claude Code",
  "claude-code-rupiah": "Claude Code Bayar Rupiah",
  "-- referensi": {
    type: "separator",
    title: "Referensi",
  },
  "api-reference": "API Reference",
  "model-harga": "Model & Harga",
  faq: "FAQ",
  "-- changelog-sep": {
    type: "separator",
    title: "Changelog",
  },
  changelog: "Changelog",
}
