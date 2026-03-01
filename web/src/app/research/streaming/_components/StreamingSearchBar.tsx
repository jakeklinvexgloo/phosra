"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Fuse from "fuse.js"
import {
  Search,
  Monitor,
  AlertTriangle,
  Layers,
  User,
} from "lucide-react"
import { gradeTextColor, gradeBgColor, gradeBorderColor } from "@/lib/shared/grade-colors"
import type { StreamingPlatformSummary } from "@/lib/streaming-research/streaming-data-types"
import { STREAMING_TEST_CATEGORIES } from "@/lib/streaming-research/streaming-data-types"

// ── Types ───────────────────────────────────────────────────────────

type SearchResultType = "platform" | "category" | "critical" | "profile"

interface SearchResultItem {
  type: SearchResultType
  title: string
  description: string
  url: string
  tags: string[]
  grade?: string
}

interface StreamingSearchBarProps {
  platforms: StreamingPlatformSummary[]
}

// ── Constants ───────────────────────────────────────────────────────

const TYPE_ICONS: Record<SearchResultType, typeof Monitor> = {
  platform: Monitor,
  category: Layers,
  critical: AlertTriangle,
  profile: User,
}

const TYPE_LABELS: Record<SearchResultType, string> = {
  platform: "Platforms",
  category: "Test Categories",
  critical: "Critical Failures",
  profile: "Profile Types",
}

const FUSE_OPTIONS = {
  keys: [
    { name: "title", weight: 2 },
    { name: "description", weight: 1 },
    { name: "tags", weight: 1.5 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
}

const LISTBOX_ID = "streaming-search-results-listbox"

// ── Grade Badge ─────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border ${gradeBgColor(grade)} ${gradeTextColor(grade)} ${gradeBorderColor(grade)}`}
    >
      {grade}
    </span>
  )
}

// ── Index builder ───────────────────────────────────────────────────

const PROFILE_LABELS: Record<string, { label: string; desc: string }> = {
  TestChild7: { label: "Child (7)", desc: "Youngest test profile — strictest parental controls expected" },
  TestChild12: { label: "Child (12)", desc: "Pre-teen profile — should restrict mature content" },
  TestTeen16: { label: "Teen (16)", desc: "Teenage profile — age-appropriate filtering expected" },
}

function buildSearchItems(platforms: StreamingPlatformSummary[]): SearchResultItem[] {
  const items: SearchResultItem[] = []

  // Platforms
  for (const p of platforms) {
    items.push({
      type: "platform",
      title: p.platformName,
      description: `Overall grade: ${p.overallGrade} — ${p.criticalFailureCount} critical failure${p.criticalFailureCount !== 1 ? "s" : ""}`,
      url: `/research/streaming/${p.platformId}`,
      tags: [p.overallGrade, p.platformId, p.platformName.toLowerCase()],
      grade: p.overallGrade,
    })
  }

  // Test categories
  for (const cat of STREAMING_TEST_CATEGORIES) {
    const slug = cat.id.replace(/-\d+$/, "").toLowerCase()
    items.push({
      type: "category",
      title: cat.category,
      description: cat.description,
      url: `/research/streaming/categories/${slug}`,
      tags: [cat.shortLabel, slug, ...cat.category.toLowerCase().split(/[\s/&]+/)],
    })
  }

  // Critical failures (per-platform)
  for (const p of platforms) {
    if (p.criticalFailureCount > 0) {
      items.push({
        type: "critical",
        title: `${p.platformName} — ${p.criticalFailureCount} Critical Failure${p.criticalFailureCount !== 1 ? "s" : ""}`,
        description: `Grade-capping failures found on ${p.platformName}`,
        url: `/research/streaming/${p.platformId}`,
        tags: ["critical", "failure", p.platformId, p.platformName.toLowerCase()],
        grade: p.overallGrade,
      })
    }
  }

  // Profile types
  for (const [profileId, meta] of Object.entries(PROFILE_LABELS)) {
    // Collect grades for this profile across platforms
    const profileGrades = platforms
      .map((p) => {
        const pg = p.profileGrades.find((g) => g.profileId === profileId)
        return pg ? `${p.platformName}: ${pg.grade}` : null
      })
      .filter(Boolean)

    items.push({
      type: "profile",
      title: meta.label,
      description: `${meta.desc}. ${profileGrades.join(", ")}`,
      url: "/research/streaming",
      tags: [profileId.toLowerCase(), meta.label.toLowerCase(), "profile", "child", "teen"],
    })
  }

  return items
}

