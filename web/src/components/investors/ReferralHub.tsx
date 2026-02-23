"use client"

import { useState, useEffect, useCallback } from "react"
import { Activity, Loader2, UserPlus } from "lucide-react"
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

      {!hasActivity ? (
        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-5 h-5 text-brand-green" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-2">Build your network</h3>
            <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
              Invite other investors to earn points, unlock badges, and climb the leaderboard.
              Share the deck and track engagement in real time.
            </p>
          </div>
        </AnimatedSection>
      ) : (
        <div className="space-y-6">
          <AnimatedSection delay={0.1}>
            <ReferralStats stats={data.stats} />
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <ReferralBadges badges={data.badges} />
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <ReferralActivityFeed activity={data.activity} />
          </AnimatedSection>

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

          <AnimatedSection delay={0.3}>
            <ReferralLeaderboard leaderboard={data.leaderboard} />
          </AnimatedSection>
        </div>
      )}
    </section>
  )
}
