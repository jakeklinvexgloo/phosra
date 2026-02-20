"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Send, Newspaper, Bell, Bot, Play, ArrowRight,
  CheckCircle2, XCircle, Clock, Minus,
} from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import { workerRegistry } from "@/lib/admin/worker-registry"
import type { AdminStats, WorkerRun } from "@/lib/admin/types"

export default function AdminCommandCenter() {
  const { getToken } = useApi()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [workerRuns, setWorkerRuns] = useState<Record<string, WorkerRun>>({})
  const [triggeringWorker, setTriggeringWorker] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const token = (await getToken()) ?? undefined
    api.getAdminStats(token).then(setStats).catch(() => {})
    api.listWorkers(token).then(setWorkerRuns).catch(() => {})
  }, [getToken])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTrigger = async (workerId: string) => {
    setTriggeringWorker(workerId)
    try {
      const token = (await getToken()) ?? undefined
      await api.triggerWorker(workerId, token)
      // Refresh data after trigger
      setTimeout(fetchData, 1000)
    } catch {
      // Handle error silently
    } finally {
      setTriggeringWorker(null)
    }
  }

  const getWorkerStatus = (workerId: string) => {
    const run = workerRuns[workerId]
    if (!run) return "idle"
    return run.status
  }

  const getWorkerLastRun = (workerId: string) => {
    const run = workerRuns[workerId]
    if (!run) return "Never"
    const d = new Date(run.started_at)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
      case "failed":
        return <XCircle className="w-3.5 h-3.5 text-destructive" />
      case "running":
        return <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
      default:
        return <Minus className="w-3.5 h-3.5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of automated workers, outreach pipeline, and compliance monitoring
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/outreach" className="plaid-card hover:border-foreground/20 transition-colors group">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
              <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Outreach</span>
          </div>
          <div className="text-2xl font-semibold tabular-nums">{stats?.outreach.total ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {stats ? `${stats.outreach.reached_out + stats.outreach.in_conversation} active` : "loading..."}
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors absolute top-4 right-4" />
        </Link>

        <Link href="/dashboard/admin/news" className="plaid-card hover:border-foreground/20 transition-colors group relative">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <Newspaper className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">News</span>
          </div>
          <div className="text-2xl font-semibold tabular-nums">{stats?.news_unread ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-0.5">unread items</div>
        </Link>

        <Link href="/dashboard/admin/compliance-alerts" className="plaid-card hover:border-foreground/20 transition-colors group relative">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30">
              <Bell className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Deadlines</span>
          </div>
          <div className="text-2xl font-semibold tabular-nums">{stats?.deadlines_approaching ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-0.5">within 30 days</div>
        </Link>

        <Link href="/dashboard/admin/workers" className="plaid-card hover:border-foreground/20 transition-colors group relative">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-md bg-brand-green/10">
              <Bot className="w-3.5 h-3.5 text-brand-green" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Workers</span>
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {stats ? `${stats.workers.healthy}/${stats.workers.total}` : "—"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {stats?.workers.failed ? `${stats.workers.failed} failed` : "all healthy"}
          </div>
        </Link>
      </div>

      {/* ── Worker Status Grid ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Workers</h2>
          <Link
            href="/dashboard/admin/workers"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all runs →
          </Link>
        </div>
        <div className="plaid-card p-0 divide-y divide-border">
          {workerRegistry.map((worker) => {
            const status = getWorkerStatus(worker.id)
            const lastRun = getWorkerLastRun(worker.id)
            return (
              <div
                key={worker.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-shrink-0">{statusIcon(status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{worker.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{worker.description}</div>
                </div>
                <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {lastRun}
                </div>
                <div className="text-[11px] text-muted-foreground/50 whitespace-nowrap hidden sm:block">
                  {worker.cron}
                </div>
                <button
                  onClick={() => handleTrigger(worker.id)}
                  disabled={triggeringWorker === worker.id || !worker.enabled}
                  className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={worker.enabled ? "Run now" : "Worker not yet enabled"}
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/dashboard/admin/outreach"
            className="plaid-card flex items-center gap-3 hover:border-foreground/20 transition-colors"
          >
            <Send className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Review Pipeline</div>
              <div className="text-xs text-muted-foreground">
                {stats?.outreach.needs_follow_up ?? 0} need follow-up
              </div>
            </div>
          </Link>
          <button
            onClick={() => handleTrigger("news-monitor")}
            className="plaid-card flex items-center gap-3 hover:border-foreground/20 transition-colors text-left"
          >
            <Newspaper className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-sm font-medium">Scan News Now</div>
              <div className="text-xs text-muted-foreground">Check industry updates</div>
            </div>
          </button>
          <button
            onClick={() => handleTrigger("legislation-monitor")}
            className="plaid-card flex items-center gap-3 hover:border-foreground/20 transition-colors text-left"
          >
            <Bell className="w-4 h-4 text-red-500" />
            <div>
              <div className="text-sm font-medium">Scan Legislation</div>
              <div className="text-xs text-muted-foreground">Check for new laws</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
