"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { LawEntry } from "@/lib/compliance/types"
import { JURISDICTION_META, STATUS_META } from "@/lib/compliance/types"

interface CompactLawCardProps {
  law: LawEntry
}

export function CompactLawCard({ law }: CompactLawCardProps) {
  const jMeta = JURISDICTION_META[law.jurisdictionGroup]
  const sMeta = STATUS_META[law.status]

  return (
    <Link
      href={`/compliance/${law.id}`}
      className={`block plaid-card border-l-4 ${jMeta.borderColor} hover:border-brand-green/50 transition-colors group`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">
          {law.shortName}
        </h3>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${sMeta.bgColor} ${sMeta.textColor}`}
        >
          {sMeta.label}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-2">{law.fullName}</p>

      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
        {law.summary}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded ${jMeta.bgColor} ${jMeta.textColor}`}
          >
            {jMeta.label}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {law.ruleCategories.length} rules
          </span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-green transition-colors" />
      </div>
    </Link>
  )
}
