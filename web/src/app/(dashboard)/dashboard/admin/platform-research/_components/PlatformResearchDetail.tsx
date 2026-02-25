"use client"

import { X, RotateCcw, AlertTriangle, CheckCircle2, MapPin, Camera, FileText, GitCompare } from "lucide-react"
import type { ResearchResult, RegistryDiff } from "@/lib/platform-research/types"
import { ResearchStatusBadge } from "./ResearchStatusBadge"
import { ScreenshotGallery } from "./ScreenshotGallery"
import { CapabilityComparisonTable } from "./CapabilityComparisonTable"

interface PlatformResearchDetailProps {
  platformId: string
  result: ResearchResult | undefined
  onClose: () => void
  onRerun: () => void
}

export function PlatformResearchDetail({
  platformId,
  result,
  onClose,
  onRerun,
}: PlatformResearchDetailProps) {
  const formatDuration = (ms?: number) => {
    if (!ms) return null
    if (ms < 1000) return `${ms}ms`
    const secs = Math.round(ms / 1000)
    if (secs < 60) return `${secs}s`
    return `${Math.floor(secs / 60)}m ${secs % 60}s`
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never"
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl z-40 flex flex-col bg-background border-l border-border shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-lg font-semibold text-foreground truncate">
            {result?.platformName || platformId}
          </h2>
          <ResearchStatusBadge status={result?.status ?? null} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onRerun}
            disabled={result?.status === "running"}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
            Re-run Research
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 px-5">
            <FileText className="w-10 h-10 opacity-40" />
            <div className="text-center">
              <p className="text-sm font-medium">No research data</p>
              <p className="text-xs mt-1">
                Click &ldquo;Re-run Research&rdquo; to start automated research for this platform.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {/* Error banner */}
            {result.status === "failed" && result.errorMessage && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-700 dark:text-red-400">
                  <div className="font-medium mb-1">Research Failed</div>
                  <div className="font-mono whitespace-pre-wrap">
                    {result.errorMessage}
                  </div>
                </div>
              </div>
            )}

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  Started
                </div>
                <div className="text-sm text-foreground">
                  {formatDate(result.startedAt)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  Completed
                </div>
                <div className="text-sm text-foreground">
                  {formatDate(result.completedAt)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  Duration
                </div>
                <div className="text-sm text-foreground">
                  {formatDuration(result.durationMs) || "---"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  Trigger
                </div>
                <div className="text-sm text-foreground capitalize">
                  {result.triggerType}
                </div>
              </div>
            </div>

            {/* Notes section */}
            {result.notes && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="w-4 h-4" />
                  Research Notes
                </h3>

                {/* Summary */}
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {result.notes.summary}
                </div>

                {/* Quick flags */}
                <div className="flex flex-wrap gap-2">
                  <FlagBadge
                    label="Parental Controls"
                    found={result.notes.parentalControlsFound}
                  />
                  <FlagBadge
                    label="Screen Time Limits"
                    found={result.notes.screenTimeLimits}
                  />
                  <FlagBadge
                    label="Purchase Controls"
                    found={result.notes.purchaseControls}
                  />
                </div>

                {/* Settings location */}
                {result.notes.settingsLocation && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>Settings at: {result.notes.settingsLocation}</span>
                  </div>
                )}

                {/* Capabilities list */}
                {result.notes.capabilities.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Discovered Capabilities ({result.notes.capabilities.length})
                    </div>
                    <div className="space-y-1.5">
                      {result.notes.capabilities.map((cap) => (
                        <div
                          key={cap.ruleCategory}
                          className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground font-mono">
                              {cap.ruleCategory}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {cap.description}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Found at: {cap.location}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-[10px] text-muted-foreground tabular-nums">
                            {Math.round(cap.confidence * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Age restriction options */}
                {result.notes.ageRestrictionOptions.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Age Restriction Options
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.notes.ageRestrictionOptions.map((opt) => (
                        <span
                          key={opt}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy settings */}
                {result.notes.privacySettings.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Privacy Settings
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.notes.privacySettings.map((setting) => (
                        <span
                          key={setting}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {setting}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw notes */}
                {result.notes.rawNotes && (
                  <details className="text-xs">
                    <summary className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      Raw notes
                    </summary>
                    <pre className="mt-2 p-3 rounded-lg bg-muted/30 font-mono text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {result.notes.rawNotes}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Screenshots section */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Camera className="w-4 h-4" />
                Screenshots ({result.screenshots.length})
              </h3>
              <ScreenshotGallery screenshots={result.screenshots} />
            </div>

            {/* Capability comparison (placeholder — no diff data available yet) */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <GitCompare className="w-4 h-4" />
                Registry Comparison
              </h3>
              <CapabilityComparisonTable diff={null} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Small flag badge showing whether a feature was found */
function FlagBadge({ label, found }: { label: string; found: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
        found
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {found ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <X className="w-3 h-3" />
      )}
      {label}
    </span>
  )
}
