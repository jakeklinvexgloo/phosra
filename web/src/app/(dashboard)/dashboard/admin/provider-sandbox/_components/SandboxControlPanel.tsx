"use client"

import type { SandboxRule, EnforcementEvent } from "@/lib/sandbox/types"
import { RuleToggleGroup } from "./RuleToggleGroup"
import { EnforcementLog } from "./EnforcementLog"

interface SandboxControlPanelProps {
  rules: SandboxRule[]
  enforcementLog: EnforcementEvent[]
  isEnforcing: boolean
  onToggleRule: (category: string) => void
  onUpdateRuleConfig: (category: string, config: Record<string, unknown>) => void
  onEnforce: () => void
  onReset: () => void
}

/** Group rules by domain for the toggle panel */
const RULE_GROUPS: { title: string; prefixes: string[] }[] = [
  { title: "Content", prefixes: ["content_"] },
  { title: "Time", prefixes: ["time_"] },
  { title: "Purchase", prefixes: ["purchase_"] },
  { title: "Monitoring", prefixes: ["monitoring_"] },
  { title: "Social", prefixes: ["social_"] },
  { title: "Web", prefixes: ["web_"] },
  { title: "Privacy", prefixes: ["privacy_"] },
  { title: "Safety & Compliance", prefixes: ["algo_", "addictive_", "notification_", "usage_", "targeted_", "dm_", "age_", "data_", "geolocation_", "csam_", "library_", "ai_", "social_media_", "image_", "parental_", "screen_time_", "commercial_", "algorithmic_"] },
]

export function SandboxControlPanel({
  rules,
  enforcementLog,
  isEnforcing,
  onToggleRule,
  onUpdateRuleConfig,
  onEnforce,
  onReset,
}: SandboxControlPanelProps) {
  const enabledCount = rules.filter((r) => r.enabled).length

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div>
        <h3 className="text-[15px] font-semibold text-foreground">Policy Rules</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Toggle rules, then enforce to see the Netflix simulator update in real-time.
        </p>
      </div>

      {/* Rule toggles — scrollable */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: "calc(100vh - 420px)" }}>
        {RULE_GROUPS.map((group) => {
          const groupRules = rules.filter((r) =>
            group.prefixes.some((prefix) => r.category.startsWith(prefix))
          )
          return (
            <RuleToggleGroup
              key={group.title}
              title={group.title}
              rules={groupRules}
              onToggle={onToggleRule}
              onUpdateConfig={onUpdateRuleConfig}
            />
          )
        })}
      </div>

      {/* Enforce button */}
      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex gap-2">
          <button
            onClick={onEnforce}
            disabled={isEnforcing || enabledCount === 0}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEnforcing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Enforcing...
              </span>
            ) : (
              `Enforce Policy (${enabledCount} rule${enabledCount !== 1 ? "s" : ""})`
            )}
          </button>
          <button
            onClick={onReset}
            className="rounded-lg border border-border px-3 py-2.5 text-[12px] font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Enforcement log */}
      <div className="border-t border-border pt-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Enforcement Log
        </h4>
        <EnforcementLog events={enforcementLog} />
      </div>
    </div>
  )
}
