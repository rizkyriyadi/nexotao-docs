export default {
  "-- start": {
    type: "separator",
    title: "Start here",
  },
  index: "Introduction",
  konsep: "Core Concepts",
  quickstart: "Quickstart",
  playground: "Playground",
  "-- api": {
    type: "separator",
    title: "Use the API",
  },
  endpoint: "Endpoints & Formats",
  autentikasi: "Authentication",
  teks: "Text & Chat",
  "context-window": "Context Window & Compaction",
  // Image + transcription were cut in the catalog trim. Hidden from the sidebar
  // but kept routable so existing inbound links resolve to the notice, not a 404.
  gambar: { display: "hidden", title: "Image Generation" },
  transcribe: { display: "hidden", title: "Transcribe" },
  "-- integrations": {
    type: "separator",
    title: "Integrations",
  },
  integrasi: "All Integrations",
  "claude-code": "Claude Code",
  "claude-code-rupiah": "Claude Code in Rupiah",
  codex: "Codex CLI",
  vscode: "VS Code",
  "terminal-agents": "Aider & OpenCode",
  kompatibel: "Any Other Tool",
  "-- reference": {
    type: "separator",
    title: "Reference",
  },
  "model-harga": "Models & Pricing",
  penagihan: "Billing & Pricing",
  "api-reference": "API Reference",
  "-- help": {
    type: "separator",
    title: "Account & Help",
  },
  faq: "FAQ",
  changelog: "Changelog",
}
