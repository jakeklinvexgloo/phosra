"use client"

import type { ViewingActivityEntry } from "@/lib/sandbox/types"

interface NetflixViewingActivityProps {
  entries: ViewingActivityEntry[]
  isHighlighted: boolean
}

export function NetflixViewingActivity({ entries, isHighlighted }: NetflixViewingActivityProps) {
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
        Viewing Activity
      </h4>
      {entries.length === 0 ? (
        <p style={{ color: "#555", fontSize: "13px", fontStyle: "italic" }}>No viewing activity</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #333" }}>
              <th style={{ textAlign: "left", padding: "6px 0", color: "#777", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const }}>Title</th>
              <th style={{ textAlign: "left", padding: "6px 0", color: "#777", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const }}>Date</th>
              <th style={{ textAlign: "left", padding: "6px 0", color: "#777", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const }}>Rating</th>
              <th style={{ textAlign: "right", padding: "6px 0", color: "#777", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "8px 0", color: "#ddd", fontSize: "13px" }}>{entry.title}</td>
                <td style={{ padding: "8px 0", color: "#777", fontSize: "12px" }}>{entry.date}</td>
                <td style={{ padding: "8px 0" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: "3px",
                      border: "1px solid #555",
                      color: "#aaa",
                    }}
                  >
                    {entry.rating}
                  </span>
                </td>
                <td style={{ padding: "8px 0", color: "#777", fontSize: "12px", textAlign: "right" }}>{entry.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
