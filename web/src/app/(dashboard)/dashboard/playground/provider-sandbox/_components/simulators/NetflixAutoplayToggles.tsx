"use client"

interface NetflixAutoplayTogglesProps {
  nextEpisode: boolean
  previews: boolean
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      style={{
        width: 44,
        height: 24,
        borderRadius: "12px",
        backgroundColor: on ? "#E50914" : "#333",
        position: "relative",
        transition: "background-color 0.3s",
        cursor: "default",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          backgroundColor: "#fff",
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          transition: "left 0.3s",
        }}
      />
    </div>
  )
}

export function NetflixAutoplayToggles({ nextEpisode, previews }: NetflixAutoplayTogglesProps) {
  return (
    <div style={{ padding: "16px 0" }}>
      <h4 style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginBottom: "12px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
        Autoplay Controls
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Toggle on={nextEpisode} />
          <span style={{ color: nextEpisode ? "#ddd" : "#555", fontSize: "13px" }}>
            Autoplay next episode
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Toggle on={previews} />
          <span style={{ color: previews ? "#ddd" : "#555", fontSize: "13px" }}>
            Autoplay previews while browsing
          </span>
        </div>
      </div>
    </div>
  )
}
