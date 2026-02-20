"use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, AlertTriangle, CheckCircle2, Clock, Shield } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { ComplianceAlert, ComplianceAlertUrgency, ComplianceAlertStatus } from "@/lib/admin/types"

const URGENCY_META: Record<ComplianceAlertUrgency, { label: string; color: string; icon: typeof AlertTriangle }> = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400", icon: AlertTriangle },
  high: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400", icon: AlertTriangle },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400", icon: Clock },
  low: { label: "Low", color: "bg-muted text-muted-foreground", icon: Clock },
}

const STATUS_META: Record<ComplianceAlertStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground" },
  acknowledged: { label: "Acknowledged", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  action_needed: { label: "Action Needed", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
}

export default function ComplianceAlertsPage() {
  const { getToken } = useApi()
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async () => {
    const token = (await getToken()) ?? undefined
    try {
      const data = await api.listAlerts(token)
      setAlerts(data)
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handleStatusUpdate = async (id: string, status: string) => {
    const token = (await getToken()) ?? undefined
    await api.updateAlertStatus(id, status, token).catch(() => {})
    if (status === "resolved") {
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    } else {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as ComplianceAlertStatus } : a))
      )
    }
  }

  const daysUntil = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return `${Math.abs(diff)}d overdue`
    if (diff === 0) return "Today"
    return `${diff}d`
  }

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  }

  const critical = alerts.filter((a) => a.urgency === "critical").length
  const high = alerts.filter((a) => a.urgency === "high").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Compliance Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {alerts.length} active alerts
          {critical > 0 && ` (${critical} critical)`}
          {high > 0 && ` / ${high} high`}
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-10 text-center">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="plaid-card flex flex-col items-center justify-center py-16 text-center">
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-1">No active alerts</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            All compliance deadlines are resolved or none have been created yet.
            Run the Compliance Alerter worker to scan for upcoming deadlines.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const urgency = URGENCY_META[alert.urgency]
            const status = STATUS_META[alert.status]
            const UrgencyIcon = urgency.icon

            return (
              <div key={alert.id} className="plaid-card !p-0 overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <UrgencyIcon className={`w-4 h-4 ${
                      alert.urgency === "critical" ? "text-red-500" :
                      alert.urgency === "high" ? "text-orange-500" :
                      alert.urgency === "medium" ? "text-amber-500" :
                      "text-muted-foreground"
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-foreground">{alert.law_name}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${urgency.color}`}>
                        {urgency.label}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Deadline: {formatDate(alert.deadline_date)}</span>
                      <span className={`font-medium ${
                        alert.urgency === "critical" ? "text-red-600 dark:text-red-400" :
                        alert.urgency === "high" ? "text-orange-600 dark:text-orange-400" :
                        ""
                      }`}>
                        {daysUntil(alert.deadline_date)}
                      </span>
                      <span className="text-muted-foreground/50">ID: {alert.law_id}</span>
                    </div>
                    {alert.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{alert.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {alert.status === "pending" && (
                      <button
                        onClick={() => handleStatusUpdate(alert.id, "acknowledged")}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status !== "resolved" && (
                      <button
                        onClick={() => handleStatusUpdate(alert.id, "resolved")}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
