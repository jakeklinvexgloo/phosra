"use client"

import { useCallback, useEffect, useState } from "react"
import { Play, CheckCircle2, XCircle, Clock, Minus } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import { workerRegistry } from "@/lib/admin/worker-registry"
import type { WorkerRun } from "@/lib/admin/types"

export default function WorkersPage() {
  const { getToken } = useApi()
  const [workerRuns, setWorkerRuns] = useState<Record<string, WorkerRun>>({})
  const [triggeringWorker, setTriggeringWorker] = useState<string | null>(null)

  const fetchWorkers = useCallback(async () => {
    const token = (await getToken()) ?? undefined
    api.listWorkers(token).then(setWorkerRuns).catch(() => {})
  }, [getToken])

  useEffect(() => {
    fetchWorkers()
  }, [fetchWorkers])

  const handleTrigger = async (workerId: string) => {
    setTriggeringWorker(workerId)
    try {
      const token = (await getToken()) ?? undefined
      await api.triggerWorker(workerId, token)
      setTimeout(fetchWorkers, 1000)
    } catch {
      // Silently handle
    } finally {
      setTriggeringWorker(null)
    }
  }

  const statusIcon = (status?: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-brand-green" />
      case "failed": return <XCircle className="w-4 h-4 text-destructive" />
      case "running": return <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
      default: return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  const formatTime = (d?: string) => {
    if (!d) return "Never"
    const diff = Date.now() - new Date(d).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Workers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage automated workers that handle outreach, news monitoring, and compliance tracking
        </p>
      </div>

      <div className="space-y-3">
        {workerRegistry.map((worker) => {
          const run = workerRuns[worker.id]
          return (
            <div key={worker.id} className="plaid-card">
              <div className="flex items-start gap-4">
                <div className="mt-0.5">{statusIcon(run?.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{worker.name}</h3>
                    {!worker.enabled && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{worker.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Schedule: {worker.cron}</span>
                    <span>Last run: {formatTime(run?.started_at)}</span>
                    {run?.items_processed != null && run.items_processed > 0 && (
                      <span>{run.items_processed} items processed</span>
                    )}
                  </div>
                  {run?.error_message && (
                    <div className="mt-2 text-xs text-destructive bg-destructive/5 px-2.5 py-1.5 rounded">
                      {run.error_message}
                    </div>
                  )}
                  {run?.output_summary && (
                    <div className="mt-2 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded">
                      {run.output_summary}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleTrigger(worker.id)}
                  disabled={triggeringWorker === worker.id || !worker.enabled}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Play className="w-3 h-3" />
                  Run Now
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
