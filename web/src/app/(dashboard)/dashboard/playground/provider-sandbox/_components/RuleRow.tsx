"use client"

import type { SandboxRule, NetflixProfile, ProfileAvatarBadgeData } from "@/lib/sandbox/types"
import { getCapability } from "@/lib/sandbox/rule-mappings"
import { ProfileAvatarBadges } from "./ProfileAvatarBadges"

interface RuleRowProps {
  rule: SandboxRule
  profiles: NetflixProfile[]
  disabled: boolean
  ruleProfileChangeCounts: Map<string, number> | undefined
  configProfileId: string
  profileRuleOverrides: Record<string, Record<string, Record<string, unknown>>>
  onToggle: (category: string) => void
  onUpdateConfig: (category: string, config: Record<string, unknown>) => void
  onUpdateProfileRuleConfig: (profileId: string, category: string, config: Record<string, unknown>) => void
}

export function RuleRow({
  rule,
  profiles,
  disabled,
  ruleProfileChangeCounts,
  configProfileId,
  profileRuleOverrides,
  onToggle,
  onUpdateConfig,
  onUpdateProfileRuleConfig,
}: RuleRowProps) {
  const isPhosraManaged = rule.category === "time_daily_limit"
  const cap = getCapability(rule.category)

  // Build avatar badge data for each profile
  const badges: ProfileAvatarBadgeData[] = profiles.map((p) => {
    const targetProfiles = cap?.targetProfiles || []
    const isAffected =
      targetProfiles.includes(p.type) ||
      (isPhosraManaged && (p.type === "standard" || p.type === "kids"))

    const changeCount = ruleProfileChangeCounts?.get(p.id) || 0

    return {
      profileId: p.id,
      profileName: p.name,
      avatarColor: p.avatarColor,
      initial: p.name.charAt(0),
      changeCount: rule.enabled ? changeCount : 0,
      isAffected,
    }
  })

  // Get the effective config for the currently selected profile
  const profileConfig = profileRuleOverrides[configProfileId]?.[rule.category]
  const effectiveConfig = profileConfig ? { ...rule.config, ...profileConfig } : rule.config

  return (
    <div>
      <label
        className="flex items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer"
        style={{
          pointerEvents: disabled ? "none" : undefined,
        }}
      >
        <input
          type="checkbox"
          checked={rule.enabled}
          onChange={() => onToggle(rule.category)}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
          className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-foreground">{rule.label}</span>
            {isPhosraManaged && rule.enabled && (
              <span className="text-[10px] px-1.5 py-0.5 rounded text-amber-600 bg-amber-50">
                Phosra-managed
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
            {rule.description}
          </p>
        </div>
        <ProfileAvatarBadges badges={badges} />
      </label>

      {/* Inline config when rule is enabled and applicable — per-profile */}
      {rule.enabled && (rule.appliesToProvider || isPhosraManaged) && (
        <RuleConfig
          rule={rule}
          effectiveConfig={effectiveConfig}
          configProfileId={configProfileId}
          profiles={profiles}
          onUpdateConfig={onUpdateConfig}
          onUpdateProfileRuleConfig={onUpdateProfileRuleConfig}
        />
      )}
    </div>
  )
}

function RuleConfig({
  rule,
  effectiveConfig,
  configProfileId,
  profiles,
  onUpdateConfig,
  onUpdateProfileRuleConfig,
}: {
  rule: SandboxRule
  effectiveConfig: Record<string, unknown>
  configProfileId: string
  profiles: NetflixProfile[]
  onUpdateConfig: (category: string, config: Record<string, unknown>) => void
  onUpdateProfileRuleConfig: (profileId: string, category: string, config: Record<string, unknown>) => void
}) {
  const configProfile = profiles.find((p) => p.id === configProfileId)
  const profileLabel = configProfile?.name || configProfileId

  // Helper to update config for the current profile
  const updateConfig = (newConfig: Record<string, unknown>) => {
    onUpdateProfileRuleConfig(configProfileId, rule.category, newConfig)
  }

  switch (rule.category) {
    case "content_rating":
      return (
        <div className="ml-8 mt-1 mb-2">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-muted-foreground">
              Max rating for <span className="font-medium text-foreground">{profileLabel}</span>
            </label>
            <select
              value={(effectiveConfig.maxRating as string) || "PG-13"}
              onChange={(e) => updateConfig({ maxRating: e.target.value })}
              className="rounded border border-border bg-background px-2 py-1 text-[12px] text-foreground"
            >
              <option value="G">G (All)</option>
              <option value="PG">PG (7+)</option>
              <option value="PG-13">PG-13 (13+)</option>
              <option value="R">R (16+)</option>
              <option value="NC-17">NC-17 (18+)</option>
            </select>
          </div>
        </div>
      )

    case "content_block_title":
      return (
        <div className="ml-8 mt-1 mb-2">
          <label className="text-[11px] text-muted-foreground">
            Titles to block for <span className="font-medium text-foreground">{profileLabel}</span> (comma-separated)
          </label>
          <input
            type="text"
            value={((effectiveConfig.titles as string[]) || []).join(", ")}
            onChange={(e) => {
              const titles = e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
              updateConfig({ titles })
            }}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-[12px] text-foreground"
            placeholder="Squid Game, Dahmer"
          />
        </div>
      )

    case "time_daily_limit":
      return (
        <div className="ml-8 mt-1 mb-2">
          <label className="text-[11px] text-muted-foreground">
            Daily limit for <span className="font-medium text-foreground">{profileLabel}</span>: {(effectiveConfig.minutes as number) || 120} min
          </label>
          <input
            type="range"
            min={15}
            max={480}
            step={15}
            value={(effectiveConfig.minutes as number) || 120}
            onChange={(e) => updateConfig({ minutes: Number(e.target.value) })}
            className="mt-1 w-full"
          />
        </div>
      )

    default:
      return null
  }
}
