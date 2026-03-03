import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Head-to-Head Comparisons — Safety Scorecard — Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const FEATURED = [
  { a: "Claude", aGrade: "A-", b: "ChatGPT", bGrade: "B+" },
  { a: "Claude", aGrade: "A-", b: "Gemini", bGrade: "A" },
  { a: "ChatGPT", bGrade: "A", b: "Gemini", aGrade: "B+" },
  { a: "Character.AI", aGrade: "B-", b: "Replika", bGrade: "F" },
  { a: "Netflix", aGrade: "A-", b: "Prime Video", bGrade: "B-" },
  { a: "ChatGPT", aGrade: "B+", b: "Grok", bGrade: "D" },
]

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#34D399"
  if (grade.startsWith("B")) return "#4ADE80"
  if (grade.startsWith("C")) return "#FBBF24"
  if (grade.startsWith("D")) return "#FB923C"
  return "#EF4444"
}

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
            Head-to-Head Comparisons
          </div>
          <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>
            55 side-by-side child safety comparisons across 11 platforms
          </div>
        </div>

        {/* Matchup grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          {FEATURED.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
                padding: "12px 24px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, justifyContent: "flex-end" }}>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{m.a}</span>
                <span style={{ fontSize: "24px", fontWeight: 800, color: gradeColor(m.aGrade) }}>{m.aGrade}</span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "rgba(255,255,255,0.15)", letterSpacing: "2px" }}>VS</span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: gradeColor(m.bGrade) }}>{m.bGrade}</span>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{m.b}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", gap: "24px" }}>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>28 AI vs AI</span>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>3 Streaming vs Streaming</span>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>24 Cross-Portal</span>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#00D47E" }}>phosra.com</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
