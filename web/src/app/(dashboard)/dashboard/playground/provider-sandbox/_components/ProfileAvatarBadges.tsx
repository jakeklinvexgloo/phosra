"use client"

import type { ProfileAvatarBadgeData } from "@/lib/sandbox/types"

interface ProfileAvatarBadgesProps {
  badges: ProfileAvatarBadgeData[]
}

export function ProfileAvatarBadges({ badges }: ProfileAvatarBadgesProps) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {badges.map((badge) => (
        <div
          key={badge.profileId}
          className="relative"
          title={`${badge.profileName}${badge.isAffected ? "" : " (not affected)"}`}
        >
          {/* Mini avatar circle */}
          <div
            className="flex items-center justify-center rounded-full text-white font-semibold"
            style={{
              width: 20,
              height: 20,
              fontSize: 10,
              background: badge.avatarColor,
              opacity: badge.isAffected ? 1 : 0.3,
            }}
          >
            {badge.initial}
          </div>

          {/* Change count badge */}
          {badge.isAffected && badge.changeCount > 0 && (
            <span
              className="absolute flex items-center justify-center rounded-full text-white font-bold"
              style={{
                width: 12,
                height: 12,
                fontSize: 8,
                lineHeight: 1,
                top: -4,
                right: -4,
                backgroundColor: "#E50914",
              }}
              aria-label={`${badge.changeCount} pending change${badge.changeCount !== 1 ? "s" : ""}`}
            >
              {badge.changeCount}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
