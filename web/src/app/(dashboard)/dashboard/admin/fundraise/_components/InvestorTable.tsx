"use client"

import { Fragment, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Linkedin,
  Twitter,
  Mail,
  Globe,
  ExternalLink,
  Search,
} from "lucide-react"
import type {
  WarmIntroTarget,
  PipelineStatus,
  PriorityTier,
  InvestorCategory,
  InvestorType,
} from "@/lib/investors/warm-intro-network"

const CATEGORY_LABELS: Partial<Record<InvestorCategory, string>> = {
  "regtech-vc": "Regtech VC",
  "child-safety-vc": "Child Safety VC",
  "edtech-vc": "EdTech VC",
  "solo-founder-fund": "Solo Founder Fund",
  "identity-vc": "Identity VC",
  "family-safety-vc": "Family Safety VC",
  "impact-fund": "Impact Fund",
  "pre-seed-specialist": "Pre-Seed Specialist",
  "ts-leader": "T&S Leader",
  "ftc-alumni": "FTC Alumni",
  "nonprofit-leader": "Nonprofit Leader",
  "regtech-founder": "Regtech Founder",
  "angel-syndicate": "Angel Syndicate",
  "hnw-angel": "HNW Angel",
  "family-office": "Family Office",
  "corporate-vc": "Corporate VC",
  "impact-investor": "Impact Investor",
  "celebrity-angel": "Celebrity Angel",
  "policy-angel": "Policy Angel",
  "parent-angel": "Parent Angel",
  "fintech-angel": "Fintech Angel",
}

const TYPE_LABELS: Partial<Record<InvestorType, string>> = {
  vc: "VC",
  angel: "Angel",
  syndicate: "Syndicate",
  strategic: "Strategic",
  "micro-fund": "Micro Fund",
  cvc: "CVC",
  "family-office": "Family Office",
  "impact-fund": "Impact Fund",
}

