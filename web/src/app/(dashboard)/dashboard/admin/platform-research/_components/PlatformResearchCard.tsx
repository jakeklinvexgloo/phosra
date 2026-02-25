"use client"

import Link from "next/link"
import { Play, Camera, Clock, ArrowRight } from "lucide-react"
import type { PlatformRegistryEntry } from "@/lib/platforms/types"
import type { ResearchResult } from "@/lib/platform-research/types"
import { ResearchStatusBadge } from "./ResearchStatusBadge"

// Platforms with completed research reports (will be replaced with dynamic detection later)
const RESEARCHED_PLATFORMS = ["netflix", "peacock"] as const
const researchedSet = new Set<string>(RESEARCHED_PLATFORMS)

interface PlatformResearchCardProps {
  platform: PlatformRegistryEntry
  result?: ResearchResult
  hasAdapter: boolean
  onSelect: () => void
  onTriggerResearch: () => void
}

export function PlatformResearchCard({
  platform,
  result,
  hasAdapter,
  onSelect,
  onTriggerResearch,
}: PlatformResearchCardProps) {
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return null
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const categoryLabel = platform.category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  const isResearched = researchedSet.has(platform.id)
  const detailHref = `/dashboard/admin/platform-research/${platform.id}`

  const cardClassName = "plaid-card !p-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-ring/50 transition-all group block"

  const cardInner = (
    <>
      <div className="p-4 space-y-3">
        {/* Header row: name + adapter indicator */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {/* Platform color dot */}
              {platform.hex && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `#${platform.hex}` }}
                />
              )}
              <h3 className="text-sm font-medium text-foreground truncate">
                {platform.name}
              </h3>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5 block">
              {categoryLabel}
            </span>
          </div>

          {/* Adapter indicator */}
          {hasAdapter && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Adapter
            </span>
          )}
        </div>

        {/* Status badge */}
        <div>
          {isResearched && !result?.status ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Completed
            </span>
          ) : (
            <ResearchStatusBadge status={result?.status ?? null} />
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {result?.completedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(result.completedAt)}
              </span>
            )}
            {result?.screenshots && result.screenshots.length > 0 && (
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3" />
                {result.screenshots.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="border-t border-border/50 px-4 py-2.5 bg-muted/20 flex items-center justify-between">
        {isResearched ? (
          <span className="flex items-center gap-1 text-[11px] font-medium text-foreground/70 group-hover:text-foreground transition-colors">
            View Report
            <ArrowRight className="w-3 h-3" />
          </span>
        ) : (
          <div className="flex items-center gap-2 ml-auto">
            {hasAdapter ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onTriggerResearch()
                }}
                disabled={result?.status === "running"}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Play className="w-3 h-3" />
                {result?.status === "running" ? "Running..." : "Research"}
              </button>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                No adapter
              </span>
            )}
          </div>
        )}
      </div>
    </>
  )

  if (isResearched) {
    return (
      <Link href={detailHref} className={cardClassName}>
        {cardInner}
      </Link>
    )
  }

  return (
    <div onClick={onSelect} className={cardClassName}>
      {cardInner}
    </div>
  )
}
