"use client"

import { useState, useEffect, useCallback } from "react"
import { GitBranch, Loader2 } from "lucide-react"
import ReferralNetworkStats from "./ReferralNetworkStats"
import ReferralTree, { type TreeNode } from "./ReferralTree"
import ReferralLeaderboardAdmin, { type LeaderboardRow } from "./ReferralLeaderboardAdmin"
import ReferralFunnel from "./ReferralFunnel"

/* ------------------------------------------------------------------ */
/*  Types from admin API                                               */
/* ------------------------------------------------------------------ */

interface Investor {
  phone_e164: string
  name: string
  company: string
  referred_by: string
  is_active: boolean
  created_at: string
  notes: string
}

interface SessionInfo {
  phone_e164: string
  last_active: string
}

interface InviteLink {
  code: string
  created_by: string
  referrer_name: string
  recipient_name: string
  uses: string
  max_uses: string
  created_at: string
  expires_at: string
}

interface DeckShare {
  id: string
  shared_by_phone: string
  recipient_hint: string
  created_at: string
  view_count: string
}

interface SafeRecord {
  id: string
  investor_phone: string
  investor_name: string
  investor_company: string
  investment_amount_cents: string
  status: string
  investor_signed_at: string | null
  company_signed_at: string | null
  created_at: string
}

interface NetworkData {
  investors: Investor[]
  sessions: SessionInfo[]
  invites: InviteLink[]
  inviteClaims: Array<{ invite_code: string; claimed_by_phone: string; name: string; claimed_at: string }>
  deckShares: DeckShare[]
  deckViews: Array<{ share_id: string; viewed_at: string }>
  safes: SafeRecord[]
}

/* ------------------------------------------------------------------ */
/*  Tree-building logic                                                */
/* ------------------------------------------------------------------ */

