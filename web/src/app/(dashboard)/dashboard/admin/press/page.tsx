"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Megaphone, Plus, Search, FileText, Send as SendIcon,
  Calendar, CheckCircle2, Lightbulb, Clock,
  PenLine, Eye, Sparkles, Target, Loader2
} from "lucide-react"
import { useApi } from "@/lib/useApi"
import type { PressRelease, PressStats, PressReleaseStatus } from "@/lib/press/types"
import { STATUS_LABELS, STATUS_COLORS, RELEASE_TYPE_LABELS } from "@/lib/press/types"

type FilterTab = "all" | PressReleaseStatus

const TABS: { key: FilterTab; label: string; icon: typeof FileText }[] = [
  { key: "all", label: "All", icon: FileText },
  { key: "idea", label: "Ideas", icon: Lightbulb },
  { key: "draft", label: "Drafts", icon: PenLine },
  { key: "in_review", label: "In Review", icon: Eye },
  { key: "approved", label: "Approved", icon: CheckCircle2 },
  { key: "scheduled", label: "Scheduled", icon: Calendar },
  { key: "distributed", label: "Distributed", icon: SendIcon },
]

export default function PressCenterPage() {
  const router = useRouter()
  const { getToken } = useApi()
  const [releases, setReleases] = useState<PressRelease[]>([])
  const [stats, setStats] = useState<PressStats>({ total: 0, drafts: 0, scheduled: 0, distributed: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newType, setNewType] = useState("product_launch")
  const [creating, setCreating] = useState(false)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [planError, setPlanError] = useState("")

  const getHeaders = useCallback(async (json = false) => {
    const headers: Record<string, string> = {}
    if (json) headers["Content-Type"] = "application/json"
    const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" && typeof window !== "undefined"
      ? localStorage.getItem("sandbox-session") : null
    if (sandbox) {
      headers["X-Sandbox-Session"] = sandbox
    } else {
      const token = await getToken()
      if (token) headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }, [getToken])

  const fetchReleases = useCallback(async () => {
    try {
      const headers = await getHeaders()
      const res = await fetch("/api/press", { headers })
      if (res.ok) {
        const data = await res.json()
        setReleases(data.releases || [])
        setStats(data.stats || { total: 0, drafts: 0, scheduled: 0, distributed: 0 })
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [getHeaders])

  useEffect(() => { fetchReleases() }, [fetchReleases])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const headers = await getHeaders(true)
      const res = await fetch("/api/press", {
        method: "POST",
        headers,
        body: JSON.stringify({ title: newTitle, release_type: newType }),
      })
      if (res.ok) {
        const release = await res.json()
        router.push(`/dashboard/admin/press/${release.id}`)
      }
    } catch {} finally {
      setCreating(false)
    }
  }

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true)
    setPlanError("")
    try {
      const headers = await getHeaders(true)
      const res = await fetch("/api/press/generate-plan", {
        method: "POST",
        headers,
      })
      const data = await res.json()
      if (res.ok) {
        await fetchReleases()
      } else {
        setPlanError(data.error || "Failed to generate plan")
      }
    } catch {
      setPlanError("Network error — please try again")
    } finally {
      setGeneratingPlan(false)
    }
  }

  const filtered = useMemo(() => {
    let out = [...releases]
    if (tab !== "all") out = out.filter(r => r.status === tab)
    if (search) {
      const q = search.toLowerCase()
      out = out.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.headline.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q)
      )
    }
    return out
  }, [releases, tab, search])

  const tabCount = (key: FilterTab) => {
    if (key === "all") return releases.length
    return releases.filter(r => r.status === key).length
  }

  const milestoneLinkedCount = releases.filter(r => r.milestone_id).length

  const timeAgo = (d: string) => {
    const ms = Date.now() - new Date(d).getTime()
    const mins = Math.floor(ms / 60000)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const days = Math.floor(hrs / 24)
    return `${days}d`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
        </div>
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Press Center</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">
            {releases.length} releases &middot; manage, draft, and distribute
          </p>
        </div>
        <div className="flex items-center gap-2">
          {milestoneLinkedCount === 0 && (
            <button
              onClick={handleGeneratePlan}
              disabled={generatingPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {generatingPlan ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {generatingPlan ? "Generating Plan..." : "Generate Press Plan"}
            </button>
          )}
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Release
          </button>
        </div>
      </div>

      {/* Plan generation error */}
      {planError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-xs text-red-600 dark:text-red-400">
          {planError}
        </div>
      )}

      {/* New release inline form */}
      {showNewForm && (
        <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Press release title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              autoFocus
              className="flex-1 h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
            />
            <select
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className="h-9 px-2 text-xs bg-background border border-border/50 rounded-lg focus:outline-none"
            >
              {Object.entries(RELEASE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || creating}
              className="h-9 px-4 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => { setShowNewForm(false); setNewTitle(""); setNewType("product_launch") }}
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={`grid gap-2.5 ${milestoneLinkedCount > 0 ? "grid-cols-5" : "grid-cols-4"}`}>
        {[
          { label: "Total", value: stats.total, icon: FileText, color: "text-foreground/60" },
          { label: "Drafts", value: stats.drafts, icon: PenLine, color: "text-blue-500" },
          { label: "Scheduled", value: stats.scheduled, icon: Calendar, color: "text-purple-500" },
          { label: "Distributed", value: stats.distributed, icon: SendIcon, color: "text-emerald-500" },
          ...(milestoneLinkedCount > 0 ? [{ label: "From Plan", value: milestoneLinkedCount, icon: Target, color: "text-pink-500" }] : []),
        ].map(s => (
          <div key={s.label} className="bg-card rounded-lg px-3.5 py-2.5 border border-border/50 hover:border-border transition-colors">
            <div className="flex items-center gap-2">
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{s.label}</span>
            </div>
            <div className="text-xl font-semibold tabular-nums mt-0.5 text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-muted/60 rounded-lg p-0.5">
          {TABS.map(t => {
            const active = tab === t.key
            const count = tabCount(t.key)
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Filter..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 w-48 pl-8 pr-3 text-xs bg-card border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 placeholder:text-muted-foreground/50 transition-all"
          />
        </div>
      </div>

      {/* Release list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <Megaphone className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {releases.length === 0 ? "No press releases yet." : "No releases match your filters."}
          </p>
          {releases.length === 0 && (
            <button
              onClick={handleGeneratePlan}
              disabled={generatingPlan}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {generatingPlan ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {generatingPlan ? "Generating..." : "Generate Press Plan from Fundraise Milestones"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-[1px] rounded-lg overflow-hidden border border-border/50">
          {filtered.map(release => (
            <div
              key={release.id}
              onClick={() => router.push(`/dashboard/admin/press/${release.id}`)}
              className="group relative cursor-pointer bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Status badge */}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[release.status]}`}>
                  {STATUS_LABELS[release.status]}
                </span>

                {/* Milestone badge */}
                {release.milestone_id && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                    {release.milestone_id.toUpperCase()}
                  </span>
                )}

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-medium leading-tight truncate text-foreground">
                    {release.title}
                  </h3>
                </div>

                {/* Release type */}
                <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground font-medium">
                  {RELEASE_TYPE_LABELS[release.release_type] || release.release_type}
                </span>

                {/* Publish date */}
                <span className="hidden sm:inline text-[11px] text-muted-foreground tabular-nums min-w-16 text-right">
                  {release.publish_date
                    ? new Date(release.publish_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "\u2014"}
                </span>

                {/* Word count */}
                <span className="hidden sm:inline text-[10px] text-muted-foreground/60 tabular-nums min-w-12 text-right">
                  {release.word_count > 0 ? `${release.word_count}w` : "\u2014"}
                </span>

                {/* Time ago */}
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {timeAgo(release.updated_at || release.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">
          {filtered.length} of {releases.length} releases
        </div>
        {milestoneLinkedCount > 0 && (
          <Link
            href="/dashboard/admin/fundraise"
            className="text-[10px] text-pink-500 hover:text-pink-600 font-medium transition-colors"
          >
            View Fundraise Timeline
          </Link>
        )}
      </div>
    </div>
  )
}
