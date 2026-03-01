"use client"

import {
  ArrowRight,
  Zap,
  Shield,
  Eye,
  Settings,
  Bell,
} from "lucide-react"
import type { IntegrationGapData, EnforcementFlowData } from "@/lib/platform-research/research-data-types"

interface PhosraGapSectionProps {
  gap: IntegrationGapData
  enforcement?: EnforcementFlowData
}

const STEP_ICONS: Record<string, typeof Shield> = {
  monitor: Eye,
  classify: Shield,
  enforce: Settings,
  notify: Bell,
}

export function PhosraGapSection({ gap, enforcement }: PhosraGapSectionProps) {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      {gap.stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {gap.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card p-3 text-center"
              style={{ borderLeftColor: stat.color, borderLeftWidth: 3 }}
            >
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Gap Opportunities */}
      {gap.gapOpportunities.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Integration Gaps &amp; Solutions</h3>
          <div className="space-y-3">
            {gap.gapOpportunities.map((opp) => (
              <div key={opp.title} className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{opp.icon}</span>
                  <span className="text-sm font-medium text-foreground">{opp.title}</span>
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {opp.ruleCategory}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-medium text-red-600 dark:text-red-400 mb-0.5">
                      {opp.gapLabel}
                    </div>
                    <p className="text-muted-foreground">{opp.gap}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">
                      {opp.solutionLabel}
                    </div>
                    <p className="text-muted-foreground">{opp.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enforcement Flow */}
      {enforcement && enforcement.steps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Enforcement Flow</h3>
          <div className="flex flex-wrap items-center gap-2">
            {enforcement.steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className="rounded-lg border p-3 text-center min-w-[100px]"
                  style={{
                    borderColor: step.color,
                    backgroundColor: `${step.color}10`,
                  }}
                >
                  <div className="text-lg mb-1">{step.icon}</div>
                  <div className="text-xs font-medium text-foreground">{step.title}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{step.description}</div>
                </div>
                {i < enforcement.steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          {enforcement.loopLabel && (
            <p className="text-[10px] text-muted-foreground italic">{enforcement.loopLabel}</p>
          )}
        </div>
      )}

      {/* Limitations */}
      {enforcement?.limitations && enforcement.limitations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Limitations</h3>
          <div className="space-y-2">
            {enforcement.limitations.map((lim) => (
              <div key={lim.title} className="flex items-start gap-2.5 text-sm">
                <span className="text-base flex-shrink-0">{lim.icon}</span>
                <div>
                  <span className="font-medium text-foreground">{lim.title}</span>
                  <span className="text-muted-foreground ml-1.5">&mdash; {lim.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
