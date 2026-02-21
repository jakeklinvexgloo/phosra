"use client"

import { ChevronRight, ChevronDown, Loader2, ExternalLink } from "lucide-react"
import type { OutreachSequence, GmailMessage } from "@/lib/admin/types"

function timeAgo(d?: string): string {
  if (!d) return ""
  const ms = Date.now() - new Date(d).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function getNextAction(seq: OutreachSequence): string {
  if (seq.next_action_at) {
    const diffMs = new Date(seq.next_action_at).getTime() - Date.now()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return "Follow-up due"
    return `Follow-up in ${diffDays}d`
  }
  return "Awaiting reply"
}

function getStatusPill(seq: OutreachSequence): { label: string; className: string } {
  // Check if there's a next action pending (follow-up scheduled)
  if (seq.next_action_at) {
    const due = new Date(seq.next_action_at).getTime()
    if (due <= Date.now()) {
      return { label: "Follow-up Due", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" }
    }
  }
  // Sent but awaiting reply
  if (seq.current_step > 0 || seq.last_sent_at) {
    return { label: "Sent", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" }
  }
  return { label: "Pending", className: "bg-muted text-muted-foreground" }
}

function formatGmailDate(d?: string): string {
  if (!d) return ""
  const date = new Date(d)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function extractName(from: string): string {
  const match = from.match(/^(.+?)\s*</)
  return match ? match[1].replace(/"/g, "") : from.split("@")[0]
}

interface ActiveConversationsProps {
  sequences: OutreachSequence[]
  open: boolean
  onToggle: () => void
  expandedContactId: string | null
  onExpandContact: (contactId: string, email?: string) => void
  gmailThreads: GmailMessage[]
  gmailLoading: boolean
}

export function ActiveConversations({
  sequences,
  open,
  onToggle,
  expandedContactId,
  onExpandContact,
  gmailThreads,
  gmailLoading,
}: ActiveConversationsProps) {
  return (
    <div className="plaid-card p-0 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
          <span className="text-sm font-semibold">Active</span>
          {sequences.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full tabular-nums">
              {sequences.length}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t">
          {sequences.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No active conversations.</p>
          ) : (
            <div className="divide-y divide-border">
              {sequences.map((seq) => {
                const pill = getStatusPill(seq)
                const isExpanded = expandedContactId === seq.contact_id

                return (
                  <div key={seq.id}>
                    {/* Row */}
                    <button
                      onClick={() => onExpandContact(seq.contact_id, seq.contact_email || undefined)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors ${
                        isExpanded ? "bg-muted/20" : ""
                      }`}
                    >
                      {/* Name + org */}
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{seq.contact_name}</span>
                        {seq.contact_org && (
                          <span className="text-sm text-muted-foreground truncate">&middot; {seq.contact_org}</span>
                        )}
                      </div>

                      {/* Status pill */}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${pill.className}`}>
                        {pill.label}
                      </span>

                      {/* Relative time */}
                      {seq.last_sent_at && (
                        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap flex-shrink-0 hidden sm:block">
                          {timeAgo(seq.last_sent_at)}
                        </span>
                      )}

                      {/* Next action */}
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 hidden md:block">
                        {getNextAction(seq)}
                      </span>

                      {/* Chevron */}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>

                    {/* Expanded: Gmail thread */}
                    {isExpanded && (
                      <div className="px-4 py-3 bg-muted/10 border-t">
                        {gmailLoading ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground py-4 justify-center">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Loading email thread...
                          </div>
                        ) : gmailThreads.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No email history found.</p>
                        ) : (
                          <div className="space-y-2">
                            {gmailThreads.map((msg) => (
                              <div key={msg.id} className="rounded-lg border bg-background p-3 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs font-medium truncate">{extractName(msg.from)}</span>
                                    {msg.labels?.includes("DRAFT") && (
                                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                                        Draft
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-muted-foreground tabular-nums flex-shrink-0">
                                    {formatGmailDate(msg.date)}
                                  </span>
                                </div>
                                <div className="text-xs font-medium">{msg.subject}</div>
                                <div className="text-xs text-muted-foreground leading-relaxed">
                                  {msg.snippet}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
