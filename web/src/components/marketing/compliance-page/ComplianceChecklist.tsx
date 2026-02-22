"use client"

import { CheckCircle2, Minus } from "lucide-react"

interface ChecklistItem {
  requirement: string
  covered: boolean
  feature: string
}

interface ComplianceChecklistProps {
  items: ChecklistItem[]
}

export function ComplianceChecklist({ items }: ComplianceChecklistProps) {
  return (
    <div className="plaid-card">
      <h3 className="section-header mb-4">Compliance Coverage</h3>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Status icon */}
            {item.covered ? (
              <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
            ) : (
              <Minus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}

            {/* Requirement text */}
            <span className="text-sm text-foreground flex-1">
              {item.requirement}
            </span>

            {/* Feature badge */}
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded flex-shrink-0 max-w-[140px] truncate">
              {item.feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
