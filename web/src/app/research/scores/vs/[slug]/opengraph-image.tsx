import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Platform Safety Comparison — Phosra"
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
const PLATFORMS: Record<string, { name: string; grade: string; score: number; tests: number; critical: number }> = {
  chatgpt: { name: "ChatGPT", grade: "B+", score: 79.6, tests: 40, critical: 7 },
  claude: { name: "Claude", grade: "A+", score: 97.0, tests: 40, critical: 3 },
  gemini: { name: "Gemini", grade: "B+", score: 75.8, tests: 40, critical: 7 },
  grok: { name: "Grok", grade: "C", score: 41.4, tests: 36, critical: 7 },
  character_ai: { name: "Character.AI", grade: "B+", score: 79.7, tests: 40, critical: 7 },
  copilot: { name: "Microsoft Copilot", grade: "A+", score: 96.4, tests: 40, critical: 1 },
  perplexity: { name: "Perplexity", grade: "A", score: 91.5, tests: 40, critical: 7 },
  replika: { name: "Replika", grade: "C", score: 59.9, tests: 40, critical: 7 },
  netflix: { name: "Netflix", grade: "B-", score: 54.1, tests: 27, critical: 3 },
  peacock: { name: "Peacock", grade: "C-", score: 41.2, tests: 27, critical: 5 },
  prime_video: { name: "Prime Video", grade: "D+", score: 35.1, tests: 27, critical: 6 },
}

const ALL_IDS = Object.keys(PLATFORMS)

function parseSlug(slug: string): [string, string] | null {
  const parts = slug.split("-vs-")
  if (parts.length !== 2) return null
  const [a, b] = parts
  if (!ALL_IDS.includes(a) || !ALL_IDS.includes(b)) return null
  if (a === b) return null
  return [a, b]
}

export function generateStaticParams() {
  const slugs: { slug: string }[] = []
  for (let i = 0; i < ALL_IDS.length; i++) {
    for (let j = i + 1; j < ALL_IDS.length; j++) {
      slugs.push({ slug: [ALL_IDS[i], ALL_IDS[j]].sort().join("-vs-") })
    }
  }
  return slugs
}

export default async function Image({ params }: { params: { slug: string } }) {
  const pair = parseSlug(params.slug)
  if (!pair) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", background: "#0D1B2A", alignItems: "center", justifyContent: "center", color: "white", fontSize: 48 }}>
          Comparison Not Found
        </div>
      ),
      { ...size }
    )
  }

  const [idA, idB] = pair
  const pA = PLATFORMS[idA]
  const pB = PLATFORMS[idB]
  const colorA = GRADE_COLORS[pA.grade] ?? "#9ca3af"
  const colorB = GRADE_COLORS[pB.grade] ?? "#9ca3af"
  const winner = pA.score > pB.score ? "a" : pA.score < pB.score ? "b" : "tie"

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
        {/* Top accent — gradient from platform A to platform B color */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${colorA}, transparent 40%, transparent 60%, ${colorB})`,
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ color: "#00D47E", fontSize: 18, marginBottom: 6, display: "flex" }}>
            HEAD-TO-HEAD SAFETY COMPARISON
          </div>
          <div style={{ color: "#94a3b8", fontSize: 16, display: "flex" }}>
            Independent Safety Testing • March 2026
          </div>
        </div>

        {/* Main comparison */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "40px" }}>
          {/* Platform A */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", flex: 1 }}>
            <div style={{ color: "white", fontSize: 32, fontWeight: 700, display: "flex", textAlign: "center" }}>
              {pA.name}
            </div>
            <div style={{ fontSize: 80, fontWeight: 800, color: colorA, lineHeight: 1, display: "flex" }}>
              {pA.grade}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ color: "white", fontSize: 18, fontWeight: 700, display: "flex" }}>{pA.score}/100</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, display: "flex" }}>Score</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ color: pA.critical <= 3 ? "#34d399" : "#f87171", fontSize: 18, fontWeight: 700, display: "flex" }}>{pA.critical}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, display: "flex" }}>Critical</div>
              </div>
            </div>
          </div>

          {/* VS divider */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "30px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 20, fontWeight: 800, display: "flex" }}>VS</div>
            </div>
            {winner !== "tie" && (
              <div style={{ color: "#00D47E", fontSize: 12, fontWeight: 600, display: "flex" }}>
                {winner === "a" ? pA.name : pB.name} wins
              </div>
            )}
          </div>

          {/* Platform B */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", flex: 1 }}>
            <div style={{ color: "white", fontSize: 32, fontWeight: 700, display: "flex", textAlign: "center" }}>
              {pB.name}
            </div>
            <div style={{ fontSize: 80, fontWeight: 800, color: colorB, lineHeight: 1, display: "flex" }}>
              {pB.grade}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ color: "white", fontSize: 18, fontWeight: 700, display: "flex" }}>{pB.score}/100</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, display: "flex" }}>Score</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ color: pB.critical <= 3 ? "#34d399" : "#f87171", fontSize: 18, fontWeight: 700, display: "flex" }}>{pB.critical}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, display: "flex" }}>Critical</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#64748b", fontSize: 16, display: "flex" }}>
            phosra.com/research/scores/vs/{params.slug}
          </div>
          <div style={{ background: "#00D47E20", color: "#00D47E", fontSize: 14, fontWeight: 600, padding: "6px 14px", borderRadius: "8px", display: "flex" }}>
            Phosra Safety Research
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
