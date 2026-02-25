"use client"

import { useMemo, useState } from "react"
import {
  ChevronDown,
  Linkedin,
  Twitter,
  Mail,
  Globe,
  ExternalLink,
  Star,
  X,
} from "lucide-react"
import type {
  WarmIntroTarget,
  PipelineStatus,
  PriorityTier,
  InvestorCategory,
  InvestorType,
} from "@/lib/investors/warm-intro-network"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/search-input"
import {
  DataTable,
  DataTableHeader,
  DataTableRow,
  DataTableEmpty,
  type ColumnDef,
  type SortState,
} from "@/components/ui/data-table"

export type InvestorRating = 1 | 2 | 3 | 4 | 5 | "x"

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
  "faith-family": "Faith & Family",
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

const TIER_BADGE_VARIANT: Record<PriorityTier, "destructive" | "warning" | "info"> = {
  1: "destructive",
  2: "warning",
  3: "info",
}

const THESIS_BADGE_VARIANT: Record<string, "success" | "warning" | "default"> = {
  perfect: "success",
  good: "warning",
  adjacent: "default",
}

export default function InvestorTable({
  targets,
  onStatusChange,
  ratings,
  onRatingChange,
  initialCategoryFilter,
  initialTierFilter,
}: {
  targets: WarmIntroTarget[]
  onStatusChange: (id: string, status: PipelineStatus) => void
  ratings?: Record<string, InvestorRating>
  onRatingChange?: (id: string, rating: InvestorRating | null) => void
  initialCategoryFilter?: string
  initialTierFilter?: string
}) {
  const [tierFilter, setTierFilter] = useState<string>(initialTierFilter ?? "all")
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryFilter ?? "all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [thesisFilter, setThesisFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sort, setSort] = useState<SortState | null>({ key: "tier", direction: "asc" })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(targets.map((t) => t.category))).sort(),
    [targets],
  )
  const types = useMemo(
    () => Array.from(new Set(targets.map((t) => t.type))).sort(),
    [targets],
  )

  const hasActiveFilters =
    tierFilter !== "all" ||
    categoryFilter !== "all" ||
    typeFilter !== "all" ||
    thesisFilter !== "all" ||
    ratingFilter !== "all"

  const clearAllFilters = () => {
    setTierFilter("all")
    setCategoryFilter("all")
    setTypeFilter("all")
    setThesisFilter("all")
    setRatingFilter("all")
  }

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc" ? { key, direction: "desc" as const } : null
      }
      return { key, direction: "asc" as const }
    })
  }

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    let result = targets.filter((t) => {
      if (tierFilter !== "all" && t.tier !== Number(tierFilter)) return false
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false
      if (typeFilter !== "all" && t.type !== typeFilter) return false
      if (thesisFilter !== "all" && t.thesisAlignment !== thesisFilter) return false
      if (ratingFilter !== "all" && ratings) {
        const r = ratings[t.id]
        if (ratingFilter === "rated" && (r === undefined || r === "x")) return false
        if (ratingFilter === "unrated" && r !== undefined) return false
        if (ratingFilter === "not-a-fit" && r !== "x") return false
      }
      if (q && !t.name.toLowerCase().includes(q) && !t.fundOrCompany.toLowerCase().includes(q) && !(t.notes ?? "").toLowerCase().includes(q))
        return false
      return true
    })
    // Sort
    const thesisOrder: Record<string, number> = { perfect: 0, good: 1, adjacent: 2 }
    if (sort) {
      result.sort((a, b) => {
        let cmp = 0
        switch (sort.key) {
          case "name": cmp = a.name.localeCompare(b.name); break
          case "tier": cmp = a.tier - b.tier; break
          case "category": cmp = a.category.localeCompare(b.category); break
          case "thesisAlignment": cmp = thesisOrder[a.thesisAlignment] - thesisOrder[b.thesisAlignment]; break
          case "paths": cmp = b.introPaths.length - a.introPaths.length; break
          case "rating": {
            const ratingVal = (id: string) => {
              const r = ratings?.[id]
              if (r === undefined) return 0
              if (r === "x") return -1
              return r
            }
            cmp = ratingVal(b.id) - ratingVal(a.id)
            break
          }
        }
        return sort.direction === "asc" ? cmp : -cmp
      })
    }
    return result
  }, [targets, tierFilter, categoryFilter, typeFilter, thesisFilter, ratingFilter, searchQuery, sort, ratings])

  /* ── Column definitions (inside component for closure over ratings/handlers) ── */

  const columns: ColumnDef<WarmIntroTarget>[] = useMemo(() => [
    {
      id: "name",
      accessor: "name",
      header: "Name",
      sortable: true,
      cell: (_, row) => (
        <span className="flex items-center gap-1.5 text-foreground font-medium max-w-[180px] truncate">
          <ChevronDown
            className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${expandedId === row.id ? "" : "-rotate-90"}`}
          />
          {row.name}
        </span>
      ),
    },
    {
      id: "fund",
      accessor: "fundOrCompany",
      header: "Fund",
      cell: (v) => <span className="text-muted-foreground max-w-[140px] truncate">{v as string}</span>,
    },
    {
      id: "tier",
      accessor: "tier",
      header: "Tier",
      sortable: true,
      cell: (_, row) => (
        <Badge variant={TIER_BADGE_VARIANT[row.tier]} size="sm">
          Tier {row.tier}
        </Badge>
      ),
    },
    {
      id: "category",
      accessor: "category",
      header: "Category",
      sortable: true,
      hideBelow: "md",
      cell: (v) => <span className="text-muted-foreground">{CATEGORY_LABELS[v as InvestorCategory] ?? (v as string).replace(/-/g, " ")}</span>,
    },
    {
      id: "checkSize",
      accessor: "checkSizeRange",
      header: "Check Size",
      hideBelow: "lg",
      cell: (v) => <span className="text-muted-foreground tabular-nums">{v as string}</span>,
    },
    {
      id: "thesisAlignment",
      accessor: "thesisAlignment",
      header: "Thesis",
      sortable: true,
      cell: (v) => (
        <Badge variant={THESIS_BADGE_VARIANT[v as string] || "default"} size="sm">
          {v as string}
        </Badge>
      ),
    },
    {
      id: "status",
      accessor: "status",
      header: "Status",
      interactive: true,
      cell: (_, row) => (
        <select
          value={row.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            onStatusChange(
              row.id,
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
      ),
    },
    {
      id: "rating",
      accessor: (row) => ratings?.[row.id],
      header: "Rating",
      sortable: true,
      interactive: true,
      cell: (_, row) => {
        const currentRating = ratings?.[row.id]
        return (
          <div className="flex items-center gap-0.5">
            {currentRating === "x" ? (
              <>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => onRatingChange?.(row.id, s as InvestorRating)}
                    className="p-0"
                  >
                    <Star className="w-3 h-3 text-border" />
                  </button>
                ))}
                <button
                  onClick={() => onRatingChange?.(row.id, null)}
                  className="p-0 ml-1"
                  title="Clear not-a-fit"
                >
                  <X className="w-3 h-3 text-red-500 fill-red-500" />
                </button>
              </>
            ) : (
              <>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      onRatingChange?.(
                        row.id,
                        currentRating === s ? null : (s as InvestorRating),
                      )
                    }
                    className="p-0"
                  >
                    <Star
                      className={`w-3 h-3 ${
                        currentRating !== undefined &&
                        s <= (currentRating as number)
                          ? "text-amber-400 fill-amber-400"
                          : "text-border"
                      }`}
                    />
                  </button>
                ))}
                <button
                  onClick={() => onRatingChange?.(row.id, "x")}
                  className="p-0 ml-1"
                  title="Not a fit"
                >
                  <X className="w-3 h-3 text-border hover:text-red-500" />
                </button>
              </>
            )}
          </div>
        )
      },
    },
    {
      id: "paths",
      accessor: (row) => row.introPaths.length,
      header: "Paths",
      sortable: true,
      align: "right",
      cell: (v) => <span className="tabular-nums">{v as number}</span>,
    },
  ], [expandedId, ratings, onStatusChange, onRatingChange])

  /* ── Expanded row content renderer ── */

  const renderExpandedContent = (t: WarmIntroTarget) => (
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
                  {" \u2014 "}
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
  )

  const selectClass =
    "px-3 py-2 rounded-lg border border-border bg-background text-sm"

  const chipClass = (active: boolean) =>
    `text-[11px] font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
      active
        ? "bg-brand-green text-[#0D1B2A]"
        : "bg-muted text-muted-foreground hover:bg-muted/80"
    }`

  return (
    <div>
      {/* Search + Filters */}
      <div className="space-y-2 mb-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search investors by name, fund, or notes..."
        />

        {/* Quick-filter chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              setCategoryFilter("faith-family")
              setTierFilter("1")
            }}
            className={chipClass(categoryFilter === "faith-family" && tierFilter === "1")}
          >
            Faith & Family Gatekeepers
          </button>
          <button
            onClick={() => {
              setTierFilter("1")
              setCategoryFilter("all")
              setTypeFilter("all")
              setThesisFilter("all")
            }}
            className={chipClass(tierFilter === "1" && categoryFilter === "all")}
          >
            Tier 1 Investors
          </button>
          <button
            onClick={() => {
              setThesisFilter("perfect")
              setTierFilter("all")
              setCategoryFilter("all")
              setTypeFilter("all")
            }}
            className={chipClass(thesisFilter === "perfect" && tierFilter === "all" && categoryFilter === "all")}
          >
            Perfect Thesis
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Clear Filters
            </button>
          )}
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
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">All Ratings</option>
            <option value="rated">Rated</option>
            <option value="unrated">Unrated</option>
            <option value="not-a-fit">Not a Fit</option>
          </select>
          <span className="flex items-center text-xs text-muted-foreground ml-auto">
            {filtered.length} of {targets.length} targets
          </span>
        </div>
      </div>

      {/* Table */}
      <DataTable className="text-xs">
        <DataTableHeader columns={columns} sort={sort} onSort={toggleSort} />
        <tbody>
          {filtered.length === 0 ? (
            <DataTableEmpty
              description="No investors match your filters."
              colSpan={columns.length}
            />
          ) : (
            filtered.map((t) => {
              const isExpanded = expandedId === t.id
              return (
                <DataTableRow
                  key={t.id}
                  row={t}
                  columns={columns}
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  isExpanded={isExpanded}
                  expandedContent={renderExpandedContent(t)}
                />
              )
            })
          )}
        </tbody>
      </DataTable>
    </div>
  )
}
