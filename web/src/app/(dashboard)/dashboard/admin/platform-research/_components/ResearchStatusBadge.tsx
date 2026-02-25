"use client"

import { RESEARCH_STATUS_META, type ResearchStatus } from "@/lib/platform-research/types"

interface ResearchStatusBadgeProps {
  status: ResearchStatus | null
}

export function ResearchStatusBadge({ status }: ResearchStatusBadgeProps) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
        Not Researched
      </span>
    )
  }

  const meta = RESEARCH_STATUS_META[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.color}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${meta.dotColor} ${status === "running" ? "animate-pulse" : ""}`}
      />
      {meta.label}
    </span>
  )
}