function buildTree(data: NetworkData): {
  roots: TreeNode[]
  leaderboard: LeaderboardRow[]
  funnelStages: Array<{ label: string; count: number }>
  maxDepth: number
  viralCoefficient: string
  topReferrer: { name: string; count: number } | null
  referralAmountCents: number
} {
  const sessionSet = new Set(data.sessions.map((s) => s.phone_e164))
  const deckViewPhones = new Set(
    data.deckShares.filter((ds) => parseInt(ds.view_count, 10) > 0).map((ds) => ds.shared_by_phone),
  )

  // Build investor map
  const investorMap = new Map<string, Investor>()
  for (const inv of data.investors) investorMap.set(inv.phone_e164, inv)

  // Build safe map (best status per phone)
  const safeMap = new Map<string, { amountCents: number; status: string }>()
  for (const s of data.safes) {
    if (s.status === "voided") continue
    const existing = safeMap.get(s.investor_phone)
    const cents = parseInt(s.investment_amount_cents, 10)
    if (!existing || cents > existing.amountCents) {
      safeMap.set(s.investor_phone, { amountCents: cents, status: s.status })
    }
  }

  // Build invite stats per phone
  const inviteSentCount = new Map<string, number>()
  const inviteClaimedCount = new Map<string, number>()
  for (const il of data.invites) {
    inviteSentCount.set(il.created_by, (inviteSentCount.get(il.created_by) || 0) + 1)
    const uses = parseInt(il.uses, 10)
    if (uses > 0) {
      inviteClaimedCount.set(il.created_by, (inviteClaimedCount.get(il.created_by) || 0) + uses)
    }
  }

  // Deck share stats per phone
  const deckShareCount = new Map<string, number>()
  const deckViewCount = new Map<string, number>()
  for (const ds of data.deckShares) {
    deckShareCount.set(ds.shared_by_phone, (deckShareCount.get(ds.shared_by_phone) || 0) + 1)
    deckViewCount.set(
      ds.shared_by_phone,
      (deckViewCount.get(ds.shared_by_phone) || 0) + parseInt(ds.view_count, 10),
    )
  }

  // Referral safes per phone
  const referralSafeCount = new Map<string, number>()
  const referralSafeAmount = new Map<string, number>()
  for (const inv of data.investors) {
    if (inv.referred_by) {
      const safe = safeMap.get(inv.phone_e164)
      if (safe && safe.status !== "voided") {
        referralSafeCount.set(inv.referred_by, (referralSafeCount.get(inv.referred_by) || 0) + 1)
        referralSafeAmount.set(inv.referred_by, (referralSafeAmount.get(inv.referred_by) || 0) + safe.amountCents)
      }
    }
  }

  // Build tree nodes
  const nodeMap = new Map<string, TreeNode>()
  for (const inv of data.investors) {
    const safe = safeMap.get(inv.phone_e164)
    nodeMap.set(inv.phone_e164, {
      phone: inv.phone_e164,
      name: inv.name,
      company: inv.company,
      referredBy: inv.referred_by,
      isActive: inv.is_active,
      createdAt: inv.created_at,
      hasSession: sessionSet.has(inv.phone_e164),
      hasDeckView: deckViewPhones.has(inv.phone_e164),
      hasSafe: !!safe,
      safeAmountCents: safe?.amountCents ?? 0,
      safeStatus: safe?.status ?? "",
      children: [],
    })
  }

  // Link children to parents
  const roots: TreeNode[] = []
  const allNodes: TreeNode[] = []
  nodeMap.forEach((v) => allNodes.push(v))
  for (const node of allNodes) {
    if (node.referredBy && nodeMap.has(node.referredBy)) {
      nodeMap.get(node.referredBy)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  // Calculate max depth
  function getDepth(node: TreeNode): number {
    if (node.children.length === 0) return 1
    return 1 + Math.max(...node.children.map(getDepth))
  }
  const maxDepth = roots.length > 0 ? Math.max(...roots.map(getDepth)) : 0

  // Viral coefficient = total referrals / total investors who have referred at least 1
  const referrersCount = data.investors.filter((i) =>
    data.investors.some((j) => j.referred_by === i.phone_e164),
  ).length
  const referredCount = data.investors.filter((i) => i.referred_by).length
  const viralCoefficient = referrersCount > 0
    ? (referredCount / referrersCount).toFixed(2)
    : "0.00"

  // Top referrer
  let topReferrer: { name: string; count: number } | null = null
  const referralCounts = new Map<string, number>()
  for (const inv of data.investors) {
    if (inv.referred_by) {
      referralCounts.set(inv.referred_by, (referralCounts.get(inv.referred_by) || 0) + 1)
    }
  }
  referralCounts.forEach((count, phone) => {
    if (!topReferrer || count > topReferrer.count) {
      const inv = investorMap.get(phone)
      topReferrer = { name: inv?.name || phone, count }
    }
  })

  // Total referral capital
  let totalReferralCents = 0
  Array.from(referralSafeAmount.values()).forEach((cents) => { totalReferralCents += cents })

  // Leaderboard
  const leaderboard: LeaderboardRow[] = data.investors.map((inv) => {
    const sent = inviteSentCount.get(inv.phone_e164) || 0
    const claimed = inviteClaimedCount.get(inv.phone_e164) || 0
    const shares = deckShareCount.get(inv.phone_e164) || 0
    const views = deckViewCount.get(inv.phone_e164) || 0
    const refSafes = referralSafeCount.get(inv.phone_e164) || 0
    const refAmount = referralSafeAmount.get(inv.phone_e164) || 0
    const score = sent * 1 + claimed * 5 + views * 2 + refSafes * 20
    return {
      phone: inv.phone_e164,
      name: inv.name,
      company: inv.company,
      invitesSent: sent,
      invitesClaimed: claimed,
      deckShares: shares,
      deckViews: views,
      referralSafes: refSafes,
      referralAmountCents: refAmount,
      score,
    }
  }).filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  // Funnel stages
  const totalInvited = data.investors.length
  const totalClaimed = data.inviteClaims.length
  const totalLoggedIn = sessionSet.size
  const totalDeckViewed = deckViewPhones.size
  const totalSafeCreated = new Set(data.safes.map((s) => s.investor_phone)).size
  const totalSafeSigned = new Set(
    data.safes.filter((s) => s.status === "investor_signed" || s.status === "countersigned").map((s) => s.investor_phone),
  ).size
  const totalCountersigned = new Set(
    data.safes.filter((s) => s.status === "countersigned").map((s) => s.investor_phone),
  ).size

  const funnelStages = [
    { label: "Approved", count: totalInvited },
    { label: "Invite Claimed", count: totalClaimed },
    { label: "Portal Login", count: totalLoggedIn },
    { label: "Deck Viewed", count: totalDeckViewed },
    { label: "SAFE Created", count: totalSafeCreated },
    { label: "SAFE Signed", count: totalSafeSigned },
    { label: "Countersigned", count: totalCountersigned },
  ]

  return { roots, leaderboard, funnelStages, maxDepth, viralCoefficient, topReferrer, referralAmountCents: totalReferralCents }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ReferralNetwork() {
  const [data, setData] = useState<NetworkData | null>(null)
  const [loading, setLoading] = useState(true)

  const headers = useCallback((extra?: Record<string, string>) => {
    const h: Record<string, string> = { "Content-Type": "application/json", ...extra }
    const sandbox = typeof window !== "undefined" ? localStorage.getItem("sandbox-session") : null
    if (sandbox) h["X-Sandbox-Session"] = sandbox
    return h
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/investors/admin/referral-network", { headers: headers() })
        if (res.ok) setData(await res.json())
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [headers])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) return null

  const { roots, leaderboard, funnelStages, maxDepth, viralCoefficient, topReferrer, referralAmountCents } = buildTree(data)

  // Don't render if no data at all
  if (data.investors.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <GitBranch className="w-5 h-5 text-brand-green" />
        <h3 className="text-sm font-semibold text-foreground">Referral Network</h3>
      </div>

      <ReferralNetworkStats
        stats={{ maxChainDepth: maxDepth, viralCoefficient, topReferrer, referralAmountCents }}
      />

      <ReferralTree roots={roots} />

      {leaderboard.length > 0 && (
        <>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6">
            Referral Leaderboard
          </h4>
          <ReferralLeaderboardAdmin rows={leaderboard} />
        </>
      )}

      <ReferralFunnel stages={funnelStages} />
    </div>
  )
}
