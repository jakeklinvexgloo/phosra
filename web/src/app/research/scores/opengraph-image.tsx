import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Platform Safety Scorecard — Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const GRADE_COLORS: Record<string, string> = {
  "A+": "#10b981", A: "#10b981", "A-": "#10b981",
  "B+": "#3b82f6", B: "#3b82f6", "B-": "#3b82f6",
  "C+": "#f59e0b", C: "#f59e0b", "C-": "#f59e0b",
  "D+": "#f97316", D: "#f97316", "D-": "#f97316",
  F: "#ef4444",
}

// Hardcoded scorecard data for OG image (avoid heavy data loading at edge)
const PLATFORMS: Record<string, { name: string; grade: string; score: number; rank: number }> = {
  claude: { name: "Claude", grade: "A+", score: 97.0, rank: 1 },
  copilot: { name: "Microsoft Copilot", grade: "A+", score: 96.4, rank: 2 },
  perplexity: { name: "Perplexity", grade: "A", score: 91.5, rank: 3 },
  netflix: { name: "Netflix", grade: "A-", score: 83.6, rank: 4 },
  character_ai: { name: "Character.AI", grade: "B+", score: 79.7, rank: 5 },
  chatgpt: { name: "ChatGPT", grade: "B+", score: 79.6, rank: 6 },
  peacock: { name: "Peacock", grade: "D", score: 78.8, rank: 7 },
  prime_video: { name: "Prime Video", grade: "D", score: 76.0, rank: 8 },
  gemini: { name: "Gemini", grade: "B+", score: 75.8, rank: 9 },
  replika: { name: "Replika", grade: "C", score: 59.9, rank: 10 },
  grok: { name: "Grok", grade: "C", score: 41.4, rank: 11 },
}

export default async function Image() {
  // Default: show top-level scorecard
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0D1B2A 0%, #132D46 50%, #0D1B2A 100%)",
          padding: "50px 60px",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #00D47E, transparent)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#00D47E",
              fontSize: 22,
              marginBottom: 12,
              display: "flex",
            }}
          >
            INDEPENDENT SAFETY RESEARCH
          </div>
          <div
            style={{
              color: "white",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.15,
              display: "flex",
            }}
          >
            Platform Safety Scorecard
          </div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: 22,
              marginTop: 10,
              display: "flex",
            }}
          >
            11 platforms tested across 383 safety tests • March 2026
          </div>
        </div>

        {/* Platform grid — show top 6 */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {Object.values(PLATFORMS).slice(0, 6).map((p) => (
            <div
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "12px 20px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 16,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                #{p.rank}
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  background: `${GRADE_COLORS[p.grade] ?? "#64748b"}25`,
                  color: GRADE_COLORS[p.grade] ?? "#64748b",
                  fontSize: 18,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "8px",
                  display: "flex",
                }}
              >
                {p.grade}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: 20,
              display: "flex",
            }}
          >
            phosra.com/research/scores
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            {["4 A", "3 B", "2 C", "2 D"].map((label) => (
              <div
                key={label}
                style={{
                  color: "#64748b",
                  fontSize: 16,
                  background: "rgba(255,255,255,0.05)",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  display: "flex",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
