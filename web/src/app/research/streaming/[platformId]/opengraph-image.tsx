import { ImageResponse } from "next/og"
import { STREAMING_PLATFORM_IDS } from "@/lib/streaming-research/streaming-data-types"

export const runtime = "edge"
export const alt = "Streaming Safety Report — Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const GRADE_COLORS: Record<string, string> = {
  "A+": "#34d399", A: "#34d399", "A-": "#34d399",
  "B+": "#60a5fa", B: "#60a5fa", "B-": "#60a5fa",
  "C+": "#fbbf24", C: "#fbbf24", "C-": "#fbbf24",
  "D+": "#fb923c", D: "#fb923c", "D-": "#fb923c",
  F: "#f87171",
}

// Hardcoded for edge runtime
const PLATFORMS: Record<string, {
  name: string
  grade: string
  score: number
  tests: number
  critical: number
  profiles: { name: string; grade: string }[]
}> = {
  netflix: {
    name: "Netflix",
    grade: "A-",
    score: 83.6,
    tests: 13,
    critical: 3,
    profiles: [
      { name: "Kids (7)", grade: "A" },
      { name: "Teen (12)", grade: "A-" },
      { name: "Teen (16)", grade: "A-" },
    ],
  },
  peacock: {
    name: "Peacock",
    grade: "D",
    score: 78.8,
    tests: 27,
    critical: 1,
    profiles: [
      { name: "Kids (7)", grade: "A+" },
      { name: "Kids (12)", grade: "D" },
      { name: "Teen (16)", grade: "D" },
    ],
  },
  prime_video: {
    name: "Prime Video",
    grade: "D",
    score: 76.0,
    tests: 27,
    critical: 1,
    profiles: [
      { name: "Kids (7)", grade: "A+" },
      { name: "Kids (12)", grade: "D" },
      { name: "Teen (16)", grade: "D" },
    ],
  },
}

export function generateStaticParams() {
  return STREAMING_PLATFORM_IDS.map((id) => ({ platformId: id }))
}

export default async function Image({ params }: { params: { platformId: string } }) {
  const platform = PLATFORMS[params.platformId]
  if (!platform) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", background: "#0D1B2A", alignItems: "center", justifyContent: "center", color: "white", fontSize: 48 }}>
          Platform Not Found
        </div>
      ),
      { ...size }
    )
  }

  const gradeColor = GRADE_COLORS[platform.grade] ?? "#9ca3af"

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
        {/* Top accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, transparent, ${gradeColor}, transparent)`,
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#00D47E",
              fontSize: 20,
              marginBottom: 10,
              display: "flex",
            }}
          >
            STREAMING CONTENT SAFETY REPORT
          </div>
          <div
            style={{
              color: "white",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.15,
              display: "flex",
            }}
          >
            {platform.name}
          </div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: 22,
              marginTop: 8,
              display: "flex",
            }}
          >
            Independent Safety Testing • March 2026
          </div>
        </div>

        {/* Grade + Profile breakdown */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "40px" }}>
          {/* Big grade badge */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontSize: 100,
                fontWeight: 800,
                color: gradeColor,
                lineHeight: 1,
                display: "flex",
              }}
            >
              {platform.grade}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 16,
                display: "flex",
              }}
            >
              Overall Grade
            </div>
          </div>

          {/* Profile grades + stats */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {platform.profiles.map((profile) => {
              const pColor = GRADE_COLORS[profile.grade] ?? "#9ca3af"
              return (
                <div
                  key={profile.name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    padding: "14px 20px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    minWidth: "120px",
                  }}
                >
                  <div
                    style={{
                      color: pColor,
                      fontSize: 26,
                      fontWeight: 700,
                      display: "flex",
                    }}
                  >
                    {profile.grade}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 13,
                      marginTop: 4,
                      display: "flex",
                    }}
                  >
                    {profile.name}
                  </div>
                </div>
              )
            })}
            {/* Stats */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "14px 20px",
                border: "1px solid rgba(255,255,255,0.08)",
                minWidth: "120px",
              }}
            >
              <div
                style={{
                  color: "white",
                  fontSize: 22,
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                {platform.score}/100
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 13,
                  marginTop: 4,
                  display: "flex",
                }}
              >
                Score
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#64748b", fontSize: 18, display: "flex" }}>
            phosra.com/research/streaming/{params.platformId}
          </div>
          <div
            style={{
              background: `${gradeColor}20`,
              color: gradeColor,
              fontSize: 16,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: "8px",
              display: "flex",
            }}
          >
            Phosra Safety Research
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
