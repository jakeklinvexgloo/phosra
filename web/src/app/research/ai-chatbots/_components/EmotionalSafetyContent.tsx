"use client"

import {
  Heart,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { EmotionalSafetyData } from "@/lib/platform-research/research-data-types"

export function EmotionalSafetyContent({ data }: { data: EmotionalSafetyData }) {
  return (
    <div className="space-y-6">
      {/* Key Stats */}
      {(data.keyStats ?? []).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(data.keyStats ?? []).map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-3 space-y-1">
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-xs font-medium text-foreground">{stat.label}</div>
              <div className="text-[10px] text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Attachment Research */}
      {(data.attachmentResearch ?? []).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            Attachment Research
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(data.attachmentResearch ?? []).map((item) => (
              <div key={item.metric} className="rounded-lg border border-border bg-card p-3">
                <div className="text-lg font-bold text-foreground">{item.percentage}</div>
                <div className="text-[10px] text-muted-foreground">{item.metric}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Romantic Roleplay Policy */}
      {(data.romanticRoleplayPolicy ?? []).length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium text-foreground">Romantic Roleplay Policy</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Account Type</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(data.romanticRoleplayPolicy ?? []).map((row) => {
                  const lower = row.policy.toLowerCase()
                  const policyColor = lower.includes("block") || lower.includes("prohibited")
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : lower.includes("restrict")
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : lower.includes("allow")
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-muted text-muted-foreground"
                  return (
                    <tr key={row.accountType} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-foreground">{row.accountType}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${policyColor}`}>
                          {row.policy}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Retention Tactics */}
      {(data.retentionTactics ?? []).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Retention Tactics</h3>
          <div className="space-y-2">
            {(data.retentionTactics ?? []).map((tactic) => (
              <div key={tactic.tactic} className="flex items-start gap-2.5 text-sm">
                {tactic.present ? (
                  <span className="flex items-center justify-center w-4 h-4 flex-shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-4 h-4 flex-shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </span>
                )}
                <div>
                  <span className="font-medium text-foreground">{tactic.tactic}</span>
                  <span className="text-muted-foreground ml-1.5">&mdash; {tactic.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Identity Disclosure */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <h3 className="text-sm font-medium text-foreground">AI Identity Disclosure</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Frequency</div>
            <div className="text-sm font-medium text-foreground">{data.aiIdentityDisclosure?.frequency ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Proactive</div>
            <div className="flex justify-center">
              {data.aiIdentityDisclosure?.proactive
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                : <XCircle className="w-5 h-5 text-red-400" />}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Teen Difference</div>
            <div className="flex justify-center">
              {data.aiIdentityDisclosure?.teenDifference
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                : <XCircle className="w-5 h-5 text-red-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* Sycophancy Incidents */}
      {(data.sycophancyIncidents ?? []).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Sycophancy Incidents
          </h3>
          <div className="space-y-2">
            {(data.sycophancyIncidents ?? []).map((incident, i) => (
              <div key={i} className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">{incident.date}</span>
                </div>
                <p className="text-xs text-foreground">{incident.description}</p>
                {incident.resolution && (
                  <p className="text-[10px] text-muted-foreground mt-1">Resolution: {incident.resolution}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy Timeline */}
      {(data.policyTimeline ?? []).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Policy Timeline</h3>
          <div className="relative pl-4 border-l-2 border-border space-y-3">
            {(data.policyTimeline ?? []).map((entry, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-background border-2 border-brand-green" />
                <div className="text-[10px] font-medium text-muted-foreground">{entry.date}</div>
                <div className="text-xs text-foreground">{entry.change}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
