"use client"

import { useState } from "react"
import type { SandboxRule } from "@/lib/sandbox/types"

interface CollapsedNARulesProps {
  rules: SandboxRule[]
}

/** Group prefixes for summary display */
const DOMAIN_PREFIXES: { label: string; prefixes: string[] }[] = [
  { label: "Web", prefixes: ["web_"] },
  { label: "Social", prefixes: ["social_"] },
  { label: "Privacy", prefixes: ["privacy_"] },
  { label: "Content", prefixes: ["content_"] },
  { label: "Time", prefixes: ["time_"] },
  { label: "Purchase", prefixes: ["purchase_"] },
  { label: "Monitoring", prefixes: ["monitoring_"] },
  {
    label: "Safety & Compliance",
    prefixes: [
      "algo_",
      "addictive_",
      "notification_",
      "usage_",
      "targeted_",
      "dm_",
      "age_",
      "data_",
      "geolocation_",
      "csam_",
      "library_",
      "ai_",
      "social_media_",
      "image_",
      "parental_",
      "screen_time_",
      "commercial_",
      "algorithmic_",
    ],
  },
]

export function CollapsedNARules({ rules }: CollapsedNARulesProps) {
  const [expanded, setExpanded] = useState(false)

  if (rules.length === 0) return null

  // Build summary by domain
  const domainSummary = DOMAIN_PREFIXES.map((domain) => {
    const count = rules.filter((r) =>
      domain.prefixes.some((prefix) => r.category.startsWith(prefix))
    ).length
    return { label: domain.label, count }
  }).filter((d) => d.count > 0)

  return (
    <div className="border-t border-border pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left"
      >
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          N/A ({rules.length} rules)
        </h4>
        <svg
          className={`h-3 w-3 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <p className="text-[10px] text-muted-foreground mt-1">
        {domainSummary.map((d) => `${d.label} (${d.count})`).join(", ")}
      </p>

      {expanded && (
        <div className="mt-2 space-y-1">
          {rules.map((rule) => (
            <div key={rule.category} className="px-2 py-1">
              <span className="text-[12px] text-muted-foreground">{rule.label}</span>
              <p className="text-[10px] text-muted-foreground/70 leading-tight">
                {rule.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
