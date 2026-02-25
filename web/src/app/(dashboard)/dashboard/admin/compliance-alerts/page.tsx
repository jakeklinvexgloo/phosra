"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock, Shield } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { ComplianceAlert, ComplianceAlertUrgency, ComplianceAlertStatus } from "@/lib/admin/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"

const URGENCY_META: Record<ComplianceAlertUrgency, { label: string; variant: "destructive" | "orange" | "warning" | "default"; icon: typeof AlertTriangle }> = {
  critical: { label: "Critical", variant: "destructive", icon: AlertTriangle },
  high: { label: "High", variant: "orange", icon: AlertTriangle },
  medium: { label: "Medium", variant: "warning", icon: Clock },
  low: { label: "Low", variant: "default", icon: Clock },
}

const STATUS_META: Record<ComplianceAlertStatus, { label: string; variant: "default" | "info" | "warning" | "success" }> = {
  pending: { label: "Pending", variant: "default" },
  acknowledged: { label: "Acknowledged", variant: "info" },
  action_needed: { label: "Action Needed", variant: "warning" },
  resolved: { label: "Resolved", variant: "success" },
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

  const description = `${alerts.length} active alerts${critical > 0 ? ` (${critical} critical)` : ""}${high > 0 ? ` / ${high} high` : ""}`

  return (
    <div className="space-y-6">
      <PageHeader title="Compliance Alerts" description={description} />

      {loading ? (
        <div className="text-sm text-muted-foreground py-10 text-center">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No active alerts"
          description="All compliance deadlines are resolved or none have been created yet. Run the Compliance Alerter worker to scan for upcoming deadlines."
        />
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const urgency = URGENCY_META[alert.urgency]
            const status = STATUS_META[alert.status]
            const UrgencyIcon = urgency.icon

            return (
              <div key={alert.id} className="plaid-card-flush overflow-hidden">
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
                      <Badge variant={urgency.variant} size="sm">{urgency.label}</Badge>
                      <Badge variant={status.variant} size="sm">{status.label}</Badge>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(alert.id, "acknowledged")}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {alert.status !== "resolved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(alert.id, "resolved")}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Resolve
                      </Button>
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
