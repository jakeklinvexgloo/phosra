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

  const statusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            Completed
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            Failed
          </span>
        )
      case "running":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            Running
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            Idle
          </span>
        )
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
  const idle = total - running - healthy - failed

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Workers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated workers that handle outreach, news monitoring, and compliance tracking
          </p>
        </div>
        <button
          onClick={fetchWorkers}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: total, icon: Activity, color: "text-foreground" },
          { label: "Healthy", value: healthy, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Running", value: running, icon: RefreshCw, color: "text-amber-500" },
          { label: "Failed", value: failed, icon: XCircle, color: "text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="plaid-card !py-3">
            <div className="flex items-center gap-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <div>
                <div className="text-lg font-semibold text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
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
            <div key={worker.id} className="plaid-card !p-0 overflow-hidden">
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
                    {statusBadge(run?.status)}
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
                  <button
                    onClick={() => handleTrigger(worker.id)}
                    disabled={isTriggering || isRunning}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isRunning ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    {isRunning ? "Running" : isTriggering ? "Starting..." : "Run"}
                  </button>
                  <button
                    onClick={() => toggleHistory(worker.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
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
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                histRun.trigger_type === "manual"
                                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {histRun.trigger_type}
                              </span>
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
                        No runs yet. Click "Run" to execute this worker.
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
