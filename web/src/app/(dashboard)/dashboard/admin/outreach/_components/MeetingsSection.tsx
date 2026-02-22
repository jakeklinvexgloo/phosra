"use client"

import { ChevronRight, Calendar } from "lucide-react"
import type { OutreachActivityWithContact } from "@/lib/admin/types"

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

interface MeetingsSectionProps {
  meetings: OutreachActivityWithContact[]
  open: boolean
  onToggle: () => void
}

export function MeetingsSection({ meetings, open, onToggle }: MeetingsSectionProps) {
  return (
    <div className="plaid-card p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
          <span className="text-sm font-semibold">Meetings</span>
          {meetings.length > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded-full tabular-nums">
              {meetings.length}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t">
          {meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No meetings proposed yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {meetings.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{m.contact_name}</span>
                      {m.contact_org && (
                        <span className="text-sm text-muted-foreground truncate">&middot; {m.contact_org}</span>
                      )}
                    </div>
                    {m.subject && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{m.subject}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap flex-shrink-0">
                    {timeAgo(m.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
