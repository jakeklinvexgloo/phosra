"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { JURISDICTION_META, STATUS_META } from "@/lib/compliance/types"
import { getCountryFlag } from "@/lib/compliance/country-flags"
import type { LawEntry } from "@/lib/compliance/types"

interface LawCardProps {
  law: LawEntry
  index: number
}

export function LawCard({ law }: LawCardProps) {
  const jMeta = JURISDICTION_META[law.jurisdictionGroup]
  const sMeta = STATUS_META[law.status]
  const flag = getCountryFlag(law.country)

  const checklist = law.detailedPage?.checklist
  const covered = checklist?.filter((c) => c.covered).length ?? 0
  const total = checklist?.length ?? 0
  const hasCoverage = total > 0

  return (
    <Link
      href={`/compliance/${law.id}`}
      className={`
        block p-4 rounded-lg border border-border bg-card
        hover:shadow-md hover:border-border/80 transition-all group
      `}
    >
      {/* Header: Flag + Name + Status dot */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm flex-shrink-0" aria-hidden>{flag}</span>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors truncate">
          {law.shortName}
        </h3>
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sMeta.dotColor}`}
          title={sMeta.label}
        />
        <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
      </div>

      {/* Summary — 1 line */}
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
            <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-green transition-all"
                style={{ width: `${(covered / total) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {covered}/{total}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
