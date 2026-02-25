"use client"

import { CheckCircle2, Loader2, XCircle, Circle } from "lucide-react"
import type { ResearchStats } from "@/lib/platform-research/types"

interface ResearchStatsRowProps {
  stats: ResearchStats
}

export function ResearchStatsRow({ stats }: ResearchStatsRowProps) {
  const cards = [
    {
      label: "Completed",
      value: stats.researched,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Loader2,
      color: "text-blue-500",
    },
    {
      label: "Failed",
      value: stats.failed,
      icon: XCircle,
      color: "text-red-500",
    },
    {
      label: "Not Started",
      value: stats.notStarted,
      icon: Circle,
      color: "text-muted-foreground",
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="plaid-card !py-3">
          <div className="flex items-center gap-2">
            <card.icon className={`w-4 h-4 ${card.color}`} />
            <div>
              <div className="text-xl font-semibold tabular-nums text-foreground">
                {card.value}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {card.label}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
