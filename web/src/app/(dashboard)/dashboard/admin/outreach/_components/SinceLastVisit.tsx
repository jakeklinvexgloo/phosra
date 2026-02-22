"use client"

import { Mail, Send, MessageSquare, Calendar } from "lucide-react"
import type { OutreachActivitySummary } from "@/lib/admin/types"

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface SinceLastVisitProps {
  summary: OutreachActivitySummary | null
  lastVisit: string | null
}

export function SinceLastVisit({ summary, lastVisit }: SinceLastVisitProps) {
  if (!summary || !lastVisit) return null

  const total = summary.emails_drafted + summary.emails_sent + summary.replies_received + summary.meetings_proposed
  if (total === 0) return null

  const stats = [
    { label: "Emails drafted", value: summary.emails_drafted, icon: Mail, show: summary.emails_drafted > 0 },
    { label: "Sent", value: summary.emails_sent, icon: Send, show: summary.emails_sent > 0 },
    { label: "Replies", value: summary.replies_received, icon: MessageSquare, show: summary.replies_received > 0 },
    { label: "Meetings proposed", value: summary.meetings_proposed, icon: Calendar, show: summary.meetings_proposed > 0 },
  ].filter((s) => s.show)

  return (
    <div className="plaid-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">Since Last Visit</span>
        <span className="text-xs text-muted-foreground">{relativeTime(lastVisit)}</span>
      </div>
      <div className="flex gap-4 flex-wrap">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <s.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg font-semibold tabular-nums">{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
