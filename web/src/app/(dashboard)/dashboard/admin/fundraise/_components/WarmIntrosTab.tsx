"use client"

import { useState, useMemo, useCallback } from "react"
import { Users, Target, Sparkles } from "lucide-react"
import {
  WARM_INTRO_TARGETS,
  SUPER_CONNECTORS,
  getNetworkStats,
  type PipelineStatus,
} from "@/lib/investors/warm-intro-network"
import InvestorTable from "./InvestorTable"
import SuperConnectorsSection from "./SuperConnectorsSection"
import PipelineFunnel from "./PipelineFunnel"
import InvestorResearchModal from "./InvestorResearchModal"

export default function WarmIntrosTab() {
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, PipelineStatus>
  >({})
  const [showResearch, setShowResearch] = useState(false)

  const targets = useMemo(
    () =>
      WARM_INTRO_TARGETS.map((t) =>
        statusOverrides[t.id]
          ? { ...t, status: statusOverrides[t.id] }
          : t,
      ),
    [statusOverrides],
  )

  const stats = useMemo(() => {
    const base = getNetworkStats()
    return {
      ...base,
      tier1Count: targets.filter((t) => t.tier === 1).length,
      tier2Count: targets.filter((t) => t.tier === 2).length,
      tier3Count: targets.filter((t) => t.tier === 3).length,
      totalPaths: targets.reduce((s, t) => s + t.introPaths.length, 0),
    }
  }, [targets])

  const handleStatusChange = useCallback(
    (id: string, status: PipelineStatus) => {
      setStatusOverrides((prev) => ({ ...prev, [id]: status }))
    },
    [],
  )

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="plaid-card !py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-brand-green/10">
              <Users className="w-3.5 h-3.5 text-brand-green" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              Total Targets
            </span>
          </div>
          <div className="text-xl font-semibold tabular-nums">
            {stats.totalTargets}
          </div>
        </div>

        <div className="plaid-card !py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30">
              <Target className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              Tier 1
            </span>
          </div>
          <div className="text-xl font-semibold tabular-nums">
            {stats.tier1Count}
          </div>
        </div>

        <div className="plaid-card !py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              Tier 2
            </span>
          </div>
          <div className="text-xl font-semibold tabular-nums">
            {stats.tier2Count}
          </div>
        </div>

        <div className="plaid-card !py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
              <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              Tier 3
            </span>
          </div>
          <div className="text-xl font-semibold tabular-nums">
            {stats.tier3Count}
          </div>
        </div>

        <div className="plaid-card !py-3 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              Intro Paths
            </span>
          </div>
          <div className="text-xl font-semibold tabular-nums">
            {stats.totalPaths}
          </div>
        </div>
      </div>

      {/* AI Research button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowResearch(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-green text-[#0D1B2A] text-xs font-semibold hover:bg-brand-green/90 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          AI Research
        </button>
      </div>

      {/* Investor table */}
      <InvestorTable targets={targets} onStatusChange={handleStatusChange} />

      {/* Super connectors */}
      <SuperConnectorsSection
        connectors={SUPER_CONNECTORS}
        targets={targets}
      />

      {/* Pipeline funnel */}
      <PipelineFunnel targets={targets} />

      {/* Research modal */}
      <InvestorResearchModal
        open={showResearch}
        onClose={() => setShowResearch(false)}
      />
    </div>
  )
}
