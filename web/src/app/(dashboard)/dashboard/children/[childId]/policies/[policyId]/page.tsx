"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import type { ChildPolicy, PolicyRule } from "@/lib/types"
import { RULE_GROUPS } from "@/lib/types"

export default function PolicyEditorPage() {
  const params = useParams()
  const policyId = params.policyId as string
  const [policy, setPolicy] = useState<ChildPolicy | null>(null)
  const [rules, setRules] = useState<PolicyRule[]>([])
  const [activeGroup, setActiveGroup] = useState("content")

  useEffect(() => {
    api.getPolicy(policyId).then(setPolicy)
    api.listRules(policyId).then(r => setRules(r || []))
  }, [policyId])

  const getRuleForCategory = (category: string): PolicyRule | undefined => {
    return rules.find(r => r.category === category)
  }

  const toggleRule = async (category: string) => {
    const existing = getRuleForCategory(category)
    if (existing) {
      const updated = await api.updateRule(existing.id, !existing.enabled, existing.config)
      setRules(rules.map(r => r.id === existing.id ? updated : r))
    } else {
      const created = await api.createRule(policyId, category, true, {})
      setRules([...rules, created])
    }
  }

  const updateRuleConfig = async (ruleId: string, config: any) => {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return
    const updated = await api.updateRule(ruleId, rule.enabled, config)
    setRules(rules.map(r => r.id === ruleId ? updated : r))
  }

  if (!policy) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-h2 text-foreground">{policy.name}</h2>
        <p className="text-muted-foreground">Policy Editor - Configure rules for each category</p>
      </div>

      <div className="flex gap-6">
        {/* Rule group sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="space-y-1">
            {Object.entries(RULE_GROUPS).map(([key, group]) => (
              <button
                key={key}
                onClick={() => setActiveGroup(key)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeGroup === key ? "text-foreground font-medium border-l-2 border-foreground bg-muted" : "text-muted-foreground hover:text-foreground border-l-2 border-transparent"
                }`}
              >
                {group.label}
                <span className="ml-2 text-xs text-muted-foreground">
                  {group.categories.filter(c => getRuleForCategory(c.value)?.enabled).length}/{group.categories.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Rule editors */}
        <div className="flex-1 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGroup}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {RULE_GROUPS[activeGroup]?.categories.map(({ value, label }) => {
                const rule = getRuleForCategory(value)
                return (
                  <div key={value} className="plaid-card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-foreground">{label}</h3>
                        <p className="text-xs text-muted-foreground">{value}</p>
                      </div>
                      {/* Toggle */}
                      <button
                        onClick={() => toggleRule(value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          rule?.enabled ? "bg-brand-green" : "bg-muted"
                        }`}
                      >
                        <motion.span
                          className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
                          animate={{ x: rule?.enabled ? 24 : 4 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>

                    <AnimatePresence>
                      {rule?.enabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <RuleConfigEditor category={value} rule={rule} onUpdate={(config) => updateRuleConfig(rule.id, config)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function RuleConfigEditor({ category, rule, onUpdate }: { category: string; rule: PolicyRule; onUpdate: (config: any) => void }) {
  const config = rule.config || {}

  switch (category) {
    case "time_daily_limit":
      return (
        <div>
          <label className="block text-sm text-foreground mb-2">Daily limit (minutes)</label>
          <input
            type="range"
            min={15}
            max={480}
            step={15}
            value={config.daily_minutes || 120}
            onChange={(e) => onUpdate({ daily_minutes: parseInt(e.target.value) })}
            className="w-full accent-brand-green"
          />
          <p className="text-sm text-muted-foreground mt-1">{config.daily_minutes || 120} minutes ({Math.floor((config.daily_minutes || 120) / 60)}h {(config.daily_minutes || 120) % 60}m)</p>
        </div>
      )

    case "web_filter_level":
      return (
        <div className="flex gap-3">
          {["strict", "moderate", "light"].map(level => (
            <button
              key={level}
              onClick={() => onUpdate({ level })}
              className={`relative flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                config.level === level ? "border-foreground text-foreground bg-muted" : "border-border text-foreground hover:bg-muted/50"
              }`}
            >
              {config.level === level && (
                <motion.div
                  layoutId="filter-level"
                  className="absolute inset-0 rounded-lg border-2 border-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </button>
          ))}
        </div>
      )

    case "web_safesearch":
    case "purchase_block_iap":
    case "monitoring_activity":
    case "monitoring_alerts":
    case "targeted_ad_block":
    case "data_deletion_request":
      return (
        <p className="text-sm text-muted-foreground">
          {rule.enabled ? "Enabled" : "Disabled"} - Toggle the switch above to change.
        </p>
      )

    case "algo_feed_control":
      return (
        <div>
          <label className="block text-sm text-foreground mb-2">Feed algorithm mode</label>
          <div className="flex gap-3">
            {["chronological", "algorithmic"].map(mode => (
              <button
                key={mode}
                onClick={() => onUpdate({ mode })}
                className={`relative flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  config.mode === mode ? "border-foreground text-foreground bg-muted" : "border-border text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="relative capitalize">{mode}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">KOSA, KOSMA, CA SB 976, EU DSA require chronological feed option for minors.</p>
        </div>
      )

    case "addictive_design_control":
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-2">Disable addictive design patterns:</p>
          {[
            { key: "disable_infinite_scroll", label: "Infinite scroll" },
            { key: "disable_autoplay", label: "Autoplay" },
            { key: "disable_streaks", label: "Streaks & gamification" },
            { key: "disable_like_counts", label: "Like counts" },
            { key: "disable_daily_rewards", label: "Daily rewards" },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config[item.key] ?? false}
                onChange={(e) => onUpdate({ ...config, [item.key]: e.target.checked })}
                className="w-4 h-4 rounded border-border accent-brand-green"
              />
              <span className="text-sm text-foreground">{item.label}</span>
            </label>
          ))}
        </div>
      )

    case "notification_curfew":
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground">Quiet hours:</span>
          <input
            type="time"
            value={config.start || "20:00"}
            onChange={(e) => onUpdate({ ...config, start: e.target.value })}
            className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="time"
            value={config.end || "07:00"}
            onChange={(e) => onUpdate({ ...config, end: e.target.value })}
            className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
          />
        </div>
      )

    case "usage_timer_notification":
      return (
        <div>
          <label className="block text-sm text-foreground mb-2">Remind every (minutes)</label>
          <input
            type="range"
            min={15}
            max={60}
            step={15}
            value={config.interval_minutes || 30}
            onChange={(e) => onUpdate({ interval_minutes: parseInt(e.target.value) })}
            className="w-full accent-brand-green"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>15 min</span>
            <span className="font-medium text-foreground">{config.interval_minutes || 30} min</span>
            <span>60 min</span>
          </div>
        </div>
      )

    case "dm_restriction":
      return (
        <div className="flex gap-3">
          {["none", "contacts_only", "everyone"].map(mode => (
            <button
              key={mode}
              onClick={() => onUpdate({ mode })}
              className={`relative flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                config.mode === mode ? "border-foreground text-foreground bg-muted" : "border-border text-foreground hover:bg-muted/50"
              }`}
            >
              <span className="relative">{mode === "none" ? "No DMs" : mode === "contacts_only" ? "Contacts Only" : "Everyone"}</span>
            </button>
          ))}
        </div>
      )

    case "age_gate":
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {config.enabled ? "Age verification required before access." : "Age gate disabled."}
          </p>
          {config.enabled && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-foreground">Minimum age:</label>
              <input
                type="number"
                min={0}
                max={18}
                value={config.min_age || 13}
                onChange={(e) => onUpdate({ ...config, min_age: parseInt(e.target.value) })}
                className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          )}
        </div>
      )

    case "geolocation_opt_in":
      return (
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.geolocation_allowed ?? false}
              onChange={(e) => onUpdate({ geolocation_allowed: e.target.checked })}
              className="w-4 h-4 rounded border-border accent-brand-green"
            />
            <span className="text-sm text-foreground">Allow geolocation sharing</span>
          </label>
          <p className="text-xs text-muted-foreground">(Default: off per CT SB 3, MD Kids Code)</p>
        </div>
      )

    case "purchase_spending_cap":
      return (
        <div>
          <label className="block text-sm text-foreground mb-2">Monthly spending cap ($)</label>
          <input
            type="number"
            min={0}
            max={500}
            value={config.monthly_cap || 0}
            onChange={(e) => onUpdate({ monthly_cap: parseFloat(e.target.value) })}
            className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
      )

    case "content_rating":
      return (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Maximum allowed ratings per system:</p>
          {config.max_ratings && Object.entries(config.max_ratings).map(([system, rating]) => (
            <div key={system} className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase font-medium text-muted-foreground w-12">{system}</span>
              <span className="text-sm font-medium text-brand-green">{rating as string}</span>
            </div>
          ))}
        </div>
      )

    case "time_scheduled_hours":
      return (
        <div className="space-y-3">
          {["weekday", "weekend"].map(period => (
            <div key={period} className="flex items-center gap-3">
              <span className="text-sm text-foreground w-20 capitalize">{period}:</span>
              <input
                type="time"
                value={config.schedule?.[period]?.start || "07:00"}
                onChange={(e) => onUpdate({ schedule: { ...config.schedule, [period]: { ...config.schedule?.[period], start: e.target.value } } })}
                className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="time"
                value={config.schedule?.[period]?.end || "21:00"}
                onChange={(e) => onUpdate({ schedule: { ...config.schedule, [period]: { ...config.schedule?.[period], end: e.target.value } } })}
                className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
              />
            </div>
          ))}
        </div>
      )

    case "social_chat_control":
      return (
        <div className="flex gap-3">
          {["disabled", "friends_only", "everyone"].map(mode => (
            <button
              key={mode}
              onClick={() => onUpdate({ mode })}
              className={`relative flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                config.mode === mode ? "border-foreground text-foreground bg-muted" : "border-border text-foreground hover:bg-muted/50"
              }`}
            >
              {config.mode === mode && (
                <motion.div
                  layoutId="chat-mode"
                  className="absolute inset-0 rounded-lg border-2 border-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{mode.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
            </button>
          ))}
        </div>
      )

    case "privacy_profile_visibility":
      return (
        <div className="flex gap-3">
          {["private", "friends", "public"].map(vis => (
            <button
              key={vis}
              onClick={() => onUpdate({ visibility: vis })}
              className={`relative flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                config.visibility === vis ? "border-foreground text-foreground bg-muted" : "border-border text-foreground hover:bg-muted/50"
              }`}
            >
              {config.visibility === vis && (
                <motion.div
                  layoutId="visibility"
                  className="absolute inset-0 rounded-lg border-2 border-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{vis.charAt(0).toUpperCase() + vis.slice(1)}</span>
            </button>
          ))}
        </div>
      )

    default:
      return (
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground font-mono">{JSON.stringify(config, null, 2)}</p>
        </div>
      )
  }
}
