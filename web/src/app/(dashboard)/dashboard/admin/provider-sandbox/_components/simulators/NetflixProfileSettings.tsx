"use client"

import type { NetflixProfile } from "@/lib/sandbox/types"
import { NetflixMaturitySlider } from "./NetflixMaturitySlider"
import { NetflixBlockedTitles } from "./NetflixBlockedTitles"
import { NetflixProfileLock } from "./NetflixProfileLock"
import { NetflixAutoplayToggles } from "./NetflixAutoplayToggles"
import { NetflixViewingActivity } from "./NetflixViewingActivity"

interface NetflixProfileSettingsProps {
  profile: NetflixProfile
  isHighlighted: (key: string) => boolean
}

export function NetflixProfileSettings({ profile, isHighlighted }: NetflixProfileSettingsProps) {
  const hk = (field: string) => isHighlighted(`${profile.id}:${field}`)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        borderTop: "1px solid #333",
        paddingTop: "16px",
      }}
    >
      {/* Profile header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "6px",
            background: profile.avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {profile.name.charAt(0)}
        </div>
        <div>
          <span style={{ color: "#fff", fontSize: "15px", fontWeight: 600 }}>{profile.name}</span>
          <span style={{ color: "#777", fontSize: "12px", marginLeft: "8px" }}>
            {profile.type === "kids" ? "Kids Profile" : profile.type === "adult" ? "Admin Profile" : "Standard Profile"}
          </span>
        </div>
      </div>

      {/* Time limit managed badge */}
      {profile.timeLimitManaged && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "6px",
            backgroundColor: "rgba(217, 119, 6, 0.1)",
            border: "1px solid rgba(217, 119, 6, 0.3)",
            boxShadow: hk("timeLimitManaged") ? "0 0 0 2px #00D47E" : "none",
            transition: "box-shadow 0.3s",
          }}
        >
          <span style={{ fontSize: "14px" }}>&#9201;</span>
          <span style={{ color: "#d97706", fontSize: "12px", fontWeight: 600 }}>
            TIME LIMIT: Phosra-managed
          </span>
          <span style={{ color: "#a3730a", fontSize: "11px", marginLeft: "auto" }}>
            Not natively supported by Netflix
          </span>
        </div>
      )}

      {/* Settings sections */}
      <NetflixMaturitySlider
        value={profile.maturityRating}
        isHighlighted={hk("maturityRating")}
      />

      <NetflixBlockedTitles
        titles={profile.blockedTitles}
        isHighlighted={hk("blockedTitles")}
      />

      <NetflixProfileLock
        enabled={profile.profileLock.enabled}
        pin={profile.profileLock.pin}
        isHighlighted={hk("profileLock")}
      />

      <NetflixAutoplayToggles
        nextEpisode={profile.autoplayNextEpisode}
        previews={profile.autoplayPreviews}
      />

      <NetflixViewingActivity
        entries={profile.viewingActivity}
        isHighlighted={hk("viewingActivity")}
      />
    </div>
  )
}
