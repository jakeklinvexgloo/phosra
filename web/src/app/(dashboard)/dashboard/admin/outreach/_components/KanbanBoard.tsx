"use client"

import { Mail } from "lucide-react"
import type { OutreachContact, OutreachStatus } from "@/lib/admin/types"
import { OUTREACH_STATUS_META, EMAIL_STATUS_META } from "@/lib/admin/types"
import { getNextAction } from "./OutreachTable"

const KANBAN_COLUMNS: OutreachStatus[] = ["not_contacted", "draft_ready", "reached_out", "in_conversation", "partnership", "declined"]

const PRIORITY_LABELS: Record<number, string> = { 1: "P1", 2: "P2", 3: "P3" }
const PRIORITY_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  3: "bg-muted text-muted-foreground",
}

interface KanbanBoardProps {
  contacts: OutreachContact[]
  onStatusChange: (contact: OutreachContact, status: OutreachStatus) => void
  onExpand: (contact: OutreachContact) => void
  updatingId: string | null
}

export function KanbanBoard({ contacts, onStatusChange, onExpand, updatingId }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-6 gap-3 min-h-[400px]">
      {KANBAN_COLUMNS.map((status) => {
        const meta = OUTREACH_STATUS_META[status]
        const columnContacts = contacts.filter((c) => c.status === status)

        return (
          <div key={status} className="flex flex-col">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={`w-2 h-2 rounded-full ${meta.dotColor}`} />
              <span className="text-xs font-semibold text-foreground">{meta.label}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">{columnContacts.length}</span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2">
              {columnContacts.map((contact) => {
                const action = getNextAction(contact)
                return (
                  <div
                    key={contact.id}
                    className="plaid-card p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onExpand(contact)}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="text-sm font-medium text-foreground truncate">{contact.name}</div>
                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded flex-shrink-0 ${PRIORITY_COLORS[contact.priority_tier] || PRIORITY_COLORS[3]}`}>
                        {PRIORITY_LABELS[contact.priority_tier] || "P3"}
                      </span>
                    </div>
                    {contact.org && (
                      <div className="text-xs text-muted-foreground truncate mb-1.5">{contact.org}</div>
                    )}
                    <div className="flex items-center gap-2">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className={`text-[10px] font-medium ${EMAIL_STATUS_META[contact.email_status]?.color || "text-muted-foreground"}`}>
                            {EMAIL_STATUS_META[contact.email_status]?.label || "\u2014"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`text-[10px] font-medium mt-1.5 ${action.className}`}>{action.label}</div>
                    {/* Status change dropdown */}
                    <div className="mt-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={contact.status}
                        onChange={(e) => onStatusChange(contact, e.target.value as OutreachStatus)}
                        disabled={updatingId === contact.id}
                        className="text-[10px] w-full bg-muted/50 rounded px-1.5 py-1 border-0 cursor-pointer text-muted-foreground"
                      >
                        {KANBAN_COLUMNS.map((s) => (
                          <option key={s} value={s}>{OUTREACH_STATUS_META[s].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )
              })}
              {columnContacts.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground/40">Empty</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
