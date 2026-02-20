"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { Search, ExternalLink, MessageSquare, Calendar, ChevronDown, ChevronRight, Mail, Send } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { OutreachContact, OutreachContactType, OutreachStatus, EmailStatus, OutreachActivity } from "@/lib/admin/types"
import { OUTREACH_STATUS_META, EMAIL_STATUS_META, CONTACT_TYPE_LABELS } from "@/lib/admin/types"

const ALL_TYPES: (OutreachContactType | "all")[] = ["all", "advocacy", "tech_company", "legislator", "academic", "other"]
const ALL_STATUSES: (OutreachStatus | "all")[] = ["all", "not_contacted", "draft_ready", "reached_out", "in_conversation", "partnership", "declined"]
const ALL_EMAIL_STATUSES: (EmailStatus | "all")[] = ["all", "none", "draft_ready", "emailed", "awaiting_reply", "replied", "bounced"]
const PRIORITY_LABELS: Record<number, string> = { 1: "P1", 2: "P2", 3: "P3" }
const PRIORITY_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  3: "bg-muted text-muted-foreground",
}

export default function OutreachPipeline() {
  const { getToken } = useApi()
  const [contacts, setContacts] = useState<OutreachContact[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<OutreachContactType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | "all">("all")
  const [emailStatusFilter, setEmailStatusFilter] = useState<EmailStatus | "all">("all")
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
    let result = contacts
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.org?.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      )
    }
    if (emailStatusFilter !== "all") {
      result = result.filter((c) => c.email_status === emailStatusFilter)
    }
    return result
  }, [contacts, searchQuery, emailStatusFilter])

  const stats = useMemo(() => {
    return {
      total: contacts.length,
      active: contacts.filter((c) => c.status === "reached_out" || c.status === "in_conversation").length,
      emailed: contacts.filter((c) => c.email_status === "emailed" || c.email_status === "awaiting_reply").length,
      replied: contacts.filter((c) => c.email_status === "replied").length,
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

  const handleEmailStatusChange = async (contact: OutreachContact, newEmailStatus: EmailStatus) => {
    setUpdatingId(contact.id)
    try {
      const token = (await getToken()) ?? undefined
      await api.updateOutreach(contact.id, {
        email_status: newEmailStatus,
        ...(newEmailStatus === "emailed" ? { last_contact_at: new Date().toISOString(), status: "reached_out" } : {}),
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
          {stats.emailed} emailed &middot;{" "}
          <span className={stats.replied > 0 ? "text-brand-green font-medium" : ""}>{stats.replied} replied</span>
          {stats.followUp > 0 && (
            <>
              {" "}&middot;{" "}
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {stats.followUp} need follow-up
              </span>
            </>
          )}
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

        {/* Email status pills */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider self-center mr-1">Email:</span>
          {ALL_EMAIL_STATUSES.map((es) => (
            <button
              key={es}
              onClick={() => setEmailStatusFilter(es)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                emailStatusFilter === es
                  ? "bg-foreground/10 text-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {es === "all" ? "All" : EMAIL_STATUS_META[es].label}
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
          <div className="grid grid-cols-[30px_1fr_1fr_120px_100px_90px_40px] gap-2 px-5 py-2.5 border-b border-border text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
            <div></div>
            <div>Name</div>
            <div>Org</div>
            <div>Status</div>
            <div>Email</div>
            <div>Last</div>
            <div></div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {filteredContacts.map((contact) => (
              <div key={contact.id}>
                <div
                  className={`grid grid-cols-[30px_1fr_1fr_120px_100px_90px_40px] gap-2 px-5 py-3 items-center cursor-pointer hover:bg-muted/30 transition-colors ${
                    isOverdue(contact) ? "bg-amber-50/50 dark:bg-amber-900/5" : ""
                  }`}
                  onClick={() => handleExpand(contact)}
                >
                  {/* Priority tier */}
                  <div className="flex items-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_COLORS[contact.priority_tier] || PRIORITY_COLORS[3]}`}>
                      {PRIORITY_LABELS[contact.priority_tier] || "P3"}
                    </span>
                  </div>

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
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${OUTREACH_STATUS_META[contact.status]?.color || "bg-muted text-muted-foreground"}`}
                    >
                      {ALL_STATUSES.filter((s) => s !== "all").map((s) => (
                        <option key={s} value={s}>
                          {OUTREACH_STATUS_META[s as OutreachStatus].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Email status */}
                  <div>
                    <select
                      value={contact.email_status}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleEmailStatusChange(contact, e.target.value as EmailStatus)
                      }}
                      disabled={updatingId === contact.id}
                      className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer bg-transparent ${EMAIL_STATUS_META[contact.email_status]?.color || "text-muted-foreground"}`}
                    >
                      {ALL_EMAIL_STATUSES.filter((s) => s !== "all").map((s) => (
                        <option key={s} value={s}>
                          {EMAIL_STATUS_META[s as EmailStatus].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {formatDate(contact.last_contact_at)}
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
                          <div className="text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <a href={`mailto:${contact.email}`} className="text-foreground hover:underline">
                              {contact.email}
                            </a>
                            <a
                              href={`https://mail.google.com/mail/?view=cm&to=${contact.email}`}
                              target="_blank"
                              rel="noopener"
                              className="ml-1 text-muted-foreground hover:text-foreground"
                              title="Compose in Gmail"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Send className="w-2.5 h-2.5" />
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
                            <span className="text-muted-foreground">X:</span>{" "}
                            <a href={`https://x.com/${contact.twitter_handle}`} target="_blank" rel="noopener" className="text-foreground hover:underline">
                              @{contact.twitter_handle}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Phone:</span>{" "}
                            <span className="text-foreground">{contact.phone}</span>
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
                        <div className="text-xs">
                          <span className="text-muted-foreground">Priority:</span>{" "}
                          <span className="font-medium">Tier {contact.priority_tier}</span>
                        </div>
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
