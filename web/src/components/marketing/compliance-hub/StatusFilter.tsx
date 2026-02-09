"use client"

import { STATUS_META } from "@/lib/compliance/types"
import type { LawStatus } from "@/lib/compliance/types"

interface StatusFilterProps {
  active: string
  onSelect: (status: string) => void
}

const PILLS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "enacted", label: "Enacted" },
  { id: "passed", label: "Passed" },
  { id: "pending", label: "Pending" },
  { id: "proposed", label: "Proposed" },
]

export function StatusFilter({ active, onSelect }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PILLS.map((pill) => {
        const isActive = active === pill.id
        const meta = pill.id !== "all" ? STATUS_META[pill.id as LawStatus] : null

        return (
          <button
            key={pill.id}
            onClick={() => onSelect(pill.id)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full transition-colors
              ${
                isActive && meta
                  ? `${meta.bgColor} ${meta.textColor}`
                  : isActive
                    ? "bg-brand-green/10 text-brand-green"
                    : "bg-muted text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {pill.label}
          </button>
        )
      })}
    </div>
  )
}
