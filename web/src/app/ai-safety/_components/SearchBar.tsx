"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Fuse from "fuse.js"
import {
  Search,
  Shield,
  BookOpen,
  AlertTriangle,
  MessageSquare,
  Zap,
  Lock,
} from "lucide-react"

// ── Types ───────────────────────────────────────────────────────────

type SearchResultType = "platform" | "dimension" | "category" | "prompt" | "finding" | "control"

interface SearchResultItem {
  type: SearchResultType
  title: string
  description: string
  url: string
  tags: string[]
  grade?: string
  score?: number
  category?: string
}

interface SearchBarProps {
  items: SearchResultItem[]
}

// ── Constants ───────────────────────────────────────────────────────

const TYPE_ICONS: Record<SearchResultType, typeof Shield> = {
  platform: Shield,
  dimension: BookOpen,
  category: AlertTriangle,
  prompt: MessageSquare,
  finding: Zap,
  control: Lock,
}

const TYPE_LABELS: Record<SearchResultType, string> = {
  platform: "Platforms",
  dimension: "Research Dimensions",
  category: "Harm Categories",
  prompt: "Test Prompts",
  finding: "Key Findings",
  control: "Phosra Controls",
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

// ── Grade Badge ─────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const color = grade.startsWith("A")
    ? "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30"
    : grade.startsWith("B")
      ? "text-blue-500 bg-blue-100 dark:bg-blue-900/30"
      : grade.startsWith("C")
        ? "text-amber-500 bg-amber-100 dark:bg-amber-900/30"
        : "text-red-500 bg-red-100 dark:bg-red-900/30"
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {grade}
    </span>
  )
}

// ── Search Bar Component ────────────────────────────────────────────

export function SearchBar({ items }: SearchBarProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showResults, setShowResults] = useState(false)

  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items])

  // Debounce the query by 200ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 200)
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
    const typeOrder: SearchResultType[] = ["platform", "dimension", "category", "prompt", "finding", "control"]

    for (const type of typeOrder) {
      const typeItems = results.filter((r) => r.type === type)
      if (typeItems.length > 0) {
        groups.push({ type, items: typeItems })
      }
    }
    return groups
  }, [results])

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    return groupedResults.flatMap((g) => g.items)
  }, [groupedResults])

  // Show/hide dropdown
  useEffect(() => {
    setShowResults(flatResults.length > 0)
    setActiveIndex(-1)
  }, [flatResults])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showResults) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setActiveIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (activeIndex >= 0 && activeIndex < flatResults.length) {
            router.push(flatResults[activeIndex].url)
            setShowResults(false)
            setQuery("")
          }
          break
        case "Escape":
          setShowResults(false)
          inputRef.current?.blur()
          break
      }
    },
    [showResults, flatResults, activeIndex, router]
  )

  // Track which flat index we're at for highlighting
  let flatIndex = -1

  return (
    <div ref={containerRef} className="relative max-w-xl mx-auto">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (flatResults.length > 0) setShowResults(true)
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/30 transition-colors"
          placeholder="Search platforms, categories, findings..."
        />
      </div>

      {/* Dropdown */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full rounded-xl border border-border bg-card shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {groupedResults.map((group) => (
            <div key={group.type}>
              {/* Group header */}
              <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border/50">
                {TYPE_LABELS[group.type]}
              </div>
              {/* Group items */}
              {group.items.map((item) => {
                flatIndex++
                const idx = flatIndex
                const Icon = TYPE_ICONS[item.type]
                const isActive = idx === activeIndex
                return (
                  <Link
                    key={`${item.type}-${item.url}`}
                    href={item.url}
                    onClick={() => {
                      setShowResults(false)
                      setQuery("")
                    }}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                      isActive ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                    </div>
                    {item.grade && <GradeBadge grade={item.grade} />}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
