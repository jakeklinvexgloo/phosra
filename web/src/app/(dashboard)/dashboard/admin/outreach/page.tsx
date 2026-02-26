"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type {
  OutreachContact,
  OutreachSequence,
  OutreachPendingEmail,
  OutreachConfig,
  AutopilotStats,
  OutreachActivityWithContact,
  OutreachActivitySummary,
  GmailMessage,
  GmailListResponse,
  GoogleAccountInfo,
  PersonaAccountMapping,
} from "@/lib/admin/types"
import { OutreachHeader } from "./_components/OutreachHeader"
import { SinceLastVisit } from "./_components/SinceLastVisit"
import { DisconnectionBanner } from "./_components/DisconnectionBanner"
import { PersonaFilterBar } from "./_components/PersonaFilterBar"
import { ReviewQueue } from "./_components/ReviewQueue"
import { AlexActivityFeed } from "./_components/AlexActivityFeed"
import { ActiveConversations } from "./_components/ActiveConversations"
import { MeetingsSection } from "./_components/MeetingsSection"
import { UpNextQueue } from "./_components/UpNextQueue"
import { SenderConfig } from "./_components/SenderConfig"
import { GoogleAccountsManager } from "./_components/GoogleAccountsManager"

export default function OutreachPage() {
  const { getToken } = useApi()

  // ── Data ──────────────────────────────────────────────────────
  const [contacts, setContacts] = useState<OutreachContact[]>([])
  const [sequences, setSequences] = useState<OutreachSequence[]>([])
  const [pendingEmails, setPendingEmails] = useState<OutreachPendingEmail[]>([])
  const [loading, setLoading] = useState(true)

  // ── Autopilot ─────────────────────────────────────────────────
  const [config, setConfig] = useState<OutreachConfig | null>(null)
  const [stats, setStats] = useState<AutopilotStats | null>(null)
  const [googleAccounts, setGoogleAccounts] = useState<GoogleAccountInfo[]>([])
  const [personaAccounts, setPersonaAccounts] = useState<PersonaAccountMapping[]>([])

  // ── Persona Filter ──────────────────────────────────────────
  const [personaFilter, setPersonaFilter] = useState<"all" | "jake" | "alex">("all")

  // ── Activity Feed ───────────────────────────────────────────
  const [recentActivities, setRecentActivities] = useState<OutreachActivityWithContact[]>([])
  const [activitySummary, setActivitySummary] = useState<OutreachActivitySummary | null>(null)
  const [lastVisit, setLastVisit] = useState<string | null>(null)

  // ── Drafting ─────────────────────────────────────────────────
  const [drafting, setDrafting] = useState(false)

  // ── UI ────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false)
  const [showAccountsManager, setShowAccountsManager] = useState(false)
  const [feedOpen, setFeedOpen] = useState(true)
  const [activeOpen, setActiveOpen] = useState(true)
  const [meetingsOpen, setMeetingsOpen] = useState(false)
  const [queueOpen, setQueueOpen] = useState(false)

  // ── Gmail thread state (for expanded active conversation) ─────
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null)
  const [gmailThreads, setGmailThreads] = useState<GmailMessage[]>([])
  const [gmailLoading, setGmailLoading] = useState(false)

  // ── Fetch everything in parallel ──────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined

      // Read last visit from server
      let storedLastVisit: string | null = null
      try {
        const stateRes = await fetch("/api/admin/dashboard-state")
        if (stateRes.ok) {
          const stateData = await stateRes.json()
          if (stateData.outreach_last_visit) {
            storedLastVisit = stateData.outreach_last_visit as string
          }
        }
      } catch {}
      setLastVisit(storedLastVisit)

      const promises: Promise<unknown>[] = [
        api.listOutreach(token),
        api.getAutopilotConfig(token),
        api.getAutopilotStats(token),
        api.listGoogleAccounts(token),
        api.listPendingEmails(undefined, token).then((all: unknown) =>
          (all as OutreachPendingEmail[]).filter(
            (e) => e.status === "pending_review" || e.status === "approved"
          )
        ),
        api.listSequences(token),
        api.listRecentActivities(50, token),
        api.listPersonaAccounts(token),
      ]
      // Only fetch summary if we have a previous visit
      if (storedLastVisit) {
        promises.push(api.getActivitySummary(storedLastVisit, token))
      }

      const results = await Promise.allSettled(promises)
      const [contactsRes, configRes, statsRes, gmailRes, pendingRes, seqRes, activitiesRes, personaRes, summaryRes] = results

      if (contactsRes.status === "fulfilled") setContacts(contactsRes.value as OutreachContact[])
      if (configRes.status === "fulfilled") setConfig(configRes.value as OutreachConfig)
      if (statsRes.status === "fulfilled") setStats(statsRes.value as AutopilotStats)
      if (gmailRes.status === "fulfilled") {
        setGoogleAccounts(gmailRes.value as GoogleAccountInfo[])
      }
      if (pendingRes.status === "fulfilled") setPendingEmails(pendingRes.value as OutreachPendingEmail[])
      if (seqRes.status === "fulfilled") setSequences(seqRes.value as OutreachSequence[])
      if (activitiesRes.status === "fulfilled") setRecentActivities(activitiesRes.value as OutreachActivityWithContact[])
      if (personaRes && personaRes.status === "fulfilled") setPersonaAccounts(personaRes.value as PersonaAccountMapping[])
      if (summaryRes && summaryRes.status === "fulfilled") setActivitySummary(summaryRes.value as OutreachActivitySummary)

      // Update last visit timestamp on server
      fetch("/api/admin/dashboard-state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "outreach_last_visit", value: new Date().toISOString() }),
      }).catch(() => {})
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── Computed: active sequences ────────────────────────────────
  const activeConversations = useMemo(
    () => sequences.filter((s) => s.status === "active"),
    [sequences]
  )

  // ── Computed: meeting activities ─────────────────────────────
  const meetingActivities = useMemo(
    () => recentActivities.filter((a) => a.activity_type === "meeting_proposed"),
    [recentActivities]
  )

  // ── Computed: up-next contacts (not_contacted with email, sorted by priority)
  const upNextContacts = useMemo(
    () =>
      contacts
        .filter((c) => c.status === "not_contacted" && c.email)
        .sort((a, b) => a.priority_tier - b.priority_tier),
    [contacts]
  )

  // ── Computed: persona counts for filter bar ─────────────────
  const personaCounts = useMemo(() => {
    const jake = pendingEmails.filter((e) => e.google_account_key === "jake").length
    const alex = pendingEmails.length - jake
    return { all: pendingEmails.length, jake, alex }
  }, [pendingEmails])

  // ── Reconnect handler for DisconnectionBanner ──────────────
  const handleReconnect = useCallback(async (accountKey: string) => {
    try {
      const token = (await getToken()) ?? undefined
      const result = await api.getGoogleAccountAuthURL(accountKey, token)
      window.location.href = result.url
    } catch { /* ignore */ }
  }, [getToken])

  // ── Autopilot toggle ──────────────────────────────────────────
  const handleToggle = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const updated = await api.toggleAutopilot(token)
      setConfig(updated)
    } catch {
      // ignore
    }
  }, [getToken])

  // ── Manage Google accounts ───────────────────────────────────
  const handleManageAccounts = useCallback(() => {
    setShowAccountsManager(true)
  }, [])

  // ── Draft next email (1 at a time) ───────────────────────────
  const handleDraftNext = useCallback(async () => {
    if (drafting) return

    setDrafting(true)
    try {
      const token = (await getToken()) ?? undefined

      // If there's an un-sequenced contact, start a sequence for them (ignore error if one already exists)
      const next = upNextContacts[0]
      if (next) {
        try { await api.startSequence(next.id, token) } catch { /* sequence may already exist */ }
      }

      // Trigger the worker (DRAFT_LIMIT=1 is set server-side for manual triggers)
      await api.triggerWorker("outreach-sequencer", token)

      // Poll for the new pending email to appear
      const prevCount = pendingEmails.length
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000))
        try {
          const allEmails = (await api.listPendingEmails(undefined, token) as OutreachPendingEmail[])
            .filter((e) => e.status === "pending_review" || e.status === "approved")
          if (allEmails.length > prevCount) {
            setPendingEmails(allEmails)
            // Refresh contacts so the drafted one moves out of upNext
            const freshContacts = await api.listOutreach(token)
            setContacts(freshContacts as OutreachContact[])
            break
          }
        } catch { /* keep polling */ }
      }
    } catch {
      // ignore
    } finally {
      setDrafting(false)
    }
  }, [drafting, upNextContacts, getToken, pendingEmails.length])

  // ── Queue / Send ────────────────────────────────────────────────
  const handleQueue = useCallback(async (id: string) => {
    try {
      const token = (await getToken()) ?? undefined
      await api.queuePendingEmail(id, token)
      fetchAll()
    } catch { /* ignore */ }
  }, [getToken, fetchAll])

  const handleSend = useCallback(async (id: string) => {
    try {
      const token = (await getToken()) ?? undefined
      await api.sendQueuedEmail(id, token)
      fetchAll()
    } catch { /* ignore */ }
  }, [getToken, fetchAll])

  // ── Expand active conversation → fetch Gmail threads ──────────
  const handleExpandContact = useCallback(
    async (contactId: string, email?: string) => {
      if (expandedContactId === contactId) {
        setExpandedContactId(null)
        setGmailThreads([])
        return
      }
      setExpandedContactId(contactId)
      setGmailThreads([])

      if (googleAccounts.length > 0 && email) {
        setGmailLoading(true)
        try {
          const token = (await getToken()) ?? undefined
          // Search across ALL connected accounts
          const connectedKeys = googleAccounts.filter((a) => a.connected).map((a) => a.account_key)
          const searchPromises = connectedKeys.flatMap((accountKey) => [
            api.searchGmail(`to:${email} OR from:${email}`, 10, token, accountKey),
            api.searchGmail(`is:draft to:${email}`, 10, token, accountKey),
          ])
          const results = await Promise.allSettled(searchPromises)
          // Merge and deduplicate all results
          const seen = new Set<string>()
          const merged: GmailMessage[] = []
          for (const result of results) {
            if (result.status === "fulfilled") {
              const msgs = (result.value as GmailListResponse).messages || []
              for (const msg of msgs) {
                if (!seen.has(msg.id)) {
                  seen.add(msg.id)
                  merged.push(msg)
                }
              }
            }
          }
          // Sort by date descending
          merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setGmailThreads(merged)
        } catch {
          setGmailThreads([])
        } finally {
          setGmailLoading(false)
        }
      }
    },
    [expandedContactId, getToken, googleAccounts]
  )

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <DisconnectionBanner
        googleAccounts={googleAccounts}
        personaAccounts={personaAccounts}
        onReconnect={handleReconnect}
      />

      <SinceLastVisit summary={activitySummary} lastVisit={lastVisit} />

      <OutreachHeader
        config={config}
        stats={stats}
        googleAccounts={googleAccounts}
        onToggle={handleToggle}
        onManageAccounts={handleManageAccounts}
        onOpenSettings={() => setShowSettings(true)}
      />

      <PersonaFilterBar
        selected={personaFilter}
        counts={personaCounts}
        onSelect={setPersonaFilter}
      />

      <ReviewQueue
        emails={pendingEmails}
        loading={loading}
        drafting={drafting}
        hasContacts={upNextContacts.length > 0 || activeConversations.length > 0}
        onRefresh={fetchAll}
        onDraftNext={handleDraftNext}
        onQueue={handleQueue}
        onSend={handleSend}
        personaFilter={personaFilter}
      />

      <AlexActivityFeed
        activities={recentActivities}
        open={feedOpen}
        onToggle={() => setFeedOpen((v) => !v)}
      />

      <ActiveConversations
        sequences={activeConversations}
        open={activeOpen}
        onToggle={() => setActiveOpen((v) => !v)}
        expandedContactId={expandedContactId}
        onExpandContact={handleExpandContact}
        gmailThreads={gmailThreads}
        gmailLoading={gmailLoading}
      />

      <MeetingsSection
        meetings={meetingActivities}
        open={meetingsOpen}
        onToggle={() => setMeetingsOpen((v) => !v)}
      />

      <UpNextQueue
        contacts={upNextContacts}
        open={queueOpen}
        onToggle={() => setQueueOpen((v) => !v)}
      />

      <SenderConfig
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <GoogleAccountsManager
        open={showAccountsManager}
        onClose={() => setShowAccountsManager(false)}
        onAccountsChanged={fetchAll}
      />
    </div>
  )
}
