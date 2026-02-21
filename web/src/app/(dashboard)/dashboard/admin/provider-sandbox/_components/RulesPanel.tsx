"use client"

import type { SandboxRule, NetflixProfile } from "@/lib/sandbox/types"
import { ApplicableRulesSection } from "./ApplicableRulesSection"
import { CollapsedNARules } from "./CollapsedNARules"
import { EnforceActionBar } from "./EnforceActionBar"

interface RulesPanelProps {
  rules: SandboxRule[]
  profiles: NetflixProfile[]
  previewMode: boolean
  isComputing: boolean
  changeCount: number
  hasChanges: boolean
  ruleProfileChangeCounts: Map<string, Map<string, number>>
  onToggleRule: (category: string) => void
  onUpdateRuleConfig: (category: string, config: Record<string, unknown>) => void
  onPreview: () => void
  onApply: () => void
  onDiscard: () => void
  onReset: () => void
}

export function RulesPanel({
  rules,
  profiles,
  previewMode,
  isComputing,
  changeCount,
  hasChanges,
  ruleProfileChangeCounts,
  onToggleRule,
  onUpdateRuleConfig,
  onPreview,
  onApply,
  onDiscard,
  onReset,
}: RulesPanelProps) {
  // Split into applicable (supported OR time_daily_limit) and N/A
  const applicableRules = rules.filter(
    (r) => r.appliesToProvider || r.category === "time_daily_limit"
  )
  const naRules = rules.filter(
    (r) => !r.appliesToProvider && r.category !== "time_daily_limit"
  )

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div>
        <h3 className="text-[15px] font-semibold text-foreground">Policy Rules</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Toggle rules, then preview changes.
        </p>
      </div>

      {/* Rule sections -- scrollable */}
      <div
        className="flex-1 overflow-y-auto space-y-4 pr-1"
        style={{
          maxHeight: "calc(100vh - 380px)",
          pointerEvents: previewMode ? "none" : undefined,
          opacity: previewMode ? 0.6 : undefined,
        }}
      >
        <ApplicableRulesSection
          rules={applicableRules}
          profiles={profiles}
          disabled={previewMode}
          ruleProfileChangeCounts={ruleProfileChangeCounts}
          onToggle={onToggleRule}
          onUpdateConfig={onUpdateRuleConfig}
        />

        <CollapsedNARules rules={naRules} />
      </div>

      {/* Enforce action bar */}
      <EnforceActionBar
        changeCount={changeCount}
        hasChanges={hasChanges}
        previewMode={previewMode}
        isComputing={isComputing}
        onPreview={onPreview}
        onApply={onApply}
        onDiscard={onDiscard}
        onReset={onReset}
      />
    </div>
  )
}
