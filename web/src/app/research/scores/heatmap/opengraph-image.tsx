import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Safety Performance Heatmap — Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const GRADE_COLORS: Record<string, string> = {
  "A+": "#34d399", A: "#34d399", "A-": "#34d399",
  "B+": "#60a5fa", B: "#60a5fa", "B-": "#60a5fa",
  "C+": "#fbbf24", C: "#fbbf24", "C-": "#fbbf24",
  "D+": "#fb923c", D: "#fb923c", "D-": "#fb923c",
  F: "#f87171",
}

// Mini heatmap data (platform → grades for key categories)
const HEATMAP_ROWS: { name: string; grade: string; cells: { grade: string }[] }[] = [
  { name: "Claude", grade: "A+", cells: [{ grade: "A" }, { grade: "A+" }, { grade: "A" }, { grade: "A+" }, { grade: "A+" }, { grade: "A+" }] },
  { name: "Copilot", grade: "A+", cells: [{ grade: "A-" }, { grade: "A+" }, { grade: "A" }, { grade: "A+" }, { grade: "A+" }, { grade: "A" }] },
  { name: "Perplexity", grade: "A", cells: [{ grade: "B-" }, { grade: "A" }, { grade: "A+" }, { grade: "A+" }, { grade: "A+" }, { grade: "A" }] },
  { name: "Netflix", grade: "A-", cells: [{ grade: "—" }, { grade: "—" }, { grade: "—" }, { grade: "—" }, { grade: "A+" }, { grade: "A+" }] },
  { name: "ChatGPT", grade: "B+", cells: [{ grade: "C" }, { grade: "A+" }, { grade: "B+" }, { grade: "A+" }, { grade: "F" }, { grade: "A+" }] },
  { name: "Gemini", grade: "B+", cells: [{ grade: "F" }, { grade: "A+" }, { grade: "F" }, { grade: "A+" }, { grade: "F" }, { grade: "A+" }] },
  { name: "Grok", grade: "C", cells: [{ grade: "F" }, { grade: "A+" }, { grade: "F" }, { grade: "B+" }, { grade: "F" }, { grade: "F" }] },
]

const COL_LABELS = ["Self-Harm", "Grooming", "Sexual", "Drugs", "Emotion", "Bully"]

function cellColor(grade: string): string {
  if (grade === "—") return "rgba(255,255,255,0.02)"
  const base = GRADE_COLORS[grade]
  if (!base) return "rgba(255,255,255,0.02)"
  return `${base}20`
}

export default function Image() {
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
            background: "linear-gradient(90deg, #00D47E, #00D47E80 30%, transparent)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#00D47E", fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", display: "flex", marginBottom: 4 }}>
              PLATFORM SAFETY SCORECARD
            </div>
            <div style={{ color: "white", fontSize: 42, fontWeight: 800, display: "flex" }}>
              Performance Heatmap
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, display: "flex", marginTop: 6 }}>
              11 platforms × 21 safety categories — color-coded safety matrix
            </div>
          </div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            borderRadius: "20px",
            background: "rgba(0,212,126,0.08)",
            border: "2px solid rgba(0,212,126,0.2)",
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, display: "flex" }}>🟩</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, display: "flex", marginTop: 4 }}>
              21 tests
            </div>
          </div>
        </div>

        {/* Mini heatmap grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {/* Column headers */}
          <div style={{ display: "flex", gap: "3px", paddingLeft: "130px" }}>
            {COL_LABELS.map((label) => (
              <div key={label} style={{ width: "80px", display: "flex", justifyContent: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 600, display: "flex" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
          {/* Data rows */}
          {HEATMAP_ROWS.map((row) => (
            <div key={row.name} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <div style={{ width: "100px", display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, display: "flex" }}>
                  {row.name}
                </div>
              </div>
              <div style={{
                width: "26px",
                height: "26px",
                borderRadius: "6px",
                background: `${GRADE_COLORS[row.grade] ?? "#9ca3af"}15`,
                border: `1px solid ${GRADE_COLORS[row.grade] ?? "#9ca3af"}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
                color: GRADE_COLORS[row.grade] ?? "#9ca3af",
              }}>
                {row.grade}
              </div>
              {row.cells.map((cell, i) => (
                <div
                  key={i}
                  style={{
                    width: "80px",
                    height: "26px",
                    borderRadius: "5px",
                    background: cellColor(cell.grade),
                    border: `1px solid ${cell.grade === "—" ? "rgba(255,255,255,0.04)" : `${GRADE_COLORS[cell.grade] ?? "#9ca3af"}20`}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: cell.grade === "—" ? "rgba(255,255,255,0.1)" : GRADE_COLORS[cell.grade] ?? "#9ca3af", display: "flex" }}>
                    {cell.grade}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { label: "Platforms", value: "11", color: "#00D47E" },
            { label: "Categories", value: "21", color: "#60a5fa" },
            { label: "Highest Avg", value: "Cyberbullying (96)", color: "#34d399" },
            { label: "Lowest Avg", value: "Prof. Escape (25)", color: "#f87171" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                borderRadius: "12px",
                padding: "10px 12px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ color: stat.color, fontSize: 16, fontWeight: 700, display: "flex" }}>{stat.value}</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, display: "flex", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#64748b", fontSize: 15, display: "flex" }}>
            phosra.com/research/scores/heatmap
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
