"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, X, ShieldCheck, Star } from "lucide-react"
import { api } from "@/lib/api"
import type { Family, ComplianceLink } from "@/lib/types"
import { DASHBOARD_PLATFORM_ENTRIES, type DashboardPlatformEntry } from "@/lib/platforms/adapters/to-dashboard-table"
import { PLATFORM_STATS } from "@/lib/platforms/stats"
import { CATEGORY_META } from "@/lib/platforms/registry"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import {
  DataTable,
  DataTableHeader,
  DataTableRow,
  DataTableEmpty,
  DataTableFooter,
  type ColumnDef,
  type SortState,
} from "@/components/ui/data-table"

/* ── Capability groups ─────────────────────────────────────────── */

const CAP_GROUPS: { key: string; label: string; caps: string[] }[] = [
  { key: "content", label: "Content", caps: ["content_rating"] },
  { key: "time", label: "Time", caps: ["time_limit", "scheduled_hours"] },
  { key: "web", label: "Web", caps: ["web_filtering", "safe_search", "custom_blocklist", "custom_allowlist"] },
  { key: "social", label: "Social", caps: ["social_control", "app_control"] },
  { key: "purchase", label: "Purchase", caps: ["purchase_control"] },
]

function hasCapGroup(platform: DashboardPlatformEntry, groupKey: string): boolean {
  const group = CAP_GROUPS.find(g => g.key === groupKey)
  if (!group) return false
  return group.caps.some(c => platform.capabilities.includes(c))
}

/* ── Tier badge mapping ──────────────────────────────────────── */

const TIER_BADGE_VARIANT: Record<string, "success" | "info" | "warning" | "default"> = {
  API: "success",
  Hybrid: "info",
  Guide: "warning",
  Roadmap: "default",
}

/* ── Types ─────────────────────────────────────────────────────── */

type SideFilter = "all" | "source" | "target"

/* ── Tier sort order mapping ──────────────────────────────────── */

const TIER_SORT_ORDER: Record<string, number> = { API: 0, Hybrid: 1, Guide: 2, Roadmap: 3 }

/* ── Column definitions ──────────────────────────────────────── */

const columns: ColumnDef<DashboardPlatformEntry>[] = [
  {
    id: "name",
    accessor: "name",
    header: "Platform",
    sortable: true,
    className: "min-w-[180px]",
    cell: (_, row) => (
      <div className="flex items-center gap-2">
        {row.hex && (
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: `#${row.hex}` }}
          />
        )}
        <span className={`font-medium text-sm ${row.tier === "planned" ? "text-muted-foreground" : "text-foreground"}`}>
          {row.name}
        </span>
      </div>
    ),
  },
  {
    id: "category",
    accessor: "categoryLabel",
    header: "Category",
    sortable: true,
    cell: (_, row) => (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: `#${row.accentHex}` }}
        />
        {row.categoryLabel}
      </span>
    ),
  },
  {
    id: "side",
    accessor: "side",
    header: "Side",
    sortable: true,
    cell: (v) => (
      <Badge variant={(v as string) === "source" ? "info" : "purple"} size="sm">
        {(v as string) === "source" ? "Source" : "Target"}
      </Badge>
    ),
  },
  {
    id: "tier",
    accessor: (row) => TIER_SORT_ORDER[row.tierLabel] ?? 9,
    header: "Tier",
    sortable: true,
    cell: (_, row) => (
      <Badge variant={TIER_BADGE_VARIANT[row.tierLabel] || "default"} size="sm">
        {row.tierLabel}
      </Badge>
    ),
  },
  ...CAP_GROUPS.map((g): ColumnDef<DashboardPlatformEntry> => ({
    id: g.key,
    accessor: (row) => hasCapGroup(row, g.key),
    header: g.label,
    sortable: true,
    align: "center",
    cell: (v, row) =>
      v ? (
        <span className={`font-medium ${row.tier === "planned" ? "text-muted-foreground" : "text-success"}`}>&#10003;</span>
      ) : (
        <span className="text-muted-foreground/40">&mdash;</span>
      ),
  })),
]

