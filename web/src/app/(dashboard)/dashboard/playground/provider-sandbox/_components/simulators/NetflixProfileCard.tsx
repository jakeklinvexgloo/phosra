"use client"

import type { NetflixProfile, ProtectionScore } from "@/lib/sandbox/types"

interface NetflixProfileCardProps {
  profile: NetflixProfile
  isSelected: boolean
  onSelect: () => void
  isHighlighted: boolean
  changeCount: number
  protectionScore: ProtectionScore | null
}

function getScoreColor(value: number): string {
  if (value <= 3) return "#E74C3C"
  if (value <= 6) return "#D97706"
  return "#00D47E"
}

export function NetflixProfileCard({
  profile,
  isSelected,
  onSelect,
  isHighlighted,
  changeCount,
  protectionScore,
}: NetflixProfileCardProps) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "12px",
        borderRadius: "8px",
        border: isSelected ? "2px solid #E50914" : "2px solid transparent",
        backgroundColor: isSelected ? "rgba(229, 9, 20, 0.1)" : "transparent",
        cursor: "pointer",
        transition: "all 0.2s",
        outline: "none",
        boxShadow: isHighlighted ? "0 0 0 2px #00D47E" : "none",
      }}
    >
      {/* Avatar with change count badge */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "8px",
            background: profile.avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {profile.name.charAt(0)}
        </div>

        {/* Change count badge */}
        {changeCount > 0 && (
          <div
            aria-label={`${changeCount} pending changes`}
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: "#E50914",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "9px",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {changeCount}
          </div>
        )}
      </div>

      {/* Name */}
      <span style={{ color: "#aaa", fontSize: "13px", fontWeight: 500 }}>
        {profile.name}
      </span>

      {/* Type badge */}
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "0.05em",
          padding: "2px 8px",
          borderRadius: "4px",
          backgroundColor:
            profile.type === "kids"
              ? "rgba(39, 174, 96, 0.2)"
              : profile.type === "adult"
                ? "rgba(229, 9, 20, 0.2)"
                : "rgba(170, 170, 170, 0.15)",
          color:
            profile.type === "kids"
              ? "#27ae60"
              : profile.type === "adult"
                ? "#E50914"
                : "#aaa",
        }}
      >
        {profile.type === "kids" ? "Kids" : profile.type === "adult" ? "Admin" : "Standard"}
      </span>

      {/* Protection score */}
      {protectionScore && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: getScoreColor(protectionScore.value),
            }}
          >
            {protectionScore.value}/10
          </span>
          {protectionScore.gapCount > 0 && (
            <span style={{ fontSize: "9px", color: "#E74C3C", fontWeight: 600 }}>
              !! {protectionScore.gapCount} gaps
            </span>
          )}
        </div>
      )}
    </button>
  )
}
