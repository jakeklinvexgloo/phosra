"use client"

import { useCallback, useEffect, useState } from "react"
import { BarChart3, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { DeveloperAPIUsage } from "@/lib/types"
import { useDevOrg } from "@/contexts/dev-org-context"

interface DailyStats {
  date: string
  total: number
  success: number
  clientError: number
  serverError: number
}

interface EndpointStats {
  endpoint: string
  total: number
  success: number
}

interface KeyStats {
  keyId: string
  keyName: string
  keyPrefix: string
  total: number
}

export default function UsagePage() {
  const { getToken } = useApi()
  const { org, keys } = useDevOrg()
  const [usage, setUsage] = useState<DeveloperAPIUsage[]>([])
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsage = useCallback(async () => {
    if (!org) return
    setLoading(true)
    setError(null)
    try {
      const token = (await getToken()) ?? undefined
      if (!token) return
      const usageData = await api.getDeveloperUsage(token, org.id, days)
      setUsage(usageData || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load usage data"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [getToken, org, days])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  // Aggregate daily stats
  const dailyMap = new Map<string, DailyStats>()
  for (const row of usage) {
    const date = row.hour.split("T")[0]
    const existing = dailyMap.get(date) || { date, total: 0, success: 0, clientError: 0, serverError: 0 }
    existing.total += row.total_requests
    existing.success += row.status_2xx
    existing.clientError += row.status_4xx
    existing.serverError += row.status_5xx
    dailyMap.set(date, existing)
  }
  const dailyStats = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  // Aggregate endpoint stats
  const endpointMap = new Map<string, EndpointStats>()
  for (const row of usage) {
    const existing = endpointMap.get(row.endpoint) || { endpoint: row.endpoint, total: 0, success: 0 }
    existing.total += row.total_requests
    existing.success += row.status_2xx
    endpointMap.set(row.endpoint, existing)
  }
  const endpointStats = Array.from(endpointMap.values()).sort((a, b) => b.total - a.total).slice(0, 10)

  // Aggregate per-key stats
  const keyMap = new Map<string, KeyStats>()
  for (const row of usage) {
    const matchedKey = keys.find((k) => k.id === row.key_id)
    const existing = keyMap.get(row.key_id) || {
      keyId: row.key_id,
      keyName: matchedKey?.name || "Unknown",
      keyPrefix: matchedKey?.key_prefix || row.key_id.slice(0, 12),
      total: 0,
    }
    existing.total += row.total_requests
    keyMap.set(row.key_id, existing)
  }
  const keyStats = Array.from(keyMap.values()).sort((a, b) => b.total - a.total)

  // Summary numbers
  const totalRequests = usage.reduce((sum, r) => sum + r.total_requests, 0)
  const totalSuccess = usage.reduce((sum, r) => sum + r.status_2xx, 0)
  const successRate = totalRequests > 0 ? ((totalSuccess / totalRequests) * 100).toFixed(1) : "0.0"
  const avgPerDay = dailyStats.length > 0 ? Math.round(totalRequests / dailyStats.length) : 0

  // Bar chart scale
  const maxDaily = Math.max(...dailyStats.map((d) => d.total), 1)

  if (!org) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">
          Waiting for developer organization...
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">Loading usage data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={() => { setError(null); fetchUsage() }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">API Usage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor API requests and performance for {org.name}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                days === d ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="plaid-card">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Total Requests</span>
          </div>
          <div className="text-2xl font-semibold tabular-nums">{totalRequests.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Last {days} days</div>
        </div>
        <div className="plaid-card">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-md bg-brand-green/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Success Rate</span>
          </div>
          <div className="text-2xl font-semibold tabular-nums">{successRate}%</div>
          <div className="text-xs text-muted-foreground mt-0.5">2xx responses</div>
        </div>
        <div className="plaid-card">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Avg / Day</span>
          </div>
          <div className="text-2xl font-semibold tabular-nums">{avgPerDay.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-0.5">requests per day</div>
        </div>
      </div>

      {/* Daily bar chart */}
      <div className="plaid-card">
        <h3 className="section-header mb-6">Daily Requests</h3>
        {dailyStats.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No usage data for this period</p>
          </div>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {dailyStats.map((d) => {
              const height = Math.max((d.total / maxDaily) * 100, 2)
              const successHeight = d.total > 0 ? (d.success / d.total) * height : height
              const errorHeight = height - successHeight
              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-stretch justify-end gap-0 group relative"
                  title={`${d.date}: ${d.total.toLocaleString()} requests`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-foreground text-background text-[11px] px-2 py-1 rounded whitespace-nowrap">
                      <div className="font-medium">{new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                      <div className="tabular-nums">{d.total.toLocaleString()} requests</div>
                    </div>
                  </div>
                  {errorHeight > 0 && (
                    <div
                      className="bg-destructive/60 rounded-t-sm"
                      style={{ height: `${errorHeight}%` }}
                    />
                  )}
                  <div
                    className={`bg-foreground/80 ${errorHeight > 0 ? "" : "rounded-t-sm"} rounded-b-sm transition-colors group-hover:bg-foreground`}
                    style={{ height: `${successHeight}%` }}
                  />
                </div>
              )
            })}
          </div>
        )}
        {dailyStats.length > 0 && (
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-muted-foreground">
              {new Date(dailyStats[0].date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {new Date(dailyStats[dailyStats.length - 1].date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        )}
      </div>

      {/* Top endpoints */}
      {endpointStats.length > 0 && (
        <div className="plaid-card">
          <h3 className="section-header mb-4">Top Endpoints</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-2 pr-4">
                    Endpoint
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2 px-4">
                    Requests
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2 pl-4">
                    Success
                  </th>
                </tr>
              </thead>
              <tbody>
                {endpointStats.map((ep) => (
                  <tr key={ep.endpoint} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4">
                      <code className="text-xs font-mono text-foreground">{ep.endpoint}</code>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-foreground">
                      {ep.total.toLocaleString()}
                    </td>
                    <td className="py-2.5 pl-4 text-right tabular-nums">
                      <span
                        className={
                          ep.total > 0 && ep.success / ep.total >= 0.95
                            ? "text-brand-green"
                            : ep.total > 0 && ep.success / ep.total >= 0.8
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-destructive"
                        }
                      >
                        {ep.total > 0 ? ((ep.success / ep.total) * 100).toFixed(1) : "0.0"}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-key breakdown */}
      {keyStats.length > 0 && (
        <div className="plaid-card">
          <h3 className="section-header mb-4">Per-Key Breakdown</h3>
          <div className="space-y-3">
            {keyStats.map((ks) => {
              const pct = totalRequests > 0 ? (ks.total / totalRequests) * 100 : 0
              return (
                <div key={ks.keyId} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {ks.keyName}
                      </span>
                      <code className="text-xs text-muted-foreground font-mono">
                        {ks.keyPrefix}...
                      </code>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground/70 rounded-full transition-all"
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium tabular-nums text-foreground">
                      {ks.total.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      {pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {usage.length === 0 && (
        <div className="plaid-card text-center py-12">
          <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-medium text-foreground mb-1">No usage data yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Usage data will appear here once you start making API requests with your keys.
          </p>
        </div>
      )}
    </div>
  )
}
