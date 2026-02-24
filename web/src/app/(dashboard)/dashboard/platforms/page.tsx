"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { Search, ChevronDown, ChevronUp, X, ShieldCheck, Star } from "lucide-react"
import { api } from "@/lib/api"
import type { Family, ComplianceLink } from "@/lib/types"
import { DASHBOARD_PLATFORM_ENTRIES, type DashboardPlatformEntry } from "@/lib/platforms/adapters/to-dashboard-table"
import { PLATFORM_STATS } from "@/lib/platforms/stats"
import { CATEGORY_META } from "@/lib/platforms/registry"

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

/* ── Tier badge config ─────────────────────────────────────────── */

const TIER_BADGE: Record<string, { bg: string; text: string }> = {
  API: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  Hybrid: { bg: "bg-blue-500/10", text: "text-blue-600" },
  Guide: { bg: "bg-amber-500/10", text: "text-amber-600" },
  Roadmap: { bg: "bg-muted", text: "text-muted-foreground" },
}

/* ── Types ─────────────────────────────────────────────────────── */

type SortField = "name" | "category" | "side" | "tier" | "content" | "time" | "web" | "social" | "purchase"
type SideFilter = "all" | "source" | "target"

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
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
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

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  /* ── Tier sort order mapping for sort ────────────────────────── */

  const TIER_SORT_ORDER: Record<string, number> = { API: 0, Hybrid: 1, Guide: 2, Roadmap: 3 }

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

    result.sort((a, b) => {
      let av: string | boolean | number, bv: string | boolean | number
      if (sortField === "name" || sortField === "category" || sortField === "side") {
        av = sortField === "name" ? a.name : sortField === "category" ? a.categoryLabel : a.side
        bv = sortField === "name" ? b.name : sortField === "category" ? b.categoryLabel : b.side
      } else if (sortField === "tier") {
        av = TIER_SORT_ORDER[a.tierLabel] ?? 9
        bv = TIER_SORT_ORDER[b.tierLabel] ?? 9
      } else {
        av = hasCapGroup(a, sortField)
        bv = hasCapGroup(b, sortField)
      }

      if (typeof av === "boolean") {
        if (av === bv) return 0
        const cmp = av ? -1 : 1
        return sortDir === "asc" ? cmp : -cmp
      }

      if (typeof av === "number") {
        const cmp = (av as number) - (bv as number)
        return sortDir === "asc" ? cmp : -cmp
      }

      const cmp = (av as string).localeCompare(bv as string)
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [search, sideFilter, categoryFilter, tierFilter, selectedCaps, featuredOnly, sortField, sortDir])

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

  /* ── Sort header component ───────────────────────────────────── */

  const SortHeader = ({ field, children, className = "" }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition ${className}`}
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-30" />
        )}
      </span>
    </th>
  )

  return (
    <div>
      {/* Header */}
      <h2 className="text-h2 text-foreground mb-2">Platform Coverage Explorer</h2>
      <p className="text-muted-foreground mb-6">Browse all {PLATFORM_STATS.total} platforms across {PLATFORM_STATS.categoryCount} categories</p>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="plaid-card !py-4 !px-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-foreground">{PLATFORM_STATS.total}</p>
        </div>
        <div className="plaid-card !py-4 !px-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">API Integrated</p>
          <p className="text-2xl font-bold text-emerald-600">{PLATFORM_STATS.liveCount}</p>
        </div>
        <div className="plaid-card !py-4 !px-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Categories</p>
          <p className="text-2xl font-bold text-foreground">{PLATFORM_STATS.categoryCount}</p>
        </div>
        <div className="plaid-card !py-4 !px-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Featured</p>
          <p className="text-2xl font-bold text-foreground">{marqueeCount}</p>
        </div>
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
                    {selectedCaps.includes(g.key) && "✓"}
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
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search platforms by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="plaid-input pl-10 w-full"
        />
      </div>

      {/* Table */}
      <div className="plaid-card !p-0 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <SortHeader field="name" className="min-w-[180px]">Platform</SortHeader>
              <SortHeader field="category">Category</SortHeader>
              <SortHeader field="side">Side</SortHeader>
              <SortHeader field="tier">Tier</SortHeader>
              <SortHeader field="content">Content</SortHeader>
              <SortHeader field="time">Time</SortHeader>
              <SortHeader field="web">Web</SortHeader>
              <SortHeader field="social">Social</SortHeader>
              <SortHeader field="purchase">Purchase</SortHeader>
            </tr>
          </thead>
          <tbody>
            {filtered.map(platform => {
              const isExpanded = expandedId === platform.id
              const badge = TIER_BADGE[platform.tierLabel] || TIER_BADGE.Roadmap
              const isPlanned = platform.tier === "planned"
              const dbId = platform.dbPlatformId
              const link = dbId ? links.find(c => c.platform_id === dbId) : undefined
              const verified = dbId ? isVerified(dbId) : false

              return (
                <Fragment key={platform.id}>
                  <tr
                    className={`border-b border-border cursor-pointer transition ${
                      isExpanded ? "bg-muted/30" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : platform.id)}
                  >
                    {/* Platform name + brand dot */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {platform.hex && (
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: `#${platform.hex}` }}
                          />
                        )}
                        <span className={`font-medium text-sm ${isPlanned ? "text-muted-foreground" : "text-foreground"}`}>
                          {platform.name}
                        </span>
                        {verified && <ShieldCheck className="w-4 h-4 text-success" />}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: `#${platform.accentHex}` }}
                        />
                        {platform.categoryLabel}
                      </span>
                    </td>

                    {/* Side */}
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        platform.side === "source"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-purple-500/10 text-purple-600"
                      }`}>
                        {platform.side === "source" ? "Source" : "Target"}
                      </span>
                    </td>

                    {/* Tier */}
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {platform.tierLabel}
                      </span>
                    </td>

                    {/* Capability columns */}
                    {CAP_GROUPS.map(g => (
                      <td key={g.key} className="px-4 py-4 text-center">
                        {hasCapGroup(platform, g.key) ? (
                          <span className={`font-medium ${isPlanned ? "text-muted-foreground" : "text-success"}`}>✓</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Expanded row */}
                  {isExpanded && (
                    <tr className="border-b border-border">
                      <td colSpan={9} className="bg-muted/20 px-6 py-5">
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

                          {/* Compliance section — tier-aware */}
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
                                  <button onClick={() => verify(dbId)} className="bg-foreground text-background px-3 py-1 rounded-full text-xs font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition">
                                    Verify
                                  </button>
                                  <button onClick={() => setVerifyingTo(null)} className="px-3 py-1 rounded-full border border-foreground text-foreground text-xs hover:bg-muted transition">
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setVerifyingTo(platform.id) }}
                                  className="bg-foreground text-background px-3 py-1 rounded-full text-xs font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
                                >
                                  {platform.authType === "manual" ? "View Instructions" : "Verify Compliance"}
                                </button>
                              )
                            ) : platform.tier === "stub" ? (
                              <p className="text-sm text-amber-600">Setup guide available — follow the platform-specific instructions to configure parental controls.</p>
                            ) : (
                              <p className="text-sm text-muted-foreground">On our roadmap — coming soon.</p>
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
                <td colSpan={9} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No platforms match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border text-sm text-muted-foreground">
          Showing {filtered.length} of {DASHBOARD_PLATFORM_ENTRIES.length} platforms
        </div>
      </div>
    </div>
  )
}
