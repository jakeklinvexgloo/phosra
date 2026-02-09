"use client"

import { useRef, useEffect } from "react"

interface Tab {
  id: string
  label: string
}

const TABS: Tab[] = [
  { id: "all", label: "All" },
  { id: "us-federal", label: "US Federal" },
  { id: "us-state", label: "US State" },
  { id: "eu-uk", label: "EU & UK" },
  { id: "asia-pacific", label: "Asia-Pacific" },
  { id: "americas", label: "Americas" },
  { id: "middle-east-africa", label: "Middle East" },
]

interface JurisdictionTabsProps {
  active: string
  onSelect: (id: string) => void
  counts: Record<string, number>
}

export function JurisdictionTabs({ active, onSelect, counts }: JurisdictionTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll active tab into view on mount
  useEffect(() => {
    if (!scrollRef.current) return
    const activeEl = scrollRef.current.querySelector("[data-active='true']")
    if (activeEl) {
      activeEl.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" })
    }
  }, [active])

  return (
    <div
      ref={scrollRef}
      className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id
        const count = counts[tab.id] ?? 0

        return (
          <button
            key={tab.id}
            data-active={isActive}
            onClick={() => onSelect(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap
              border-b-2 transition-colors flex-shrink-0
              ${
                isActive
                  ? "border-brand-green text-brand-green"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }
            `}
          >
            {tab.label}
            <span
              className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${isActive ? "bg-brand-green/10 text-brand-green" : "bg-muted text-muted-foreground"}
              `}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
