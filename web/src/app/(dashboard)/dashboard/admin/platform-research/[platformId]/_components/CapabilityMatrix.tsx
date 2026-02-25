"use client"

import { useState } from "react"
import { CheckCircle2, AlertTriangle, MinusCircle, ChevronDown, ChevronRight } from "lucide-react"
import { ConfidenceBadge } from "./ConfidenceBadge"
import { EnforcementMethodBadge } from "./EnforcementMethodBadge"

// ── Types ───────────────────────────────────────────────────────

export interface CapabilityEntry {
  ruleCategory: string
  label: string
  platformFeature: string
  enforcementMethod: string
  confidence: number
  gap?: string
  workaround?: string
}

export interface CapabilitySummary {
  fullyEnforceable: CapabilityEntry[]
  partiallyEnforceable: CapabilityEntry[]
  notApplicable: CapabilityEntry[]
}

// ── Tabs ────────────────────────────────────────────────────────

type TabKey = "fully" | "partial" | "na"

const TABS: { key: TabKey; label: string; icon: typeof CheckCircle2; borderColor: string }[] = [
  { key: "fully", label: "Fully Enforceable", icon: CheckCircle2, borderColor: "border-emerald-500" },
  { key: "partial", label: "Partially Enforceable", icon: AlertTriangle, borderColor: "border-amber-500" },
  { key: "na", label: "Not Applicable", icon: MinusCircle, borderColor: "border-muted-foreground" },
]

// ── Component ───────────────────────────────────────────────────

interface CapabilityMatrixProps {
  capabilities: CapabilitySummary
}

export function CapabilityMatrix({ capabilities }: CapabilityMatrixProps) {
  const counts: Record<TabKey, number> = {
    fully: capabilities.fullyEnforceable.length,
    partial: capabilities.partiallyEnforceable.length,
    na: capabilities.notApplicable.length,
  }

  const [activeTab, setActiveTab] = useState<TabKey>("fully")
  const [naExpanded, setNaExpanded] = useState(false)

  const entries: Record<TabKey, CapabilityEntry[]> = {
    fully: capabilities.fullyEnforceable,
    partial: capabilities.partiallyEnforceable,
    na: capabilities.notApplicable,
  }

  const activeEntries = entries[activeTab]

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              <span
                className={`ml-0.5 tabular-nums text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-muted text-foreground" : "bg-transparent"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Capability cards */}
      {activeTab === "na" ? (
        <div className="space-y-1">
          <button
            onClick={() => setNaExpanded(!naExpanded)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {naExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            {counts.na} capabilities not applicable to this platform
          </button>
          {naExpanded && (
            <div className="space-y-1 pl-5 pt-1">
              {activeEntries.map((cap) => (
                <div
                  key={cap.ruleCategory}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span className="font-mono text-[10px]">{cap.ruleCategory}</span>
                  <span className="text-border">--</span>
                  <span>{cap.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-2">
          {activeEntries.map((cap) => {
            const borderColor =
              activeTab === "fully" ? "border-l-emerald-500" : "border-l-amber-500"
            return (
              <div
                key={cap.ruleCategory}
                className={`border-l-4 ${borderColor} plaid-card !p-4 space-y-2`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {cap.ruleCategory}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {cap.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <EnforcementMethodBadge method={cap.enforcementMethod} />
                    <ConfidenceBadge confidence={cap.confidence} />
                  </div>
                </div>

                {/* Platform feature */}
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {cap.platformFeature}
                </div>

                {/* Confidence bar */}
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cap.confidence > 0.8
                        ? "bg-emerald-500"
                        : cap.confidence >= 0.5
                          ? "bg-amber-500"
                          : "bg-muted-foreground"
                    }`}
                    style={{ width: `${Math.round(cap.confidence * 100)}%` }}
                  />
                </div>

                {/* Gap + workaround (partial only) */}
                {activeTab === "partial" && (cap.gap || cap.workaround) && (
                  <div className="pt-1 space-y-1.5 border-t border-border/50">
                    {cap.gap && (
                      <div className="flex items-start gap-1.5 text-xs">
                        <span className="text-amber-600 dark:text-amber-400 font-medium flex-shrink-0">
                          Gap:
                        </span>
                        <span className="text-muted-foreground">{cap.gap}</span>
                      </div>
                    )}
                    {cap.workaround && (
                      <div className="flex items-start gap-1.5 text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex-shrink-0">
                          Workaround:
                        </span>
                        <span className="text-muted-foreground">{cap.workaround}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {activeEntries.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              No capabilities in this category.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
