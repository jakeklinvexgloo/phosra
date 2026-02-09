"use client"

import { DISPLAY_GROUPS } from "@/lib/compliance/country-flags"
import { LAW_REGISTRY } from "@/lib/compliance"

interface JurisdictionBadge {
  flag: string
  count: number
  label: string
}

function getBadges(): JurisdictionBadge[] {
  const counts: Record<string, number> = {}
  for (const law of LAW_REGISTRY) {
    counts[law.jurisdictionGroup] = (counts[law.jurisdictionGroup] || 0) + 1
  }
  return DISPLAY_GROUPS.map((g) => ({
    flag: g.flag,
    count: counts[g.jurisdictionGroup] || 0,
    label: g.label,
  })).filter((b) => b.count > 0)
}

export function JurisdictionSummaryRow() {
  const badges = getBadges()

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border text-sm"
        >
          <span aria-hidden>{badge.flag}</span>
          <span className="font-semibold text-foreground tabular-nums">{badge.count}</span>
          <span className="text-muted-foreground text-xs">{badge.label}</span>
        </div>
      ))}
    </div>
  )
}
