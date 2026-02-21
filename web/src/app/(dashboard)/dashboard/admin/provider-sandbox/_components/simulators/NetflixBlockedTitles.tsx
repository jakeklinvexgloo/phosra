"use client"

interface NetflixBlockedTitlesProps {
  titles: string[]
  isHighlighted: boolean
}

export function NetflixBlockedTitles({ titles, isHighlighted }: NetflixBlockedTitlesProps) {
  return (
    <div
      style={{
        padding: "16px 0",
        transition: "box-shadow 0.3s",
        boxShadow: isHighlighted ? "0 0 0 2px #00D47E" : "none",
        borderRadius: "8px",
      }}
    >
      <h4 style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginBottom: "12px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
        Blocked Titles
      </h4>
      {titles.length === 0 ? (
        <p style={{ color: "#555", fontSize: "13px", fontStyle: "italic" }}>No blocked titles</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {titles.map((title) => (
            <div
              key={title}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "#2a2a2a",
              }}
            >
              <span style={{ color: "#ddd", fontSize: "13px" }}>{title}</span>
              <span
                style={{
                  color: "#E50914",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "default",
                }}
              >
                BLOCKED
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
