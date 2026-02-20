"use client"

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import type { OutreachContact, OutreachStatus, EmailStatus } from "@/lib/admin/types"
import { OUTREACH_STATUS_META, EMAIL_STATUS_META } from "@/lib/admin/types"
import { ContactDetail } from "./ContactDetail"
import type { GmailMessage, OutreachActivity } from "@/lib/admin/types"

export type SortField = "name" | "org" | "relevance" | "priority" | "last_contact" | "followup"

const PRIORITY_LABELS: Record<number, string> = { 1: "P1", 2: "P2", 3: "P3" }
const PRIORITY_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  3: "bg-muted text-muted-foreground",
}

const ALL_STATUSES: OutreachStatus[] = ["not_contacted", "draft_ready", "reached_out", "in_conversation", "partnership", "declined"]
const ALL_EMAIL_STATUSES: EmailStatus[] = ["none", "draft_ready", "emailed", "awaiting_reply", "replied", "bounced"]

function formatDate(d?: string) {
  if (!d) return "\u2014"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getFollowupBadge(followupDate?: string): { label: string; className: string } | null {
  if (!followupDate) return null
  const now = new Date()
  const followup = new Date(followupDate)
  const diffMs = followup.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)}d overdue`, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" }
  }
  if (diffDays === 0) {
    return { label: "due today", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" }
  }
  return { label: `in ${diffDays}d`, className: "bg-muted text-muted-foreground" }
}

export function getNextAction(contact: OutreachContact): { label: string; className: string } {
  if (contact.next_followup_at && new Date(contact.next_followup_at) < new Date()) {
    return { label: "Follow up (overdue)", className: "text-red-600 dark:text-red-400" }
  }
  if (contact.status === "not_contacted" && contact.email_status === "none") {
    return { label: "Send initial email", className: "text-blue-600 dark:text-blue-400" }
  }
  if (contact.email_status === "draft_ready") {
    return { label: "Review & send draft", className: "text-purple-600 dark:text-purple-400" }
  }
  if (contact.email_status === "awaiting_reply") {
    const daysSince = contact.last_contact_at
      ? Math.round((Date.now() - new Date(contact.last_contact_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    return { label: `Waiting for reply ${daysSince}d`, className: "text-amber-600 dark:text-amber-400" }
  }
  if (contact.email_status === "replied") {
    return { label: "Schedule meeting", className: "text-brand-green" }
  }
  if (contact.status === "in_conversation") {
    return { label: "Continue conversation", className: "text-amber-600 dark:text-amber-400" }
  }
  return { label: "Review", className: "text-muted-foreground" }
}

interface OutreachTableProps {
  contacts: OutreachContact[]
  sortField: SortField
  sortDir: "asc" | "desc"
  toggleSort: (field: SortField) => void
  selectedIds: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: () => void
  expandedId: string | null
  onExpand: (contact: OutreachContact) => void
  focusedIndex: number
  updatingId: string | null
  onStatusChange: (contact: OutreachContact, status: OutreachStatus) => void
  onEmailStatusChange: (contact: OutreachContact, emailStatus: EmailStatus) => void
  onTagClick: (tag: string) => void
  // Detail panel props
  expandedActivities: OutreachActivity[]
  gmailThreads: GmailMessage[]
  gmailLoading: boolean
  gmailConnected: boolean
  expandedMessageId: string | null
  expandedMessage: GmailMessage | null
  onExpandMessage: (msg: GmailMessage) => void
  onAddNote: (contactId: string, note: string) => void
  onSendEmail: (to: string, subject: string, body: string, contactId: string) => void
  sendingEmail: boolean
}

function SortHeader({
  field, children, sortField, sortDir, toggleSort, className = "",
}: {
  field: SortField
  children: React.ReactNode
  sortField: SortField
  sortDir: "asc" | "desc"
  toggleSort: (f: SortField) => void
  className?: string
}) {
  return (
    <div
      className={`cursor-pointer select-none hover:text-foreground transition inline-flex items-center gap-1 ${className}`}
      onClick={() => toggleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      ) : (
        <ChevronDown className="w-3 h-3 opacity-0" />
      )}
    </div>
  )
}

export function OutreachTable({
  contacts, sortField, sortDir, toggleSort,
  selectedIds, toggleSelect, toggleSelectAll,
  expandedId, onExpand, focusedIndex,
  updatingId, onStatusChange, onEmailStatusChange,
  onTagClick,
  expandedActivities, gmailThreads, gmailLoading, gmailConnected,
  expandedMessageId, expandedMessage, onExpandMessage,
  onAddNote, onSendEmail, sendingEmail,
}: OutreachTableProps) {
  const allSelected = contacts.length > 0 && contacts.every((c) => selectedIds.has(c.id))

  return (
    <div className="plaid-card p-0 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[32px_28px_1fr_1fr_80px_120px_100px_100px_100px_36px] gap-2 px-5 py-2.5 border-b border-border text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="w-3.5 h-3.5 rounded border-border cursor-pointer accent-foreground"
          />
        </div>
        <div></div>
        <SortHeader field="name" sortField={sortField} sortDir={sortDir} toggleSort={toggleSort}>Name</SortHeader>
        <SortHeader field="org" sortField={sortField} sortDir={sortDir} toggleSort={toggleSort}>Org</SortHeader>
        <SortHeader field="relevance" sortField={sortField} sortDir={sortDir} toggleSort={toggleSort}>Rel</SortHeader>
        <SortHeader field="followup" sortField={sortField} sortDir={sortDir} toggleSort={toggleSort}>Follow-up</SortHeader>
        <div>Status</div>
        <div>Email</div>
        <SortHeader field="last_contact" sortField={sortField} sortDir={sortDir} toggleSort={toggleSort}>Last</SortHeader>
        <div></div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {contacts.map((contact, idx) => {
          const followup = getFollowupBadge(contact.next_followup_at)
          const action = getNextAction(contact)
          const isFocused = idx === focusedIndex

          return (
            <div key={contact.id}>
              <div
                className={`grid grid-cols-[32px_28px_1fr_1fr_80px_120px_100px_100px_100px_36px] gap-2 px-5 py-3 items-center cursor-pointer hover:bg-muted/30 transition-colors ${
                  isFocused ? "ring-1 ring-inset ring-foreground/20 bg-muted/20" : ""
                } ${followup && followup.label.includes("overdue") ? "bg-amber-50/50 dark:bg-amber-900/5" : ""}`}
                onClick={() => onExpand(contact)}
              >
                {/* Checkbox */}
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(contact.id)}
                    onChange={() => toggleSelect(contact.id)}
                    className="w-3.5 h-3.5 rounded border-border cursor-pointer accent-foreground"
                  />
                </div>

                {/* Priority tier */}
                <div className="flex items-center">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_COLORS[contact.priority_tier] || PRIORITY_COLORS[3]}`}>
                    {PRIORITY_LABELS[contact.priority_tier] || "P3"}
                  </span>
                </div>

                {/* Name + next action */}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{contact.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground truncate">{contact.title}</span>
                    <span className={`text-[10px] font-medium ${action.className} whitespace-nowrap`}>{action.label}</span>
                  </div>
                </div>

                {/* Org */}
                <div className="text-sm text-muted-foreground truncate">{contact.org}</div>

                {/* Relevance bar */}
                <div className="flex items-center gap-1.5">
                  {contact.relevance_score != null ? (
                    <>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            contact.relevance_score >= 80 ? "bg-brand-green" : contact.relevance_score >= 50 ? "bg-amber-500" : "bg-muted-foreground/40"
                          }`}
                          style={{ width: `${contact.relevance_score}%` }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground">{contact.relevance_score}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">&mdash;</span>
                  )}
                </div>

                {/* Follow-up badge */}
                <div>
                  {followup ? (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${followup.className}`}>
                      {followup.label}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">&mdash;</span>
                  )}
                </div>

                {/* Status */}
                <div onClick={(e) => e.stopPropagation()}>
                  <select
                    value={contact.status}
                    onChange={(e) => onStatusChange(contact, e.target.value as OutreachStatus)}
                    disabled={updatingId === contact.id}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${OUTREACH_STATUS_META[contact.status]?.color || "bg-muted text-muted-foreground"}`}
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{OUTREACH_STATUS_META[s].label}</option>
                    ))}
                  </select>
                </div>

                {/* Email status */}
                <div onClick={(e) => e.stopPropagation()}>
                  <select
                    value={contact.email_status}
                    onChange={(e) => onEmailStatusChange(contact, e.target.value as EmailStatus)}
                    disabled={updatingId === contact.id}
                    className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer bg-transparent ${EMAIL_STATUS_META[contact.email_status]?.color || "text-muted-foreground"}`}
                  >
                    {ALL_EMAIL_STATUSES.map((s) => (
                      <option key={s} value={s}>{EMAIL_STATUS_META[s].label}</option>
                    ))}
                  </select>
                </div>

                {/* Last contact */}
                <div className="text-xs text-muted-foreground tabular-nums">
                  {formatDate(contact.last_contact_at)}
                </div>

                {/* Expand chevron */}
                <div className="flex items-center justify-center">
                  {expandedId === contact.id ? (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === contact.id && (
                <ContactDetail
                  contact={contact}
                  activities={expandedActivities}
                  gmailThreads={gmailThreads}
                  gmailLoading={gmailLoading}
                  gmailConnected={gmailConnected}
                  expandedMessageId={expandedMessageId}
                  expandedMessage={expandedMessage}
                  onExpandMessage={onExpandMessage}
                  onAddNote={onAddNote}
                  onSendEmail={onSendEmail}
                  sendingEmail={sendingEmail}
                  onTagClick={onTagClick}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-border text-xs text-muted-foreground">
        {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
        {selectedIds.size > 0 && <span className="ml-2 font-medium text-foreground">&middot; {selectedIds.size} selected</span>}
      </div>
    </div>
  )
}
