"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users, Plus, Star, Send as SendIcon,
  Newspaper, ChevronDown,
} from "lucide-react"
import { useApi } from "@/lib/useApi"
import type {
  Journalist,
  JournalistStats,
  JournalistRelationshipStatus,
  JournalistBeat,
  JournalistTier,
} from "@/lib/journalists/types"
import {
  RELATIONSHIP_STATUS_LABELS,
  BEAT_LABELS,
} from "@/lib/journalists/types"
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

// ─── Badge variant mappings ──────────────────────────────────────────────────

const STATUS_BADGE_VARIANT: Record<JournalistRelationshipStatus, "default" | "info" | "warning" | "purple" | "success" | "pink"> = {
  identified: "default",
  researching: "info",
  pitched: "warning",
  in_dialogue: "purple",
  warm_contact: "success",
  champion: "pink",
  inactive: "default",
}

const TIER_BADGE_VARIANT: Record<JournalistTier, "purple" | "info" | "default"> = {
  1: "purple",
  2: "info",
  3: "default",
}

const TIER_LABEL: Record<JournalistTier, string> = {
  1: "T1",
  2: "T2",
  3: "T3",
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

type PageTab = "directory" | "pipeline" | "coverage"

const PAGE_TABS: { key: PageTab; label: string }[] = [
  { key: "directory", label: "Directory" },
  { key: "pipeline", label: "Pitch Pipeline" },
  { key: "coverage", label: "Coverage" },
]

type StatusFilter = "all" | JournalistRelationshipStatus

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "identified", label: "Identified" },
  { key: "researching", label: "Researching" },
  { key: "pitched", label: "Pitched" },
  { key: "in_dialogue", label: "In Dialogue" },
  { key: "warm_contact", label: "Warm" },
  { key: "champion", label: "Champion" },
]

