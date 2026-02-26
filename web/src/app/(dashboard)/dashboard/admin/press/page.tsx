"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Megaphone, Plus, FileText, Send as SendIcon,
  Calendar, CheckCircle2, Lightbulb,
  PenLine, Eye, Sparkles, Target,
  ChevronDown
} from "lucide-react"
import { useApi } from "@/lib/useApi"
import type { PressRelease, PressStats, PressReleaseStatus, ReleaseType } from "@/lib/press/types"
import { STATUS_LABELS, RELEASE_TYPE_LABELS } from "@/lib/press/types"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { SearchInput } from "@/components/ui/search-input"
import { Badge } from "@/components/ui/badge"
import {
  DataTable,
  DataTableHeader,
  DataTableRow,
  DataTableEmpty,
  DataTableFooter,
  useDataTable,
  type ColumnDef,
} from "@/components/ui/data-table"

const STATUS_BADGE_VARIANT: Record<PressReleaseStatus, "default" | "info" | "warning" | "success" | "purple"> = {
  idea: "default",
  draft: "info",
  in_review: "warning",
  approved: "success",
  scheduled: "purple",
  distributed: "success",
  archived: "default",
}

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

function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

const columns: ColumnDef<PressRelease>[] = [
  {
    id: "status",
    accessor: "status",
    header: "Status",
    sortable: true,
    cell: (_, row) => (
      <Badge variant={STATUS_BADGE_VARIANT[row.status]} size="md">
        {STATUS_LABELS[row.status]}
      </Badge>
    ),
  },
  {
    id: "title",
    accessor: "title",
    header: "Title",
    sortable: true,
    cell: (_, row) => (
      <div className="flex items-center gap-2 min-w-0">
        {row.milestone_id && (
          <Badge variant="pink" size="sm">
            {row.milestone_id.toUpperCase()}
          </Badge>
        )}
        <span className="text-[13px] font-medium leading-tight truncate text-foreground">
          {row.title}
        </span>
      </div>
    ),
  },
  {
    id: "release_type",
    accessor: "release_type",
    header: "Type",
    sortable: true,
    hideBelow: "sm",
    cell: (_, row) => (
      <Badge variant="default" size="sm">
        {RELEASE_TYPE_LABELS[row.release_type] || row.release_type}
      </Badge>
    ),
  },
  {
    id: "publish_date",
    accessor: "publish_date",
    header: "Published",
    sortable: true,
    hideBelow: "sm",
    align: "right",
    sortFn: (a, b, dir) => {
      const aVal = a.publish_date
      const bVal = b.publish_date
      if (!aVal && !bVal) return 0
      if (!aVal) return 1
      if (!bVal) return -1
      const cmp = new Date(aVal).getTime() - new Date(bVal).getTime()
      return dir === "asc" ? cmp : -cmp
    },
    cell: (v) => (
      <span className="text-[11px] text-muted-foreground tabular-nums">
        {v ? new Date(v as string).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
      </span>
    ),
  },
  {
    id: "word_count",
    accessor: "word_count",
    header: "Words",
    sortable: true,
    hideBelow: "sm",
    align: "right",
    cell: (v) => (
      <span className="text-[10px] text-muted-foreground/60 tabular-nums">
        {(v as number) > 0 ? `${v}w` : "—"}
      </span>
    ),
  },
  {
    id: "updated_at",
    accessor: (r) => r.updated_at || r.created_at,
    header: "Updated",
    sortable: true,
    align: "right",
    sortFn: (a, b, dir) => {
      const aVal = a.updated_at || a.created_at
      const bVal = b.updated_at || b.created_at
      if (!aVal && !bVal) return 0
      if (!aVal) return 1
      if (!bVal) return -1
      const cmp = new Date(aVal).getTime() - new Date(bVal).getTime()
      return dir === "asc" ? cmp : -cmp
    },
    cell: (_, row) => (
      <span className="text-[11px] text-muted-foreground tabular-nums">
        {timeAgo(row.updated_at || row.created_at)}
      </span>
    ),
  },
]

export default function PressCenterPage() {
  const router = useRouter()
  const { getToken } = useApi()
  const [releases, setReleases] = useState<PressRelease[]>([])
  const [stats, setStats] = useState<PressStats>({ total: 0, drafts: 0, scheduled: 0, distributed: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<FilterTab>("all")
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newType, setNewType] = useState("product_launch")
  const [creating, setCreating] = useState(false)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [planError, setPlanError] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | ReleaseType>("all")

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
      if (res.ok) {
        await fetchReleases()
      } else {
        let msg = `Server error (${res.status})`
        try {
          const data = await res.json()
          msg = data.error || msg
        } catch {
          // response wasn't JSON (e.g. timeout HTML page)
        }
        setPlanError(msg)
      }
    } catch (err) {
      setPlanError(`Request failed: ${err instanceof Error ? err.message : "unknown error"}`)
    } finally {
      setGeneratingPlan(false)
    }
  }

  const preFiltered = useMemo(() => {
    let out = [...releases]
    if (tab !== "all") out = out.filter(r => r.status === tab)
    if (typeFilter !== "all") out = out.filter(r => r.release_type === typeFilter)
    return out
  }, [releases, tab, typeFilter])

  const { rows, sort, toggleSort, search, setSearch } = useDataTable({
    data: preFiltered,
    columns,
    initialSort: { key: "publish_date", direction: "asc" },
    searchKeys: ["title", "headline", "body"],
  })

  const tabCount = (key: FilterTab) => {
    if (key === "all") return releases.length
    return releases.filter(r => r.status === key).length
  }

  const milestoneLinkedCount = releases.filter(r => r.milestone_id).length

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
      <PageHeader
        title="Press Center"
        description={`${releases.length} releases \u00b7 manage, draft, and distribute`}
        actions={
          <>
            {milestoneLinkedCount === 0 && (
              <Button variant="accent" size="sm" loading={generatingPlan} onClick={handleGeneratePlan}>
                {!generatingPlan && <Sparkles className="w-3.5 h-3.5" />}
                {generatingPlan ? "Generating Plan..." : "Generate Press Plan"}
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => setShowNewForm(!showNewForm)}>
              <Plus className="w-3.5 h-3.5" />
              New Release
            </Button>
          </>
        }
      />

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
            <Button variant="primary" size="lg" onClick={handleCreate} disabled={!newTitle.trim()} loading={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => { setShowNewForm(false); setNewTitle(""); setNewType("product_launch") }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={`grid gap-2.5 ${milestoneLinkedCount > 0 ? "grid-cols-5" : "grid-cols-4"}`}>
        <StatCard label="Total" value={stats.total} icon={FileText} iconColor="text-foreground/60" />
        <StatCard label="Drafts" value={stats.drafts} icon={PenLine} iconColor="text-blue-500" />
        <StatCard label="Scheduled" value={stats.scheduled} icon={Calendar} iconColor="text-purple-500" />
        <StatCard label="Distributed" value={stats.distributed} icon={SendIcon} iconColor="text-emerald-500" />
        {milestoneLinkedCount > 0 && (
          <StatCard label="From Plan" value={milestoneLinkedCount} icon={Target} iconColor="text-pink-500" />
        )}
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
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as "all" | ReleaseType)}
            className="h-8 pl-2.5 pr-7 text-xs bg-card border border-border/50 rounded-lg appearance-none focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
          >
            <option value="all">All Types</option>
            {Object.entries(RELEASE_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <SearchInput compact value={search} onChange={setSearch} placeholder="Filter..." className="w-48" />
      </div>

      {/* Release table */}
      <DataTable>
        <DataTableHeader columns={columns} sort={sort} onSort={toggleSort} />
        <tbody>
          {rows.length === 0 ? (
            <DataTableEmpty
              icon={Megaphone}
              description={releases.length === 0 ? "No press releases yet." : "No releases match your filters."}
              colSpan={columns.length}
              action={releases.length === 0 ? (
                <Button variant="accent" size="sm" loading={generatingPlan} onClick={handleGeneratePlan}>
                  {!generatingPlan && <Sparkles className="w-3.5 h-3.5" />}
                  {generatingPlan ? "Generating..." : "Generate Press Plan from Fundraise Milestones"}
                </Button>
              ) : undefined}
            />
          ) : (
            rows.map(release => (
              <DataTableRow
                key={release.id}
                row={release}
                columns={columns}
                onClick={() => router.push(`/dashboard/admin/press/${release.id}`)}
              />
            ))
          )}
        </tbody>
      </DataTable>

      {rows.length > 0 && (
        <DataTableFooter showing={rows.length} total={releases.length}>
          {milestoneLinkedCount > 0 && (
            <Link
              href="/dashboard/admin/fundraise"
              className="text-[10px] text-pink-500 hover:text-pink-600 font-medium transition-colors"
            >
              View Fundraise Timeline
            </Link>
          )}
        </DataTableFooter>
      )}
    </div>
  )
}
