"use client"

import type { NetflixProfile, ProfileChangeSummary, ProtectionScore } from "@/lib/sandbox/types"
import { NetflixProfileCard } from "./NetflixProfileCard"
import { NetflixProfileSettings } from "./NetflixProfileSettings"

interface NetflixSimulatorProps {
  profiles: NetflixProfile[]
  previousProfiles: NetflixProfile[] | null
  previewMode: boolean
  selectedProfileId: string
  onSelectProfile: (id: string) => void
  isHighlighted: (key: string) => boolean
  profileChangeSummaries: ProfileChangeSummary[]
  protectionScores: Map<string, ProtectionScore>
}

export function NetflixSimulator({
  profiles,
  previousProfiles,
  previewMode,
  selectedProfileId,
  onSelectProfile,
  isHighlighted,
  profileChangeSummaries,
  protectionScores,
}: NetflixSimulatorProps) {
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0]
  const previousProfile = previousProfiles?.find((p) => p.id === selectedProfileId) ?? null

  // Build a map of profileId -> changeCount from summaries
  const changeCountMap = new Map<string, number>()
  for (const summary of profileChangeSummaries) {
    changeCountMap.set(summary.profileId, summary.changeCount)
  }

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
              changeCount={previewMode ? (changeCountMap.get(profile.id) ?? 0) : 0}
              protectionScore={protectionScores.get(profile.id) ?? null}
            />
          ))}
        </div>
      </div>

      {/* Preview mode aria announcement */}
      {previewMode && (
        <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
          Preview mode: {profileChangeSummaries.reduce((sum, s) => sum + s.changeCount, 0)} changes across {profileChangeSummaries.length} profiles
        </div>
      )}

      {/* Selected profile settings */}
      {selectedProfile && (
        <NetflixProfileSettings
          profile={selectedProfile}
          previousProfile={previewMode ? previousProfile : null}
          previewMode={previewMode}
          isHighlighted={isHighlighted}
        />
      )}
    </div>
  )
}
