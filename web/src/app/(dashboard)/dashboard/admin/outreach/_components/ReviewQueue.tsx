"use client"

import { useCallback, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { OutreachPendingEmail } from "@/lib/admin/types"
import { PersonaBadge, getPersonaBorderClass } from "./PersonaBadge"

const STEP_LABELS = ["Initial", "Follow-up 1", "Follow-up 2", "Final"]

function getEmailPersona(email: OutreachPendingEmail): "jake" | "alex" {
  if (email.google_account_key === "jake") return "jake"
  return "alex"
}

interface ReviewQueueProps {
  emails: OutreachPendingEmail[]
  loading: boolean
  drafting: boolean
  hasContacts: boolean
  onRefresh: () => void
  onDraftNext: () => void
  onQueue: (id: string) => void
  onSend: (id: string) => void
  personaFilter?: "all" | "jake" | "alex"
}

export function ReviewQueue({ emails, loading, drafting, hasContacts, onRefresh, onDraftNext, onQueue, onSend, personaFilter }: ReviewQueueProps) {
  const { getToken } = useApi()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState("")
  const [editBody, setEditBody] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleApprove = useCallback(async (id: string) => {
    setActionLoading(id)
    try {
      const token = (await getToken()) ?? undefined
      await api.approvePendingEmail(id, token)
      onRefresh()
    } catch { /* ignore */ }
    finally { setActionLoading(null) }
  }, [getToken, onRefresh])

  const handleReject = useCallback(async (id: string) => {
    setActionLoading(id)
    try {
      const token = (await getToken()) ?? undefined
      await api.rejectPendingEmail(id, token)
      onRefresh()
    } catch { /* ignore */ }
    finally { setActionLoading(null) }
  }, [getToken, onRefresh])

  const handleQueue = useCallback(async (id: string) => {
    setActionLoading(id)
    try {
      onQueue(id)
    } finally {
      setActionLoading(null)
    }
  }, [onQueue])

  const handleSend = useCallback(async (id: string) => {
    setActionLoading(id)
    try {
      onSend(id)
    } finally {
      setActionLoading(null)
    }
  }, [onSend])

  const handleStartEdit = useCallback((email: OutreachPendingEmail) => {
    setEditingId(email.id)
    setEditSubject(email.subject)
    setEditBody(email.body)
  }, [])

  const handleSaveEdit = useCallback(async (id: string) => {
    setActionLoading(id)
    try {
      const token = (await getToken()) ?? undefined
      await api.editPendingEmail(id, { subject: editSubject, body: editBody }, token)
      setEditingId(null)
      onRefresh()
    } catch { /* ignore */ }
    finally { setActionLoading(null) }
  }, [getToken, editSubject, editBody, onRefresh])

  const filteredEmails = personaFilter && personaFilter !== "all"
    ? emails.filter((e) => getEmailPersona(e) === personaFilter)
    : emails

  const pendingReview = filteredEmails.filter((e) => e.status === "pending_review").sort((a, b) => {
    const aP = getEmailPersona(a) === "jake" ? 0 : 1
    const bP = getEmailPersona(b) === "jake" ? 0 : 1
    return aP - bP
  })
  const queued = filteredEmails.filter((e) => e.status === "approved").sort((a, b) => {
    const aP = getEmailPersona(a) === "jake" ? 0 : 1
    const bP = getEmailPersona(b) === "jake" ? 0 : 1
    return aP - bP
  })

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-display text-lg font-semibold">Review</h2>
        {filteredEmails.length > 0 && (
          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums">
            {filteredEmails.length}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="plaid-card text-center py-12">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
        </div>
      )}

      {/* Empty state — drafting in progress */}
      {!loading && filteredEmails.length === 0 && drafting && (
        <div className="plaid-card text-center py-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Alex is drafting an email...</span>
          </div>
        </div>
      )}

      {/* Empty state — ready to draft */}
      {!loading && filteredEmails.length === 0 && !drafting && (
        <div className="plaid-card text-center py-12 space-y-3">
          <p className="text-sm text-muted-foreground">No emails to review.</p>
          {hasContacts && (
            <button
              onClick={onDraftNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "hsl(157, 100%, 42%)" }}
            >
              <Sparkles className="w-4 h-4" />
              Draft Next Email
            </button>
          )}
        </div>
      )}

      {/* Email cards */}
      {!loading && filteredEmails.length > 0 && (
        <div className="space-y-3">
          {/* Pending review emails */}
          {pendingReview.map((email) => (
            <div key={email.id} className={`plaid-card p-4 space-y-3 border-l-4 ${getPersonaBorderClass(getEmailPersona(email))}`}>
              {/* Header: contact info + step badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <PersonaBadge persona={getEmailPersona(email)} />
                  <span className="text-sm font-medium truncate">{email.contact_name}</span>
                  {email.contact_org && (
                    <span className="text-sm text-muted-foreground truncate">&middot; {email.contact_org}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {(() => {
                    const p = getEmailPersona(email)
                    const label = p === "jake" ? "Jake" : "Alex"
                    return (
                      <span className="text-xs text-muted-foreground">via {label}</span>
                    )
                  })()}
                  <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium">
                    {STEP_LABELS[email.step_number] ?? `Step ${email.step_number + 1}`}
                  </span>
                </div>
              </div>

              {editingId === email.id ? (
                /* Editing mode */
                <>
                  <input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="plaid-input text-sm font-semibold"
                    placeholder="Subject"
                    autoFocus
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={10}
                    className="plaid-input text-sm leading-relaxed"
                    placeholder="Email body"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSaveEdit(email.id)}
                      disabled={actionLoading === email.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "hsl(157, 100%, 42%)" }}
                    >
                      {actionLoading === email.id ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                /* Display mode */
                <>
                  <div className="text-sm font-semibold">{email.subject}</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {email.body}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(email.id)}
                      disabled={actionLoading === email.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "hsl(157, 100%, 42%)" }}
                    >
                      {actionLoading === email.id ? "Sending..." : "Approve & Send"}
                    </button>
                    <button
                      onClick={() => handleQueue(email.id)}
                      disabled={actionLoading === email.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Queue
                    </button>
                    <button
                      onClick={() => handleStartEdit(email)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleReject(email.id)}
                      disabled={actionLoading === email.id}
                      className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Queued emails */}
          {queued.map((email) => (
            <div key={email.id} className={`plaid-card p-4 space-y-3 border-l-4 ${getPersonaBorderClass(getEmailPersona(email))}`}>
              {/* Header: contact info + step badge + queued badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <PersonaBadge persona={getEmailPersona(email)} />
                  <span className="text-sm font-medium truncate">{email.contact_name}</span>
                  {email.contact_org && (
                    <span className="text-sm text-muted-foreground truncate">&middot; {email.contact_org}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {(() => {
                    const p = getEmailPersona(email)
                    const label = p === "jake" ? "Jake" : "Alex"
                    return (
                      <span className="text-xs text-muted-foreground">via {label}</span>
                    )
                  })()}
                  <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                    Queued
                  </span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium">
                    {STEP_LABELS[email.step_number] ?? `Step ${email.step_number + 1}`}
                  </span>
                </div>
              </div>

              {editingId === email.id ? (
                <>
                  <input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="plaid-input text-sm font-semibold"
                    placeholder="Subject"
                    autoFocus
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={10}
                    className="plaid-input text-sm leading-relaxed"
                    placeholder="Email body"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSaveEdit(email.id)}
                      disabled={actionLoading === email.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "hsl(157, 100%, 42%)" }}
                    >
                      {actionLoading === email.id ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold">{email.subject}</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {email.body}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSend(email.id)}
                      disabled={actionLoading === email.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "hsl(157, 100%, 42%)" }}
                    >
                      {actionLoading === email.id ? "Sending..." : "Send Now"}
                    </button>
                    <button
                      onClick={() => handleStartEdit(email)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleReject(email.id)}
                      disabled={actionLoading === email.id}
                      className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Draft next button below existing emails */}
          {hasContacts && (
            <div className="text-center pt-1">
              <button
                onClick={onDraftNext}
                disabled={drafting}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {drafting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Drafting...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> Draft another</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
