"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { OutreachPendingEmail } from "@/lib/admin/types"

interface PendingReviewQueueProps {
  open: boolean
  onToggle: () => void
  onRefresh?: () => void
}

const STEP_LABELS = ["Initial", "Follow-up 1", "Follow-up 2", "Final"]

export function PendingReviewQueue({ open, onToggle, onRefresh }: PendingReviewQueueProps) {
  const { getToken } = useApi()
  const [emails, setEmails] = useState<OutreachPendingEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState("")
  const [editBody, setEditBody] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchEmails = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const data = await api.listPendingEmails("pending_review", token)
      setEmails(data)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    if (open) fetchEmails()
  }, [open, fetchEmails])

  const handleApprove = useCallback(async (id: string) => {
    setActionLoading(id)
    try {
      const token = (await getToken()) ?? undefined
      await api.approvePendingEmail(id, token)
      setEmails((prev) => prev.filter((e) => e.id !== id))
      onRefresh?.()
    } catch { /* ignore */ } finally {
      setActionLoading(null)
    }
  }, [getToken, onRefresh])

  const handleReject = useCallback(async (id: string) => {
    setActionLoading(id)
    try {
      const token = (await getToken()) ?? undefined
      await api.rejectPendingEmail(id, token)
      setEmails((prev) => prev.filter((e) => e.id !== id))
    } catch { /* ignore */ } finally {
      setActionLoading(null)
    }
  }, [getToken])

  const handleEdit = useCallback((email: OutreachPendingEmail) => {
    setEditingId(email.id)
    setEditSubject(email.subject)
    setEditBody(email.body)
  }, [])

  const handleSaveEdit = useCallback(async (id: string) => {
    setActionLoading(id)
    try {
      const token = (await getToken()) ?? undefined
      const updated = await api.editPendingEmail(id, { subject: editSubject, body: editBody }, token)
      setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)))
      setEditingId(null)
    } catch { /* ignore */ } finally {
      setActionLoading(null)
    }
  }, [getToken, editSubject, editBody])

  return (
    <div className="plaid-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          <svg className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-medium">Pending Review</span>
          {emails.length > 0 && (
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-medium px-2 py-0.5 rounded-full">
              {emails.length}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t px-4 pb-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center animate-pulse">Loading...</p>
          ) : emails.length === 0 ? (
            <div className="text-center py-6">
              <svg className="mx-auto h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-muted-foreground">No emails pending review</p>
            </div>
          ) : (
            <div className="space-y-3 pt-3">
              {emails.map((email) => (
                <div key={email.id} className="border rounded-lg p-3 space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{email.contact_name}</span>
                      <span className="text-xs text-muted-foreground">{email.contact_org}</span>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {STEP_LABELS[email.step_number] || `Step ${email.step_number}`}
                      </span>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {expandedId === email.id ? "Collapse" : "Expand"}
                    </button>
                  </div>

                  {/* Preview / Expanded */}
                  {expandedId === email.id ? (
                    editingId === email.id ? (
                      <div className="space-y-2">
                        <input
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="w-full text-sm border rounded px-2 py-1"
                        />
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={8}
                          className="w-full text-sm border rounded px-2 py-1 font-mono"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(email.id)}
                            disabled={actionLoading === email.id}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-xs text-muted-foreground hover:underline">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">To: {email.to_email}</div>
                        <div className="text-sm font-medium">{email.subject}</div>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 p-2 rounded max-h-48 overflow-y-auto">
                          {email.body}
                        </pre>
                      </div>
                    )
                  ) : (
                    <div>
                      <div className="text-sm">{email.subject}</div>
                      <div className="text-xs text-muted-foreground truncate">{email.body.slice(0, 100)}...</div>
                    </div>
                  )}

                  {/* Actions */}
                  {editingId !== email.id && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApprove(email.id)}
                        disabled={actionLoading === email.id}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === email.id ? "Sending..." : "Approve & Send"}
                      </button>
                      <button
                        onClick={() => handleEdit(email)}
                        className="text-xs border px-3 py-1 rounded hover:bg-muted"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleReject(email.id)}
                        disabled={actionLoading === email.id}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
