"use client"

import { useMemo, useState, useEffect } from "react"
import { Search, ChevronDown, X } from "lucide-react"
import { PLATFORM_PAGE_ENTRIES, type PlatformPageEntry } from "@/lib/platforms/adapters/to-platform-page"
import { CATEGORY_META, PLATFORM_STATS } from "@/lib/platforms"
import { PlatformIcon } from "@/components/marketing/ecosystem/PlatformIcon"
import type { PlatformCategorySlug } from "@/lib/platforms/types"

/* ── Types ──────────────────────────────────────────────────────── */

type TabKey = "featured" | PlatformCategorySlug

interface TabItem {
  key: TabKey
  label: string
  count: number
}

/* ── CategoryCard (inline) ──────────────────────────────────────── */

function CategoryCard({
  label,
  accentClass,
  accentHex,
  platforms,
  forceOpen = false,
}: {
  label: string
  accentClass: string
  accentHex: string
  platforms: PlatformPageEntry[]
  forceOpen?: boolean
}) {
  const [userToggled, setUserToggled] = useState<boolean | null>(null)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Reset user toggle when tab/search changes
  useEffect(() => {
    setUserToggled(null)
  }, [forceOpen])

  const defaultOpen = isDesktop
  const open = forceOpen || (userToggled !== null ? userToggled : defaultOpen)

  const accentBorder =
    accentClass.split(" ").find((c) => c.startsWith("border-")) ?? "border-emerald-400"
  const accentText = accentClass.split(" ")[0] ?? "text-emerald-600"
  const accentBg =
    accentClass.split(" ").find((c) => c.startsWith("bg-")) ?? "bg-emerald-50"

  return (
    <div
      className={`bg-white border border-border rounded-sm shadow-plaid-card overflow-hidden border-l-[3px] ${accentBorder}`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setUserToggled((prev) => !(prev !== null ? prev : defaultOpen))}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-foreground">{label}</h4>
          <span
            className={`text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-sm ${accentText} ${accentBg}`}
          >
            {platforms.length} platforms
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 sm:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Collapsible content */}
      <div
        className="grid transition-all duration-300 ease-in-out sm:!grid-rows-[1fr]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-0.5 p-2">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="group flex flex-col items-center gap-1 py-2 px-1 rounded hover:bg-muted/60 transition-colors"
              >
                <div className="relative">
                  {/* Grayscale (default) */}
                  <div className="group-hover:hidden">
                    <PlatformIcon
                      platform={{
                        name: platform.name,
                        iconKey: platform.iconKey,
                        hex: platform.hex,
                      }}
                      size={24}
                      grayscale
                      fallbackHex={accentHex}
                    />
                  </div>
                  {/* Color (hover) */}
                  <div className="hidden group-hover:block">
                    <PlatformIcon
                      platform={{
                        name: platform.name,
                        iconKey: platform.iconKey,
                        hex: platform.hex,
                      }}
                      size={24}
                      grayscale={false}
                      fallbackHex={accentHex}
                    />
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground group-hover:text-foreground text-center leading-tight transition-colors line-clamp-1">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────────── */

export default function PlatformsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("featured")
  const [search, setSearch] = useState("")

  const isSearchActive = search.trim().length > 0

  /* Derived: featured (marquee) platforms */
  const featuredPlatforms = useMemo(
    () => PLATFORM_PAGE_ENTRIES.filter((p) => p.marquee),
    [],
  )

  /* Derived: all platforms grouped by category */
  const byCategory = useMemo(() => {
    const map: Record<string, PlatformPageEntry[]> = {}
    for (const p of PLATFORM_PAGE_ENTRIES) {
      ;(map[p.category] ??= []).push(p)
    }
    return map
  }, [])

  /* Derived: tab bar items */
  const tabs: TabItem[] = useMemo(
    () => [
      { key: "featured" as TabKey, label: "Featured", count: featuredPlatforms.length },
      ...CATEGORY_META.map((c) => ({
        key: c.slug as TabKey,
        label: c.shortLabel,
        count: byCategory[c.slug]?.length ?? 0,
      })),
    ],
    [featuredPlatforms, byCategory],
  )

  /* Derived: search-filtered platforms grouped by category */
  const searchResults = useMemo(() => {
    if (!isSearchActive) return null
    const q = search.toLowerCase()
    const filtered = PLATFORM_PAGE_ENTRIES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q),
    )
    const groups: Record<string, PlatformPageEntry[]> = {}
    for (const p of filtered) {
      ;(groups[p.category] ??= []).push(p)
    }
    return { groups, total: filtered.length }
  }, [search, isSearchActive])

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
          Platform Coverage
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mb-4">
          Explore the {PLATFORM_STATS.marketingTotal} platforms Phosra supports across{" "}
          {PLATFORM_STATS.categoryCount} categories — streaming, social media, gaming,
          DNS filtering, devices, and more.
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
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search platforms by name or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="plaid-input pl-10 w-full"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab bar */}
      {!isSearchActive && (
        <div className="flex gap-2 overflow-x-auto pb-4 px-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full flex-shrink-0 transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      {isSearchActive ? (
        /* ── Search results: grouped by category ── */
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {searchResults?.total ?? 0} platform{(searchResults?.total ?? 0) !== 1 ? "s" : ""} found
          </p>
          {searchResults && Object.keys(searchResults.groups).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORY_META.filter((c) => searchResults.groups[c.slug]).map((c) => (
                <CategoryCard
                  key={c.slug}
                  label={c.label}
                  accentClass={c.accentClass}
                  accentHex={c.accentHex}
                  platforms={searchResults.groups[c.slug]}
                  forceOpen
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground">
                No platforms match &quot;{search}&quot;
              </p>
            </div>
          )}
        </div>
      ) : activeTab === "featured" ? (
        /* ── Featured: flat logo grid ── */
        <div className="plaid-card !p-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1">
            {featuredPlatforms.map((platform) => {
              const meta = CATEGORY_META.find((c) => c.slug === platform.category)
              return (
                <div
                  key={platform.id}
                  className="group flex flex-col items-center gap-1.5 py-3 px-1 rounded hover:bg-muted/60 transition-colors"
                >
                  <div className="relative">
                    <div className="group-hover:hidden">
                      <PlatformIcon
                        platform={{
                          name: platform.name,
                          iconKey: platform.iconKey,
                          hex: platform.hex,
                        }}
                        size={28}
                        grayscale
                        fallbackHex={meta?.accentHex ?? "94A3B8"}
                      />
                    </div>
                    <div className="hidden group-hover:block">
                      <PlatformIcon
                        platform={{
                          name: platform.name,
                          iconKey: platform.iconKey,
                          hex: platform.hex,
                        }}
                        size={28}
                        grayscale={false}
                        fallbackHex={meta?.accentHex ?? "94A3B8"}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground group-hover:text-foreground text-center leading-tight transition-colors line-clamp-1">
                    {platform.name}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Showing {featuredPlatforms.length} featured platforms of{" "}
              {PLATFORM_STATS.total} total.{" "}
              <button
                onClick={() => setActiveTab(CATEGORY_META[4].slug as TabKey)}
                className="text-brand-green hover:underline"
              >
                Browse all categories
              </button>
            </p>
          </div>
        </div>
      ) : (
        /* ── Single category view ── */
        (() => {
          const meta = CATEGORY_META.find((c) => c.slug === activeTab)
          const platforms = byCategory[activeTab] ?? []
          if (!meta) return null

          return (
            <CategoryCard
              label={meta.label}
              accentClass={meta.accentClass}
              accentHex={meta.accentHex}
              platforms={platforms}
              forceOpen
            />
          )
        })()
      )}

      {/* Footer count */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        {PLATFORM_STATS.total} platforms across {PLATFORM_STATS.categoryCount} categories
      </div>
    </div>
  )
}
