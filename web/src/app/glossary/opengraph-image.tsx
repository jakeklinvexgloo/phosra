import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Child Safety Glossary - Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0D1B2A 0%, #132D46 50%, #0D1B2A 100%)",
          padding: "60px",
          justifyContent: "center",
          position: "relative",
        }}
      >
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

        <div
          style={{
            color: "#00D47E",
            fontSize: 24,
            marginBottom: 16,
            display: "flex",
          }}
        >
          REFERENCE
        </div>

        <div
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 16,
            display: "flex",
          }}
        >
          Child Safety Glossary
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: 28,
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          25+ Key Terms Defined
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 60,
            color: "#64748b",
            fontSize: 20,
            display: "flex",
          }}
        >
          phosra.com
        </div>
      </div>
    ),
    { ...size }
  )
}
