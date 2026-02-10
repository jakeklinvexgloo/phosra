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
      className="flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-lg border border-border bg-white hover:border-foreground hover:shadow-sm text-left transition-all group"
    >
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-green/20 transition-colors">
        <Icon className="w-4 h-4 md:w-4.5 md:h-4.5 text-brand-green" />
      </div>
      <div className="min-w-0">
        <p className="text-xs md:text-sm font-medium text-foreground">{scenario.title}</p>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {scenario.description}
        </p>
      </div>
    </button>
  )
}
