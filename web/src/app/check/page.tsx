"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, ChevronDown, ChevronRight, Shield } from "lucide-react"
import { LAW_REGISTRY } from "@/lib/compliance/index"
import { STATUS_META } from "@/lib/compliance/types"
import type { LawEntry, Jurisdiction, LawStatus } from "@/lib/compliance/types"

// ── Rule category metadata ────────────────────────────────────────

interface CategoryMeta {
  label: string
  domain: string
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  // Content
  content_rating: { label: "Content Rating", domain: "Content" },
  content_block_title: { label: "Content Block by Title", domain: "Content" },
  content_allow_title: { label: "Content Allow by Title", domain: "Content" },
  content_allowlist_mode: { label: "Content Allowlist Mode", domain: "Content" },
  content_descriptor_block: { label: "Content Descriptor Block", domain: "Content" },
  // Time
  time_daily_limit: { label: "Daily Time Limit", domain: "Time" },
  time_scheduled_hours: { label: "Scheduled Hours", domain: "Time" },
  time_per_app_limit: { label: "Per-App Time Limit", domain: "Time" },
  time_downtime: { label: "Downtime", domain: "Time" },
  // Purchase
  purchase_approval: { label: "Purchase Approval", domain: "Purchase" },
  purchase_spending_cap: { label: "Spending Cap", domain: "Purchase" },
  purchase_block_iap: { label: "Block In-App Purchases", domain: "Purchase" },
  // Social
  social_contacts: { label: "Contact Restrictions", domain: "Social" },
  social_chat_control: { label: "Chat Control", domain: "Social" },
  social_multiplayer: { label: "Multiplayer Restrictions", domain: "Social" },
  // Web
  web_safesearch: { label: "SafeSearch", domain: "Web" },
  web_category_block: { label: "Category Blocking", domain: "Web" },
  web_custom_allowlist: { label: "Custom Allowlist", domain: "Web" },
  web_custom_blocklist: { label: "Custom Blocklist", domain: "Web" },
  web_filter_level: { label: "Filter Level", domain: "Web" },
  // Privacy
  privacy_location: { label: "Location Privacy", domain: "Privacy" },
  privacy_profile_visibility: { label: "Profile Visibility", domain: "Privacy" },
  privacy_data_sharing: { label: "Data Sharing", domain: "Privacy" },
  privacy_account_creation: { label: "Account Creation", domain: "Privacy" },
  // Monitoring
  monitoring_activity: { label: "Activity Monitoring", domain: "Monitoring" },
  monitoring_alerts: { label: "Alerts", domain: "Monitoring" },
  // Algorithmic Safety
  algo_feed_control: { label: "Algorithmic Feed Control", domain: "Algorithmic Safety" },
  addictive_design_control: { label: "Addictive Design Control", domain: "Algorithmic Safety" },
  // Notifications
  notification_curfew: { label: "Notification Curfew", domain: "Notifications" },
  usage_timer_notification: { label: "Usage Timer Notification", domain: "Notifications" },
  // Advertising & Data
  targeted_ad_block: { label: "Targeted Ad Block", domain: "Advertising & Data" },
  dm_restriction: { label: "DM Restriction", domain: "Advertising & Data" },
  age_gate: { label: "Age Gate", domain: "Advertising & Data" },
  data_deletion_request: { label: "Data Deletion Request", domain: "Advertising & Data" },
  geolocation_opt_in: { label: "Geolocation Opt-In", domain: "Advertising & Data" },
  // Compliance Expansion
  csam_reporting: { label: "CSAM Reporting", domain: "Compliance" },
  library_filter_compliance: { label: "Library Filter Compliance", domain: "Compliance" },
  ai_minor_interaction: { label: "AI Minor Interaction", domain: "Compliance" },
  social_media_min_age: { label: "Social Media Minimum Age", domain: "Compliance" },
  image_rights_minor: { label: "Image Rights (Minor)", domain: "Compliance" },
  // Legislation-Driven
  parental_consent_gate: { label: "Parental Consent Gate", domain: "Parental Controls" },
  parental_event_notification: { label: "Parental Event Notification", domain: "Parental Controls" },
  screen_time_report: { label: "Screen Time Report", domain: "Parental Controls" },
  commercial_data_ban: { label: "Commercial Data Ban", domain: "Advertising & Data" },
  algorithmic_audit: { label: "Algorithmic Audit", domain: "Algorithmic Safety" },
}

// ── Domain ordering ───────────────────────────────────────────────

const DOMAIN_ORDER = [
  "Content",
  "Time",
  "Purchase",
  "Social",
  "Web",
  "Privacy",
  "Monitoring",
  "Algorithmic Safety",
  "Notifications",
  "Advertising & Data",
  "Compliance",
  "Parental Controls",
]

// ── Platform types ────────────────────────────────────────────────

const PLATFORM_TYPES = [
  "All",
  "Social Media",
  "Video Streaming",
  "Gaming",
  "Messaging",
  "E-Commerce",
  "Education",
  "Browser/Search",
  "DNS/Network",
  "Device/OS",
] as const

