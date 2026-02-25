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
} from "lucide-react"
import { SectionCard } from "./SectionCard"

const steps = [
  {
    id: "monitor",
    icon: Eye,
    title: "Monitor",
    description: "Track viewing activity",
    detail: "Check viewing history every 30 min via Falcor API using cached session cookies",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    dotColor: "bg-blue-500",
    headerBg: "bg-blue-500/10",
  },
  {
    id: "detect",
    icon: Gauge,
    title: "Detect",
    description: "Compare against daily limit",
    detail: "Calculate total watch time from history entries and compare vs parent-set limit (e.g., 2h 15m / 2h)",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    dotColor: "bg-amber-500",
    headerBg: "bg-amber-500/10",
  },
  {
    id: "lock",
    icon: Lock,
    title: "Lock",
    description: "Restrict profile access",
    detail: "Change child's profile PIN to a Phosra-generated value via Playwright automation",
    color: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
    dotColor: "bg-red-500",
    headerBg: "bg-red-500/10",
  },
  {
    id: "notify",
    icon: Bell,
    title: "Notify",
    description: "Alert parent",
    detail: "Push real-time notification to parent via Phosra app with viewing summary and lock confirmation",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dotColor: "bg-emerald-500",
    headerBg: "bg-emerald-500/10",
  },
]

const limitations = [
  {
    icon: Timer,
    title: "~30 min polling delay",
    description: "Viewing activity is polled, not real-time. Children may overshoot the limit by up to 30 minutes before the profile is locked.",
  },
  {
    icon: AlertTriangle,
    title: "No native Netflix API",
    description: "All write operations require Playwright browser automation. Session cookies must be refreshed every 7-14 days.",
  },
  {
    icon: Lock,
    title: "PIN managed by Phosra vault",
    description: "Phosra stores and rotates the child profile PIN. Original PIN is preserved for restore. Mid-stream lockout may disrupt viewing.",
  },
]

export function EnforcementFlow() {
  return (
    <SectionCard
      id="enforcement-flow"
      title="Screen Time Enforcement Cycle"
      icon={Timer}
      badge="4-step loop"
    >
      <div className="space-y-6">
        {/* Flow diagram */}
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
            Enforcement Loop
          </div>

          {/* Desktop: horizontal flow */}
          <div className="hidden md:flex items-stretch gap-0">
            {steps.map((step, idx) => {
              const Icon = step.icon
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
                  {idx < steps.length - 1 && (
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
            {steps.map((step, idx) => {
              const Icon = step.icon
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
                  {idx < steps.length - 1 && (
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
              <span>Repeats daily until parent adjusts limits</span>
            </div>
          </div>
        </div>

        {/* Limitation callouts */}
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
            Known Limitations
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {limitations.map((lim) => {
              const Icon = lim.icon
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
