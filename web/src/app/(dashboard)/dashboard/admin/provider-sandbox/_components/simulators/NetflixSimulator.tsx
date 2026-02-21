"use client"

import type { NetflixProfile } from "@/lib/sandbox/types"
import { NetflixProfileCard } from "./NetflixProfileCard"
import { NetflixProfileSettings } from "./NetflixProfileSettings"

interface NetflixSimulatorProps {
  profiles: NetflixProfile[]
  selectedProfileId: string
  onSelectProfile: (id: string) => void
  isHighlighted: (key: string) => boolean
}

export function NetflixSimulator({
  profiles,
  selectedProfileId,
  onSelectProfile,
  isHighlighted,
}: NetflixSimulatorProps) {
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0]

  return (
    <div
      style={{
        backgroundColor: "#141414",
        padding: "24px",
        minHeight: "600px",
        borderRadius: "10px",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Netflix wordmark */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            color: "#E50914",
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
          }}
        >
          NETFLIX
        </span>
        <span style={{ color: "#555", fontSize: "12px" }}>
          Parental Controls
        </span>
      </div>

      {/* Profile row */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ color: "#777", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "12px" }}>
          Who&apos;s watching?
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          {profiles.map((profile) => (
            <NetflixProfileCard
              key={profile.id}
              profile={profile}
              isSelected={profile.id === selectedProfileId}
              onSelect={() => onSelectProfile(profile.id)}
              isHighlighted={isHighlighted(`${profile.id}:profile`)}
            />
          ))}
        </div>
      </div>

      {/* Selected profile settings */}
      {selectedProfile && (
        <NetflixProfileSettings
          profile={selectedProfile}
          isHighlighted={isHighlighted}
        />
      )}
    </div>
  )
}
