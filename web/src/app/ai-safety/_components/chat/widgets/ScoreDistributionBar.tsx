"use client"

interface ScoreDistributionBarProps {
  fullBlock: number
  partial: number
  softWarning: number
  compliant: number
  enthusiastic: number
  label?: string
}

const SEGMENTS = [
  { key: "fullBlock", label: "Full Block", color: "bg-emerald-500", dotColor: "bg-emerald-500" },
  { key: "partial", label: "Partial", color: "bg-blue-500", dotColor: "bg-blue-500" },
  { key: "softWarning", label: "Soft Warning", color: "bg-amber-500", dotColor: "bg-amber-500" },
  { key: "compliant", label: "Compliant", color: "bg-orange-500", dotColor: "bg-orange-500" },
  { key: "enthusiastic", label: "Enthusiastic", color: "bg-red-500", dotColor: "bg-red-500" },
] as const

export function ScoreDistributionBar({
  fullBlock,
  partial,
  softWarning,
  compliant,
  enthusiastic,
  label,
}: ScoreDistributionBarProps) {
  const values: Record<string, number> = { fullBlock, partial, softWarning, compliant, enthusiastic }
  const total = fullBlock + partial + softWarning + compliant + enthusiastic
  if (total === 0) return null

  return (
    <div className="my-2 space-y-1.5">
      {label && (
        <div className="text-[11px] font-medium text-white/60 uppercase tracking-wider">
          {label}
        </div>
      )}
      <div className="flex h-4 rounded-md overflow-hidden border border-white/10">
        {SEGMENTS.map(({ key, label: segLabel, color }) => {
          const count = values[key]
          if (count === 0) return null
          const pct = (count / total) * 100
          return (
            <div
              key={key}
              className={`${color} flex items-center justify-center text-[9px] font-medium text-white`}
              style={{ width: `${pct}%` }}
              title={`${segLabel}: ${count}`}
            >
              {pct >= 10 && count}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
        {SEGMENTS.map(({ key, label: segLabel, dotColor }) => {
          const count = values[key]
          if (count === 0) return null
          return (
            <span key={key} className="flex items-center gap-1 text-white/50">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              {segLabel} ({count})
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** Parse score distribution text like "34 full-block, 3 partial, 1 soft-warning, 2 compliant, 0 enthusiastic" */
export function parseScoreDistribution(text: string): ScoreDistributionBarProps | null {
  const nums: Record<string, number> = {
    fullBlock: 0,
    partial: 0,
    softWarning: 0,
    compliant: 0,
    enthusiastic: 0,
  }

  const fbMatch = text.match(/(\d+)\s*full[- ]?block/i)
  const partialMatch = text.match(/(\d+)\s*partial/i)
  const swMatch = text.match(/(\d+)\s*soft[- ]?warn/i)
  const compMatch = text.match(/(\d+)\s*compliant/i)
  const enthMatch = text.match(/(\d+)\s*enthusiastic/i)

  if (!fbMatch && !partialMatch && !swMatch && !compMatch && !enthMatch) return null

  if (fbMatch) nums.fullBlock = parseInt(fbMatch[1])
  if (partialMatch) nums.partial = parseInt(partialMatch[1])
  if (swMatch) nums.softWarning = parseInt(swMatch[1])
  if (compMatch) nums.compliant = parseInt(compMatch[1])
  if (enthMatch) nums.enthusiastic = parseInt(enthMatch[1])

  return nums as unknown as ScoreDistributionBarProps
}
