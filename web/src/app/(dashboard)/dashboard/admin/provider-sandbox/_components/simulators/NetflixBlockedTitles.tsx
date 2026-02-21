"use client"

interface NetflixBlockedTitlesProps {
  titles: string[]
  previousTitles: string[] | null
  isHighlighted: boolean
}

export function NetflixBlockedTitles({ titles, previousTitles, isHighlighted }: NetflixBlockedTitlesProps) {
  // No diff mode: render normally
  if (previousTitles === null) {
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
                <span style={{ color: "#E50914", fontSize: "11px", fontWeight: 600, cursor: "default" }}>
                  BLOCKED
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Diff mode: compute added and removed titles
  const previousSet = new Set(previousTitles)
  const currentSet = new Set(titles)
  const removedTitles = previousTitles.filter((t) => !currentSet.has(t))
  const addedTitles = titles.filter((t) => !previousSet.has(t))
  const unchangedTitles = titles.filter((t) => previousSet.has(t))

  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {/* Removed titles */}
        {removedTitles.map((title) => (
          <div
            key={`removed-${title}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: "rgba(255, 107, 107, 0.06)",
              border: "1px solid rgba(255, 107, 107, 0.15)",
            }}
          >
            <span style={{ color: "#FF6B6B", fontSize: "13px", textDecoration: "line-through" }}>
              {title}
            </span>
            <span style={{ color: "#FF6B6B", fontSize: "11px", fontWeight: 600 }}>
              REMOVED
            </span>
          </div>
        ))}

        {/* Added titles */}
        {addedTitles.map((title) => (
          <div
            key={`added-${title}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: "rgba(0, 212, 126, 0.06)",
              border: "1px solid rgba(0, 212, 126, 0.15)",
            }}
          >
            <span style={{ color: "#00D47E", fontSize: "13px" }}>{title}</span>
            <span style={{ color: "#00D47E", fontSize: "11px", fontWeight: 600 }}>
              BLOCKED
            </span>
          </div>
        ))}

        {/* Unchanged titles */}
        {unchangedTitles.map((title) => (
          <div
            key={`unchanged-${title}`}
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
            <span style={{ color: "#555", fontSize: "11px", fontWeight: 600 }}>
              BLOCKED
            </span>
          </div>
        ))}

        {/* Empty state */}
        {removedTitles.length === 0 && addedTitles.length === 0 && unchangedTitles.length === 0 && (
          <p style={{ color: "#555", fontSize: "13px", fontStyle: "italic" }}>No blocked titles</p>
        )}
      </div>
    </div>
  )
}
