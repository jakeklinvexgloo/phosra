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
  configProfileId: string
  profileRuleOverrides: Record<string, Record<string, Record<string, unknown>>>
  onToggleRule: (category: string) => void
  onUpdateRuleConfig: (category: string, config: Record<string, unknown>) => void
  onUpdateProfileRuleConfig: (profileId: string, category: string, config: Record<string, unknown>) => void
  onSelectConfigProfile: (profileId: string) => void
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
  configProfileId,
  profileRuleOverrides,
  onToggleRule,
  onUpdateRuleConfig,
  onUpdateProfileRuleConfig,
  onSelectConfigProfile,
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

  // Only child profiles are configurable (not adults, except for purchase_approval which is handled separately)
  const configurableProfiles = profiles.filter((p) => p.type !== "adult")

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div>
        <h3 className="text-[15px] font-semibold text-foreground">Policy Rules</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Select a family member, configure their rules, then preview changes.
        </p>
      </div>

      {/* Profile config tabs */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Configuring for
        </label>
        <div className="flex gap-1.5 mt-1.5">
          {configurableProfiles.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectConfigProfile(p.id)}
              disabled={previewMode}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                configProfileId === p.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              style={{ opacity: previewMode ? 0.6 : 1 }}
            >
              <span
                className="inline-block w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0"
                style={{ background: p.avatarColor, lineHeight: "16px", textAlign: "center" }}
              >
                {p.name.charAt(0)}
              </span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rule sections -- scrollable */}
      <div
        className="flex-1 overflow-y-auto space-y-4 pr-1"
        style={{
          maxHeight: "calc(100vh - 440px)",
          pointerEvents: previewMode ? "none" : undefined,
          opacity: previewMode ? 0.6 : undefined,
        }}
      >
        <ApplicableRulesSection
          rules={applicableRules}
          profiles={profiles}
          disabled={previewMode}
          ruleProfileChangeCounts={ruleProfileChangeCounts}
          configProfileId={configProfileId}
          profileRuleOverrides={profileRuleOverrides}
          onToggle={onToggleRule}
          onUpdateConfig={onUpdateRuleConfig}
          onUpdateProfileRuleConfig={onUpdateProfileRuleConfig}
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
