import type { CapabilityEntry } from "@/lib/parental-controls/types"
import { Check, Minus, X } from "lucide-react"

function SupportBadge({ support }: { support: string }) {
  switch (support) {
    case "full":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-green">
          <Check className="w-3.5 h-3.5" />
          Full
        </span>
      )
    case "partial":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
          <Minus className="w-3.5 h-3.5" />
          Partial
        </span>
      )
    case "none":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground/50">
          <X className="w-3.5 h-3.5" />
          No
        </span>
      )
    default:
      return (
        <span className="text-xs text-muted-foreground/40">—</span>
      )
  }
}

export function CapabilityMatrix({
  capabilities,
  accentColor,
  compact = false,
}: {
  capabilities: CapabilityEntry[]
  accentColor: string
  compact?: boolean
}) {
  if (compact) {
    const full = capabilities.filter((c) => c.support === "full").length
    const partial = capabilities.filter((c) => c.support === "partial").length
    const total = capabilities.length

    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${((full + partial * 0.5) / total) * 100}%`,
              background: accentColor,
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {full}/{total}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {capabilities.map((cap) => (
        <div
          key={cap.category}
          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm text-foreground">{cap.label}</span>
          <SupportBadge support={cap.support} />
        </div>
      ))}
    </div>
  )
}
