"use client"

import { GitBranch, Calendar, Code2 } from "lucide-react"
import { SectionCard } from "./SectionCard"

type ComplexityLevel = "Low" | "Low-Medium" | "Medium" | "High" | "None"
type RiskLevel = "Low" | "Low-Medium" | "Medium" | "High" | "None"

interface AdapterMethod {
  name: string
  approach: string
  approachColor: string
  complexity: ComplexityLevel
  risk: RiskLevel
  recommendation: string
}

const methods: AdapterMethod[] = [
  {
    name: "authenticate",
    approach: "Playwright",
    approachColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    complexity: "Medium",
    risk: "Medium",
    recommendation: "Use stealth mode. Cache session cookies for 7-14 days to minimize login frequency.",
  },
  {
    name: "listProfiles",
    approach: "Falcor API",
    approachColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    complexity: "Low",
    risk: "Low",
    recommendation: "Use Falcor API directly with cached session cookies.",
  },
  {
    name: "getProfileSettings",
    approach: "Falcor API",
    approachColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    complexity: "Low",
    risk: "Low",
    recommendation: "API call. Parse Falcor JSON graph response.",
  },
  {
    name: "setContentRestrictions",
    approach: "Playwright + MFA",
    approachColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    complexity: "High",
    risk: "Medium",
    recommendation: "Playwright with MFA code retrieval. Prefer password-based MFA path.",
  },
  {
    name: "setTitleRestrictions",
    approach: "Playwright + MFA",
    approachColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    complexity: "High",
    risk: "Medium",
    recommendation: "Playwright. Batch title changes in a single MFA-verified session.",
  },
  {
    name: "setProfilePIN",
    approach: "Playwright",
    approachColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    complexity: "Medium",
    risk: "Low-Medium",
    recommendation: "Playwright with password re-entry handling.",
  },
  {
    name: "getWatchHistory",
    approach: "Falcor API",
    approachColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    complexity: "Low-Medium",
    risk: "Low",
    recommendation: "Try API first; fall back to Playwright scrape of viewing activity page.",
  },
  {
    name: "lockProfile",
    approach: "Playwright",
    approachColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    complexity: "Medium",
    risk: "Medium",
    recommendation: "Store original PIN to restore later. Primary screen time enforcement mechanism.",
  },
  {
    name: "createKidsProfile",
    approach: "Playwright",
    approachColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    complexity: "Medium",
    risk: "Low",
    recommendation: "Playwright. Verify profile count before attempting (max 5).",
  },
  {
    name: "supportsNativeScreenTime",
    approach: "Static",
    approachColor: "bg-muted text-muted-foreground",
    complexity: "None",
    risk: "None",
    recommendation: "Returns false. Netflix has zero native screen time features.",
  },
]

function complexityBadge(level: ComplexityLevel) {
  switch (level) {
    case "High":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    case "Medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    case "Low-Medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
    case "Low":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function riskBadge(level: RiskLevel) {
  switch (level) {
    case "High":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    case "Medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    case "Low-Medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
    case "Low":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

interface TimelinePhase {
  priority: string
  label: string
  components: string
  minDays: number
  maxDays: number
  color: string
  barColor: string
  hatchColor: string
}

const timelinePhases: TimelinePhase[] = [
  {
    priority: "P0",
    label: "Foundation",
    components: "Session Manager (2-3d), Read Layer (1-2d)",
    minDays: 3,
    maxDays: 5,
    color: "text-red-700 dark:text-red-300",
    barColor: "bg-red-500",
    hatchColor: "bg-red-300 dark:bg-red-700",
  },
  {
    priority: "P1",
    label: "Enforcement",
    components: "Write Layer (3-5d), Testing (2-3d)",
    minDays: 5,
    maxDays: 8,
    color: "text-amber-700 dark:text-amber-300",
    barColor: "bg-amber-500",
    hatchColor: "bg-amber-300 dark:bg-amber-700",
  },
  {
    priority: "P2",
    label: "Intelligence",
    components: "Screen Time Enforcer (2-3d)",
    minDays: 2,
    maxDays: 3,
    color: "text-emerald-700 dark:text-emerald-300",
    barColor: "bg-emerald-500",
    hatchColor: "bg-emerald-300 dark:bg-emerald-700",
  },
]

const maxTotal = 16

export function AdapterRoadmap() {
  return (
    <SectionCard
      id="adapter-roadmap"
      title="Adapter Development Roadmap"
      icon={GitBranch}
      badge="10-16 days"
    >
      <div className="space-y-8">
        {/* Method assessment grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="w-4 h-4 text-muted-foreground" />
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Method Assessment (10 methods)
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {methods.map((method) => (
              <div
                key={method.name}
                className="p-3 rounded-lg border border-border/50 bg-card space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <code className="text-xs font-mono font-semibold text-foreground">
                    {method.name}()
                  </code>
                  <span
                    className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${method.approachColor}`}
                  >
                    {method.approach}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${complexityBadge(method.complexity)}`}
                  >
                    {method.complexity} complexity
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${riskBadge(method.risk)}`}
                  >
                    {method.risk} risk
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {method.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Development timeline */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Development Timeline
            </div>
          </div>
          <div className="space-y-4">
            {timelinePhases.map((phase) => {
              const minPct = (phase.minDays / maxTotal) * 100
              const maxPct = (phase.maxDays / maxTotal) * 100
              return (
                <div key={phase.priority} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold ${phase.color}`}
                      >
                        {phase.priority}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {phase.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {phase.minDays}-{phase.maxDays} days
                    </span>
                  </div>
                  {/* Timeline bar */}
                  <div className="relative h-6 rounded-md bg-muted/50 overflow-hidden">
                    {/* Max estimate (hatched/lighter) */}
                    <div
                      className={`absolute inset-y-0 left-0 rounded-md ${phase.hatchColor} opacity-50`}
                      style={{ width: `${maxPct}%` }}
                    />
                    {/* Min estimate (solid fill) */}
                    <div
                      className={`absolute inset-y-0 left-0 rounded-md ${phase.barColor}`}
                      style={{ width: `${minPct}%` }}
                    />
                    {/* Label inside bar */}
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-[10px] font-medium text-white drop-shadow-sm truncate">
                        {phase.components}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total summary */}
          <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">
                Total Estimated Effort
              </span>
            </div>
            <span className="text-lg font-bold text-accent tabular-nums">
              10-16 days
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
