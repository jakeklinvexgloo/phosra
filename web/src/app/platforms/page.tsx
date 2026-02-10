"use client"

import { Fragment, useMemo, useState } from "react"
import { Search, ChevronDown, ChevronUp, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import { PLATFORM_PAGE_ENTRIES, TIER_LABELS, type PlatformPageEntry } from "@/lib/platforms/adapters/to-platform-page"
import { CATEGORY_META, PLATFORM_STATS } from "@/lib/platforms"
import { PlatformIcon } from "@/components/marketing/ecosystem/PlatformIcon"
import type { PlatformCategorySlug, PlatformSide, IntegrationTier } from "@/lib/platforms/types"

type SortField = "name" | "category" | "tier" | "side"

const tierBadgeConfig: Record<IntegrationTier, { bg: string; text: string }> = {
  live: { bg: "bg-emerald-50", text: "text-emerald-700" },
  partial: { bg: "bg-amber-50", text: "text-amber-700" },
  stub: { bg: "bg-blue-50", text: "text-blue-700" },
  planned: { bg: "bg-gray-100", text: "text-gray-500" },
}

export default function PlatformsPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<PlatformCategorySlug | "all">("all")
  const [tierFilter, setTierFilter] = useState<IntegrationTier | "all">("all")
  const [sideFilter, setSideFilter] = useState<PlatformSide | "all">("all")
  const [sortField, setSortField] = useState<SortField>("tier")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const filtered = useMemo(() => {
    let result = [...PLATFORM_PAGE_ENTRIES]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.categoryLabel.toLowerCase().includes(q),
      )
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter)
    }

    if (tierFilter !== "all") {
      result = result.filter((p) => p.tier === tierFilter)
    }

    if (sideFilter !== "all") {
      result = result.filter((p) => p.side === sideFilter)
    }

    const tierOrder: Record<string, number> = { live: 0, partial: 1, stub: 2, planned: 3 }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name)
          break
        case "category":
          cmp = a.categoryLabel.localeCompare(b.categoryLabel)
          break
        case "tier":
          cmp = tierOrder[a.tier] - tierOrder[b.tier]
          if (cmp === 0) cmp = a.name.localeCompare(b.name)
          break
        case "side":
          cmp = a.side.localeCompare(b.side)
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [search, categoryFilter, tierFilter, sideFilter, sortField, sortDir])

  const SortHeader = ({
    field,
    children,
    className = "",
  }: {
    field: SortField
    children: React.ReactNode
    className?: string
  }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition ${className}`}
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDir === "asc" ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )
        ) : (
          <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-30" />
        )}
      </span>
    </th>
  )

  const activeFilters = [
    categoryFilter !== "all" && { key: "category", label: CATEGORY_META.find((c) => c.slug === categoryFilter)?.shortLabel ?? categoryFilter },
    tierFilter !== "all" && { key: "tier", label: TIER_LABELS[tierFilter] },
    sideFilter !== "all" && { key: "side", label: sideFilter === "source" ? "Sources" : "Targets" },
  ].filter(Boolean) as { key: string; label: string }[]

  const clearFilter = (key: string) => {
    if (key === "category") setCategoryFilter("all")
    if (key === "tier") setTierFilter("all")
    if (key === "side") setSideFilter("all")
  }

  return (
    <div>
      {/* Hero header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
          Platform Coverage Explorer
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mb-4">
          Explore the {PLATFORM_STATS.marketingTotal} platforms Phosra supports across {PLATFORM_STATS.categoryCount} categories
          {" \u2014 "}streaming, social media, gaming, DNS filtering, devices, and more.
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {PLATFORM_STATS.integratedCount} integrated
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            {PLATFORM_STATS.plannedCount}+ on roadmap
          </span>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-brand-green hover:underline"
          >
            Sign up to verify compliance
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as PlatformCategorySlug | "all")}
          className="plaid-input !w-auto text-sm min-w-[180px] cursor-pointer"
        >
          <option value="all">All Categories ({PLATFORM_STATS.categoryCount})</option>
          {CATEGORY_META.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as IntegrationTier | "all")}
          className="plaid-input !w-auto text-sm min-w-[160px] cursor-pointer"
        >
          <option value="all">All Integration Status</option>
          <option value="live">API</option>
          <option value="partial">Hybrid</option>
          <option value="stub">Guide</option>
          <option value="planned">Roadmap</option>
        </select>

        <select
          value={sideFilter}
          onChange={(e) => setSideFilter(e.target.value as PlatformSide | "all")}
          className="plaid-input !w-auto text-sm min-w-[140px] cursor-pointer"
        >
          <option value="all">Sources & Targets</option>
          <option value="source">Sources Only</option>
          <option value="target">Targets Only</option>
        </select>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 bg-muted text-foreground text-xs px-2.5 py-1 rounded-full"
            >
              {f.label}
              <button onClick={() => clearFilter(f.key)} className="hover:opacity-70 transition">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() => {
              setCategoryFilter("all")
              setTierFilter("all")
              setSideFilter("all")
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search platforms by name or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="plaid-input pl-10 w-full"
        />
      </div>

      {/* Table */}
      <div className="plaid-card !p-0 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <SortHeader field="name" className="min-w-[200px]">
                Platform
              </SortHeader>
              <SortHeader field="category">Category</SortHeader>
              <SortHeader field="side">Side</SortHeader>
              <SortHeader field="tier">Integration</SortHeader>
            </tr>
          </thead>
          <tbody>
            {filtered.map((platform) => {
              const isExpanded = expandedId === platform.id
              const badge = tierBadgeConfig[platform.tier]

              return (
                <Fragment key={platform.id}>
                  <tr
                    className={`border-b border-border cursor-pointer transition ${
                      isExpanded ? "bg-muted/30" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : platform.id)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <PlatformIcon
                          platform={{
                            name: platform.name,
                            iconKey: platform.iconKey,
                            hex: platform.hex,
                          }}
                          size={24}
                          grayscale={false}
                          fallbackHex={platform.accentHex}
                        />
                        <span className="font-medium text-foreground text-sm">{platform.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${platform.accentClass}`}
                      >
                        {platform.categoryShortLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground capitalize">
                      {platform.side}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}
                      >
                        {platform.tierLabel}
                      </span>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="border-b border-border">
                      <td colSpan={4} className="bg-muted/20 px-6 py-5">
                        <div className="space-y-4">
                          {platform.description && (
                            <p className="text-sm text-muted-foreground">{platform.description}</p>
                          )}

                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                                Category
                              </p>
                              <span className="text-sm text-muted-foreground">
                                {platform.categoryLabel}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                                Integration
                              </p>
                              <span className="text-sm text-muted-foreground">
                                {platform.tierLabel}
                              </span>
                            </div>
                            {platform.dbPlatformId && (
                              <div>
                                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                                  Compliance
                                </p>
                                <Link
                                  href="/login"
                                  className="inline-flex items-center gap-1.5 text-sm text-brand-green hover:underline"
                                >
                                  Sign in to verify
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No platforms match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="px-6 py-3 border-t border-border text-sm text-muted-foreground">
          Showing {filtered.length} of {PLATFORM_STATS.total} platforms
        </div>
      </div>
    </div>
  )
}
