"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { STATUS_META } from "@/lib/compliance/types"
import { getCountryFlag } from "@/lib/compliance/country-flags"
import type { LawEntry } from "@/lib/compliance/types"

interface HighlightLawCardProps {
  law: LawEntry
}

export function HighlightLawCard({ law }: HighlightLawCardProps) {
  const sMeta = STATUS_META[law.status]
  const flag = getCountryFlag(law.country)

  const checklist = law.detailedPage?.checklist
  const covered = checklist?.filter((c) => c.covered).length ?? 0
  const total = checklist?.length ?? 0
  const hasCoverage = total > 0

  return (
    <Link
      href={`/compliance/${law.id}`}
      className="relative block p-6 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl
        hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-200 group overflow-hidden"
    >

      {/* Guide badge */}
      {law.detailedPage && (
        <span className="absolute top-3 right-3 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-green/15 text-brand-green">
          Guide
        </span>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base" aria-hidden>{flag}</span>
        <h3 className="font-semibold text-white group-hover:text-brand-green transition-colors">
          {law.shortName}
        </h3>
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ml-auto ${sMeta.bgColor} ${sMeta.textColor}`}
        >
          {sMeta.label}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-white/50 line-clamp-2 mb-3">
        {law.summary}
      </p>

      {/* Coverage bar */}
      {hasCoverage && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-green transition-all"
              style={{ width: `${(covered / total) * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/40 tabular-nums flex-shrink-0">
            {covered}/{total}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <span className="text-xs text-white/40">
          {law.ruleCategories.length} categories
        </span>
        <span className="text-xs text-brand-green font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View details
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  )
}
