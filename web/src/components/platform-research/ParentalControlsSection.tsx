"use client"

import {
  Link2,
  Eye,
  Settings,
  ShieldAlert,
  Bell,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { ParentalControlsDetail } from "@/lib/platform-research/research-data-types"

interface ParentalControlsSectionProps {
  data: ParentalControlsDetail
}

const DIFFICULTY_COLORS: Record<string, string> = {
  "trivial": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "easy": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "moderate": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "difficult": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "hard": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
}

function difficultyColor(d: string | undefined | null): string {
  if (!d) return "bg-muted text-muted-foreground"
  const lower = d.toLowerCase()
  for (const [key, cls] of Object.entries(DIFFICULTY_COLORS)) {
    if (lower.includes(key)) return cls
  }
  return "bg-muted text-muted-foreground"
}

export function ParentalControlsSection({ data }: ParentalControlsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Linking Mechanism */}
      <div className="plaid-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Linking Mechanism
        </h3>
        <div className="text-sm">
          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mr-2">
            {data.linkingMechanism?.method ?? "None"}
          </span>
          <span className="text-muted-foreground">{data.linkingMechanism?.details ?? ""}</span>
        </div>
      </div>

      {/* Visibility Matrix */}
      <div className="plaid-card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Parent Visibility Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Data Point</th>
                <th className="px-4 py-2.5 text-center font-medium text-foreground">Visible</th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Granularity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(data.visibilityMatrix ?? []).map((row) => (
                <tr key={row.dataPoint} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.dataPoint}</td>
                  <td className="px-4 py-2.5 text-center">
                    {row.visible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.granularity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configurable Controls */}
      <div className="plaid-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configurable Controls
        </h3>
        <div className="space-y-2">
          {(data.configurableControls ?? []).map((ctrl) => (
            <div key={ctrl.control} className="flex items-start gap-2.5 text-sm">
              {ctrl.available ? (
                <span className="flex items-center justify-center w-4 h-4 flex-shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </span>
              ) : (
                <span className="flex items-center justify-center w-4 h-4 flex-shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                </span>
              )}
              <div>
                <span className="font-medium text-foreground">{ctrl.control}</span>
                <span className="text-muted-foreground ml-1.5">&mdash; {ctrl.details}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bypass Vulnerabilities */}
      {(data.bypassVulnerabilities ?? []).length > 0 && (
        <div className="plaid-card !p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Bypass Vulnerabilities
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Method</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Difficulty</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(data.bypassVulnerabilities ?? []).map((vuln) => (
                  <tr key={vuln.method} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{vuln.method}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${difficultyColor(vuln.difficulty)}`}>
                        {vuln.difficulty ?? "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{vuln.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Safety Alerts */}
      {(data.safetyAlerts ?? []).length > 0 && (
        <div className="plaid-card space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Safety Alerts
          </h3>
          <div className="space-y-3">
            {(data.safetyAlerts ?? []).map((alert) => (
              <div key={alert.triggerType} className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">{alert.triggerType}</span>
                  <div className="flex gap-1">
                    {(alert.channels ?? []).map((ch) => (
                      <span key={ch} className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{alert.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
