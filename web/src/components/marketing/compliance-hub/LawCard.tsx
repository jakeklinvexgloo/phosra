"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { STATUS_META } from "@/lib/compliance/types"
import { getCountryFlag } from "@/lib/compliance/country-flags"
import type { LawEntry } from "@/lib/compliance/types"

interface LawCardProps {
  law: LawEntry
  index: number
}

export function LawCard({ law }: LawCardProps) {
  const sMeta = STATUS_META[law.status]
  const flag = getCountryFlag(law.country)

  const checklist = law.detailedPage?.checklist
  const covered = checklist?.filter((c) => c.covered).length ?? 0
  const total = checklist?.length ?? 0
  const hasCoverage = total > 0
  const coveragePct = hasCoverage ? Math.round((covered / total) * 100) : 0

  return (
    <Link
      href={`/compliance/${law.id}`}
      className="relative block p-5 rounded-xl border border-border bg-card
        hover:shadow-md hover:border-foreground/20 transition-all duration-200 group overflow-hidden"
    >

      {/* Guide badge */}
      {law.detailedPage && (
        <span className="absolute top-3 right-3 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-green/10 text-brand-green">
          Guide
        </span>
      )}

      {/* Header: Flag + Name + Status pill */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm flex-shrink-0" aria-hidden>{flag}</span>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors truncate">
          {law.shortName}
        </h3>
        <span
          className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${sMeta.bgColor} ${sMeta.textColor}`}
          title={sMeta.label}
        >
          {sMeta.label}
        </span>
        <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
      </div>

      {/* Summary */}
      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
        {law.summary}
      </p>

      {/* Footer: categories count + coverage bar */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground">
          {law.ruleCategories.length} categories
        </span>

        {hasCoverage && (
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-green transition-all"
                style={{ width: `${coveragePct}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {coveragePct}%
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
