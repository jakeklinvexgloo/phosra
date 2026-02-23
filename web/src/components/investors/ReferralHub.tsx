"use client"

import { useState, useEffect, useCallback } from "react"
import { Activity, Loader2, UserPlus, Share2, Eye, Trophy, ArrowRight } from "lucide-react"
import { AnimatedSection } from "@/components/marketing/shared"
import ReferralStats from "./ReferralStats"
import ReferralBadges from "./ReferralBadges"
import ReferralActivityFeed from "./ReferralActivityFeed"
import ReferralLeaderboard from "./ReferralLeaderboard"

interface ReferralData {
  stats: {
    invitesSent: number
    invitesClaimed: number
    deckSharesSent: number
    totalDeckViews: number
    referralInvestments: number
    referralAmountCents: number
    score: number
  }
  activity: Array<{
    type: "invite_claimed" | "deck_viewed" | "safe_signed"
    actorName: string
    detail: string
    timestamp: string
  }>
  leaderboard: Array<{
    rank: number
    name: string
    score: number
    isCurrentUser: boolean
  }>
  badges: Array<{
    key: string
    label: string
    description: string
    earned: boolean
    earnedAt: string | null
  }>
  referrals: Array<{
    name: string
    company: string
    joinedAt: string
    engagementLevel: "invited" | "joined" | "engaged" | "committed" | "invested"
    subReferralCount: number
  }>
}

const ENGAGEMENT_COLORS = {
  invited: "bg-white/10 text-white/40",
  joined: "bg-blue-500/10 text-blue-400",
  engaged: "bg-amber-500/10 text-amber-400",
  committed: "bg-brand-green/10 text-brand-green",
  invested: "bg-brand-green/20 text-brand-green",
} as const

export default function ReferralHub() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/investors/referrals", { credentials: "include" })
      if (res.ok) {
        setData(await res.json())
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 lg:py-20">
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
        </div>
      </section>
    )
  }

  if (error || !data) return null

  const hasActivity = data.stats.invitesSent > 0 || data.stats.deckSharesSent > 0

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 lg:py-20">
      <AnimatedSection>
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-brand-green" />
          <div>
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-1">
              Your Network
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-white">
              Referral Hub
            </h2>
          </div>
        </div>
      </AnimatedSection>

      <div className="space-y-6">
        {/* Stats — only when there's activity */}
        {hasActivity && (
          <AnimatedSection delay={0.1}>
            <ReferralStats stats={data.stats} />
          </AnimatedSection>
        )}

        {/* Empty state CTA — when no activity yet */}
        {!hasActivity && (
          <AnimatedSection delay={0.1}>
            <div className="glass-card rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-brand-green" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-2">
                    Help build the round — earn your place on the board
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed mb-4">
                    Every great raise is built on referrals. Invite investors you know, share the deck,
                    and track who engages — all from here.
                  </p>
                  <div className="space-y-2">
                    {[
                      { icon: Share2, action: "Send an invite", points: "+1 pt", detail: "per invite sent" },
                      { icon: UserPlus, action: "They join the portal", points: "+5 pts", detail: "per sign-up" },
                      { icon: Eye, action: "Share the deck", points: "+2 pts", detail: "per view" },
                      { icon: Trophy, action: "They invest", points: "+20 pts", detail: "per SAFE signed" },
                    ].map((row) => (
                      <div key={row.action} className="flex items-center gap-3">
                        <row.icon className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                        <span className="text-xs text-white/60 flex-1">{row.action}</span>
                        <span className="text-xs text-brand-green font-mono tabular-nums">{row.points}</span>
                        <span className="text-[10px] text-white/20 w-24">{row.detail}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-4 text-[10px] text-white/20">
                    <ArrowRight className="w-3 h-3" />
                    <span>Use the <strong className="text-white/40">Invite an Investor</strong> button above or <strong className="text-white/40">Share Deck</strong> on the pitch deck to get started</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Badges — always visible (unearned ones are dimmed, acts as a teaser) */}
        <AnimatedSection delay={hasActivity ? 0.15 : 0.2}>
          <ReferralBadges badges={data.badges} />
        </AnimatedSection>

        {/* Activity feed — only when there's activity */}
        {hasActivity && (
          <AnimatedSection delay={0.2}>
            <ReferralActivityFeed activity={data.activity} />
          </AnimatedSection>
        )}

        {/* Referral list — only when referrals exist */}
        {data.referrals.length > 0 && (
          <AnimatedSection delay={0.25}>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">
                Your Referrals
              </p>
              <div className="space-y-2">
                {data.referrals.map((ref, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70 font-medium">{ref.name}</p>
                      {ref.company && (
                        <p className="text-[10px] text-white/30">{ref.company}</p>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${ENGAGEMENT_COLORS[ref.engagementLevel]}`}
                    >
                      {ref.engagementLevel}
                    </span>
                    {ref.subReferralCount > 0 && (
                      <span className="text-[10px] text-white/20">
                        +{ref.subReferralCount} sub
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Leaderboard — always visible if anyone has scored (shows other investors' momentum) */}
        {data.leaderboard.length > 0 && (
          <AnimatedSection delay={0.3}>
            <ReferralLeaderboard leaderboard={data.leaderboard} />
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
