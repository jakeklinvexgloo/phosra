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
} from "@/lib/admin/types"
import { OutreachHeader } from "./_components/OutreachHeader"
import { SinceLastVisit } from "./_components/SinceLastVisit"
import { ReviewQueue } from "./_components/ReviewQueue"
import { AlexActivityFeed } from "./_components/AlexActivityFeed"
import { ActiveConversations } from "./_components/ActiveConversations"
import { MeetingsSection } from "./_components/MeetingsSection"
import { UpNextQueue } from "./_components/UpNextQueue"
import { SenderConfig } from "./_components/SenderConfig"

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
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailEmail, setGmailEmail] = useState("")

  // ── Activity Feed ───────────────────────────────────────────
  const [recentActivities, setRecentActivities] = useState<OutreachActivityWithContact[]>([])
  const [activitySummary, setActivitySummary] = useState<OutreachActivitySummary | null>(null)
  const [lastVisit, setLastVisit] = useState<string | null>(null)

  // ── UI ────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false)
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

      // Read last visit from localStorage
      const storedLastVisit = typeof window !== "undefined" ? localStorage.getItem("outreach-last-visit") : null
      setLastVisit(storedLastVisit)

      const promises: Promise<unknown>[] = [
        api.listOutreach(token),
        api.getAutopilotConfig(token),
        api.getAutopilotStats(token),
        api.getOutreachGoogleStatus(token),
        api.listPendingEmails("pending_review", token),
        api.listSequences(token),
        api.listRecentActivities(50, token),
      ]
      // Only fetch summary if we have a previous visit
      if (storedLastVisit) {
        promises.push(api.getActivitySummary(storedLastVisit, token))
      }

      const results = await Promise.allSettled(promises)
      const [contactsRes, configRes, statsRes, gmailRes, pendingRes, seqRes, activitiesRes, summaryRes] = results

      if (contactsRes.status === "fulfilled") setContacts(contactsRes.value as OutreachContact[])
      if (configRes.status === "fulfilled") setConfig(configRes.value as OutreachConfig)
      if (statsRes.status === "fulfilled") setStats(statsRes.value as AutopilotStats)
      if (gmailRes.status === "fulfilled") {
        const val = gmailRes.value as { connected: boolean; email: string }
        setGmailConnected(val.connected)
        setGmailEmail(val.email || "")
      }
      if (pendingRes.status === "fulfilled") setPendingEmails(pendingRes.value as OutreachPendingEmail[])
      if (seqRes.status === "fulfilled") setSequences(seqRes.value as OutreachSequence[])
      if (activitiesRes.status === "fulfilled") setRecentActivities(activitiesRes.value as OutreachActivityWithContact[])
      if (summaryRes && summaryRes.status === "fulfilled") setActivitySummary(summaryRes.value as OutreachActivitySummary)

      // Update last visit timestamp
      if (typeof window !== "undefined") {
        localStorage.setItem("outreach-last-visit", new Date().toISOString())
      }
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

  // ── Gmail connect ─────────────────────────────────────────────
  const handleConnectGmail = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const { url } = await api.getOutreachGoogleAuthURL(token)
      window.location.href = url
    } catch {
      // ignore
    }
  }, [getToken])

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

      if (gmailConnected && email) {
        setGmailLoading(true)
        try {
          const token = (await getToken()) ?? undefined
          const [messagesResult, draftsResult] = await Promise.allSettled([
            api.searchGmail(`to:${email} OR from:${email}`, 10, token),
            api.searchGmail(`is:draft to:${email}`, 10, token),
          ])
          const messages: GmailMessage[] =
            messagesResult.status === "fulfilled"
              ? (messagesResult.value as GmailListResponse).messages || []
              : []
          const drafts: GmailMessage[] =
            draftsResult.status === "fulfilled"
              ? (draftsResult.value as GmailListResponse).messages || []
              : []
          // Merge and deduplicate
          const seen = new Set<string>()
          const merged: GmailMessage[] = []
          for (const msg of [...drafts, ...messages]) {
            if (!seen.has(msg.id)) {
              seen.add(msg.id)
              merged.push(msg)
            }
          }
          setGmailThreads(merged)
        } catch {
          setGmailThreads([])
        } finally {
          setGmailLoading(false)
        }
      }
    },
    [expandedContactId, getToken, gmailConnected]
  )

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <SinceLastVisit summary={activitySummary} lastVisit={lastVisit} />

      <OutreachHeader
        config={config}
        stats={stats}
        gmailConnected={gmailConnected}
        gmailEmail={gmailEmail}
        onToggle={handleToggle}
        onConnectGmail={handleConnectGmail}
        onOpenSettings={() => setShowSettings(true)}
      />

      <ReviewQueue
        emails={pendingEmails}
        loading={loading}
        onRefresh={fetchAll}
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
    </div>
  )
}
