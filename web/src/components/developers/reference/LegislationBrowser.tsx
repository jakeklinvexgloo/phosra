"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { LAW_REGISTRY } from "@/lib/compliance/law-registry"
import type { LawEntry, LawStatus, Jurisdiction } from "@/lib/compliance/types"
import { STATUS_META } from "@/lib/compliance/types"
import { DISPLAY_GROUPS } from "@/lib/compliance/country-flags"
import { getCountryFlag } from "@/lib/compliance/country-flags"
import { getCategoryMeta, getGroupColor } from "@/lib/compliance/category-meta"
import { CATEGORY_REFERENCE } from "@/lib/docs/categories"

// ── Helpers ──

const ALL_STATUSES: LawStatus[] = ["enacted", "passed", "pending", "proposed", "injunction"]

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    timeoutRef.current = setTimeout(() => setDebounced(value), delay)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [value, delay])
  return debounced
}

function matchesSearch(law: LawEntry, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const searchable = [
    law.shortName,
    law.fullName,
    law.summary,
    law.jurisdiction,
    ...law.keyProvisions,
    ...law.tags,
    ...law.ruleCategories,
  ]
    .join(" ")
    .toLowerCase()
  return searchable.includes(q)
}

// ── Component ──

export function LegislationBrowser() {
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState<LawStatus | "all">("all")
  const [jurisdictionFilter, setJurisdictionFilter] = useState<Jurisdiction | "all">("all")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const debouncedSearch = useDebounce(searchInput, 200)

  // Compute stats from full registry
  const stats = useMemo(() => {
    const jurisdictions = new Set(LAW_REGISTRY.map((l) => l.jurisdiction))
    const categories = new Set(LAW_REGISTRY.flatMap((l) => l.ruleCategories))
    return {
      total: LAW_REGISTRY.length,
      enacted: LAW_REGISTRY.filter((l) => l.status === "enacted").length,
      jurisdictions: jurisdictions.size,
      categories: categories.size,
    }
  }, [])

  // Filter laws
  const filteredLaws = useMemo(() => {
    return LAW_REGISTRY.filter((law) => {
      if (statusFilter !== "all" && law.status !== statusFilter) return false
      if (jurisdictionFilter !== "all" && law.jurisdictionGroup !== jurisdictionFilter) return false
      if (!matchesSearch(law, debouncedSearch)) return false
      return true
    })
  }, [debouncedSearch, statusFilter, jurisdictionFilter])

  // Group filtered laws by jurisdiction
  const groupedLaws = useMemo(() => {
    const groups: { group: typeof DISPLAY_GROUPS[number]; laws: LawEntry[] }[] = []
    for (const group of DISPLAY_GROUPS) {
      const laws = filteredLaws.filter((l) => l.jurisdictionGroup === group.jurisdictionGroup)
      if (laws.length > 0) {
        groups.push({ group, laws })
      }
    }
    return groups
  }, [filteredLaws])

  const toggleCard = useCallback((id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleGroup = useCallback((jurisdictionGroup: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(jurisdictionGroup)) next.delete(jurisdictionGroup)
      else next.add(jurisdictionGroup)
      return next
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Laws" value={stats.total} />
        <StatCard label="Enacted" value={stats.enacted} />
        <StatCard label="Jurisdictions" value={stats.jurisdictions} />
        <StatCard label="PCSS Categories" value={stats.categories} />
      </div>

      {/* ── Search + Filters ── */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search laws by name, jurisdiction, provision, or category..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-colors"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5">
            <FilterPill
              label="All"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              isAllPill
            />
            {ALL_STATUSES.map((s) => (
              <FilterPill
                key={s}
                label={STATUS_META[s].label}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                dotColor={STATUS_META[s].dotColor}
              />
            ))}
          </div>

          {/* Jurisdiction dropdown */}
          <select
            value={jurisdictionFilter}
            onChange={(e) => setJurisdictionFilter(e.target.value as Jurisdiction | "all")}
            className="px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-colors"
          >
            <option value="all">All Jurisdictions</option>
            {DISPLAY_GROUPS.map((g) => (
              <option key={g.jurisdictionGroup} value={g.jurisdictionGroup}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Results ── */}
      {groupedLaws.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No laws found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search or filters to find relevant legislation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedLaws.map(({ group, laws }) => {
            const isCollapsed = collapsedGroups.has(group.jurisdictionGroup)
            // Status breakdown for dots
            const enacted = laws.filter((l) => l.status === "enacted").length
            const passed = laws.filter((l) => l.status === "passed").length
            const pending = laws.filter((l) => l.status !== "enacted" && l.status !== "passed").length

            return (
              <div
                key={group.jurisdictionGroup}
                className="border-l-2 border-l-foreground/20 rounded-lg bg-card border border-border overflow-hidden"
              >
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.jurisdictionGroup)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{group.flag}</span>
                    <span className="text-sm font-semibold text-foreground">{group.label}</span>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                      {laws.length}
                    </span>
                    {/* Status dots */}
                    <span className="hidden sm:flex items-center gap-1 ml-1">
                      {enacted > 0 && (
                        <span className="flex items-center gap-0.5" title={`${enacted} enacted`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                          <span className="text-[10px] text-muted-foreground">{enacted}</span>
                        </span>
                      )}
                      {passed > 0 && (
                        <span className="flex items-center gap-0.5" title={`${passed} passed`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                          <span className="text-[10px] text-muted-foreground">{passed}</span>
                        </span>
                      )}
                      {pending > 0 && (
                        <span className="flex items-center gap-0.5" title={`${pending} pending/proposed`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                          <span className="text-[10px] text-muted-foreground">{pending}</span>
                        </span>
                      )}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Card Grid */}
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isCollapsed ? "0fr" : "1fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 px-4 pb-4">
                      {laws.map((law) => (
                        <LawCard
                          key={law.id}
                          law={law}
                          expanded={expandedCards.has(law.id)}
                          onToggle={() => toggleCard(law.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 text-center">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function FilterPill({
  label,
  active,
  onClick,
  dotColor,
  isAllPill,
}: {
  label: string
  active: boolean
  onClick: () => void
  dotColor?: string
  isAllPill?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
        active
          ? isAllPill
            ? "bg-foreground text-background"
            : "bg-foreground/10 text-foreground font-medium"
          : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className="flex items-center gap-1.5">
        {dotColor && !isAllPill && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
        {label}
      </span>
    </button>
  )
}

function LawCard({
  law,
  expanded,
  onToggle,
}: {
  law: LawEntry
  expanded: boolean
  onToggle: () => void
}) {
  const statusMeta = STATUS_META[law.status]
  const categoryCount = law.ruleCategories.length

  return (
    <div
      className={`rounded-xl border bg-card overflow-hidden transition-all duration-200 ${
        expanded ? "border-foreground/20 shadow-md" : "border-border hover:border-foreground/20 hover:shadow-sm"
      }`}
    >
      {/* Card Header (always visible) */}
      <button onClick={onToggle} className="w-full text-left p-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-shrink-0">{getCountryFlag(law.country)}</span>
            <span className="text-sm font-semibold text-foreground truncate">{law.shortName}</span>
          </div>
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusMeta.bgColor} ${statusMeta.textColor}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}`} />
            {statusMeta.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 leading-relaxed">{law.summary}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">
            {categoryCount} {categoryCount === 1 ? "category" : "categories"}
          </span>
          {law.detailedPage && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-green/10 text-brand-green">
              Guide
            </span>
          )}
        </div>
        {/* Coverage bar */}
        {categoryCount > 0 && (
          <div className="w-full h-1 rounded-full bg-foreground/10 mt-2">
            <div
              className="h-full rounded-full bg-brand-green/60"
              style={{ width: `${Math.min(100, (categoryCount / 10) * 100)}%` }}
            />
          </div>
        )}
      </button>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/10">
          {/* Full name */}
          <p className="text-xs text-muted-foreground italic">{law.fullName}</p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Jurisdiction</p>
              <p className="text-xs text-foreground">{law.jurisdiction}</p>
            </div>
            <div className="bg-muted/30 rounded p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Introduced</p>
              <p className="text-xs text-foreground">{law.introduced}</p>
            </div>
            <div className="bg-muted/30 rounded p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Status</p>
              <p className="text-xs text-foreground">{law.statusLabel}</p>
            </div>
          </div>

          {/* Key Provisions */}
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-1.5">Key Provisions</h4>
            <ul className="space-y-1">
              {law.keyProvisions.map((provision, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="text-brand-green mt-0.5 flex-shrink-0">&#8226;</span>
                  <span className="leading-relaxed">{provision}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required PCSS Categories with color-coded group badges */}
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-1.5">Required PCSS Categories</h4>
            <div className="flex flex-wrap gap-1.5">
              {law.ruleCategories.map((catId) => {
                const meta = getCategoryMeta(catId)
                const groupColor = getGroupColor(meta.group)
                const catRef = CATEGORY_REFERENCE.find((c) => c.id === catId)
                return (
                  <span
                    key={catId}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border ${groupColor.bg} ${groupColor.text} ${groupColor.border}`}
                    title={catRef?.description || meta.description}
                  >
                    <code className="font-mono">{catId}</code>
                  </span>
                )
              })}
            </div>
          </div>

          {/* Link to compliance detail page */}
          <a
            href={`/compliance/${law.id}`}
            className="inline-flex items-center gap-1 text-xs text-brand-green hover:underline"
          >
            View full compliance page
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}
