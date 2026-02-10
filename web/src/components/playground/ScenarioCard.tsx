"use client"

import type { Scenario } from "@/lib/playground/scenarios"

interface ScenarioCardProps {
  scenario: Scenario
  onClick: (prompt: string) => void
}

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  const Icon = scenario.icon
  return (
    <button
      onClick={() => onClick(scenario.prompt)}
      className="flex items-start gap-2.5 p-3 md:p-3.5 rounded-2xl border border-border/50 bg-foreground/[0.02] dark:bg-foreground/[0.04] hover:bg-foreground/[0.05] dark:hover:bg-foreground/[0.08] text-left transition-all group"
    >
      <div className="w-8 h-8 rounded-full bg-foreground/[0.06] dark:bg-foreground/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-foreground/[0.1] transition-colors">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground bg-foreground/[0.05] px-1.5 py-0.5 rounded-full">
            {scenario.badge}
          </span>
        </div>
        <p className="text-sm font-medium text-foreground mt-0.5">{scenario.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {scenario.description}
        </p>
      </div>
    </button>
  )
}
