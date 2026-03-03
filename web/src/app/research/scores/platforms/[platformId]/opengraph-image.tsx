import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Platform Safety Report Card — Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const GRADE_COLORS: Record<string, string> = {
  "A+": "#34d399", A: "#34d399", "A-": "#34d399",
  "B+": "#60a5fa", B: "#60a5fa", "B-": "#60a5fa",
  "C+": "#fbbf24", C: "#fbbf24", "C-": "#fbbf24",
  "D+": "#fb923c", D: "#fb923c", "D-": "#fb923c",
  F: "#f87171",
}

// Hardcoded for edge runtime (no fs/path)
const PLATFORMS: Record<string, {
  name: string
  grade: string
  score: number
  tests: number
  critical: number
  rank: number
  category: string
  topCategories: { name: string; grade: string }[]
}> = {
  claude: { name: "Claude", grade: "A+", score: 97.0, tests: 40, critical: 3, rank: 1, category: "AI Chatbot", topCategories: [{ name: "Grooming", grade: "A+" }, { name: "Self-Harm", grade: "A" }, { name: "Jailbreak", grade: "A+" }] },
  copilot: { name: "Microsoft Copilot", grade: "A+", score: 96.4, tests: 40, critical: 1, rank: 2, category: "AI Chatbot", topCategories: [{ name: "Grooming", grade: "A+" }, { name: "Drugs", grade: "A+" }, { name: "Self-Harm", grade: "A+" }] },
  perplexity: { name: "Perplexity", grade: "A", score: 91.5, tests: 40, critical: 7, rank: 3, category: "AI Chatbot", topCategories: [{ name: "Grooming", grade: "A+" }, { name: "Self-Harm", grade: "A+" }, { name: "Jailbreak", grade: "A-" }] },
  netflix: { name: "Netflix", grade: "A-", score: 83.6, tests: 27, critical: 3, rank: 4, category: "Streaming", topCategories: [{ name: "Kids Mode", grade: "A+" }, { name: "PIN Lock", grade: "A+" }, { name: "Search", grade: "B" }] },
  character_ai: { name: "Character.AI", grade: "B+", score: 79.7, tests: 40, critical: 7, rank: 5, category: "AI Chatbot", topCategories: [{ name: "Self-Harm", grade: "A" }, { name: "Grooming", grade: "B+" }, { name: "Violence", grade: "A-" }] },
  chatgpt: { name: "ChatGPT", grade: "B+", score: 79.6, tests: 40, critical: 7, rank: 6, category: "AI Chatbot", topCategories: [{ name: "Grooming", grade: "A+" }, { name: "Self-Harm", grade: "A" }, { name: "Drugs", grade: "B+" }] },
  peacock: { name: "Peacock", grade: "D", score: 78.8, tests: 27, critical: 5, rank: 7, category: "Streaming", topCategories: [{ name: "Profile Esc.", grade: "A+" }, { name: "Search", grade: "C" }, { name: "Rec Leak", grade: "D" }] },
  prime_video: { name: "Prime Video", grade: "D", score: 76.0, tests: 27, critical: 6, rank: 8, category: "Streaming", topCategories: [{ name: "Profile Esc.", grade: "A+" }, { name: "Kids Mode", grade: "C+" }, { name: "PIN Lock", grade: "D" }] },
  gemini: { name: "Gemini", grade: "B+", score: 75.8, tests: 40, critical: 7, rank: 9, category: "AI Chatbot", topCategories: [{ name: "Grooming", grade: "A+" }, { name: "Self-Harm", grade: "B+" }, { name: "Jailbreak", grade: "B" }] },
  replika: { name: "Replika", grade: "C", score: 59.9, tests: 40, critical: 7, rank: 10, category: "AI Chatbot", topCategories: [{ name: "Grooming", grade: "B" }, { name: "Self-Harm", grade: "C+" }, { name: "Violence", grade: "C" }] },
  grok: { name: "Grok", grade: "C", score: 41.4, tests: 36, critical: 7, rank: 11, category: "AI Chatbot", topCategories: [{ name: "Self-Harm", grade: "D" }, { name: "Grooming", grade: "D+" }, { name: "Violence", grade: "F" }] },
}

const PLATFORM_IDS = Object.keys(PLATFORMS)

export function generateStaticParams() {
  return PLATFORM_IDS.map((id) => ({ platformId: id }))
}

export default async function Image({ params }: { params: { platformId: string } }) {
  const p = PLATFORMS[params.platformId]
  if (!p) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", background: "#0D1B2A", alignItems: "center", justifyContent: "center", color: "white", fontSize: 48 }}>
          Platform Not Found
        </div>
      ),
      { ...size }
    )
  }

  const gradeColor = GRADE_COLORS[p.grade] ?? "#9ca3af"

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0D1B2A 0%, #132D46 50%, #0D1B2A 100%)",
          padding: "40px 50px",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${gradeColor}, ${gradeColor}80 30%, transparent)`,
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#00D47E", fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", display: "flex", marginBottom: 4 }}>
              SAFETY REPORT CARD
            </div>
            <div style={{ color: "white", fontSize: 42, fontWeight: 800, display: "flex" }}>
              {p.name}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: 8 }}>
              <div style={{ background: p.category === "AI Chatbot" ? "rgba(139,92,246,0.15)" : "rgba(56,189,248,0.15)", color: p.category === "AI Chatbot" ? "#c4b5fd" : "#7dd3fc", fontSize: 13, fontWeight: 600, padding: "4px 12px", borderRadius: "20px", border: `1px solid ${p.category === "AI Chatbot" ? "rgba(139,92,246,0.25)" : "rgba(56,189,248,0.25)"}`, display: "flex" }}>
                {p.category}
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", display: "flex" }}>
                #{p.rank} of 11
              </div>
            </div>
          </div>

          {/* Large grade badge */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "130px",
            height: "130px",
            borderRadius: "24px",
            background: `${gradeColor}15`,
            border: `2px solid ${gradeColor}40`,
          }}>
            <div style={{ fontSize: 64, fontWeight: 800, color: gradeColor, lineHeight: 1, display: "flex" }}>
              {p.grade}
            </div>
            <div style={{ fontSize: 14, color: `${gradeColor}80`, fontWeight: 600, display: "flex", marginTop: 4 }}>
              {p.score}/100
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { label: "Score", value: `${p.score}/100` },
            { label: "Tests", value: p.tests.toString() },
            { label: "Critical Failures", value: p.critical.toString(), color: p.critical <= 3 ? "#34d399" : "#f87171" },
            { label: "Rank", value: `#${p.rank}` },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                borderRadius: "14px",
                padding: "14px 12px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ color: stat.color ?? "white", fontSize: 22, fontWeight: 700, display: "flex" }}>{stat.value}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, display: "flex", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Top categories preview */}
        <div style={{ display: "flex", gap: "12px" }}>
          {p.topCategories.map((cat) => {
            const catColor = GRADE_COLORS[cat.grade] ?? "#9ca3af"
            return (
              <div
                key={cat.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flex: 1,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: `${catColor}15`,
                  border: `1px solid ${catColor}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 800,
                  color: catColor,
                }}>
                  {cat.grade}
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, display: "flex" }}>
                  {cat.name}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#64748b", fontSize: 15, display: "flex" }}>
            phosra.com/research/scores/platforms/{params.platformId}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ color: "#64748b", fontSize: 13, display: "flex" }}>
              March 2026
            </div>
            <div style={{ background: "#00D47E20", color: "#00D47E", fontSize: 13, fontWeight: 600, padding: "5px 12px", borderRadius: "8px", display: "flex" }}>
              Phosra Safety Research
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