// Map platform type to keywords that match law platform fields
const PLATFORM_KEYWORDS: Record<string, string[]> = {
  "Social Media": ["Instagram", "TikTok", "Snapchat", "Facebook", "X", "Telegram", "Discord"],
  "Video Streaming": ["YouTube", "Netflix", "Twitch", "Spotify"],
  "Gaming": ["Roblox", "Nexon", "NCSoft"],
  "Messaging": ["Discord", "Snapchat", "Telegram"],
  "E-Commerce": [],
  "Education": ["Schools", "Libraries"],
  "Browser/Search": ["Google", "NTT Docomo", "SoftBank", "KDDI"],
  "DNS/Network": ["NTT Docomo", "SoftBank", "KDDI"],
  "Device/OS": ["Android", "iOS"],
}

// ── Jurisdiction options ──────────────────────────────────────────

interface JurisdictionOption {
  id: Jurisdiction
  label: string
}

const JURISDICTION_OPTIONS: JurisdictionOption[] = [
  { id: "us-federal", label: "US Federal" },
  { id: "us-state", label: "US State" },
  { id: "eu", label: "European Union" },
  { id: "uk", label: "United Kingdom" },
  { id: "asia-pacific", label: "Asia-Pacific" },
  { id: "americas", label: "Americas" },
  { id: "middle-east-africa", label: "Middle East & Africa" },
]

// ── Status badge component ────────────────────────────────────────

function StatusBadge({ status }: { status: LawStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.bgColor} ${meta.textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
      {meta.label}
    </span>
  )
}

// ── Main page component ───────────────────────────────────────────

