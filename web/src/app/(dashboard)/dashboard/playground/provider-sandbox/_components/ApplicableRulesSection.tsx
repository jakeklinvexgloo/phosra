"use client"

import type { SandboxRule, NetflixProfile } from "@/lib/sandbox/types"
import { RuleRow } from "./RuleRow"

interface ApplicableRulesSectionProps {
  rules: SandboxRule[]
  profiles: NetflixProfile[]
  disabled: boolean
  ruleProfileChangeCounts: Map<string, Map<string, number>>
  configProfileId: string
  profileRuleOverrides: Record<string, Record<string, Record<string, unknown>>>
  onToggle: (category: string) => void
  onUpdateConfig: (category: string, config: Record<string, unknown>) => void
  onUpdateProfileRuleConfig: (profileId: string, category: string, config: Record<string, unknown>) => void
}

export function ApplicableRulesSection({
  rules,
  profiles,
  disabled,
  ruleProfileChangeCounts,
  configProfileId,
  profileRuleOverrides,
  onToggle,
  onUpdateConfig,
  onUpdateProfileRuleConfig,
}: ApplicableRulesSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Applicable ({rules.length})
      </h4>
      <div className="space-y-1.5">
        {rules.map((rule) => (
          <RuleRow
            key={rule.category}
            rule={rule}
            profiles={profiles}
            disabled={disabled}
            ruleProfileChangeCounts={ruleProfileChangeCounts.get(rule.category)}
            configProfileId={configProfileId}
            profileRuleOverrides={profileRuleOverrides}
            onToggle={onToggle}
            onUpdateConfig={onUpdateConfig}
            onUpdateProfileRuleConfig={onUpdateProfileRuleConfig}
          />
        ))}
      </div>
    </div>
  )
}
