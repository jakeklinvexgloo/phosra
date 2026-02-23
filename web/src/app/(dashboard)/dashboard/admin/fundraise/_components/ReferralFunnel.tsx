"use client"

interface FunnelStage {
  label: string
  count: number
}

function pct(a: number, b: number): string {
  if (b === 0) return "—"
  return `${Math.round((a / b) * 100)}%`
}

export default function ReferralFunnel({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(1, ...stages.map((s) => s.count))

  return (
    <div className="plaid-card">
      <h3 className="text-sm font-semibold text-foreground mb-4">Referral Funnel</h3>
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const barPct = (stage.count / max) * 100
          const conversionRate = i > 0 && stages[i - 1].count > 0
            ? pct(stage.count, stages[i - 1].count)
            : null
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground w-32 text-right flex-shrink-0">
                {stage.label}
              </span>
              <div className="flex-1 h-5 bg-muted/40 rounded overflow-hidden relative">
                <div
                  className="h-full bg-brand-green/70 rounded transition-all duration-300"
                  style={{ width: `${barPct}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums w-8 text-right">
                {stage.count}
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">
                {conversionRate || ""}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
