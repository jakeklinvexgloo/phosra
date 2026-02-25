"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Trash2,
  Eye,
  Search,
  Zap,
  TrendingUp,
  Radio,
  CheckCheck,
  ChevronDown,
  ArrowUpRight,
  Layers,
  BarChart3,
} from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { NewsItem } from "@/lib/admin/types"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { SearchInput } from "@/components/ui/search-input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

// ── Tabs ─────────────────────────────────────────────────────────
type FeedTab = "priority" | "all" | "saved" | "unread"

const TABS: { key: FeedTab; label: string; icon: typeof Zap }[] = [
  { key: "priority", label: "Priority", icon: Zap },
  { key: "unread", label: "Unread", icon: Radio },
  { key: "all", label: "All", icon: Layers },
  { key: "saved", label: "Saved", icon: Bookmark },
]

// ── Source colors ────────────────────────────────────────────────
const SOURCE_COLORS: Record<string, string> = {
  "Common Sense Media": "bg-blue-500",
  "FTC Press Releases": "bg-indigo-500",
  "EFF Updates": "bg-violet-500",
  "UK ICO": "bg-sky-500",
  "Competitive Intel": "bg-amber-500",
  "Provider Monitor": "bg-emerald-500",
}

function sourceColor(source: string) {
  return SOURCE_COLORS[source] || "bg-zinc-400"
}

