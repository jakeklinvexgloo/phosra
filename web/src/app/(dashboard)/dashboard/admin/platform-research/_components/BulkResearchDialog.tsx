"use client"

import { useState } from "react"
import { X, Play, Loader2 } from "lucide-react"
import type { PlatformRegistryEntry } from "@/lib/platforms/types"

interface BulkResearchDialogProps {
  platforms: PlatformRegistryEntry[]
  onConfirm: (platformIds: string[]) => void
  onCancel: () => void
  isRunning: boolean
}

export function BulkResearchDialog({
  platforms,
  onConfirm,
  onCancel,
  isRunning,
}: BulkResearchDialogProps) {
  const [progress, setProgress] = useState(0)

  const estimatedMinutes = platforms.length * 3 // ~3 min per platform avg
  const estimatedTime =
    estimatedMinutes < 60
      ? `${estimatedMinutes} minutes`
      : `${Math.round(estimatedMinutes / 60 * 10) / 10} hours`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!isRunning ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 bg-background rounded-xl border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Bulk Platform Research
          </h2>
          {!isRunning && (
            <button
              onClick={onCancel}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            This will run automated research on{" "}
            <span className="font-medium text-foreground">
              {platforms.length} platform{platforms.length !== 1 ? "s" : ""}
            </span>{" "}
            with available adapters.
          </p>

          {/* Platform list */}
          <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
            <div className="divide-y divide-border/50">
              {platforms.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-2 text-sm"
                >
                  {p.hex && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `#${p.hex}` }}
                    />
                  )}
                  <span className="text-foreground">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {p.category.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated time */}
          <div className="text-xs text-muted-foreground">
            Estimated time: ~{estimatedTime} (2-5 min per platform)
          </div>

          {/* Progress bar (when running) */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium tabular-nums">
                  {progress} / {platforms.length}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-500"
                  style={{
                    width: `${platforms.length > 0 ? (progress / platforms.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          {!isRunning ? (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(platforms.map((p) => p.id))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Start Research
              </button>
            </>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-foreground/50 text-background cursor-not-allowed"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Researching...
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