/* ── Component ─────────────────────────────────────────────────── */

export default function PlatformsPage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [links, setLinks] = useState<ComplianceLink[]>([])
  const [search, setSearch] = useState("")
  const [sideFilter, setSideFilter] = useState<SideFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [tierFilter, setTierFilter] = useState("all")
  const [selectedCaps, setSelectedCaps] = useState<string[]>([])
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [sort, setSort] = useState<SortState | null>({ key: "name", direction: "asc" })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [capsOpen, setCapsOpen] = useState(false)
  const [verifyingTo, setVerifyingTo] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const capsRef = useRef<HTMLDivElement>(null)

  /* ── Data fetching (compliance links only) ───────────────────── */

  useEffect(() => {
    api.listFamilies().then((f: Family[]) => {
      setFamilies(f || [])
      if (f && f.length > 0) {
        api.listComplianceLinks(f[0].id).then((c: ComplianceLink[]) => setLinks(c || []))
      }
    })
  }, [])

  /* ── Close caps dropdown on outside click ────────────────────── */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (capsRef.current && !capsRef.current.contains(e.target as Node)) setCapsOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  /* ── Filter helpers ──────────────────────────────────────────── */

  const toggleCap = (cap: string) => {
    setSelectedCaps(prev => prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap])
  }

  const removeCap = (cap: string) => {
    setSelectedCaps(prev => prev.filter(c => c !== cap))
  }

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc" ? { key, direction: "desc" as const } : null
      }
      return { key, direction: "asc" as const }
    })
  }

  /* ── Filtered + sorted platforms ─────────────────────────────── */

  const filtered = useMemo(() => {
    let result = [...DASHBOARD_PLATFORM_ENTRIES]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q))
    }

    if (sideFilter !== "all") {
      result = result.filter(p => p.side === sideFilter)
    }

    if (categoryFilter !== "all") {
      result = result.filter(p => p.category === categoryFilter)
    }

    if (tierFilter !== "all") {
      result = result.filter(p => p.tierLabel === tierFilter)
    }

    if (selectedCaps.length > 0) {
      result = result.filter(p => selectedCaps.every(cap => hasCapGroup(p, cap)))
    }

    if (featuredOnly) {
      result = result.filter(p => p.marquee)
    }

    // Sort using the column definitions
    if (sort) {
      const col = columns.find(c => c.id === sort.key)
      if (col) {
        result.sort((a, b) => {
          const accessor = col.accessor
          const av = typeof accessor === "function" ? accessor(a) : a[accessor as keyof DashboardPlatformEntry]
          const bv = typeof accessor === "function" ? accessor(b) : b[accessor as keyof DashboardPlatformEntry]

          if (typeof av === "boolean" && typeof bv === "boolean") {
            if (av === bv) return 0
            const cmp = av ? -1 : 1
            return sort.direction === "asc" ? cmp : -cmp
          }

          if (typeof av === "number" && typeof bv === "number") {
            const cmp = av - bv
            return sort.direction === "asc" ? cmp : -cmp
          }

          const cmp = String(av ?? "").localeCompare(String(bv ?? ""))
          return sort.direction === "asc" ? cmp : -cmp
        })
      }
    }

    return result
  }, [search, sideFilter, categoryFilter, tierFilter, selectedCaps, featuredOnly, sort])

  /* ── Compliance helpers ──────────────────────────────────────── */

  const isVerified = (dbPlatformId: string) => links.some(c => c.platform_id === dbPlatformId && c.status === "verified")

  const verify = async (dbPlatformId: string) => {
    if (!families.length) return
    await api.verifyCompliance(families[0].id, dbPlatformId, apiKey)
    const c = await api.listComplianceLinks(families[0].id)
    setLinks(c || [])
    setVerifyingTo(null)
    setApiKey("")
  }

  const revoke = async (linkId: string) => {
    await api.revokeCertification(linkId)
    if (families.length) {
      const c = await api.listComplianceLinks(families[0].id)
      setLinks(c || [])
    }
  }

  /* ── Grouped categories for dropdown ─────────────────────────── */

  const sourceCategories = CATEGORY_META.filter(c => c.side === "source")
  const targetCategories = CATEGORY_META.filter(c => c.side === "target")

  /* ── Marquee count ───────────────────────────────────────────── */

  const marqueeCount = DASHBOARD_PLATFORM_ENTRIES.filter(p => p.marquee).length

  /* ── Expanded row content renderer ─────────────────────────── */

  const renderExpandedContent = (platform: DashboardPlatformEntry) => {
    const dbId = platform.dbPlatformId
    const link = dbId ? links.find(c => c.platform_id === dbId) : undefined
    const verified = dbId ? isVerified(dbId) : false

    return (
      <div className="space-y-4">
        {/* Description */}
        {platform.description && (
          <p className="text-sm text-muted-foreground">{platform.description}</p>
        )}

        {/* Capabilities tags */}
        <div>
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Capabilities</p>
          <div className="flex flex-wrap gap-1.5">
            {platform.capabilities.length > 0 ? (
              platform.capabilities.map(cap => (
                <span key={cap} className="px-2 py-0.5 bg-accent/10 text-brand-green rounded text-xs">
                  {cap.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">None listed</span>
            )}
          </div>
        </div>

        {/* Auth type (if present) */}
        {platform.authType && (
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Auth Type</p>
            <span className="text-sm text-muted-foreground">{platform.authType}</span>
          </div>
        )}

        {/* Compliance section -- tier-aware */}
        <div>
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Compliance</p>

          {(platform.tier === "live" || platform.tier === "partial") && dbId ? (
            /* Live/Partial with backend adapter: verify/revoke flow */
            verified ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-success font-medium">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Verified
                </span>
                {link && (
                  <button onClick={(e) => { e.stopPropagation(); revoke(link.id) }} className="text-xs text-destructive hover:underline">
                    Revoke
                  </button>
                )}
              </div>
            ) : verifyingTo === platform.id ? (
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {platform.authType === "api_key" && (
                  <input
                    type="text"
                    placeholder="API Key"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:border-foreground"
                  />
                )}
                <Button size="sm" onClick={() => verify(dbId)}>
                  Verify
                </Button>
                <Button size="sm" variant="outline" onClick={() => setVerifyingTo(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); setVerifyingTo(platform.id) }}
              >
                {platform.authType === "manual" ? "View Instructions" : "Verify Compliance"}
              </Button>
            )
          ) : platform.tier === "stub" ? (
            <p className="text-sm text-amber-600">Setup guide available — follow the platform-specific instructions to configure parental controls.</p>
          ) : (
            <p className="text-sm text-muted-foreground">On our roadmap — coming soon.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Platform Coverage Explorer"
        description={`Browse all ${PLATFORM_STATS.total} platforms across ${PLATFORM_STATS.categoryCount} categories`}
        className="mb-6"
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={PLATFORM_STATS.total} />
        <StatCard label="API Integrated" value={PLATFORM_STATS.liveCount} iconColor="text-emerald-600" />
        <StatCard label="Categories" value={PLATFORM_STATS.categoryCount} />
        <StatCard label="Featured" value={marqueeCount} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Side toggle (pill buttons) */}
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(["all", "source", "target"] as SideFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setSideFilter(s)}
              className={`px-3 py-2 text-sm font-medium transition ${
                sideFilter === s
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {s === "all" ? "All" : s === "source" ? "Source" : "Target"}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="plaid-input !w-auto text-sm min-w-[180px] cursor-pointer"
        >
          <option value="all">All Categories</option>
          <optgroup label="Sources">
            {sourceCategories.map(c => (
              <option key={c.slug} value={c.slug}>{c.shortLabel}</option>
            ))}
          </optgroup>
          <optgroup label="Targets">
            {targetCategories.map(c => (
              <option key={c.slug} value={c.slug}>{c.shortLabel}</option>
            ))}
          </optgroup>
        </select>

        {/* Tier dropdown */}
        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value)}
          className="plaid-input !w-auto text-sm min-w-[140px] cursor-pointer"
        >
          <option value="all">All Tiers</option>
          <option value="API">API</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Guide">Guide</option>
          <option value="Roadmap">Roadmap</option>
        </select>

        {/* Capabilities multi-select */}
        <div ref={capsRef} className="relative">
          <button
            onClick={() => setCapsOpen(!capsOpen)}
            className="plaid-input flex items-center gap-2 min-w-[180px] cursor-pointer"
          >
            <span className="text-sm text-muted-foreground">
              {selectedCaps.length === 0 ? "Capabilities" : `${selectedCaps.length} selected`}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
          </button>
          {capsOpen && (
            <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-sm shadow-lg z-20 min-w-[180px]">
              {CAP_GROUPS.map(g => (
                <button
                  key={g.key}
                  onClick={() => toggleCap(g.key)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-muted/50 transition"
                >
                  <span className={`w-4 h-4 rounded-sm border flex items-center justify-center text-xs ${
                    selectedCaps.includes(g.key) ? "bg-foreground border-foreground text-background" : "border-border"
                  }`}>
                    {selectedCaps.includes(g.key) && "\u2713"}
                  </span>
                  {g.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Featured toggle */}
        <button
          onClick={() => setFeaturedOnly(!featuredOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md border transition ${
            featuredOnly
              ? "bg-amber-500/10 border-amber-400 text-amber-600"
              : "bg-background border-border text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Star className={`w-4 h-4 ${featuredOnly ? "fill-amber-500" : ""}`} />
          Featured
        </button>
      </div>

      {/* Capability chips */}
      {selectedCaps.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCaps.map(cap => {
            const group = CAP_GROUPS.find(g => g.key === cap)
            return (
              <span key={cap} className="inline-flex items-center gap-1 bg-muted text-foreground text-xs px-2.5 py-1 rounded-full">
                {group?.label || cap}
                <button onClick={() => removeCap(cap)} className="hover:opacity-70 transition">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
          <button onClick={() => setSelectedCaps([])} className="text-xs text-muted-foreground hover:text-foreground transition">
            Clear all
          </button>
        </div>
      )}

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search platforms by name"
        className="mb-6"
      />

      {/* Table */}
      <DataTable>
        <DataTableHeader columns={columns} sort={sort} onSort={toggleSort} />
        <tbody>
          {filtered.length === 0 ? (
            <DataTableEmpty
              description="No platforms match your filters."
              colSpan={columns.length}
            />
          ) : (
            filtered.map(platform => {
              const isExpanded = expandedId === platform.id
              const verified = platform.dbPlatformId ? isVerified(platform.dbPlatformId) : false

              return (
                <DataTableRow
                  key={platform.id}
                  row={platform}
                  columns={columns.map((col, idx) =>
                    idx === 0
                      ? {
                          ...col,
                          cell: (_, row: DashboardPlatformEntry) => (
                            <div className="flex items-center gap-2">
                              {row.hex && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: `#${row.hex}` }}
                                />
                              )}
                              <span className={`font-medium text-sm ${row.tier === "planned" ? "text-muted-foreground" : "text-foreground"}`}>
                                {row.name}
                              </span>
                              {verified && <ShieldCheck className="w-4 h-4 text-success" />}
                            </div>
                          ),
                        }
                      : col
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : platform.id)}
                  isExpanded={isExpanded}
                  expandedContent={renderExpandedContent(platform)}
                />
              )
            })
          )}
        </tbody>
      </DataTable>

      {/* Footer */}
      <DataTableFooter showing={filtered.length} total={DASHBOARD_PLATFORM_ENTRIES.length} />
    </div>
  )
}
