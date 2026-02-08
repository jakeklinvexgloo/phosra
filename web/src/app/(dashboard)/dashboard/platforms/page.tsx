"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { Search, ChevronDown, ChevronUp, X, ShieldCheck } from "lucide-react"
import { api } from "@/lib/api"
import type { Platform, Family, ComplianceLink } from "@/lib/types"

const CAP_GROUPS: { key: string; label: string; caps: string[] }[] = [
  { key: "content", label: "Content", caps: ["content_rating"] },
  { key: "time", label: "Time", caps: ["time_limit", "scheduled_hours"] },
  { key: "web", label: "Web", caps: ["web_filtering", "safe_search", "custom_blocklist", "custom_allowlist"] },
  { key: "social", label: "Social", caps: ["social_control", "app_control"] },
  { key: "purchase", label: "Purchase", caps: ["purchase_control"] },
]

const categoryLabels: Record<string, string> = {
  dns: "DNS Filtering",
  streaming: "Streaming",
  gaming: "Gaming",
  device: "Device",
  browser: "Browser Extension",
}

const tierConfig: Record<string, { bg: string; text: string; label: string }> = {
  compliant: { bg: "bg-success/10", text: "text-success", label: "Compliant" },
  provisional: { bg: "bg-warning/10", text: "text-warning", label: "Provisional" },
  pending: { bg: "bg-muted", text: "text-muted-foreground", label: "Pending" },
}

function hasCapGroup(platform: Platform, groupKey: string): boolean {
  const group = CAP_GROUPS.find(g => g.key === groupKey)
  if (!group) return false
  return group.caps.some(c => platform.capabilities?.includes(c))
}

