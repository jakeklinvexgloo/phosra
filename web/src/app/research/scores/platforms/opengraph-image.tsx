import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "All Platforms — Safety Scorecard — Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const PLATFORMS = [
  { name: "ChatGPT", grade: "B+", score: 87.3, portal: "AI" },
  { name: "Claude", grade: "A-", score: 92.3, portal: "AI" },
  { name: "Gemini", grade: "A", score: 94.3, portal: "AI" },
  { name: "Grok", grade: "D", score: 64.3, portal: "AI" },
  { name: "Character.AI", grade: "B-", score: 80.3, portal: "AI" },
  { name: "Copilot", grade: "B+", score: 88.3, portal: "AI" },
  { name: "Perplexity", grade: "B-", score: 82, portal: "AI" },
  { name: "Replika", grade: "F", score: 36.3, portal: "AI" },
  { name: "Netflix", grade: "A-", score: 91.7, portal: "Stream" },
  { name: "Prime Video", grade: "B-", score: 80.6, portal: "Stream" },
  { name: "Peacock", grade: "C+", score: 77.8, portal: "Stream" },
]

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#34D399"
  if (grade.startsWith("B")) return "#4ADE80"
  if (grade.startsWith("C")) return "#FBBF24"
  if (grade.startsWith("D")) return "#FB923C"
  return "#EF4444"
}

export default function OGImage() {
  const sorted = [...PLATFORMS].sort((a, b) => b.score - a.score)

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
            All Platforms
          </div>
          <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>
            11 platforms ranked by child safety performance
          </div>
        </div>

        {/* Platform list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          {sorted.map((p, i) => (
            <div
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "8px 16px",
                borderRadius: "10px",
                background: i < 3 ? "rgba(0,212,126,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${i < 3 ? "rgba(0,212,126,0.15)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.3)", width: "24px", textAlign: "center" as const }}>
                {i + 1}
              </span>
              <span style={{ fontSize: "22px", fontWeight: 800, color: gradeColor(p.grade), width: "48px", textAlign: "center" as const }}>
                {p.grade}
              </span>
              <span style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.8)", flex: 1 }}>
                {p.name}
              </span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", padding: "2px 8px", borderRadius: "6px", background: p.portal === "AI" ? "rgba(139,92,246,0.15)" : "rgba(56,189,248,0.15)", border: `1px solid ${p.portal === "AI" ? "rgba(139,92,246,0.25)" : "rgba(56,189,248,0.25)"}` }}>
                {p.portal}
              </span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", width: "48px", textAlign: "right" as const }}>
                {p.score}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>8 AI Chatbots + 3 Streaming Services</span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#00D47E" }}>phosra.com</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
