import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Scorecard API — Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const ENDPOINTS = [
  { method: "GET", path: "/api/research/scores", desc: "All platform scores" },
  { method: "GET", path: "/api/research/scores/platforms/:id", desc: "Platform report card" },
  { method: "GET", path: "/api/research/scores/categories", desc: "All 21 categories" },
  { method: "GET", path: "/api/research/scores/categories/:id", desc: "Category leaderboard" },
  { method: "GET", path: "/api/research/badge/:id", desc: "SVG safety badge" },
  { method: "GET", path: "/api/research/scores/csv", desc: "CSV export" },
  { method: "GET", path: "/research/scores/feed.xml", desc: "RSS feed" },
]

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0D1B2A",
          padding: "48px 56px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #00D47E, #00A86B)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
                color: "#0D1B2A",
              }}
            >
              P
            </div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "2px", textTransform: "uppercase" as const }}>
              PLATFORM SAFETY SCORECARD
            </span>
          </div>
          <div style={{ fontSize: "42px", fontWeight: 800, color: "white", marginBottom: "4px" }}>
            Scorecard API
          </div>
          <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>
            Free public REST API — No authentication required
          </div>
        </div>

        {/* Endpoints */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          {ENDPOINTS.map((ep, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
                background: "rgba(52,211,153,0.15)",
                border: "1px solid rgba(52,211,153,0.25)",
                color: "#34D399",
              }}>
                {ep.method}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "monospace", flex: 1 }}>
                {ep.path}
              </span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>{ep.desc}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>JSON + SVG + CSV + RSS • 1hr cache • CORS enabled</span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#00D47E" }}>phosra.com</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
