"use client"

import { useCallback, useState } from "react"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { OutreachPendingEmail } from "@/lib/admin/types"

const STEP_LABELS = ["Initial", "Follow-up 1", "Follow-up 2", "Final"]

interface ReviewQueueProps {
  emails: OutreachPendingEmail[]
  loading: boolean
  onRefresh: () => void
}

export function ReviewQueue({ emails, loading, onRefresh }: ReviewQueueProps) {
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

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-display text-lg font-semibold">Review</h2>
        {emails.length > 0 && (
          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums">
            {emails.length}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="plaid-card text-center py-12">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!loading && emails.length === 0 && (
        <div className="plaid-card text-center py-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">No emails to review &mdash; Alex is drafting...</span>
          </div>
        </div>
      )}

      {/* Email cards */}
      {!loading && emails.length > 0 && (
        <div className="space-y-3">
          {emails.map((email) => (
            <div key={email.id} className="plaid-card p-4 space-y-3">
              {/* Header: contact info + step badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium truncate">{email.contact_name}</span>
                  {email.contact_org && (
                    <span className="text-sm text-muted-foreground truncate">&middot; {email.contact_org}</span>
                  )}
                </div>
                <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium flex-shrink-0 ml-2">
                  {STEP_LABELS[email.step_number] ?? `Step ${email.step_number + 1}`}
                </span>
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
        </div>
      )}
    </div>
  )
}
