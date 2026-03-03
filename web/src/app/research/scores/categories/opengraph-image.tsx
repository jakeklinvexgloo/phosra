import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Safety Test Categories — Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const GROUPS = [
  { name: "Critical Safety", count: 5, color: "#EF4444", portals: "3 AI + 2 Streaming" },
  { name: "Content Safety", count: 7, color: "#F59E0B", portals: "4 AI + 3 Streaming" },
  { name: "Wellbeing", count: 3, color: "#8B5CF6", portals: "3 AI" },
  { name: "Privacy & Security", count: 3, color: "#3B82F6", portals: "2 AI + 1 Streaming" },
  { name: "Other", count: 3, color: "#6B7280", portals: "1 AI + 2 Streaming" },
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
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "32px" }}>
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
          <div style={{ fontSize: "42px", fontWeight: 800, color: "white", marginBottom: "6px" }}>
            Safety Test Categories
          </div>
          <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>
            21 categories across AI chatbots and streaming platforms
          </div>
        </div>

        {/* Groups grid */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "12px", flex: 1 }}>
          {GROUPS.map((group) => (
            <div
              key={group.name}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "20px 24px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                flex: group.count >= 5 ? "1 1 48%" : "1 1 30%",
                minWidth: "200px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ width: "4px", height: "28px", borderRadius: "2px", background: group.color }} />
                <span style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>{group.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "32px", fontWeight: 800, color: group.color }}>{group.count}</span>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>{group.portals}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", gap: "24px" }}>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>12 AI Chatbot Categories</span>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>9 Streaming Categories</span>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#00D47E" }}>phosra.com</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
