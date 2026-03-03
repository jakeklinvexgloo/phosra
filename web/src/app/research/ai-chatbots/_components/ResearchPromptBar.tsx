"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
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
import { gradeTextColor, gradeBgColor, gradeBorderColor } from "@/lib/shared/grade-colors"

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

interface ResearchPromptBarProps {
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

const LISTBOX_ID = "research-search-listbox"

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

// ── Component ───────────────────────────────────────────────────────

export function ResearchPromptBar({ items }: ResearchPromptBarProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)

  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items])

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
    const typeOrder: SearchResultType[] = ["platform", "dimension", "category", "prompt", "finding", "control"]
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

  const activeOptionId = activeIndex >= 0 ? `research-search-option-${activeIndex}` : undefined

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
                      id={`research-search-option-${idx}`}
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
