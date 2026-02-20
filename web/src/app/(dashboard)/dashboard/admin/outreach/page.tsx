"use client"

import { useCallback, useEffect, useState, useMemo, useRef } from "react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { OutreachContact, OutreachContactType, OutreachStatus, EmailStatus, OutreachActivity, GmailMessage, GmailListResponse } from "@/lib/admin/types"
import { OutreachStats } from "./_components/OutreachStats"
import { OutreachFilters, type ViewMode } from "./_components/OutreachFilters"
import { OutreachTable, type SortField } from "./_components/OutreachTable"
import { ContactDetail } from "./_components/ContactDetail"
import { BulkActions } from "./_components/BulkActions"
import { KanbanBoard } from "./_components/KanbanBoard"

export default function OutreachPipeline() {
  const { getToken } = useApi()

  // ── Data ──────────────────────────────────────────────────────
  const [contacts, setContacts] = useState<OutreachContact[]>([])
  const [loading, setLoading] = useState(true)

  // ── Filters ───────────────────────────────────────────────────
  const [typeFilter, setTypeFilter] = useState<OutreachContactType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | "all">("all")
  const [emailStatusFilter, setEmailStatusFilter] = useState<EmailStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTags, setActiveTags] = useState<string[]>([])

  // ── Sort ──────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>("followup")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  // ── Selection & Expansion ─────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedActivities, setExpandedActivities] = useState<OutreachActivity[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [bulkUpdating, setBulkUpdating] = useState(false)

  // ── Gmail integration ─────────────────────────────────────────
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailThreads, setGmailThreads] = useState<GmailMessage[]>([])
  const [gmailLoading, setGmailLoading] = useState(false)
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null)
  const [expandedMessage, setExpandedMessage] = useState<GmailMessage | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)

  // ── View ──────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [focusedIndex, setFocusedIndex] = useState(-1)

  // ── Refs ──────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Data fetching ─────────────────────────────────────────────
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

  // Check Gmail connection on mount
  useEffect(() => {
    async function checkGmail() {
      try {
        const token = (await getToken()) ?? undefined
        const s = await api.getGoogleStatus(token)
        setGmailConnected(s.connected)
      } catch {
        setGmailConnected(false)
      }
    }
    checkGmail()
  }, [getToken])

  // ── Filtering + Sorting ───────────────────────────────────────
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

    if (activeTags.length > 0) {
      result = result.filter((c) => activeTags.every((tag) => c.tags?.includes(tag)))
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name)
          break
        case "org":
          cmp = (a.org || "").localeCompare(b.org || "")
          break
        case "relevance":
          cmp = (a.relevance_score ?? 0) - (b.relevance_score ?? 0)
          break
        case "priority":
          cmp = a.priority_tier - b.priority_tier
          break
        case "last_contact": {
          const aTime = a.last_contact_at ? new Date(a.last_contact_at).getTime() : 0
          const bTime = b.last_contact_at ? new Date(b.last_contact_at).getTime() : 0
          cmp = aTime - bTime
          break
        }
        case "followup": {
          const aTime = a.next_followup_at ? new Date(a.next_followup_at).getTime() : Infinity
          const bTime = b.next_followup_at ? new Date(b.next_followup_at).getTime() : Infinity
          cmp = aTime - bTime
          break
        }
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [contacts, searchQuery, emailStatusFilter, activeTags, sortField, sortDir])

  // ── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: contacts.length,
    active: contacts.filter((c) => c.status === "reached_out" || c.status === "in_conversation").length,
    emailed: contacts.filter((c) => c.email_status === "emailed" || c.email_status === "awaiting_reply").length,
    replied: contacts.filter((c) => c.email_status === "replied").length,
    followUp: contacts.filter((c) => {
      if (!c.next_followup_at) return false
      return new Date(c.next_followup_at) < new Date()
    }).length,
  }), [contacts])

  // ── All tags for filter chips ─────────────────────────────────
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    contacts.forEach((c) => c.tags?.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [contacts])

  // ── Handlers ──────────────────────────────────────────────────
  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }, [sortField])

  const handleStatusChange = useCallback(async (contact: OutreachContact, newStatus: OutreachStatus) => {
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
  }, [getToken, fetchContacts])

  const handleEmailStatusChange = useCallback(async (contact: OutreachContact, newEmailStatus: EmailStatus) => {
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
  }, [getToken, fetchContacts])

  const handleExpand = useCallback(async (contact: OutreachContact) => {
    if (expandedId === contact.id) {
      setExpandedId(null)
      setGmailThreads([])
      setExpandedMessageId(null)
      setExpandedMessage(null)
      return
    }
    setExpandedId(contact.id)
    setGmailThreads([])
    setExpandedMessageId(null)
    setExpandedMessage(null)

    // Fetch activities
    try {
      const token = (await getToken()) ?? undefined
      const detail = await api.getOutreachContact(contact.id, token)
      setExpandedActivities(detail.activities || [])
    } catch {
      setExpandedActivities([])
    }

    // Fetch Gmail threads if connected and contact has email
    if (gmailConnected && contact.email) {
      setGmailLoading(true)
      try {
        const token = (await getToken()) ?? undefined
        const result: GmailListResponse = await api.searchGmail(`to:${contact.email} OR from:${contact.email}`, 5, token)
        setGmailThreads(result.messages || [])
      } catch {
        setGmailThreads([])
      } finally {
        setGmailLoading(false)
      }
    }
  }, [expandedId, getToken, gmailConnected])

  const handleExpandMessage = useCallback(async (msg: GmailMessage) => {
    if (expandedMessageId === msg.id) {
      setExpandedMessageId(null)
      setExpandedMessage(null)
      return
    }
    setExpandedMessageId(msg.id)
    try {
      const token = (await getToken()) ?? undefined
      const full = await api.getGmailMessage(msg.id, token)
      setExpandedMessage(full)
    } catch {
      setExpandedMessage(null)
    }
  }, [expandedMessageId, getToken])

  const handleAddNote = useCallback(async (contactId: string, note: string) => {
    try {
      const token = (await getToken()) ?? undefined
      await api.createOutreachActivity(contactId, { activity_type: "note", subject: note }, token)
      // Refresh activities
      const detail = await api.getOutreachContact(contactId, token)
      setExpandedActivities(detail.activities || [])
    } catch {
      // Handle error
    }
  }, [getToken])

  const handleSendEmail = useCallback(async (to: string, subject: string, body: string, contactId: string) => {
    setSendingEmail(true)
    try {
      const token = (await getToken()) ?? undefined
      await api.sendGmailMessage({ to, subject, body, contact_id: contactId }, token)
      // Refresh threads
      if (to) {
        const result: GmailListResponse = await api.searchGmail(`to:${to} OR from:${to}`, 5, token)
        setGmailThreads(result.messages || [])
      }
      // Refresh activities
      const detail = await api.getOutreachContact(contactId, token)
      setExpandedActivities(detail.activities || [])
    } catch {
      // Handle error
    } finally {
      setSendingEmail(false)
    }
  }, [getToken])

  // ── Selection ─────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (filteredContacts.every((c) => selectedIds.has(c.id))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)))
    }
  }, [filteredContacts, selectedIds])

  const handleBulkStatusUpdate = useCallback(async (status: OutreachStatus) => {
    setBulkUpdating(true)
    try {
      const token = (await getToken()) ?? undefined
      const updates = Array.from(selectedIds).map((id) =>
        api.updateOutreach(id, { status, last_contact_at: new Date().toISOString() }, token)
      )
      await Promise.allSettled(updates)
      setSelectedIds(new Set())
      fetchContacts()
    } catch {
      // Handle error
    } finally {
      setBulkUpdating(false)
    }
  }, [getToken, selectedIds, fetchContacts])

  const handleBulkEmailStatusUpdate = useCallback(async (emailStatus: EmailStatus) => {
    setBulkUpdating(true)
    try {
      const token = (await getToken()) ?? undefined
      const updates = Array.from(selectedIds).map((id) =>
        api.updateOutreach(id, { email_status: emailStatus }, token)
      )
      await Promise.allSettled(updates)
      setSelectedIds(new Set())
      fetchContacts()
    } catch {
      // Handle error
    } finally {
      setBulkUpdating(false)
    }
  }, [getToken, selectedIds, fetchContacts])

  // ── Tag filtering ─────────────────────────────────────────────
  const handleTagClick = useCallback((tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]))
  }, [])

  const handleTagRemove = useCallback((tag: string) => {
    setActiveTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  // ── Keyboard shortcuts ────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return
      if (viewMode !== "table") return

      switch (e.key) {
        case "j":
          e.preventDefault()
          setFocusedIndex((prev) => Math.min(prev + 1, filteredContacts.length - 1))
          break
        case "k":
          e.preventDefault()
          setFocusedIndex((prev) => Math.max(prev - 1, 0))
          break
        case "e":
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < filteredContacts.length) {
            handleExpand(filteredContacts[focusedIndex])
          }
          break
        case "n":
          e.preventDefault()
          // Focus the note input if detail is expanded
          if (expandedId) {
            const noteInput = document.querySelector("[data-note-input]") as HTMLInputElement
            if (noteInput) noteInput.focus()
          }
          break
        case "s":
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < filteredContacts.length) {
            const contact = filteredContacts[focusedIndex]
            const statuses: OutreachStatus[] = ["not_contacted", "draft_ready", "reached_out", "in_conversation", "partnership", "declined"]
            const currentIdx = statuses.indexOf(contact.status)
            const nextStatus = statuses[(currentIdx + 1) % statuses.length]
            handleStatusChange(contact, nextStatus)
          }
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [viewMode, filteredContacts, focusedIndex, expandedId, handleExpand, handleStatusChange])

  // Reset focused index when filters change
  useEffect(() => {
    setFocusedIndex(-1)
  }, [typeFilter, statusFilter, emailStatusFilter, searchQuery, activeTags])

  // ── Render ────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Outreach Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage partner outreach, track conversations, and close partnerships.
        </p>
      </div>

      <OutreachStats
        total={stats.total}
        active={stats.active}
        emailed={stats.emailed}
        replied={stats.replied}
        followUp={stats.followUp}
      />

      <OutreachFilters
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        emailStatusFilter={emailStatusFilter}
        setEmailStatusFilter={setEmailStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTags={activeTags}
        onTagRemove={handleTagRemove}
        onClearTags={() => setActiveTags([])}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filteredContacts={filteredContacts}
      />

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
      ) : viewMode === "table" ? (
        <OutreachTable
          contacts={filteredContacts}
          sortField={sortField}
          sortDir={sortDir}
          toggleSort={toggleSort}
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          expandedId={expandedId}
          onExpand={handleExpand}
          focusedIndex={focusedIndex}
          updatingId={updatingId}
          onStatusChange={handleStatusChange}
          onEmailStatusChange={handleEmailStatusChange}
          onTagClick={handleTagClick}
          expandedActivities={expandedActivities}
          gmailThreads={gmailThreads}
          gmailLoading={gmailLoading}
          gmailConnected={gmailConnected}
          expandedMessageId={expandedMessageId}
          expandedMessage={expandedMessage}
          onExpandMessage={handleExpandMessage}
          onAddNote={handleAddNote}
          onSendEmail={handleSendEmail}
          sendingEmail={sendingEmail}
        />
      ) : (
        <KanbanBoard
          contacts={filteredContacts}
          onStatusChange={handleStatusChange}
          onExpand={handleExpand}
          updatingId={updatingId}
        />
      )}

      <BulkActions
        selectedCount={selectedIds.size}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkEmailStatusUpdate={handleBulkEmailStatusUpdate}
        onClear={() => setSelectedIds(new Set())}
        updating={bulkUpdating}
      />
    </div>
  )
}