const PIPELINE_STATUSES: JournalistRelationshipStatus[] = [
  "pitched", "in_dialogue", "warm_contact", "champion",
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns: ColumnDef<Journalist>[] = [
  {
    id: "tier",
    accessor: "tier",
    header: "Tier",
    sortable: true,
    cell: (_, row) => (
      <Badge variant={TIER_BADGE_VARIANT[row.tier]} size="md">
        {TIER_LABEL[row.tier]}
      </Badge>
    ),
  },
  {
    id: "name",
    accessor: "name",
    header: "Name",
    sortable: true,
    cell: (_, row) => (
      <div className="min-w-0">
        <span className="text-[13px] font-medium leading-tight text-foreground">
          {row.name}
        </span>
        {row.publication && (
          <span className="text-[11px] text-muted-foreground ml-1.5">
            {row.publication}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "beat",
    accessor: "beat",
    header: "Beat",
    sortable: true,
    hideBelow: "sm",
    cell: (_, row) =>
      row.beat ? (
        <Badge variant="outline" size="sm">
          {BEAT_LABELS[row.beat] || row.beat}
        </Badge>
      ) : (
        <span className="text-[11px] text-muted-foreground/50">—</span>
      ),
  },
  {
    id: "relationship_status",
    accessor: "relationship_status",
    header: "Status",
    sortable: true,
    cell: (_, row) => (
      <Badge variant={STATUS_BADGE_VARIANT[row.relationship_status]} size="md">
        {RELATIONSHIP_STATUS_LABELS[row.relationship_status]}
      </Badge>
    ),
  },
  {
    id: "last_contact_at",
    accessor: (r) => r.last_contact_at,
    header: "Last Contact",
    sortable: true,
    hideBelow: "sm",
    align: "right",
    sortFn: (a, b, dir) => {
      const aVal = a.last_contact_at
      const bVal = b.last_contact_at
      if (!aVal && !bVal) return 0
      if (!aVal) return 1
      if (!bVal) return -1
      const cmp = new Date(aVal).getTime() - new Date(bVal).getTime()
      return dir === "asc" ? cmp : -cmp
    },
    cell: (_, row) => (
      <span className="text-[11px] text-muted-foreground tabular-nums">
        {row.last_contact_at ? timeAgo(row.last_contact_at) : "—"}
      </span>
    ),
  },
  {
    id: "relevance_score",
    accessor: "relevance_score",
    header: "Score",
    sortable: true,
    hideBelow: "sm",
    align: "right",
    cell: (v) => (
      <span className="text-[11px] text-muted-foreground tabular-nums">
        {v != null ? String(v) : "—"}
      </span>
    ),
  },
]

// ─── Page Component ──────────────────────────────────────────────────────────

export default function JournalistsPage() {
  const router = useRouter()
  const { getToken } = useApi()
  const [journalists, setJournalists] = useState<Journalist[]>([])
  const [stats, setStats] = useState<JournalistStats>({
    total: 0,
    by_tier: { tier1: 0, tier2: 0, tier3: 0 },
    by_status: {
      identified: 0, researching: 0, pitched: 0,
      in_dialogue: 0, warm_contact: 0, champion: 0, inactive: 0,
    },
    pitched: 0,
    responded: 0,
    covered: 0,
  })
  const [loading, setLoading] = useState(true)
  const [pageTab, setPageTab] = useState<PageTab>("directory")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [tierFilter, setTierFilter] = useState<"all" | JournalistTier>("all")
  const [beatFilter, setBeatFilter] = useState<"all" | JournalistBeat>("all")
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newPublication, setNewPublication] = useState("")
  const [newTier, setNewTier] = useState<JournalistTier>(2)
  const [creating, setCreating] = useState(false)

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

  const fetchData = useCallback(async () => {
    try {
      const headers = await getHeaders()
      const res = await fetch("/api/journalists", { headers })
      if (res.ok) {
        const data = await res.json()
        setJournalists(data.journalists || [])
        setStats(data.stats || stats)
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [getHeaders])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const headers = await getHeaders(true)
      const res = await fetch("/api/journalists", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: newName, publication: newPublication, tier: newTier }),
      })
      if (res.ok) {
        const journalist = await res.json()
        router.push(`/dashboard/admin/journalists/${journalist.id}`)
      }
    } catch {} finally {
      setCreating(false)
    }
  }

  // ── Directory pre-filter ──────────────────────────────────────────────────

  const directoryFiltered = useMemo(() => {
    let out = [...journalists]
    if (statusFilter !== "all") out = out.filter(j => j.relationship_status === statusFilter)
    if (tierFilter !== "all") out = out.filter(j => j.tier === tierFilter)
    if (beatFilter !== "all") out = out.filter(j => j.beat === beatFilter)
    return out
  }, [journalists, statusFilter, tierFilter, beatFilter])

  const directoryTable = useDataTable({
    data: directoryFiltered,
    columns,
    initialSort: { key: "name", direction: "asc" },
    searchKeys: ["name", "publication", "email", "notes"],
  })

  // ── Pipeline pre-filter ───────────────────────────────────────────────────

  const pipelineFiltered = useMemo(() => {
    return journalists.filter(j => PIPELINE_STATUSES.includes(j.relationship_status))
  }, [journalists])

  const pipelineTable = useDataTable({
    data: pipelineFiltered,
    columns,
    initialSort: { key: "last_contact_at", direction: "desc" },
    searchKeys: ["name", "publication", "email", "notes"],
  })

  // ── Counts ────────────────────────────────────────────────────────────────

  const statusCount = (key: StatusFilter) => {
    if (key === "all") return journalists.length
    return journalists.filter(j => j.relationship_status === key).length
  }

  // ── Loading state ─────────────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Journalists"
        description={`${journalists.length} contacts \u00b7 manage your media relationships`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="w-3.5 h-3.5" />
            Add Journalist
          </Button>
        }
      />

      {/* Inline new journalist form */}
      {showNewForm && (
        <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              autoFocus
              className="flex-1 h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
            />
            <input
              type="text"
              placeholder="Publication..."
              value={newPublication}
              onChange={e => setNewPublication(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              className="flex-1 h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
            />
            <div className="relative">
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              <select
                value={newTier}
                onChange={e => setNewTier(Number(e.target.value) as JournalistTier)}
                className="h-9 pl-2.5 pr-7 text-xs bg-background border border-border/50 rounded-lg appearance-none focus:outline-none"
              >
                <option value={1}>Tier 1</option>
                <option value={2}>Tier 2</option>
                <option value={3}>Tier 3</option>
              </select>
            </div>
            <Button variant="primary" size="lg" onClick={handleCreate} disabled={!newName.trim()} loading={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => { setShowNewForm(false); setNewName(""); setNewPublication(""); setNewTier(2) }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2.5">
        <StatCard label="Total" value={stats.total} icon={Users} iconColor="text-foreground/60" />
        <StatCard label="Tier 1" value={stats.by_tier.tier1} icon={Star} iconColor="text-purple-500" />
        <StatCard label="Pitched" value={stats.pitched} icon={SendIcon} iconColor="text-amber-500" />
        <StatCard label="Coverage" value={stats.covered} icon={Newspaper} iconColor="text-emerald-500" />
      </div>

      {/* Page-level tabs */}
      <div className="flex items-center bg-muted/60 rounded-lg p-0.5 w-fit">
        {PAGE_TABS.map(t => {
          const active = pageTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setPageTab(t.key)}
              className={`px-4 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab: Directory ─────────────────────────────────────────────────── */}
      {pageTab === "directory" && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/60 rounded-lg p-0.5">
              {STATUS_TABS.map(t => {
                const active = statusFilter === t.key
                const count = statusCount(t.key)
                return (
                  <button
                    key={t.key}
                    onClick={() => setStatusFilter(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                    <span className={`tabular-nums text-[10px] ${active ? "text-foreground/60" : "text-muted-foreground/60"}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex-1" />
            {/* Tier dropdown */}
            <div className="relative">
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              <select
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value === "all" ? "all" : (Number(e.target.value) as JournalistTier))}
                className="h-8 pl-2.5 pr-7 text-xs bg-card border border-border/50 rounded-lg appearance-none focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
              >
                <option value="all">All Tiers</option>
                <option value={1}>Tier 1</option>
                <option value={2}>Tier 2</option>
                <option value={3}>Tier 3</option>
              </select>
            </div>
            {/* Beat dropdown */}
            <div className="relative">
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              <select
                value={beatFilter}
                onChange={e => setBeatFilter(e.target.value as "all" | JournalistBeat)}
                className="h-8 pl-2.5 pr-7 text-xs bg-card border border-border/50 rounded-lg appearance-none focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
              >
                <option value="all">All Beats</option>
                {Object.entries(BEAT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <SearchInput compact value={directoryTable.search} onChange={directoryTable.setSearch} placeholder="Filter..." className="w-48" />
          </div>

          {/* Table */}
          <DataTable>
            <DataTableHeader columns={columns} sort={directoryTable.sort} onSort={directoryTable.toggleSort} />
            <tbody>
              {directoryTable.rows.length === 0 ? (
                <DataTableEmpty
                  icon={Users}
                  description={journalists.length === 0 ? "No journalists yet. Add your first contact." : "No journalists match your filters."}
                  colSpan={columns.length}
                  action={journalists.length === 0 ? (
                    <Button variant="primary" size="sm" onClick={() => setShowNewForm(true)}>
                      <Plus className="w-3.5 h-3.5" />
                      Add Journalist
                    </Button>
                  ) : undefined}
                />
              ) : (
                directoryTable.rows.map(journalist => (
                  <DataTableRow
                    key={journalist.id}
                    row={journalist}
                    columns={columns}
                    onClick={() => router.push(`/dashboard/admin/journalists/${journalist.id}`)}
                  />
                ))
              )}
            </tbody>
          </DataTable>

          {directoryTable.rows.length > 0 && (
            <DataTableFooter showing={directoryTable.rows.length} total={journalists.length} />
          )}
        </>
      )}

      {/* ── Tab: Pitch Pipeline ────────────────────────────────────────────── */}
      {pageTab === "pipeline" && (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1" />
            <SearchInput compact value={pipelineTable.search} onChange={pipelineTable.setSearch} placeholder="Filter pipeline..." className="w-48" />
          </div>

          <DataTable>
            <DataTableHeader columns={columns} sort={pipelineTable.sort} onSort={pipelineTable.toggleSort} />
            <tbody>
              {pipelineTable.rows.length === 0 ? (
                <DataTableEmpty
                  icon={SendIcon}
                  title="No Active Pipeline"
                  description="Journalists will appear here once they have been pitched or are in dialogue."
                  colSpan={columns.length}
                />
              ) : (
                pipelineTable.rows.map(journalist => (
                  <DataTableRow
                    key={journalist.id}
                    row={journalist}
                    columns={columns}
                    onClick={() => router.push(`/dashboard/admin/journalists/${journalist.id}`)}
                  />
                ))
              )}
            </tbody>
          </DataTable>

          {pipelineTable.rows.length > 0 && (
            <DataTableFooter showing={pipelineTable.rows.length} total={pipelineFiltered.length} />
          )}
        </>
      )}

      {/* ── Tab: Coverage ──────────────────────────────────────────────────── */}
      {pageTab === "coverage" && (
        <DataTable>
          <tbody>
            <DataTableEmpty
              icon={Newspaper}
              title="No Coverage Yet"
              description="Coverage will appear here as journalists publish articles about Phosra."
              colSpan={columns.length}
            />
          </tbody>
        </DataTable>
      )}
    </div>
  )
}
