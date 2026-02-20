"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { Search, ExternalLink, MessageSquare, Calendar, ChevronDown, ChevronRight } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { OutreachContact, OutreachContactType, OutreachStatus, OutreachActivity } from "@/lib/admin/types"
import { OUTREACH_STATUS_META, CONTACT_TYPE_LABELS } from "@/lib/admin/types"

const ALL_TYPES: (OutreachContactType | "all")[] = ["all", "advocacy", "tech_company", "legislator", "academic", "other"]
const ALL_STATUSES: (OutreachStatus | "all")[] = ["all", "not_contacted", "reached_out", "in_conversation", "partnership", "declined"]

export default function OutreachPipeline() {
  const { getToken } = useApi()
  const [contacts, setContacts] = useState<OutreachContact[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<OutreachContactType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedActivities, setExpandedActivities] = useState<OutreachActivity[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    const token = (await getToken()) ?? undefined
    const type = typeFilter === "all" ? undefined : typeFilter
    const status = statusFilter === "all" ? undefined : statusFilter
    api.listOutreach(token, type, status)
      .then((data: OutreachContact[]) => {
        setContacts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [getToken, typeFilter, statusFilter])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts
    const q = searchQuery.toLowerCase()
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.org?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q)
    )
  }, [contacts, searchQuery])

  const stats = useMemo(() => {
    return {
      total: contacts.length,
      active: contacts.filter((c) => c.status === "reached_out" || c.status === "in_conversation").length,
      followUp: contacts.filter((c) => {
        if (!c.next_followup_at) return false
        return new Date(c.next_followup_at) < new Date()
      }).length,
    }
  }, [contacts])

  const handleStatusChange = async (contact: OutreachContact, newStatus: OutreachStatus) => {
    setUpdatingId(contact.id)
    try {
      const token = (await getToken()) ?? undefined
      await api.updateOutreach(contact.id, {
        status: newStatus,
        last_contact_at: new Date().toISOString(),
      }, token)
      fetchContacts()
    } catch {
      // Handle error
    } finally {
      setUpdatingId(null)
    }
  }

  const handleExpand = async (contact: OutreachContact) => {
    if (expandedId === contact.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(contact.id)
    try {
      const token = (await getToken()) ?? undefined
      const detail = await api.getOutreachContact(contact.id, token)
      setExpandedActivities(detail.activities || [])
    } catch {
      setExpandedActivities([])
    }
  }

  const formatDate = (d?: string) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const isOverdue = (contact: OutreachContact) => {
    if (!contact.next_followup_at) return false
    return new Date(contact.next_followup_at) < new Date()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Outreach Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stats.total} contacts &middot; {stats.active} active &middot;{" "}
          <span className={stats.followUp > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
            {stats.followUp} need follow-up
          </span>
        </p>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All Types" : CONTACT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-foreground/10 text-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All Statuses" : OUTREACH_STATUS_META[s].label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="plaid-input pl-9"
          />
        </div>
      </div>

      {/* ── Contact Table ──────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground text-sm animate-pulse">Loading contacts...</div>
      ) : filteredContacts.length === 0 ? (
        <div className="plaid-card text-center py-12">
          <p className="text-muted-foreground text-sm">
            {contacts.length === 0
              ? "No outreach contacts yet. Run the seed script to import from your outreach docs."
              : "No contacts match your filters."}
          </p>
        </div>
      ) : (
        <div className="plaid-card p-0 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_120px_90px_90px_40px] gap-2 px-5 py-2.5 border-b border-border text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
            <div>Name</div>
            <div>Org</div>
            <div>Status</div>
            <div>Last</div>
            <div>Follow-up</div>
            <div></div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {filteredContacts.map((contact) => (
              <div key={contact.id}>
                <div
                  className={`grid grid-cols-[1fr_1fr_120px_90px_90px_40px] gap-2 px-5 py-3 items-center cursor-pointer hover:bg-muted/30 transition-colors ${
                    isOverdue(contact) ? "bg-amber-50/50 dark:bg-amber-900/5" : ""
                  }`}
                  onClick={() => handleExpand(contact)}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{contact.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{contact.title}</div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{contact.org}</div>
                  <div>
                    <select
                      value={contact.status}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleStatusChange(contact, e.target.value as OutreachStatus)
                      }}
                      disabled={updatingId === contact.id}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${OUTREACH_STATUS_META[contact.status].color}`}
                    >
                      {ALL_STATUSES.filter((s) => s !== "all").map((s) => (
                        <option key={s} value={s}>
                          {OUTREACH_STATUS_META[s as OutreachStatus].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {formatDate(contact.last_contact_at)}
                  </div>
                  <div className={`text-xs tabular-nums ${isOverdue(contact) ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}`}>
                    {formatDate(contact.next_followup_at)}
                  </div>
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
                  <div className="px-5 py-4 bg-muted/20 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1.5">
                        {contact.email && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Email:</span>{" "}
                            <a href={`mailto:${contact.email}`} className="text-foreground hover:underline">
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.linkedin_url && (
                          <div className="text-xs flex items-center gap-1">
                            <span className="text-muted-foreground">LinkedIn:</span>{" "}
                            <a href={contact.linkedin_url} target="_blank" rel="noopener" className="text-foreground hover:underline flex items-center gap-0.5">
                              Profile <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                        {contact.twitter_handle && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Twitter:</span>{" "}
                            <a href={`https://x.com/${contact.twitter_handle}`} target="_blank" rel="noopener" className="text-foreground hover:underline">
                              @{contact.twitter_handle}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {contact.relevance_score != null && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Relevance:</span>{" "}
                            <span className="font-medium">{contact.relevance_score}/100</span>
                          </div>
                        )}
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag) => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {contact.notes && (
                          <div className="text-xs text-muted-foreground">{contact.notes}</div>
                        )}
                      </div>
                    </div>

                    {/* Activity log */}
                    {expandedActivities.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
                          Activity
                        </div>
                        <div className="space-y-1.5">
                          {expandedActivities.map((a) => (
                            <div key={a.id} className="flex items-start gap-2 text-xs">
                              <MessageSquare className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium">{a.activity_type.replace("_", " ")}</span>
                                {a.subject && <span className="text-muted-foreground">: {a.subject}</span>}
                              </div>
                              <div className="text-muted-foreground tabular-nums flex items-center gap-1 flex-shrink-0">
                                <Calendar className="w-2.5 h-2.5" />
                                {formatDate(a.created_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
