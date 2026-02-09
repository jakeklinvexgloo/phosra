"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimatedSection } from "@/components/marketing/shared"
import { JURISDICTION_META, STATUS_META } from "@/lib/compliance/types"
import type { LawEntry } from "@/lib/compliance/types"

interface LawCardProps {
  law: LawEntry
  index: number
}

export function LawCard({ law, index }: LawCardProps) {
  const jMeta = JURISDICTION_META[law.jurisdictionGroup]
  const sMeta = STATUS_META[law.status]

  return (
    <AnimatedSection delay={Math.min(index * 0.05, 0.4)}>
      <Link
        href={`/compliance/${law.id}`}
        className={`
          plaid-card block h-full border-l-4 ${jMeta.borderColor}
          hover:shadow-md hover:border-border transition-all group
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-brand-green transition-colors">
            {law.shortName}
          </h3>
          <span
            className={`
              inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0
              ${sMeta.bgColor} ${sMeta.textColor}
            `}
          >
            {sMeta.label}
          </span>
        </div>

        {/* Full name */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
          {law.fullName}
        </p>

        {/* Summary */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {law.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {law.ruleCategories.length} categories
            </span>
            <span
              className={`
                inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full
                ${jMeta.bgColor} ${jMeta.textColor}
              `}
            >
              {jMeta.label}
            </span>
          </div>
          <span className="text-xs text-brand-green font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View details
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    </AnimatedSection>
  )
}
