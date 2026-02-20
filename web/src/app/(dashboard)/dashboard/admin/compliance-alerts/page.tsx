"use client"

import { Bell } from "lucide-react"

export default function ComplianceAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Compliance Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track upcoming compliance deadlines and enforcement dates from the law registry
        </p>
      </div>
      <div className="plaid-card flex flex-col items-center justify-center py-16 text-center">
        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-medium text-foreground mb-1">Coming in Phase 3</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The Compliance Alerter worker will parse enforcement dates from the law registry
          and generate urgency-coded alerts at 90/60/30/7 day thresholds. You&apos;ll see a
          timeline view of upcoming deadlines with acknowledge/resolve actions.
        </p>
      </div>
    </div>
  )
}
