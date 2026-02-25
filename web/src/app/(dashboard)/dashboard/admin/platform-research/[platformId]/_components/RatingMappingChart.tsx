"use client"

import { ArrowRight, Check, X, Minus } from "lucide-react"

// ── Types ───────────────────────────────────────────────────────

export interface RatingMappingData {
  netflixTiers: Record<
    string,
    {
      phosraTier: string
      mpaaRatings: string[]
      tvRatings: string[]
      ageRange: string
      isKidsProfile: boolean
    }
  >
  ratingSystems: Record<
    string,
    {
      supported: boolean | string
      ratings?: string[]
      notes: string
    }
  >
}

// ── Tier color map ──────────────────────────────────────────────

const TIER_COLORS: Record<string, { bg: string; text: string; pillBg: string; pillText: string }> = {
  "Little Kids": {
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
    text: "text-emerald-700 dark:text-emerald-300",
    pillBg: "bg-emerald-100 dark:bg-emerald-900/30",
    pillText: "text-emerald-700 dark:text-emerald-300",
  },
  "Older Kids": {
    bg: "bg-teal-50 dark:bg-teal-900/10",
    text: "text-teal-700 dark:text-teal-300",
    pillBg: "bg-teal-100 dark:bg-teal-900/30",
    pillText: "text-teal-700 dark:text-teal-300",
  },
  "Teens": {
    bg: "bg-amber-50 dark:bg-amber-900/10",
    text: "text-amber-700 dark:text-amber-300",
    pillBg: "bg-amber-100 dark:bg-amber-900/30",
    pillText: "text-amber-700 dark:text-amber-300",
  },
  "All Maturity Ratings": {
    bg: "bg-red-50 dark:bg-red-900/10",
    text: "text-red-700 dark:text-red-300",
    pillBg: "bg-red-100 dark:bg-red-900/30",
    pillText: "text-red-700 dark:text-red-300",
  },
}

const DEFAULT_COLORS = {
  bg: "bg-muted/30",
  text: "text-foreground",
  pillBg: "bg-muted",
  pillText: "text-muted-foreground",
}

// ── Phosra tier label map ───────────────────────────────────────

const PHOSRA_TIER_LABELS: Record<string, string> = {
  all_ages: "All Ages",
  ages_7_plus: "Ages 7+",
  ages_13_plus: "Ages 13+",
  adults_only: "Adults Only",
}

// ── Component ───────────────────────────────────────────────────

interface RatingMappingChartProps {
  ratingMapping: RatingMappingData | null
}

export function RatingMappingChart({ ratingMapping }: RatingMappingChartProps) {
  if (!ratingMapping) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No rating mapping data available for this platform.
      </div>
    )
  }

  const tierEntries = Object.entries(ratingMapping.netflixTiers)
  const systemEntries = Object.entries(ratingMapping.ratingSystems)

  return (
    <div className="space-y-6">
      {/* Tier flow chart */}
      <div className="space-y-2">
        {/* Column headers — desktop only */}
        <div className="hidden md:grid md:grid-cols-[1fr_auto_1.5fr_auto_1fr] gap-3 items-center px-1">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Platform Tier
          </div>
          <div />
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Content Ratings
          </div>
          <div />
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Phosra Tier
          </div>
        </div>

        {/* Tier rows */}
        {tierEntries.map(([tierName, tier]) => {
          const colors = TIER_COLORS[tierName] ?? DEFAULT_COLORS
          const allRatings = [...tier.mpaaRatings, ...tier.tvRatings]
          const phosraLabel = PHOSRA_TIER_LABELS[tier.phosraTier] ?? tier.phosraTier

          return (
            <div key={tierName}>
              {/* Desktop: 3-column flow */}
              <div className="hidden md:grid md:grid-cols-[1fr_auto_1.5fr_auto_1fr] gap-3 items-center">
                {/* Netflix tier */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#141414] border-l-4 border-[#E50914]">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {tierName}
                    </div>
                    <div className="text-[10px] text-zinc-400 tabular-nums">
                      {tier.ageRange}
                      {tier.isKidsProfile && (
                        <span className="ml-1.5 text-[#E50914]">Kids Profile</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                {/* Rating pills */}
                <div className="flex flex-wrap gap-1">
                  {allRatings.map((rating) => (
                    <span
                      key={rating}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.pillBg} ${colors.pillText}`}
                    >
                      {rating}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                {/* Phosra tier */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border-l-4 border-[#00D47E] bg-card">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {phosraLabel}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {tier.phosraTier}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile: vertical card */}
              <div className={`md:hidden rounded-lg ${colors.bg} p-3 space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-8 rounded-full bg-[#E50914]" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{tierName}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">
                        {tier.ageRange}
                        {tier.isKidsProfile && (
                          <span className="ml-1.5 text-[#E50914]">Kids Profile</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-foreground">{phosraLabel}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {tier.phosraTier}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {allRatings.map((rating) => (
                    <span
                      key={rating}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.pillBg} ${colors.pillText}`}
                    >
                      {rating}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Rating systems coverage */}
      {systemEntries.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Rating System Coverage
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {systemEntries.map(([system, info]) => {
              const isSupported = info.supported === true
              const isPartial = info.supported === "partial"

              let statusIcon: React.ReactNode
              let statusColor: string
              if (isSupported) {
                statusIcon = <Check className="w-3.5 h-3.5" />
                statusColor = "text-emerald-600 dark:text-emerald-400"
              } else if (isPartial) {
                statusIcon = <Minus className="w-3.5 h-3.5" />
                statusColor = "text-amber-600 dark:text-amber-400"
              } else {
                statusIcon = <X className="w-3.5 h-3.5" />
                statusColor = "text-muted-foreground"
              }

              return (
                <div
                  key={system}
                  className="plaid-card !p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {system.replace(/_/g, " ")}
                    </span>
                    <span className={statusColor}>{statusIcon}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                    {info.notes}
                  </div>
                  {info.ratings && info.ratings.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 pt-0.5">
                      {info.ratings.map((r) => (
                        <span
                          key={r}
                          className="text-[9px] px-1 py-px rounded bg-muted text-muted-foreground"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
