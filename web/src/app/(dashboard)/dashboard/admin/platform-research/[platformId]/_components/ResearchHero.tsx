"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { PlatformRegistryEntry } from "@/lib/platforms/types"
import type { PlatformResearchData } from "@/lib/platform-research/research-data-types"

interface ResearchHeroProps {
  platform: PlatformRegistryEntry
  data: PlatformResearchData
}

/* ── SVG Score Ring ───────────────────────────────────────────────── */

function ScoreRing({
  value,
  total,
  label,
}: {
  value: number
  total: number
  label: string
}) {
  const size = 88
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? value / total : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        {/* Value arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--brand-green))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text overlay */}
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xl font-bold text-foreground tabular-nums">
          {value}/{total}
        </span>
        <span className="text-[10px] text-muted-foreground leading-tight">
          {label}
        </span>
      </div>
    </div>
  )
}

/* ── Tier badge colors ────────────────────────────────────────────── */

const TIER_COLORS: Record<string, string> = {
  live: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  stub: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  planned: "bg-muted text-muted-foreground",
}

/* ── Hero Component ───────────────────────────────────────────────── */

export function ResearchHero({ platform, data }: ResearchHeroProps) {
  const enforceable =
    data.capabilities.fullyEnforceable.length +
    data.capabilities.partiallyEnforceable.length
  const total =
    enforceable + data.capabilities.notApplicable.length

  const researchDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="plaid-card space-y-4">
      {/* Back link */}
      <Link
        href="/dashboard/admin/platform-research"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Platform Research
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: name + meta */}
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-semibold text-foreground">
              {platform.name}
            </h1>
            {/* Brand color dot */}
            {platform.hex && (
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: `#${platform.hex}` }}
              />
            )}
            {/* Category badge */}
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
              {platform.category.replace(/_/g, " ")}
            </span>
            {/* Tier badge */}
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                TIER_COLORS[platform.tier] ?? TIER_COLORS.planned
              }`}
            >
              {platform.tier}
            </span>
          </div>

          {/* Research metadata line */}
          <p className="text-sm text-muted-foreground">
            {data.screenshotCount} screenshots
            {" \u00B7 "}
            Researched {researchDate}
          </p>
        </div>

        {/* Right: score ring */}
        <div className="flex-shrink-0 relative">
          <ScoreRing
            value={enforceable}
            total={total}
            label="enforceable"
          />
        </div>
      </div>
    </div>
  )
}
