"use client"

import {
  ExternalLink,
  Play,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Shield,
  Zap,
  Monitor,
  Gamepad2,
  MessageCircle,
  Smartphone,
  GraduationCap,
} from "lucide-react"
import type { Platform, PlatformResearchResult, PlatformCategory } from "@/lib/platform-research"

const CATEGORY_ICONS: Record<PlatformCategory, typeof Monitor> = {
  streaming: Monitor,
  gaming: Gamepad2,
  social: MessageCircle,
  device: Smartphone,
  education: GraduationCap,
}

const CATEGORY_COLORS: Record<PlatformCategory, string> = {
  streaming: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  gaming: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  social: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  device: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  education: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
}

interface PlatformCardProps {
  platform: Platform
  result?: PlatformResearchResult
  hasCredentials: boolean
  onResearch: (platformId: string) => void
  isResearching: boolean
  isSelected: boolean
  onSelect: (platformId: string) => void
}

export function PlatformCard({
  platform,
  result,
  hasCredentials,
  onResearch,
  isResearching,
  isSelected,
  onSelect,
}: PlatformCardProps) {
  const Icon = CATEGORY_ICONS[platform.category]
  const colorClass = CATEGORY_COLORS[platform.category]

  const statusBadge = () => {
    if (!result || result.status === "not_started") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Circle className="w-2.5 h-2.5" />
          Not researched
        </span>
      )
    }
    if (result.status === "in_progress" || isResearching) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
          <Clock className="w-2.5 h-2.5 animate-pulse" />
          Researching...
        </span>
      )
    }
    if (result.status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-brand-green">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Completed
        </span>
      )
    }
    if (result.status === "error") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="w-2.5 h-2.5" />
          Error
        </span>
      )
    }
    if (result.status === "needs_update") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-2.5 h-2.5" />
          Needs update
        </span>
      )
    }
    return null
  }

  return (
    <button
      onClick={() => onSelect(platform.id)}
      className={`plaid-card text-left hover:border-foreground/20 transition-all ${
        isSelected ? "border-foreground/30 ring-1 ring-foreground/10" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-md ${colorClass}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{platform.name}</div>
            <div className="text-[11px] text-muted-foreground capitalize">{platform.category}</div>
          </div>
        </div>
        {statusBadge()}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{platform.audience}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {platform.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="inline-block px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded"
          >
            {tag}
          </span>
        ))}
        {platform.tags.length > 4 && (
          <span className="text-[10px] text-muted-foreground">+{platform.tags.length - 4}</span>
        )}
      </div>

      {/* Assessment mini-stats (if researched) */}
      {result?.assessment && (
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-medium tabular-nums">{result.assessment.protectionRating}/10</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-medium tabular-nums">{result.assessment.phosraCoverage}%</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {result.assessment.featureCount} controls
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
        {hasCredentials ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onResearch(platform.id)
            }}
            disabled={isResearching}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-40"
          >
            <Play className="w-2.5 h-2.5" />
            {isResearching ? "Researching..." : "Research"}
          </button>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">No credentials configured</span>
        )}
        <a
          href={platform.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-2.5 h-2.5" />
          Visit
        </a>
        {platform.hasApi && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green font-medium">
            API
          </span>
        )}
      </div>
    </button>
  )
}