type SortKey = "name" | "tier" | "category" | "thesisAlignment" | "paths"
type SortDir = "asc" | "desc"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("tier")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(targets.map((t) => t.category))).sort(),
    [targets],
  )
  const types = useMemo(
    () => Array.from(new Set(targets.map((t) => t.type))).sort(),
    [targets],
  )

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    let result = targets.filter((t) => {
      if (tierFilter !== "all" && t.tier !== Number(tierFilter)) return false
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false
      if (typeFilter !== "all" && t.type !== typeFilter) return false
      if (thesisFilter !== "all" && t.thesisAlignment !== thesisFilter) return false
      if (q && !t.name.toLowerCase().includes(q) && !t.fundOrCompany.toLowerCase().includes(q) && !(t.notes ?? "").toLowerCase().includes(q))
        return false
      return true
    })
    // Sort
    const thesisOrder = { perfect: 0, good: 1, adjacent: 2 }
    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break
        case "tier": cmp = a.tier - b.tier; break
        case "category": cmp = a.category.localeCompare(b.category); break
        case "thesisAlignment": cmp = thesisOrder[a.thesisAlignment] - thesisOrder[b.thesisAlignment]; break
        case "paths": cmp = b.introPaths.length - a.introPaths.length; break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return result
  }, [targets, tierFilter, categoryFilter, typeFilter, thesisFilter, searchQuery, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-0.5" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-0.5" />
    )
  }

  const selectClass =
    "px-3 py-2 rounded-lg border border-border bg-background text-sm"

  return (
    <div>
      {/* Search + Filters */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search investors by name, fund, or notes..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/50 outline-none focus:border-brand-green"
          />
        </div>
        <div className="flex flex-wrap gap-2">
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
                {CATEGORY_LABELS[c] ?? c.replace(/-/g, " ")}
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
                {TYPE_LABELS[t] ?? t}
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
      </div>

      {/* Table */}
      <div className="plaid-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th onClick={() => toggleSort("name")} className="text-left py-2.5 px-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none">
                  Name <SortIcon col="name" />
                </th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Fund</th>
                <th onClick={() => toggleSort("tier")} className="text-left py-2.5 px-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none">
                  Tier <SortIcon col="tier" />
                </th>
                <th onClick={() => toggleSort("category")} className="text-left py-2.5 px-4 text-muted-foreground font-medium hidden md:table-cell cursor-pointer hover:text-foreground select-none">
                  Category <SortIcon col="category" />
                </th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium hidden lg:table-cell">Check Size</th>
                <th onClick={() => toggleSort("thesisAlignment")} className="text-left py-2.5 px-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none">
                  Thesis <SortIcon col="thesisAlignment" />
                </th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Status</th>
                <th onClick={() => toggleSort("paths")} className="text-right py-2.5 px-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none">
                  Paths <SortIcon col="paths" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const isExpanded = expandedId === t.id
                return (
                  <Fragment key={t.id}>
                    <tr
                      onClick={() =>
                        setExpandedId(isExpanded ? null : t.id)
                      }
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-4 text-foreground font-medium max-w-[180px] truncate">
                        <span className="flex items-center gap-1.5">
                          <ChevronDown
                            className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                          />
                          {t.name}
                        </span>
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
                      <td className="py-2.5 px-4 text-muted-foreground hidden md:table-cell">
                        {CATEGORY_LABELS[t.category] ?? t.category.replace(/-/g, " ")}
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
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            onStatusChange(
                              t.id,
                              e.target.value as PipelineStatus,
                            )
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

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr className="border-b border-border/50 bg-muted/10">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {/* Column 1: Contact & Links */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                  Contact
                                </h4>
                                <div className="space-y-1">
                                  {t.contact?.linkedin && (
                                    <a
                                      href={t.contact.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      <Linkedin className="w-3 h-3" />
                                      LinkedIn
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  {t.contact?.twitter && (
                                    <a
                                      href={`https://twitter.com/${t.contact.twitter.replace("@", "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      <Twitter className="w-3 h-3" />
                                      {t.contact.twitter}
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  {t.contact?.email && (
                                    <a
                                      href={`mailto:${t.contact.email}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      <Mail className="w-3 h-3" />
                                      {t.contact.email}
                                    </a>
                                  )}
                                  {t.contact?.website && (
                                    <a
                                      href={t.contact.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      <Globe className="w-3 h-3" />
                                      Website
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  {t.website && (
                                    <a
                                      href={t.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      <Globe className="w-3 h-3" />
                                      {t.fundOrCompany}
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  {!t.contact && !t.website && (
                                    <span className="text-muted-foreground">
                                      No contact info
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Intro Paths */}
                              <div>
                                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                  Intro Paths
                                </h4>
                                <div className="space-y-1.5">
                                  {t.introPaths.map((p, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2"
                                    >
                                      <div className="flex gap-0.5 mt-0.5 shrink-0">
                                        {Array.from({ length: 5 }).map(
                                          (_, s) => (
                                            <div
                                              key={s}
                                              className={`w-1 h-1 rounded-full ${s < p.strength ? "bg-brand-green" : "bg-border"}`}
                                            />
                                          ),
                                        )}
                                      </div>
                                      <span className="text-muted-foreground leading-tight">
                                        <span className="text-foreground font-medium capitalize">
                                          {p.type.replace(/-/g, " ")}
                                        </span>
                                        {" — "}
                                        {p.description}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Column 2: Approach Strategy */}
                            <div className="space-y-3">
                              {t.approachStrategy ? (
                                <>
                                  <div>
                                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                      Recommended Approach
                                    </h4>
                                    <p className="text-foreground leading-relaxed">
                                      {t.approachStrategy.recommended}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                      Steps
                                    </h4>
                                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                      {t.approachStrategy.steps.map(
                                        (step, i) => (
                                          <li
                                            key={i}
                                            className="leading-relaxed"
                                          >
                                            {step}
                                          </li>
                                        ),
                                      )}
                                    </ol>
                                  </div>
                                  {t.approachStrategy.timing && (
                                    <div>
                                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                        Timing
                                      </h4>
                                      <p className="text-muted-foreground">
                                        {t.approachStrategy.timing}
                                      </p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className="text-muted-foreground">
                                  No approach strategy
                                </p>
                              )}
                            </div>

                            {/* Column 3: Opening Angle & Notes */}
                            <div className="space-y-3">
                              {t.approachStrategy?.openingAngle && (
                                <div>
                                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                    Opening Angle
                                  </h4>
                                  <p className="text-foreground leading-relaxed italic">
                                    &ldquo;{t.approachStrategy.openingAngle}
                                    &rdquo;
                                  </p>
                                </div>
                              )}
                              <div>
                                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                  Thesis Note
                                </h4>
                                <p className="text-muted-foreground leading-relaxed">
                                  {t.thesisNote}
                                </p>
                              </div>
                              {t.notes && (
                                <div>
                                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                    Notes
                                  </h4>
                                  <p className="text-muted-foreground leading-relaxed">
                                    {t.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
