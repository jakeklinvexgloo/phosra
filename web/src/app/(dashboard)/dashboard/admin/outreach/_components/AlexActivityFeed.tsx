"use client"

import { ChevronRight, Mail, MessageSquare, Phone, Calendar, FileText, Send, Brain, MailOpen } from "lucide-react"
import type { OutreachActivityWithContact, OutreachActivityType } from "@/lib/admin/types"

function timeAgo(d: string): string {
  const ms = Date.now() - new Date(d).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function dateLabel(d: string): string {
  const date = new Date(d)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

const ACTIVITY_ICONS: Record<OutreachActivityType, typeof Mail> = {
  email_sent: Send,
  linkedin_message: MessageSquare,
  call: Phone,
  meeting: Calendar,
  note: FileText,
  auto_followup_sent: Mail,
  intent_classified: Brain,
  meeting_proposed: Calendar,
  email_received: MailOpen,
}

const ACTIVITY_DESCRIPTIONS: Record<OutreachActivityType, string> = {
  email_sent: "Sent email to",
  linkedin_message: "Sent LinkedIn message to",
  call: "Called",
  meeting: "Meeting with",
  note: "Added note for",
  auto_followup_sent: "Auto follow-up sent to",
  intent_classified: "Classified intent for",
  meeting_proposed: "Proposed meeting with",
  email_received: "Received reply from",
}

interface AlexActivityFeedProps {
  activities: OutreachActivityWithContact[]
  open: boolean
  onToggle: () => void
}

export function AlexActivityFeed({ activities, open, onToggle }: AlexActivityFeedProps) {
  // Group activities by date
  const grouped = activities.reduce<Record<string, OutreachActivityWithContact[]>>((acc, a) => {
    const label = dateLabel(a.created_at)
    if (!acc[label]) acc[label] = []
    acc[label].push(a)
    return acc
  }, {})

  return (
    <div className="plaid-card p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
          <span className="text-sm font-semibold">Alex&apos;s Activity</span>
          {activities.length > 0 && (
            <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded-full tabular-nums">
              {activities.length}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No recent activity.</p>
          ) : (
            <div className="divide-y divide-border">
              {Object.entries(grouped).map(([label, items]) => (
                <div key={label}>
                  <div className="px-4 py-2 bg-muted/20">
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {items.map((a) => {
                      const Icon = ACTIVITY_ICONS[a.activity_type] || FileText
                      const desc = ACTIVITY_DESCRIPTIONS[a.activity_type] || "Activity for"
                      return (
                        <div key={a.id} className="flex items-start gap-3 px-4 py-2.5">
                          <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="text-muted-foreground">{desc}</span>{" "}
                              <span className="font-medium">{a.contact_name}</span>
                              {a.contact_org && (
                                <span className="text-muted-foreground"> at {a.contact_org}</span>
                              )}
                            </p>
                            {a.subject && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{a.subject}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap flex-shrink-0">
                            {timeAgo(a.created_at)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
