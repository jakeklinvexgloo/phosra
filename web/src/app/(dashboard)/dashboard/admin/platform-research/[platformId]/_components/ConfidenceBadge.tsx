"use client"

interface ConfidenceBadgeProps {
  confidence: number
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100)

  let colorClasses: string
  if (pct > 80) {
    colorClasses = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
  } else if (pct >= 50) {
    colorClasses = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
  } else {
    colorClasses = "bg-muted text-muted-foreground"
  }

  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full ${colorClasses}`}
    >
      {pct}%
    </span>
  )
}
