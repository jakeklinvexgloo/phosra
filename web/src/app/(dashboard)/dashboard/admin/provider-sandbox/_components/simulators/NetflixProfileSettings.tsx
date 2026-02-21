"use client"

import type { NetflixProfile } from "@/lib/sandbox/types"
import { DiffSection } from "./DiffSection"
import { NetflixMaturitySlider } from "./NetflixMaturitySlider"
import { NetflixBlockedTitles } from "./NetflixBlockedTitles"
import { NetflixProfileLock } from "./NetflixProfileLock"
import { NetflixAutoplayToggles } from "./NetflixAutoplayToggles"
import { NetflixViewingActivity } from "./NetflixViewingActivity"

interface NetflixProfileSettingsProps {
  profile: NetflixProfile
  previousProfile: NetflixProfile | null
  previewMode: boolean
  isHighlighted: (key: string) => boolean
}

export function NetflixProfileSettings({
  profile,
  previousProfile,
  previewMode,
  isHighlighted,
}: NetflixProfileSettingsProps) {
  const hk = (field: string) => isHighlighted(`${profile.id}:${field}`)

  const inDiffMode = previewMode && previousProfile !== null

  // Determine diff variants for each section
  const maturityChanged = inDiffMode && previousProfile.maturityRating !== profile.maturityRating
  const blockedTitlesChanged = inDiffMode && (
    previousProfile.blockedTitles.length !== profile.blockedTitles.length ||
    previousProfile.blockedTitles.some((t, i) => profile.blockedTitles[i] !== t) ||
    profile.blockedTitles.some((t) => !previousProfile.blockedTitles.includes(t))
  )
  const lockChanged = inDiffMode && (
    previousProfile.profileLock.enabled !== profile.profileLock.enabled ||
    previousProfile.profileLock.pin !== profile.profileLock.pin
  )
  const timeLimitChanged = inDiffMode && previousProfile.timeLimitManaged !== profile.timeLimitManaged

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
      {profile.timeLimitManaged && !inDiffMode && (
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

      {/* Time limit diff when in preview mode */}
      {inDiffMode && timeLimitChanged && (
        <DiffSection
          title="Time Limit"
          variant={previousProfile.timeLimitManaged ? "changed" : "new"}
          beforeContent={
            <span style={{ fontSize: "13px" }}>
              {previousProfile.timeLimitManaged ? "Phosra-managed" : "(no limit)"}
            </span>
          }
          afterContent={
            <span style={{ fontSize: "13px" }}>
              {profile.timeLimitManaged ? "Phosra-managed" : "(no limit)"}
            </span>
          }
        />
      )}

      {/* Maturity Rating */}
      {inDiffMode ? (
        maturityChanged ? (
          <DiffSection
            title="Maturity Rating"
            variant="changed"
            beforeContent={
              <NetflixMaturitySlider
                value={previousProfile.maturityRating}
                previousValue={null}
                isHighlighted={false}
              />
            }
            afterContent={
              <NetflixMaturitySlider
                value={profile.maturityRating}
                previousValue={null}
                isHighlighted={false}
              />
            }
          />
        ) : (
          <DiffSection
            title="Maturity Rating"
            variant="unchanged"
            beforeContent={null}
            afterContent={
              <span style={{ fontSize: "12px" }}>
                {profile.maturityRating} and below (no changes)
              </span>
            }
          />
        )
      ) : (
        <NetflixMaturitySlider
          value={profile.maturityRating}
          previousValue={null}
          isHighlighted={hk("maturityRating")}
        />
      )}

      {/* Blocked Titles */}
      {inDiffMode ? (
        blockedTitlesChanged ? (
          <DiffSection
            title="Blocked Titles"
            variant={previousProfile.blockedTitles.length === 0 && profile.blockedTitles.length > 0 ? "new" : "changed"}
            beforeContent={
              <NetflixBlockedTitles
                titles={previousProfile.blockedTitles}
                previousTitles={null}
                isHighlighted={false}
              />
            }
            afterContent={
              <NetflixBlockedTitles
                titles={profile.blockedTitles}
                previousTitles={null}
                isHighlighted={false}
              />
            }
          />
        ) : (
          <DiffSection
            title="Blocked Titles"
            variant="unchanged"
            beforeContent={null}
            afterContent={
              <span style={{ fontSize: "12px" }}>
                {profile.blockedTitles.length === 0
                  ? "No blocked titles (no changes)"
                  : `${profile.blockedTitles.length} blocked titles (no changes)`}
              </span>
            }
          />
        )
      ) : (
        <NetflixBlockedTitles
          titles={profile.blockedTitles}
          previousTitles={null}
          isHighlighted={hk("blockedTitles")}
        />
      )}

      {/* Profile Lock */}
      {inDiffMode ? (
        lockChanged ? (
          <DiffSection
            title="Profile Lock"
            variant="changed"
            beforeContent={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px" }}>
                  {previousProfile.profileLock.enabled ? "ON" : "OFF"}
                </span>
              </div>
            }
            afterContent={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px" }}>
                  {profile.profileLock.enabled ? "ON" : "OFF"}
                </span>
              </div>
            }
          />
        ) : (
          <DiffSection
            title="Profile Lock"
            variant="unchanged"
            beforeContent={null}
            afterContent={
              <span style={{ fontSize: "12px" }}>
                {profile.profileLock.enabled ? "ON" : "OFF"} (no changes)
              </span>
            }
          />
        )
      ) : (
        <NetflixProfileLock
          enabled={profile.profileLock.enabled}
          pin={profile.profileLock.pin}
          previousEnabled={null}
          previousPin={null}
          isHighlighted={hk("profileLock")}
        />
      )}

      {/* Autoplay - always unchanged in diff mode */}
      {inDiffMode ? (
        <DiffSection
          title="Autoplay"
          variant="unchanged"
          beforeContent={null}
          afterContent={
            <span style={{ fontSize: "12px" }}>
              Next Episode: {profile.autoplayNextEpisode ? "ON" : "OFF"} | Previews: {profile.autoplayPreviews ? "ON" : "OFF"} (no changes)
            </span>
          }
        />
      ) : (
        <NetflixAutoplayToggles
          nextEpisode={profile.autoplayNextEpisode}
          previews={profile.autoplayPreviews}
        />
      )}

      {/* Viewing Activity - always unchanged in diff mode */}
      {inDiffMode ? (
        <DiffSection
          title="Viewing Activity"
          variant="unchanged"
          beforeContent={null}
          afterContent={
            <span style={{ fontSize: "12px" }}>
              {profile.viewingActivity.length} entries (no changes)
            </span>
          }
        />
      ) : (
        <NetflixViewingActivity
          entries={profile.viewingActivity}
          isHighlighted={hk("viewingActivity")}
        />
      )}
    </div>
  )
}
