export default {
  index: "Introduction",
  quickstart: "Quickstart",
  autentikasi: "Authentication",
  penagihan: "Billing & Pricing",
  "-- modality": {
    type: "separator",
    title: "Modality",
  },
  teks: "Text & Chat",
  // Image + transcription were cut in the 2-model catalog trim. Hidden from the
  // sidebar but kept routable so existing inbound links resolve to the retirement
  // notice instead of a 404.
  gambar: { display: "hidden", title: "Image Generation" },
  transcribe: { display: "hidden", title: "Transcribe" },
  "-- integrasi": {
    type: "separator",
    title: "Integrations",
  },
  integrasi: "All Integrations",
  "nexotao-orce": "Nexotao Orce",
  "claude-code": "Claude Code",
  "claude-code-rupiah": "Claude Code in Rupiah",
  codex: "Codex CLI",
  vscode: "VS Code",
  "terminal-agents": "Aider & OpenCode",
  kompatibel: "Any Other Tool",
  "context-window": "Context Window & Compaction",
  "-- referensi": {
    type: "separator",
    title: "Reference",
  },
  "api-reference": "API Reference",
  "model-harga": "Models & Pricing",
  "model-router": "Model Router",
  faq: "FAQ",
  "-- changelog-sep": {
    type: "separator",
    title: "Changelog",
  },
  changelog: "Changelog",
}
