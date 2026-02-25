"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Minus,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Activity,
  RotateCcw,
} from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import { workerRegistry } from "@/lib/admin/worker-registry"
import type { WorkerRun } from "@/lib/admin/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"

export default function WorkersPage() {
  const { getToken } = useApi()
  const [workerRuns, setWorkerRuns] = useState<Record<string, WorkerRun>>({})
  const [triggeringWorker, setTriggeringWorker] = useState<string | null>(null)
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null)
  const [runHistory, setRunHistory] = useState<Record<string, WorkerRun[]>>({})
  const [loadingHistory, setLoadingHistory] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchWorkers = useCallback(async () => {
    const token = (await getToken()) ?? undefined
    api.listWorkers(token).then(setWorkerRuns).catch(() => {})
  }, [getToken])

  // Initial fetch
  useEffect(() => {
    fetchWorkers()
  }, [fetchWorkers])

  // Auto-poll while any worker is running
  useEffect(() => {
    const hasRunning = Object.values(workerRuns).some((r) => r.status === "running")
    if (hasRunning && !pollingRef.current) {
      pollingRef.current = setInterval(fetchWorkers, 3000)
    } else if (!hasRunning && pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [workerRuns, fetchWorkers])

  const handleTrigger = async (workerId: string) => {
    setTriggeringWorker(workerId)
    try {
      const token = (await getToken()) ?? undefined
      await api.triggerWorker(workerId, token)
      // Poll immediately then let auto-poll take over
      setTimeout(fetchWorkers, 500)
    } catch {
      // Silently handle
    } finally {
      setTriggeringWorker(null)
    }
  }

  const toggleHistory = async (workerId: string) => {
    if (expandedWorker === workerId) {
      setExpandedWorker(null)
      return
    }
    setExpandedWorker(workerId)

    // Fetch run history if not already loaded
    if (!runHistory[workerId]) {
      setLoadingHistory(workerId)
      try {
        const token = (await getToken()) ?? undefined
        const runs = await api.listWorkerRuns(workerId, token)
        setRunHistory((prev) => ({ ...prev, [workerId]: runs }))
      } catch {
        setRunHistory((prev) => ({ ...prev, [workerId]: [] }))
      } finally {
        setLoadingHistory(null)
      }
    }
  }

  const statusIcon = (status?: string, size = "w-4 h-4") => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className={`${size} text-emerald-500`} />
      case "failed":
        return <XCircle className={`${size} text-red-500`} />
      case "running":
        return <RefreshCw className={`${size} text-amber-500 animate-spin`} />
      default:
        return <Minus className={`${size} text-muted-foreground`} />
    }
  }

  const statusBadgeVariant = (status?: string): "success" | "destructive" | "warning" | "default" => {
    switch (status) {
      case "completed": return "success"
      case "failed": return "destructive"
      case "running": return "warning"
      default: return "default"
    }
  }

  const statusBadgeLabel = (status?: string) => {
    switch (status) {
      case "completed": return "Completed"
      case "failed": return "Failed"
      case "running": return "Running"
      default: return "Idle"
    }
  }

  const formatTime = (d?: string) => {
    if (!d) return "Never"
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return "—"
    const ms = new Date(end).getTime() - new Date(start).getTime()
    if (ms < 1000) return `${ms}ms`
    const secs = Math.floor(ms / 1000)
    if (secs < 60) return `${secs}s`
    return `${Math.floor(secs / 60)}m ${secs % 60}s`
  }

  const formatDateTime = (d?: string) => {
    if (!d) return "—"
    return new Date(d).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Summary stats
  const total = workerRegistry.length
  const running = Object.values(workerRuns).filter((r) => r.status === "running").length
  const healthy = Object.values(workerRuns).filter((r) => r.status === "completed").length
  const failed = Object.values(workerRuns).filter((r) => r.status === "failed").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers"
        description="Automated workers that handle outreach, news monitoring, and compliance tracking"
        actions={
          <Button variant="ghost" size="sm" onClick={fetchWorkers}>
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total" value={total} icon={Activity} />
        <StatCard label="Healthy" value={healthy} icon={CheckCircle2} iconColor="text-emerald-500" />
        <StatCard label="Running" value={running} icon={RefreshCw} iconColor="text-amber-500" />
        <StatCard label="Failed" value={failed} icon={XCircle} iconColor="text-red-500" />
      </div>

      {/* Worker list */}
      <div className="space-y-2">
        {workerRegistry.map((worker) => {
          const run = workerRuns[worker.id]
          const isExpanded = expandedWorker === worker.id
          const history = runHistory[worker.id]
          const isRunning = run?.status === "running"
          const isTriggering = triggeringWorker === worker.id

          return (
            <div key={worker.id} className="plaid-card-flush overflow-hidden">
              {/* Main row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {statusIcon(run?.status)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{worker.name}</h3>
                    <Badge variant={statusBadgeVariant(run?.status)} size="sm" dot dotPulse={run?.status === "running"}>
                      {statusBadgeLabel(run?.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {worker.description}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex-shrink-0 text-right hidden sm:block">
                  <div className="text-xs text-muted-foreground">{worker.cron}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Last: {formatTime(run?.started_at)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-full"
                    loading={isRunning}
                    disabled={isTriggering || isRunning}
                    onClick={() => handleTrigger(worker.id)}
                  >
                    {!isRunning && <Play className="w-3 h-3" />}
                    {isRunning ? "Running" : isTriggering ? "Starting..." : "Run"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleHistory(worker.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Latest run output (always visible if present) */}
              {run?.error_message && (
                <div className="mx-4 mb-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-md border border-red-100 dark:border-red-900/20">
                  {run.error_message}
                </div>
              )}
              {run?.output_summary && run.status !== "failed" && (
                <div className="mx-4 mb-3 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">
                  {run.output_summary}
                </div>
              )}

              {/* Expanded run history */}
              {isExpanded && (
                <div className="border-t border-border/50 bg-muted/20">
                  <div className="px-4 py-2">
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Run History
                    </div>
                    {loadingHistory === worker.id ? (
                      <div className="text-xs text-muted-foreground py-3 text-center">Loading...</div>
                    ) : history && history.length > 0 ? (
                      <div className="space-y-0">
                        {/* Header row */}
                        <div className="grid grid-cols-[auto_1fr_80px_80px_60px] gap-3 text-[10px] text-muted-foreground uppercase tracking-wide pb-1 border-b border-border/30">
                          <div className="w-4" />
                          <div>Time</div>
                          <div>Duration</div>
                          <div>Trigger</div>
                          <div className="text-right">Items</div>
                        </div>
                        {history.map((histRun) => (
                          <div
                            key={histRun.id}
                            className="grid grid-cols-[auto_1fr_80px_80px_60px] gap-3 py-1.5 items-center border-b border-border/20 last:border-0 group"
                          >
                            <div>{statusIcon(histRun.status, "w-3.5 h-3.5")}</div>
                            <div className="text-xs text-foreground">
                              {formatDateTime(histRun.started_at)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDuration(histRun.started_at, histRun.completed_at)}
                            </div>
                            <div>
                              <Badge variant={histRun.trigger_type === "manual" ? "info" : "default"} size="sm">
                                {histRun.trigger_type}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
                              {histRun.items_processed || 0}
                            </div>
                            {/* Error/output on hover/expansion */}
                            {(histRun.error_message || histRun.output_summary) && (
                              <div className="col-span-5 text-xs text-muted-foreground bg-muted/30 px-2 py-1.5 rounded mt-0.5 whitespace-pre-wrap font-mono max-h-24 overflow-y-auto">
                                {histRun.error_message || histRun.output_summary}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground py-3 text-center">
                        No runs yet. Click &quot;Run&quot; to execute this worker.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
