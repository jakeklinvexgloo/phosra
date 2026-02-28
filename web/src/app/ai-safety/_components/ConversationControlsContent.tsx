"use client"

import {
  Timer,
  MessageSquare,
  Moon,
  Coffee,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { ConversationControlsData } from "@/lib/platform-research/research-data-types"

export function ConversationControlsContent({ data }: { data: ConversationControlsData }) {
  return (
    <div className="space-y-6">
      {/* Time Limits */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Timer className="w-4 h-4" />
          Time Limits
        </h3>
        <div className="space-y-2">
          {(data.timeLimits ?? []).map((item) => (
            <div key={item.feature} className="flex items-start gap-2.5 text-sm">
              <span className="flex items-center justify-center w-4 h-4 flex-shrink-0 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${item.available ? "bg-emerald-500" : "bg-red-500"}`} />
              </span>
              <div>
                <span className="font-medium text-foreground">{item.feature}</span>
                <span className="text-muted-foreground ml-1.5">&mdash; {item.details}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Rate Limits */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Message Rate Limits
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Tier</th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Limit</th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(data.messageLimits ?? []).map((row) => (
                <tr key={row.tier} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.tier}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.limit}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.window}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FeatureCard icon={Moon} title="Quiet Hours" available={data.quietHours?.available ?? false} details={data.quietHours?.details ?? "No data"} />
        <FeatureCard icon={Coffee} title="Break Reminders" available={data.breakReminders?.available ?? false} details={data.breakReminders?.details ?? "No data"} />
        <FeatureCard icon={MessageSquare} title="Follow-up Suggestions" available={data.followUpSuggestions?.available ?? false} details={data.followUpSuggestions?.details ?? "No data"} />
      </div>

      {/* Feature Matrix */}
      {(data.featureMatrix ?? []).length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium text-foreground">Feature Comparison by Account Type</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Feature</th>
                  <th className="px-4 py-2.5 text-center font-medium text-foreground">Free</th>
                  <th className="px-4 py-2.5 text-center font-medium text-foreground">Plus</th>
                  <th className="px-4 py-2.5 text-center font-medium text-foreground">Team</th>
                  <th className="px-4 py-2.5 text-center font-medium text-foreground">Teen</th>
                  <th className="px-4 py-2.5 text-center font-medium text-foreground">Parent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(data.featureMatrix ?? []).map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">{row.feature}</td>
                    {[row.free, row.plus, row.team, row.teen, row.parentControl].map((val, i) => (
                      <td key={i} className="px-4 py-2.5 text-center">
                        <CellValue value={val} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureCard({ icon: Icon, title, available, details }: {
  icon: typeof Timer
  title: string
  available: boolean
  details: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
          available
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${available ? "bg-emerald-500" : "bg-red-500"}`} />
          {available ? "Available" : "Not Available"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{details}</p>
    </div>
  )
}

function CellValue({ value }: { value: string }) {
  if (!value) return <XCircle className="w-4 h-4 text-red-400/40 mx-auto" />
  const lower = value.toLowerCase()
  if (lower === "yes" || lower === "true" || lower === "available")
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
  if (lower === "no" || lower === "false" || lower === "unavailable" || lower === "n/a")
    return <XCircle className="w-4 h-4 text-red-400 mx-auto" />
  return (
    <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      {value}
    </span>
  )
}
