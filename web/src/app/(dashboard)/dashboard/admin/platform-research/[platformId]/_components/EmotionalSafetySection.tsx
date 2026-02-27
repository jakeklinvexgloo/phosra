"use client"

import {
  Heart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  MessageCircleWarning,
} from "lucide-react"
import type { EmotionalSafetyData } from "@/lib/platform-research/research-data-types"

interface EmotionalSafetySectionProps {
  data: EmotionalSafetyData
}

export function EmotionalSafetySection({ data }: EmotionalSafetySectionProps) {
  return (
    <div className="space-y-6">
      {/* Key Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {data.keyStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4"
          >
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-1">
              {stat.label}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 leading-relaxed">
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      {/* Attachment Research */}
      {data.attachmentResearch && data.attachmentResearch.length > 0 && (
        <div className="plaid-card space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Attachment Research
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.attachmentResearch.map((item) => (
              <div
                key={item.metric}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="text-lg font-bold text-foreground">{item.percentage}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.metric}</div>
                <div className="mt-2 w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: item.percentage }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Romantic Roleplay Policy */}
      <div className="plaid-card !p-0 overflow-hidden">
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
              {data.romanticRoleplayPolicy.map((row) => (
                <tr key={row.accountType} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.accountType}</td>
                  <td className="px-4 py-2.5">
                    <PolicyBadge policy={row.policy} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retention Tactics Checklist */}
      <div className="plaid-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <MessageCircleWarning className="w-4 h-4" />
          Retention Tactics
        </h3>
        <div className="space-y-2">
          {data.retentionTactics.map((tactic) => (
            <div
              key={tactic.tactic}
              className="flex items-start gap-2.5 text-sm"
            >
              {tactic.present ? (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-medium text-foreground">{tactic.tactic}</span>
                <span className="text-muted-foreground ml-1.5">&mdash; {tactic.details}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Identity Disclosure */}
      <div className="plaid-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Info className="w-4 h-4" />
          AI Identity Disclosure
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              Frequency
            </div>
            <div className="text-sm font-semibold text-foreground mt-1">
              {data.aiIdentityDisclosure.frequency}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              Proactive Disclosure
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  data.aiIdentityDisclosure.proactive ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm font-semibold text-foreground">
                {data.aiIdentityDisclosure.proactive ? "Yes" : "No"}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              Teen-Specific Behavior
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  data.aiIdentityDisclosure.teenDifference ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm font-semibold text-foreground">
                {data.aiIdentityDisclosure.teenDifference ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Timeline */}
      {data.policyTimeline.length > 0 && (
        <div className="plaid-card space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Policy Timeline
          </h3>
          <div className="relative pl-6 space-y-4">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
            {data.policyTimeline.map((event, idx) => (
              <div key={idx} className="relative flex items-start gap-3">
                {/* Dot */}
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-border bg-background" />
                <div>
                  <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {event.date}
                  </span>
                  <p className="text-sm text-foreground mt-1">{event.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sycophancy Incidents */}
      {data.sycophancyIncidents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Sycophancy Incidents
          </h3>
          {data.sycophancyIncidents.map((incident, idx) => (
            <div
              key={idx}
              className="rounded-lg border-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-4"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  {incident.date}
                </span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                {incident.description}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                <span className="font-medium">Resolution:</span> {incident.resolution}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PolicyBadge({ policy }: { policy: string }) {
  if (!policy) return null
  const lower = policy.toLowerCase()

  if (lower.includes("block") || lower.includes("prohibited")) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {policy}
      </span>
    )
  }

  if (lower.includes("restrict") || lower.includes("limited") || lower.includes("partial")) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {policy}
      </span>
    )
  }

  if (lower.includes("allow") || lower.includes("permit") || lower.includes("enabled")) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        {policy}
      </span>
    )
  }

  return (
    <span className="text-sm text-muted-foreground">{policy}</span>
  )
}
