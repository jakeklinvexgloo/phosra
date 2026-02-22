"use client"

import { useMemo, useState } from "react"
import type {
  WarmIntroTarget,
  PipelineStatus,
  PriorityTier,
  InvestorCategory,
  InvestorType,
} from "@/lib/investors/warm-intro-network"

const PIPELINE_OPTIONS: PipelineStatus[] = [
  "identified",
  "connector-contacted",
  "intro-requested",
  "intro-made",
  "meeting-scheduled",
  "meeting-complete",
  "follow-up",
  "term-sheet",
  "committed",
  "wired",
  "passed",
]

const TIER_COLORS: Record<PriorityTier, string> = {
  1: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  2: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  3: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
}

const THESIS_COLORS: Record<string, string> = {
  perfect: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  good: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  adjacent: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

export default function InvestorTable({
  targets,
  onStatusChange,
}: {
  targets: WarmIntroTarget[]
  onStatusChange: (id: string, status: PipelineStatus) => void
}) {
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [thesisFilter, setThesisFilter] = useState<string>("all")

  const categories = useMemo(
    () => Array.from(new Set(targets.map((t) => t.category))).sort(),
    [targets],
  )
  const types = useMemo(
    () => Array.from(new Set(targets.map((t) => t.type))).sort(),
    [targets],
  )

  const filtered = useMemo(() => {
    return targets.filter((t) => {
      if (tierFilter !== "all" && t.tier !== Number(tierFilter)) return false
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false
      if (typeFilter !== "all" && t.type !== typeFilter) return false
      if (thesisFilter !== "all" && t.thesisAlignment !== thesisFilter) return false
      return true
    })
  }, [targets, tierFilter, categoryFilter, typeFilter, thesisFilter])

  const selectClass =
    "px-3 py-2 rounded-lg border border-border bg-background text-sm"

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Tiers</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace(/-/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={thesisFilter}
          onChange={(e) => setThesisFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Thesis</option>
          <option value="perfect">Perfect</option>
          <option value="good">Good</option>
          <option value="adjacent">Adjacent</option>
        </select>
        <span className="flex items-center text-xs text-muted-foreground ml-auto">
          {filtered.length} of {targets.length} targets
        </span>
      </div>

      {/* Table */}
      <div className="plaid-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Fund</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Tier</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium hidden md:table-cell">Category</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium hidden lg:table-cell">Check Size</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Thesis</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-right py-2.5 px-4 text-muted-foreground font-medium">Paths</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-2.5 px-4 text-foreground font-medium max-w-[180px] truncate">
                    {t.name}
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground max-w-[140px] truncate">
                    {t.fundOrCompany}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${TIER_COLORS[t.tier]}`}
                    >
                      Tier {t.tier}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground capitalize hidden md:table-cell">
                    {t.category.replace(/-/g, " ")}
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground tabular-nums hidden lg:table-cell">
                    {t.checkSizeRange}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${THESIS_COLORS[t.thesisAlignment]}`}
                    >
                      {t.thesisAlignment}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <select
                      value={t.status}
                      onChange={(e) =>
                        onStatusChange(t.id, e.target.value as PipelineStatus)
                      }
                      className="text-[11px] px-1.5 py-1 rounded border border-border bg-background"
                    >
                      {PIPELINE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/-/g, " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums">
                    {t.introPaths.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
