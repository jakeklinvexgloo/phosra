"use client"

import type { Jurisdiction } from "@/lib/compliance/types"

interface TabItem {
  id: string
  label: string
  jurisdictions: Jurisdiction[]
}

const TABS: TabItem[] = [
  { id: "featured", label: "Featured", jurisdictions: [] },
  { id: "us-federal", label: "US Federal", jurisdictions: ["us-federal"] },
  { id: "us-state", label: "US State", jurisdictions: ["us-state"] },
  { id: "eu-uk", label: "EU & UK", jurisdictions: ["eu", "uk"] },
  { id: "asia-pacific", label: "Asia-Pacific", jurisdictions: ["asia-pacific"] },
  { id: "americas", label: "Americas", jurisdictions: ["americas"] },
  { id: "middle-east-africa", label: "Middle East", jurisdictions: ["middle-east-africa"] },
]

interface JurisdictionTabBarProps {
  active: string
  onSelect: (id: string) => void
  counts: Record<string, number>
}

export function JurisdictionTabBar({
  active,
  onSelect,
  counts,
}: JurisdictionTabBarProps) {
  return (
    <div className="flex overflow-x-auto gap-1 -mx-1 px-1 pb-1 scrollbar-hide">
      {TABS.map((tab) => {
        const isActive = active === tab.id
        const count = tab.id === "featured"
          ? null
          : tab.jurisdictions.reduce((sum, j) => sum + (counts[j] || 0), 0)

        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-brand-green/10 text-brand-green"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
            {count != null && count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-brand-green/20 text-brand-green"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { TABS }
