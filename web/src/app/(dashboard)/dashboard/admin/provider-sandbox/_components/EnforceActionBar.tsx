"use client"

interface EnforceActionBarProps {
  changeCount: number
  hasChanges: boolean
  previewMode: boolean
  isComputing: boolean
  onPreview: () => void
  onApply: () => void
  onDiscard: () => void
  onReset: () => void
}

export function EnforceActionBar({
  changeCount,
  hasChanges,
  previewMode,
  isComputing,
  onPreview,
  onApply,
  onDiscard,
  onReset,
}: EnforceActionBarProps) {
  return (
    <div className="space-y-2 border-t border-border pt-3">
      {!previewMode ? (
        <div className="flex gap-2">
          <button
            onClick={onPreview}
            disabled={isComputing || !hasChanges}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isComputing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Computing...
              </span>
            ) : hasChanges ? (
              `Preview Changes (${changeCount} change${changeCount !== 1 ? "s" : ""})`
            ) : (
              "No Changes to Preview"
            )}
          </button>
          <button
            onClick={onReset}
            className="rounded-lg border border-border px-3 py-2.5 text-[12px] font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Reset
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onApply}
            className="flex-1 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#00D47E" }}
          >
            Apply Changes
          </button>
          <button
            onClick={onDiscard}
            className="rounded-lg border border-border px-3 py-2.5 text-[12px] font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Discard
          </button>
        </div>
      )}
    </div>
  )
}