export default function ComplianceCheckerPage() {
  const [platformType, setPlatformType] = useState<string>("All")
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<Set<Jurisdiction>>(
    new Set(JURISDICTION_OPTIONS.map((j) => j.id))
  )
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(DOMAIN_ORDER))
  const [showAllLaws, setShowAllLaws] = useState(false)

  // Toggle a jurisdiction
  const toggleJurisdiction = (id: Jurisdiction) => {
    setSelectedJurisdictions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Toggle all jurisdictions
  const toggleAll = () => {
    if (selectedJurisdictions.size === JURISDICTION_OPTIONS.length) {
      setSelectedJurisdictions(new Set())
    } else {
      setSelectedJurisdictions(new Set(JURISDICTION_OPTIONS.map((j) => j.id)))
    }
  }

  // Toggle domain accordion
  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev)
      if (next.has(domain)) {
        next.delete(domain)
      } else {
        next.add(domain)
      }
      return next
    })
  }

  // ── Filtering logic ─────────────────────────────────────────────

  const matchingLaws = useMemo(() => {
    return LAW_REGISTRY.filter((law) => {
      // Filter by jurisdiction
      if (!selectedJurisdictions.has(law.jurisdictionGroup)) return false

      // Filter by platform type
      if (platformType !== "All") {
        const keywords = PLATFORM_KEYWORDS[platformType] || []
        const lawPlatforms = law.platforms
        // If the law says "all", it applies to everything
        if (lawPlatforms.includes("all")) return true
        // If no keywords defined for this type, include the law (be inclusive)
        if (keywords.length === 0) return true
        // Check if any law platform matches our keywords
        const matches = lawPlatforms.some((p) => keywords.includes(p))
        if (!matches) return false
      }

      return true
    })
  }, [selectedJurisdictions, platformType])

  // Aggregate rule categories from matching laws
  const categoryAggregation = useMemo(() => {
    const agg: Record<string, { count: number; laws: LawEntry[] }> = {}
    for (const law of matchingLaws) {
      for (const cat of law.ruleCategories) {
        if (!agg[cat]) {
          agg[cat] = { count: 0, laws: [] }
        }
        agg[cat].count++
        agg[cat].laws.push(law)
      }
    }
    return agg
  }, [matchingLaws])

  // Group categories by domain, sorted by count within each domain
  const groupedCategories = useMemo(() => {
    const groups: Record<string, { id: string; meta: CategoryMeta; count: number; laws: LawEntry[] }[]> = {}

    for (const [catId, data] of Object.entries(categoryAggregation)) {
      const meta = CATEGORY_META[catId]
      if (!meta) continue
      if (!groups[meta.domain]) {
        groups[meta.domain] = []
      }
      groups[meta.domain].push({
        id: catId,
        meta,
        count: data.count,
        laws: data.laws,
      })
    }

    // Sort categories within each domain by count descending
    for (const domain of Object.keys(groups)) {
      groups[domain].sort((a, b) => b.count - a.count)
    }

    return groups
  }, [categoryAggregation])

  // Unique platforms affected
  const uniquePlatforms = useMemo(() => {
    const set = new Set<string>()
    for (const law of matchingLaws) {
      for (const p of law.platforms) {
        if (p !== "all") set.add(p)
      }
    }
    return set.size
  }, [matchingLaws])

  const totalCategories = Object.keys(categoryAggregation).length
  const displayLaws = showAllLaws ? matchingLaws : matchingLaws.slice(0, 12)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Compliance Checker
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight">
              PCSS Compliance Checker
            </h1>
            <p className="text-base sm:text-lg text-white/60 mt-6 leading-relaxed max-w-2xl mx-auto">
              Select your platform type and the jurisdictions you operate in to instantly see which of the 45 PCSS rule categories apply, and which laws mandate them.
            </p>
          </div>
        </div>
      </section>

      {/* Controls + Results */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

          {/* ── Left: Inputs ──────────────────────────────────── */}
          <div className="space-y-6">
            {/* Platform Type */}
            <div className="plaid-card border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">Platform Type</h3>
              <div className="relative">
                <select
                  value={platformType}
                  onChange={(e) => setPlatformType(e.target.value)}
                  className="w-full appearance-none bg-background border border-border rounded-md px-3 py-2.5 text-sm text-foreground pr-8 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                >
                  {PLATFORM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type === "All" ? "All Platform Types" : type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Jurisdictions */}
            <div className="plaid-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Jurisdictions</h3>
                <button
                  onClick={toggleAll}
                  className="text-xs text-brand-green hover:text-brand-green/80 transition-colors"
                >
                  {selectedJurisdictions.size === JURISDICTION_OPTIONS.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="space-y-2">
                {JURISDICTION_OPTIONS.map((j) => (
                  <label key={j.id} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => toggleJurisdiction(j.id)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      selectedJurisdictions.has(j.id)
                        ? "bg-brand-green border-brand-green"
                        : "border-border group-hover:border-muted-foreground"
                    }`}>
                      {selectedJurisdictions.has(j.id) && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-foreground">{j.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="plaid-card border border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Applicable laws</span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">{matchingLaws.length}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Required categories</span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">{totalCategories}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Platforms affected</span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">{uniquePlatforms}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Results ─────────────────────────────────── */}
          <div className="space-y-8">
            {selectedJurisdictions.size === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select jurisdictions to begin
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Choose at least one jurisdiction from the left panel to see which PCSS rule categories apply to your platform.
                </p>
              </div>
            ) : (
              <>
                {/* Required Rule Categories */}
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Required Rule Categories</h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    {totalCategories} of 45 categories required across {matchingLaws.length} applicable laws
                  </p>

                  <div className="space-y-3">
                    {DOMAIN_ORDER.map((domain) => {
                      const cats = groupedCategories[domain]
                      if (!cats || cats.length === 0) return null
                      const isExpanded = expandedDomains.has(domain)

                      return (
                        <div key={domain} className="plaid-card border border-border !p-0 overflow-hidden">
                          <button
                            onClick={() => toggleDomain(domain)}
                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-foreground">{domain}</span>
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {cats.length} {cats.length === 1 ? "category" : "categories"}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="border-t border-border">
                              {cats.map((cat, i) => (
                                <div
                                  key={cat.id}
                                  className={`px-5 py-3.5 ${i < cats.length - 1 ? "border-b border-border/50" : ""}`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                                        <span className="text-sm font-medium text-foreground">
                                          {cat.meta.label}
                                        </span>
                                      </div>
                                      <div className="ml-5.5 flex items-center gap-1">
                                        <code className="text-[11px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                          {cat.id}
                                        </code>
                                      </div>
                                      <div className="mt-2 ml-5.5 flex flex-wrap gap-1.5">
                                        {cat.laws.slice(0, 8).map((law) => (
                                          <Link
                                            key={law.id}
                                            href={`/compliance/${law.id}`}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-foreground/5 text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
                                          >
                                            {law.shortName}
                                          </Link>
                                        ))}
                                        {cat.laws.length > 8 && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] text-muted-foreground">
                                            +{cat.laws.length - 8} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                                        {cat.count} {cat.count === 1 ? "law" : "laws"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Applicable Laws */}
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Applicable Laws</h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    {matchingLaws.length} laws match your selection
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayLaws.map((law) => (
                      <Link
                        key={law.id}
                        href={`/compliance/${law.id}`}
                        className="plaid-card border border-border !p-4 hover:border-brand-green/30 transition-colors group block"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors">
                            {law.shortName}
                          </h4>
                          <StatusBadge status={law.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {law.fullName}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            {law.jurisdiction}
                          </span>
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {law.ruleCategories.length} {law.ruleCategories.length === 1 ? "rule" : "rules"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {matchingLaws.length > 12 && !showAllLaws && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAllLaws(true)}
                        className="inline-flex items-center gap-2 text-sm text-brand-green hover:text-brand-green/80 transition-colors"
                      >
                        Show all {matchingLaws.length} laws
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {matchingLaws.length > 12 && showAllLaws && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAllLaws(false)}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Show fewer
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-4">
            Ready to automate compliance?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Phosra&apos;s PCSS engine enforces all {totalCategories > 0 ? totalCategories : 45} rule categories across 50+ platforms with a single API call.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-brand-green text-foreground px-6 py-3 rounded-full font-medium hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)] transition"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
