"use client"

import {
  Eye,
  Gauge,
  Lock,
  Bell,
  ArrowRight,
  ArrowDown,
  AlertTriangle,
  Timer,
  type LucideIcon,
} from "lucide-react"
import { SectionCard } from "./SectionCard"
import type { EnforcementFlowData } from "@/lib/platform-research/research-data-types"

const ICON_MAP: Record<string, LucideIcon> = {
  Eye, Gauge, Lock, Bell, ArrowRight, ArrowDown, AlertTriangle, Timer,
}

interface EnforcementFlowProps {
  data: EnforcementFlowData
}

export function EnforcementFlow({ data }: EnforcementFlowProps) {
  return (
    <SectionCard
      id="enforcement-flow"
      title="Screen Time Enforcement Cycle"
      icon={Timer}
      badge={`${data.steps.length}-step loop`}
    >
      <div className="space-y-6">
        {/* Flow diagram */}
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
            Enforcement Loop
          </div>

          {/* Desktop: horizontal flow */}
          <div className="hidden md:flex items-stretch gap-0">
            {data.steps.map((step, idx) => {
              const Icon = ICON_MAP[step.icon] ?? Eye
              return (
                <div key={step.id} className="flex items-stretch flex-1">
                  <div
                    className={`flex-1 rounded-lg border p-4 space-y-2 ${step.color}`}
                  >
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${step.headerBg}`}>
                      <div className={`w-2 h-2 rounded-full ${step.dotColor}`} />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {step.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{step.description}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-80">
                      {step.detail}
                    </p>
                  </div>
                  {idx < data.steps.length - 1 && (
                    <div className="flex items-center px-2 text-muted-foreground">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile: vertical stack */}
          <div className="flex md:hidden flex-col gap-0">
            {data.steps.map((step, idx) => {
              const Icon = ICON_MAP[step.icon] ?? Eye
              return (
                <div key={step.id}>
                  <div
                    className={`rounded-lg border p-4 space-y-2 ${step.color}`}
                  >
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${step.headerBg}`}>
                      <div className={`w-2 h-2 rounded-full ${step.dotColor}`} />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {step.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{step.description}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-80">
                      {step.detail}
                    </p>
                  </div>
                  {idx < data.steps.length - 1 && (
                    <div className="flex items-center justify-center py-1.5 text-muted-foreground">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Loop indicator */}
          <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
              <ArrowRight className="w-3 h-3" />
              <span>{data.loopLabel}</span>
            </div>
          </div>
        </div>

        {/* Limitation callouts */}
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
            Known Limitations
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.limitations.map((lim) => {
              const Icon = ICON_MAP[lim.icon] ?? AlertTriangle
              return (
                <div
                  key={lim.title}
                  className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      {lim.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {lim.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