type SortField = "name" | "category" | "tier" | "content" | "time" | "web" | "social" | "purchase"

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [links, setLinks] = useState<ComplianceLink[]>([])
  const [search, setSearch] = useState("")
  const [selectedCaps, setSelectedCaps] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [tierFilter, setTierFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [capsOpen, setCapsOpen] = useState(false)
  const [verifyingTo, setVerifyingTo] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const capsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.listPlatforms().then(p => setPlatforms(p || []))
    api.listFamilies().then(f => {
      setFamilies(f || [])
      if (f && f.length > 0) {
        api.listComplianceLinks(f[0].id).then(c => setLinks(c || []))
      }
    })
  }, [])

  // Close caps dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (capsRef.current && !capsRef.current.contains(e.target as Node)) setCapsOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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

  const filtered = useMemo(() => {
    let result = [...platforms]

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q))
    }

    // Category
    if (categoryFilter !== "all") {
      result = result.filter(p => p.category === categoryFilter)
    }

    // Tier
    if (tierFilter !== "all") {
      result = result.filter(p => p.tier === tierFilter)
    }

    // Capability groups — platform must have ALL selected groups
    if (selectedCaps.length > 0) {
      result = result.filter(p => selectedCaps.every(cap => hasCapGroup(p, cap)))
    }

    // Sort
    result.sort((a, b) => {
      let av: string | boolean, bv: string | boolean
      if (sortField === "name" || sortField === "category" || sortField === "tier") {
        av = a[sortField]
        bv = b[sortField]
      } else {
        av = hasCapGroup(a, sortField)
        bv = hasCapGroup(b, sortField)
      }

      if (typeof av === "boolean") {
        // true (has cap) sorts before false
        if (av === bv) return 0
        const cmp = av ? -1 : 1
        return sortDir === "asc" ? cmp : -cmp
      }

      const cmp = (av as string).localeCompare(bv as string)
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [platforms, search, categoryFilter, tierFilter, selectedCaps, sortField, sortDir])

  const isVerified = (platformId: string) => links.some(c => c.platform_id === platformId && c.status === "verified")

  const verify = async (platformId: string) => {
    if (!families.length) return
    await api.verifyCompliance(families[0].id, platformId, apiKey)
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

  const categories = Array.from(new Set(platforms.map(p => p.category)))

  return (
    <div>
      {/* Header */}
      <h2 className="text-h2 text-foreground mb-2">Platform Coverage Explorer</h2>
      <p className="text-muted-foreground mb-8">Search for capability coverage by platform</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Capabilities multi-select */}
        <div ref={capsRef} className="relative">
          <button
            onClick={() => setCapsOpen(!capsOpen)}
            className="plaid-input flex items-center gap-2 min-w-[180px] cursor-pointer"
          >
            <span className="text-sm text-muted-foreground">
              {selectedCaps.length === 0 ? "Select Capabilities" : `${selectedCaps.length} selected`}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
          </button>
          {capsOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-sm shadow-lg z-20 min-w-[180px]">
              {CAP_GROUPS.map(g => (
                <button
                  key={g.key}
                  onClick={() => toggleCap(g.key)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-muted/50 transition"
                >
                  <span className={`w-4 h-4 rounded-sm border flex items-center justify-center text-xs ${
                    selectedCaps.includes(g.key) ? "bg-foreground border-foreground text-white" : "border-border"
                  }`}>
                    {selectedCaps.includes(g.key) && "✓"}
                  </span>
                  {g.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="plaid-input !w-auto text-sm min-w-[160px] cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{categoryLabels[c] || c}</option>
          ))}
        </select>

        {/* Tier */}
        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value)}
          className="plaid-input !w-auto text-sm min-w-[140px] cursor-pointer"
        >
          <option value="all">All Tiers</option>
          <option value="compliant">Compliant</option>
          <option value="provisional">Provisional</option>
          <option value="pending">Pending</option>
        </select>
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
      <div className="plaid-card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <SortHeader field="name" className="min-w-[160px]">Platform</SortHeader>
              <SortHeader field="category">Category</SortHeader>
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
              const tier = tierConfig[platform.tier] || tierConfig.pending
              const link = links.find(c => c.platform_id === platform.id)
              const verified = isVerified(platform.id)

              return (
                <Fragment key={platform.id}>
                  <tr
                    className={`border-b border-border cursor-pointer transition ${
                      isExpanded ? "bg-muted/30" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : platform.id)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{platform.name}</span>
                        {verified && <ShieldCheck className="w-4 h-4 text-success" />}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{categoryLabels[platform.category] || platform.category}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tier.bg} ${tier.text}`}>
                        {tier.label}
                      </span>
                    </td>
                    {CAP_GROUPS.map(g => (
                      <td key={g.key} className="px-4 py-4 text-center">
                        {hasCapGroup(platform, g.key) ? (
                          <span className="text-success font-medium">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {isExpanded && (
                    <tr className="border-b border-border">
                      <td colSpan={8} className="bg-muted/20 px-6 py-5">
                        <div className="space-y-4">
                          {/* Description */}
                          <p className="text-sm text-muted-foreground">{platform.description}</p>

                          {/* Capabilities */}
                          <div>
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Capabilities</p>
                            <div className="flex flex-wrap gap-1.5">
                              {platform.capabilities?.map(cap => (
                                <span key={cap} className="px-2 py-0.5 bg-accent/10 text-brand-green rounded text-xs">
                                  {cap.replace(/_/g, " ")}
                                </span>
                              ))}
                              {(!platform.capabilities || platform.capabilities.length === 0) && (
                                <span className="text-xs text-muted-foreground">None listed</span>
                              )}
                            </div>
                          </div>

                          {/* Auth & Compliance */}
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Auth Type</p>
                              <span className="text-sm text-muted-foreground">{platform.auth_type}</span>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Compliance</p>
                              {verified ? (
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
                                  {platform.auth_type === "api_key" && (
                                    <input
                                      type="text"
                                      placeholder="API Key"
                                      value={apiKey}
                                      onChange={e => setApiKey(e.target.value)}
                                      className="rounded border border-input bg-white px-2 py-1 text-sm text-foreground focus:outline-none focus:border-foreground"
                                    />
                                  )}
                                  <button onClick={() => verify(platform.id)} className="bg-foreground text-white px-3 py-1 rounded-full text-xs font-medium hover:opacity-90 transition">
                                    Verify
                                  </button>
                                  <button onClick={() => setVerifyingTo(null)} className="px-3 py-1 rounded-full border border-foreground text-foreground text-xs hover:bg-muted transition">
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setVerifyingTo(platform.id) }}
                                  className="bg-foreground text-white px-3 py-1 rounded-full text-xs font-medium hover:opacity-90 transition"
                                >
                                  {platform.auth_type === "manual" ? "View Instructions" : "Verify Compliance"}
                                </button>
                              )}
                            </div>
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
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No platforms match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border text-sm text-muted-foreground">
          Showing {filtered.length} of {platforms.length} platforms
        </div>
      </div>
    </div>
  )
}
