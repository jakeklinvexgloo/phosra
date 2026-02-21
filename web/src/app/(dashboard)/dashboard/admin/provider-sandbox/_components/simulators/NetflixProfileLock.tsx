"use client"

import { useState } from "react"

interface NetflixProfileLockProps {
  enabled: boolean
  pin: string
  isHighlighted: boolean
}

export function NetflixProfileLock({ enabled, pin, isHighlighted }: NetflixProfileLockProps) {
  const [showPin, setShowPin] = useState(false)

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
        {/* Toggle */}
        <div
          style={{
            width: 44,
            height: 24,
            borderRadius: "12px",
            backgroundColor: enabled ? "#E50914" : "#333",
            position: "relative",
            transition: "background-color 0.3s",
            cursor: "default",
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
              left: enabled ? 23 : 3,
              transition: "left 0.3s",
            }}
          />
        </div>
        <span style={{ color: enabled ? "#fff" : "#555", fontSize: "13px", fontWeight: 500 }}>
          {enabled ? "ON" : "OFF"}
        </span>

        {/* PIN */}
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
