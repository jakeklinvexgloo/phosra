"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RotateCcw, Search } from "lucide-react"
import { PLATFORM_REGISTRY, CATEGORY_META } from "@/lib/platforms"
import { getAdapterPlatformIds, hasAdapter } from "@/lib/platform-research/adapter-registry"
import type { ResearchResult, ResearchStats } from "@/lib/platform-research/types"
import type { PlatformRegistryEntry } from "@/lib/platforms/types"
import { ResearchStatsRow } from "./_components/ResearchStatsRow"
import { ResearchFilters, type ResearchFilterState } from "./_components/ResearchFilters"
import { PlatformResearchCard } from "./_components/PlatformResearchCard"
import { PlatformResearchDetail } from "./_components/PlatformResearchDetail"
import { BulkResearchDialog } from "./_components/BulkResearchDialog"

// ── Default stats (before API loads) ─────────────────────────────────────────

function computeLocalStats(results: Map<string, ResearchResult>): ResearchStats {
  const total = PLATFORM_REGISTRY.length
  let researched = 0
  let inProgress = 0
  let failed = 0

  const allResults = Array.from(results.values())
  for (let i = 0; i < allResults.length; i++) {
    const r = allResults[i]
    if (r.status === "completed") researched++
    else if (r.status === "running" || r.status === "pending") inProgress++
    else if (r.status === "failed") failed++
  }

  return {
    totalPlatforms: total,
    researched,
    inProgress,
    failed,
    notStarted: total - researched - inProgress - failed,
  }
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function PlatformResearchPage() {
  const [results, setResults] = useState<Map<string, ResearchResult>>(new Map())
  const [stats, setStats] = useState<ResearchStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkRunning, setBulkRunning] = useState(false)
  const [filters, setFilters] = useState<ResearchFilterState>({
    category: "all",
    status: "all",
    search: "",
  })

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const adapterIds = useMemo(() => new Set(getAdapterPlatformIds()), [])

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/research/results")
      if (res.ok) {
        const data: ResearchResult[] = await res.json()
        const map = new Map<string, ResearchResult>()
        for (const r of data) {
          map.set(r.platformId, r)
        }
        setResults(map)
      }
    } catch {
      // API not available — gracefully degrade
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/research/stats")
      if (res.ok) {
        const data: ResearchStats = await res.json()
        setStats(data)
      }
    } catch {
      // API not available — use local computation
    }
  }, [])

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchResults(), fetchStats()])
    setLoading(false)
  }, [fetchResults, fetchStats])

  // Initial load
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Auto-poll when any research is running
  useEffect(() => {
    const hasRunning = Array.from(results.values()).some(
      (r) => r.status === "running" || r.status === "pending"
    )
    if (hasRunning && !pollingRef.current) {
      pollingRef.current = setInterval(fetchAll, 5000)
    } else if (!hasRunning && pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [results, fetchAll])

  // ── Computed stats (fallback) ────────────────────────────────────────────

  const displayStats = stats || computeLocalStats(results)

  // ── Filtering ────────────────────────────────────────────────────────────

  const filteredPlatforms = useMemo(() => {
    let list: PlatformRegistryEntry[] = [...PLATFORM_REGISTRY]

    // Filter by category
    if (filters.category !== "all") {
      list = list.filter((p) => p.category === filters.category)
    }

    // Filter by search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.includes(q) ||
          p.category.replace(/_/g, " ").includes(q)
      )
    }

    // Filter by status
    if (filters.status !== "all") {
      if (filters.status === "not_started") {
        list = list.filter((p) => !results.has(p.id))
      } else if (filters.status === "has_adapter") {
        list = list.filter((p) => adapterIds.has(p.id))
      } else {
        list = list.filter((p) => {
          const r = results.get(p.id)
          return r?.status === filters.status
        })
      }
    }

    return list
  }, [filters, results, adapterIds])

  // ── Actions ──────────────────────────────────────────────────────────────

  const triggerResearch = useCallback(
    async (platformId: string) => {
      try {
        await fetch("/api/admin/research/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platformId, triggerType: "manual" }),
        })
        // Optimistically set status to pending
        setResults((prev) => {
          const next = new Map(prev)
          const existing = next.get(platformId)
          if (existing) {
            next.set(platformId, { ...existing, status: "running" })
          } else {
            next.set(platformId, {
              id: crypto.randomUUID(),
              platformId,
              platformName:
                PLATFORM_REGISTRY.find((p) => p.id === platformId)?.name ||
                platformId,
              status: "running",
              triggerType: "manual",
              screenshots: [],
              notes: null,
              startedAt: new Date().toISOString(),
            })
          }
          return next
        })
        // Start polling
        setTimeout(fetchAll, 1000)
      } catch {
        // Silently handle — API may not be set up
      }
    },
    [fetchAll]
  )

  const handleBulkResearch = useCallback(() => {
    setBulkDialogOpen(true)
  }, [])

  const handleBulkConfirm = useCallback(
    async (platformIds: string[]) => {
      setBulkRunning(true)
      try {
        await fetch("/api/admin/research/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platformIds, triggerType: "bulk" }),
        })
        setTimeout(fetchAll, 1000)
      } catch {
        // Silently handle
      } finally {
        setBulkRunning(false)
        setBulkDialogOpen(false)
      }
    },
    [fetchAll]
  )

  // Platforms eligible for bulk research (filtered + has adapter)
  const bulkEligiblePlatforms = useMemo(
    () => filteredPlatforms.filter((p) => adapterIds.has(p.id)),
    [filteredPlatforms, adapterIds]
  )

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Platform Research
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Research parental controls across platforms via browser automation
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            fetchAll()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <ResearchStatsRow stats={displayStats} />

      {/* Filters */}
      <ResearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        onBulkResearch={handleBulkResearch}
      />

      {/* Platform count */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Showing {filteredPlatforms.length} of {PLATFORM_REGISTRY.length}{" "}
          platforms
          {adapterIds.size > 0 && (
            <span className="ml-2">
              ({adapterIds.size} with adapters)
            </span>
          )}
        </div>
      </div>

      {/* Platform grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="plaid-card animate-pulse">
              <div className="space-y-3 p-4">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-5 bg-muted rounded w-1/3" />
              </div>
              <div className="border-t border-border/50 px-4 py-2.5 bg-muted/10">
                <div className="h-6 bg-muted rounded w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPlatforms.length === 0 ? (
        <div className="plaid-card flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 opacity-30 mb-3" />
          <p className="text-sm font-medium">No platforms found</p>
          <p className="text-xs mt-1">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredPlatforms.map((platform) => (
            <PlatformResearchCard
              key={platform.id}
              platform={platform}
              result={results.get(platform.id)}
              hasAdapter={adapterIds.has(platform.id)}
              onSelect={() => setSelectedPlatform(platform.id)}
              onTriggerResearch={() => triggerResearch(platform.id)}
            />
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selectedPlatform && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/20"
            onClick={() => setSelectedPlatform(null)}
          />
          <PlatformResearchDetail
            platformId={selectedPlatform}
            result={results.get(selectedPlatform)}
            onClose={() => setSelectedPlatform(null)}
            onRerun={() => triggerResearch(selectedPlatform)}
          />
        </>
      )}

      {/* Bulk research dialog */}
      {bulkDialogOpen && (
        <BulkResearchDialog
          platforms={bulkEligiblePlatforms}
          onConfirm={handleBulkConfirm}
          onCancel={() => setBulkDialogOpen(false)}
          isRunning={bulkRunning}
        />
      )}
    </div>
  )
}