// ── Search Bar Component ────────────────────────────────────────────

export function StreamingSearchBar({ platforms }: StreamingSearchBarProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)

  const searchItems = useMemo(() => buildSearchItems(platforms), [platforms])
  const fuse = useMemo(() => new Fuse(searchItems, FUSE_OPTIONS), [searchItems])

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  // Search results
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    return fuse.search(debouncedQuery, { limit: 8 }).map((r) => r.item)
  }, [fuse, debouncedQuery])

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: { type: SearchResultType; items: SearchResultItem[] }[] = []
    const typeOrder: SearchResultType[] = ["platform", "category", "critical", "profile"]
    for (const type of typeOrder) {
      const typeItems = results.filter((r) => r.type === type)
      if (typeItems.length > 0) groups.push({ type, items: typeItems })
    }
    return groups
  }, [results])

  // Flat list for keyboard nav
  const flatResults = useMemo(() => groupedResults.flatMap((g) => g.items), [groupedResults])

  const hasQuery = debouncedQuery.trim().length >= 3
  const showDropdown = isOpen && (flatResults.length > 0 || hasQuery)

  // Reset active index on results change
  useEffect(() => { setActiveIndex(-1) }, [flatResults])

  // Open dropdown when results arrive
  useEffect(() => {
    if (flatResults.length > 0 && document.activeElement === inputRef.current) {
      setIsOpen(true)
    }
  }, [flatResults])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cmd+K shortcut to focus
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [])

  const navigateTo = useCallback(
    (url: string) => {
      router.push(url)
      setIsOpen(false)
      setQuery("")
      setDebouncedQuery("")
      inputRef.current?.blur()
    },
    [router],
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          if (!isOpen && flatResults.length > 0) {
            setIsOpen(true)
            setActiveIndex(0)
          } else if (isOpen) {
            setActiveIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0))
          }
          break
        case "ArrowUp":
          e.preventDefault()
          if (isOpen) {
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1))
          }
          break
        case "Enter":
          if (isOpen && activeIndex >= 0 && activeIndex < flatResults.length) {
            e.preventDefault()
            navigateTo(flatResults[activeIndex].url)
          }
          break
        case "Escape":
          if (isOpen) {
            e.preventDefault()
            setIsOpen(false)
            inputRef.current?.blur()
          }
          break
        case "Tab":
          setIsOpen(false)
          break
      }
    },
    [isOpen, flatResults, activeIndex, navigateTo],
  )

  const activeOptionId = activeIndex >= 0 ? `streaming-search-option-${activeIndex}` : undefined

  let flatIndex = -1

  return (
    <div ref={containerRef} className="relative max-w-xl mx-auto">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={LISTBOX_ID}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!e.target.value.trim()) setIsOpen(false)
          }}
          onFocus={() => {
            if (flatResults.length > 0) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-20 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/30 motion-safe:transition-colors"
          placeholder="Search platforms, categories, findings..."
        />
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id={LISTBOX_ID}
          role="listbox"
          className="absolute top-full mt-2 w-full rounded-xl border border-border bg-card shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
        >
          {flatResults.length === 0 ? (
            <div className="px-4 py-6 text-sm text-center text-muted-foreground">
              No results for &ldquo;{debouncedQuery.trim()}&rdquo;
            </div>
          ) : (
            groupedResults.map((group) => (
              <div key={group.type} role="group" aria-label={TYPE_LABELS[group.type]}>
                <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border/50">
                  {TYPE_LABELS[group.type]}
                </div>
                {group.items.map((item) => {
                  flatIndex++
                  const idx = flatIndex
                  const Icon = TYPE_ICONS[item.type]
                  const isActive = idx === activeIndex
                  return (
                    <div
                      key={`${item.type}-${item.url}-${idx}`}
                      id={`streaming-search-option-${idx}`}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => navigateTo(item.url)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-start gap-3 px-4 py-3 motion-safe:transition-colors cursor-pointer ${
                        isActive ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{item.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                      </div>
                      {item.grade && <GradeBadge grade={item.grade} />}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
