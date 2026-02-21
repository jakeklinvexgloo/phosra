"use client"

import type { SandboxRule } from "@/lib/sandbox/types"

interface RuleToggleGroupProps {
  title: string
  rules: SandboxRule[]
  onToggle: (category: string) => void
  onUpdateConfig: (category: string, config: Record<string, unknown>) => void
}

export function RuleToggleGroup({ title, rules, onToggle, onUpdateConfig }: RuleToggleGroupProps) {
  if (rules.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-1.5">
        {rules.map((rule) => (
          <div key={rule.category}>
            <label className="flex items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={() => onToggle(rule.category)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground">{rule.label}</span>
                  {!rule.appliesToProvider && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      N/A
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {rule.description}
                </p>
              </div>
            </label>

            {/* Inline config for certain rules */}
            {rule.enabled && rule.appliesToProvider && (
              <RuleConfig rule={rule} onUpdateConfig={onUpdateConfig} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RuleConfig({ rule, onUpdateConfig }: { rule: SandboxRule; onUpdateConfig: (category: string, config: Record<string, unknown>) => void }) {
  switch (rule.category) {
    case "content_rating":
      return (
        <div className="ml-8 mt-1 mb-2">
          <label className="text-[11px] text-muted-foreground">Max rating</label>
          <select
            value={(rule.config.maxRating as string) || "PG-13"}
            onChange={(e) => onUpdateConfig(rule.category, { ...rule.config, maxRating: e.target.value })}
            className="ml-2 rounded border border-border bg-background px-2 py-1 text-[12px] text-foreground"
          >
            <option value="G">G (All)</option>
            <option value="PG">PG (7+)</option>
            <option value="PG-13">PG-13 (13+)</option>
            <option value="R">R (16+)</option>
            <option value="NC-17">NC-17 (18+)</option>
          </select>
        </div>
      )

    case "content_block_title":
      return (
        <div className="ml-8 mt-1 mb-2">
          <label className="text-[11px] text-muted-foreground">Titles to block (comma-separated)</label>
          <input
            type="text"
            value={((rule.config.titles as string[]) || []).join(", ")}
            onChange={(e) => {
              const titles = e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
              onUpdateConfig(rule.category, { ...rule.config, titles })
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
            Daily limit: {(rule.config.minutes as number) || 120} min
          </label>
          <input
            type="range"
            min={15}
            max={480}
            step={15}
            value={(rule.config.minutes as number) || 120}
            onChange={(e) => onUpdateConfig(rule.category, { ...rule.config, minutes: Number(e.target.value) })}
            className="mt-1 w-full"
          />
        </div>
      )

    default:
      return null
  }
}
