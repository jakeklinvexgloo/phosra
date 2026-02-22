"use client"

import type { WarmIntroTarget, PipelineStatus } from "@/lib/investors/warm-intro-network"

const STAGES: { key: PipelineStatus; label: string }[] = [
  { key: "identified", label: "Identified" },
  { key: "connector-contacted", label: "Connector Contacted" },
  { key: "intro-requested", label: "Intro Requested" },
  { key: "intro-made", label: "Intro Made" },
  { key: "meeting-scheduled", label: "Meeting Scheduled" },
  { key: "meeting-complete", label: "Meeting Complete" },
  { key: "follow-up", label: "Follow-up" },
  { key: "term-sheet", label: "Term Sheet" },
  { key: "committed", label: "Committed" },
  { key: "wired", label: "Wired" },
]

export default function PipelineFunnel({ targets }: { targets: WarmIntroTarget[] }) {
  const counts: Record<PipelineStatus, number> = {} as Record<PipelineStatus, number>
  for (const s of STAGES) counts[s.key] = 0
  counts["passed"] = 0
  for (const t of targets) counts[t.status] = (counts[t.status] || 0) + 1

  const max = Math.max(1, ...STAGES.map((s) => counts[s.key]))
  const passedCount = counts["passed"]

  return (
    <div className="plaid-card">
      <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline Funnel</h3>
      <div className="space-y-2">
        {STAGES.map((s) => {
          const count = counts[s.key]
          const pct = (count / max) * 100
          return (
            <div key={s.key} className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground w-36 text-right flex-shrink-0">{s.label}</span>
              <div className="flex-1 h-5 bg-muted/40 rounded overflow-hidden relative">
                <div
                  className="h-full bg-brand-green/70 rounded transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums w-6 text-right">{count}</span>
            </div>
          )
        })}
      </div>
      {passedCount > 0 && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
          <span className="text-[11px] text-muted-foreground w-36 text-right flex-shrink-0">Passed</span>
          <div className="flex-1" />
          <span className="text-xs font-semibold tabular-nums w-6 text-right text-muted-foreground">{passedCount}</span>
        </div>
      )}
    </div>
  )
}