// ── Activity sparkline (last 14 days) ────────────────────────────
function ActivityBar({ items }: { items: NewsItem[] }) {
  const days = useMemo(() => {
    const counts: number[] = new Array(14).fill(0)
    const now = Date.now()
    for (const item of items) {
      const age = Math.floor((now - new Date(item.created_at).getTime()) / 86400000)
      if (age >= 0 && age < 14) counts[13 - age]++
    }
    const max = Math.max(...counts, 1)
    return counts.map((c) => ({ count: c, pct: (c / max) * 100 }))
  }, [items])

  return (
    <div className="flex items-end gap-[3px] h-8">
      {days.map((d, i) => (
        <div
          key={i}
          className="w-[6px] rounded-[1px] bg-foreground/15 relative group"
          style={{ height: "100%" }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 rounded-[1px] bg-foreground/70 transition-all duration-300"
            style={{ height: `${Math.max(d.pct, 4)}%` }}
          />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] tabular-nums text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {d.count}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Signal meter ────────────────────────────────────────────────
function SignalMeter({ score }: { score: number }) {
  const bars = 5
  const filled = Math.round((score / 100) * bars)
  return (
    <div className="flex items-end gap-[2px]" title={`${score}% relevance`}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-[0.5px] transition-colors ${
            i < filled
              ? score >= 75
                ? "bg-emerald-500"
                : score >= 50
                  ? "bg-amber-500"
                  : "bg-foreground/30"
              : "bg-foreground/10"
          }`}
          style={{ height: `${6 + i * 3}px` }}
        />
      ))}
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────
export default function NewsFeedPage() {
  const { getToken } = useApi()
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<FeedTab>("priority")
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [focusedIdx, setFocusedIdx] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // ── Fetch ───────────────────────────────────────────────────
  const fetchNews = useCallback(async () => {
    const token = (await getToken()) ?? undefined
    try {
      const data = await api.listNews(200, undefined, token)
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  // ── Actions ─────────────────────────────────────────────────
  const act = async (fn: (token?: string) => Promise<unknown>) => {
    const token = (await getToken()) ?? undefined
    await fn(token).catch(() => {})
  }

  const handleMarkRead = async (id: string) => {
    await act((t) => api.markNewsRead(id, t))
    setItems((p) => p.map((i) => (i.id === id ? { ...i, is_read: true } : i)))
  }

  const handleToggleSaved = async (id: string) => {
    await act((t) => api.toggleNewsSaved(id, t))
    setItems((p) => p.map((i) => (i.id === id ? { ...i, is_saved: !i.is_saved } : i)))
  }

  const handleDelete = async (id: string) => {
    await act((t) => api.deleteNewsItem(id, t))
    setItems((p) => p.filter((i) => i.id !== id))
  }

  const handleMarkAllRead = async () => {
    const unread = filtered.filter((i) => !i.is_read)
    const token = (await getToken()) ?? undefined
    for (const item of unread) {
      await api.markNewsRead(item.id, token).catch(() => {})
    }
    setItems((p) => {
      const ids = new Set(unread.map((i) => i.id))
      return p.map((i) => (ids.has(i.id) ? { ...i, is_read: true } : i))
    })
  }

  // ── Filtering ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let out = [...items]

    // Tab filter
    if (tab === "priority") out = out.filter((i) => (i.relevance_score ?? 0) >= 50 && !i.is_read)
    if (tab === "unread") out = out.filter((i) => !i.is_read)
    if (tab === "saved") out = out.filter((i) => i.is_saved)

    // Source filter
    if (sourceFilter) out = out.filter((i) => i.source === sourceFilter)

    // Tag filter
    if (tagFilter) out = out.filter((i) => i.tags?.includes(tagFilter))

    // Search
    if (search) {
      const q = search.toLowerCase()
      out = out.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.summary?.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q)
      )
    }

    return out
  }, [items, tab, search, sourceFilter, tagFilter])

  // ── Derived stats ───────────────────────────────────────────
  const sources = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of items) map.set(i.source, (map.get(i.source) || 0) + 1)
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
  }, [items])

  const allTags = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of items) {
      for (const t of i.tags || []) map.set(t, (map.get(t) || 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [items])

  const unreadCount = items.filter((i) => !i.is_read).length
  const priorityCount = items.filter((i) => (i.relevance_score ?? 0) >= 50 && !i.is_read).length

  // ── Keyboard navigation ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      const item = filtered[focusedIdx]
      switch (e.key) {
        case "j":
          e.preventDefault()
          setFocusedIdx((i) => Math.min(i + 1, filtered.length - 1))
          break
        case "k":
          e.preventDefault()
          setFocusedIdx((i) => Math.max(i - 1, 0))
          break
        case "o":
          if (item?.url) window.open(item.url, "_blank")
          break
        case "s":
          if (item) handleToggleSaved(item.id)
          break
        case "r":
          if (item && !item.is_read) handleMarkRead(item.id)
          break
        case "x":
          if (item) {
            setExpandedId((prev) => (prev === item.id ? null : item.id))
          }
          break
        case "Escape":
          setExpandedId(null)
          setSearch("")
          break
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, focusedIdx])

  // Scroll focused item into view
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.children[focusedIdx] as HTMLElement
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [focusedIdx])

  // Reset focus when filter changes
  useEffect(() => {
    setFocusedIdx(0)
  }, [tab, search, sourceFilter, tagFilter])

  // ── Helpers ─────────────────────────────────────────────────
  const timeAgo = (d?: string) => {
    if (!d) return ""
    const ms = Date.now() - new Date(d).getTime()
    const mins = Math.floor(ms / 60000)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const days = Math.floor(hrs / 24)
    return `${days}d`
  }

  // ── Render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            Intelligence Feed
            {unreadCount > 0 && (
              <span className="tabular-nums text-[11px] font-semibold px-2 py-0.5 rounded-full bg-foreground text-background">
                {unreadCount}
              </span>
            )}
          </span>
        }
        description={`${items.length} signals \u00b7 ${sources.length} sources \u00b7 ${allTags.length} topics`}
        actions={<ActivityBar items={items} />}
      />

      {/* ── Stat ticker ────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2.5">
        <StatCard label="Priority" value={priorityCount} icon={Zap} iconColor="text-amber-500" />
        <StatCard label="Unread" value={unreadCount} icon={Radio} iconColor="text-blue-500" />
        <StatCard label="Total" value={items.length} icon={BarChart3} iconColor="text-foreground/60" />
        <StatCard label="Sources" value={sources.length} icon={TrendingUp} iconColor="text-emerald-500" />
      </div>

      {/* ── Filter bar ─────────────────────────────────────── */}
      <div className="space-y-2.5">
        {/* Tabs + Search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/60 rounded-lg p-0.5">
            {TABS.map((t) => {
              const active = tab === t.key
              const count =
                t.key === "priority" ? priorityCount :
                t.key === "unread" ? unreadCount :
                t.key === "saved" ? items.filter((i) => i.is_saved).length :
                items.length
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon className="w-3 h-3" />
                  {t.label}
                  <span className={`tabular-nums text-[10px] ${active ? "text-foreground/60" : "text-muted-foreground/60"}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex-1" />

          <SearchInput compact value={search} onChange={setSearch} placeholder="Filter... (\u2318K)" className="w-48" />

          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Source + Tag chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Sources */}
          {sources.map(([name, count]) => (
            <button
              key={name}
              onClick={() => setSourceFilter(sourceFilter === name ? null : name)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                sourceFilter === name
                  ? "bg-foreground text-background"
                  : "bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sourceColor(name)}`} />
              {name}
              <span className="opacity-50 tabular-nums">{count}</span>
            </button>
          ))}
          {sourceFilter && (
            <button
              onClick={() => setSourceFilter(null)}
              className="text-[10px] text-muted-foreground hover:text-foreground px-1.5"
            >
              Clear
            </button>
          )}

          {sources.length > 0 && allTags.length > 0 && (
            <div className="w-px h-4 bg-border mx-0.5" />
          )}

          {/* Tags */}
          {allTags.slice(0, 8).map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                tagFilter === tag
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              #{tag}
              <span className="opacity-40 tabular-nums">{count}</span>
            </button>
          ))}
          {tagFilter && (
            <button
              onClick={() => setTagFilter(null)}
              className="text-[10px] text-muted-foreground hover:text-foreground px-1.5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Feed ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          description={items.length === 0
            ? "No signals yet. Run the News Monitor worker to start scanning."
            : "No items match your filters."}
        />
      ) : (
        <>
          {/* Keyboard hint */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">j</kbd>{" "}
              <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">k</kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">o</kbd>{" "}
              open
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">s</kbd>{" "}
              save
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">x</kbd>{" "}
              expand
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">r</kbd>{" "}
              read
            </span>
          </div>

          <div ref={listRef} className="space-y-[1px] rounded-lg overflow-hidden border border-border/50">
            {filtered.map((item, idx) => {
              const focused = idx === focusedIdx
              const expanded = expandedId === item.id
              const score = item.relevance_score ?? 0

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setFocusedIdx(idx)
                    setExpandedId((prev) => (prev === item.id ? null : item.id))
                  }}
                  className={`
                    group relative cursor-pointer transition-colors
                    ${focused ? "bg-card" : "bg-card/50 hover:bg-card"}
                    ${!item.is_read ? "" : "opacity-70 hover:opacity-100"}
                  `}
                >
                  {/* Focus indicator */}
                  {focused && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-foreground" />
                  )}

                  {/* Unread indicator */}
                  {!item.is_read && !focused && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500/70" />
                  )}

                  <div className="flex items-center gap-3 px-4 py-2.5">
                    {/* Signal meter */}
                    <div className="flex-shrink-0 w-5">
                      {score > 0 ? (
                        <SignalMeter score={score} />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/10 mx-auto" />
                      )}
                    </div>

                    {/* Source dot */}
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${sourceColor(item.source)}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <h3
                        className={`text-[13px] leading-tight truncate ${
                          item.is_read ? "font-normal" : "font-medium"
                        }`}
                      >
                        {item.title}
                      </h3>
                    </div>

                    {/* Tags (inline, compact) */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                        {item.tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="default" size="sm">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-2 flex-shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      <span className="hidden sm:inline truncate max-w-24 text-muted-foreground/70">{item.source}</span>
                      <span>{timeAgo(item.published_at || item.created_at)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      {item.is_saved ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleSaved(item.id) }}
                          className="p-1 rounded text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleSaved(item.id) }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!item.is_read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(item.id) }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                        className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Expand chevron */}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-muted-foreground/30 transition-transform flex-shrink-0 ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Expanded detail */}
                  {expanded && (
                    <div className="px-4 pb-3 pt-0 ml-10 border-t border-border/30 mt-0">
                      <div className="pt-2.5 space-y-2">
                        {item.summary && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="font-medium">{item.source}</span>
                          {item.published_at && (
                            <span>
                              {new Date(item.published_at).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          )}
                          {score > 0 && <span>Relevance: {score}%</span>}
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {item.tags.map((t) => (
                              <button
                                key={t}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setTagFilter(tagFilter === t ? null : t)
                                }}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground hover:underline"
                          >
                            Read full article
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="text-center text-[10px] text-muted-foreground/40 uppercase tracking-widest pt-2">
            {filtered.length} of {items.length} signals
          </div>
        </>
      )}
    </div>
  )
}
