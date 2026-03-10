"use client"

import { useState } from "react"

interface NetflixProfileLockProps {
  enabled: boolean
  pin: string
  previousEnabled: boolean | null
  previousPin: string | null
  isHighlighted: boolean
}

function ToggleSwitch({ on, muted }: { on: boolean; muted?: boolean }) {
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
        opacity: muted ? 0.6 : 1,
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

export function NetflixProfileLock({
  enabled,
  pin,
  previousEnabled,
  previousPin,
  isHighlighted,
}: NetflixProfileLockProps) {
  const [showPin, setShowPin] = useState(false)

  // No diff mode: render normally
  if (previousEnabled === null) {
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
          Profile Lock
        </h4>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ToggleSwitch on={enabled} />
          <span style={{ color: enabled ? "#fff" : "#555", fontSize: "13px", fontWeight: 500 }}>
            {enabled ? "ON" : "OFF"}
          </span>
          {enabled && pin && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#777", fontSize: "12px" }}>PIN:</span>
              <span style={{ color: "#fff", fontSize: "14px", fontFamily: "monospace", letterSpacing: "0.2em" }}>
                {showPin ? pin : "****"}
              </span>
              <button
                onClick={() => setShowPin(!showPin)}
                style={{
                  color: "#E50914",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 6px",
                }}
              >
                {showPin ? "HIDE" : "SHOW"}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Diff mode: show before/after toggle state
  const hasChanged = previousEnabled !== enabled || previousPin !== pin

  if (!hasChanged) {
    return (
      <div style={{ padding: "16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ToggleSwitch on={enabled} />
          <span style={{ color: enabled ? "#fff" : "#555", fontSize: "13px", fontWeight: 500 }}>
            {enabled ? "ON" : "OFF"} (no changes)
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "16px 0" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        {/* Before */}
        <div
          style={{
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 107, 107, 0.06)",
            border: "1px solid rgba(255, 107, 107, 0.15)",
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FF6B6B", marginBottom: "8px" }}>
            Before
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ToggleSwitch on={previousEnabled} muted />
            <span style={{ color: "#FF6B6B", fontSize: "13px" }}>
              {previousEnabled ? "ON" : "OFF"}
            </span>
          </div>
          {previousEnabled && previousPin && (
            <div style={{ color: "#FF6B6B", fontSize: "11px", marginTop: "4px" }}>
              PIN: ****
            </div>
          )}
        </div>

        {/* After */}
        <div
          style={{
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 212, 126, 0.06)",
            border: "1px solid rgba(0, 212, 126, 0.15)",
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00D47E", marginBottom: "8px" }}>
            After
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ToggleSwitch on={enabled} />
            <span style={{ color: "#00D47E", fontSize: "13px" }}>
              {enabled ? "ON" : "OFF"}
            </span>
          </div>
          {enabled && pin && (
            <div style={{ color: "#00D47E", fontSize: "11px", marginTop: "4px" }}>
              PIN: {showPin ? pin : "****"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
