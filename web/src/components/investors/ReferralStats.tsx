"use client"

import { UserPlus, Eye, DollarSign, Trophy } from "lucide-react"

interface ReferralStatsData {
  invitesSent: number
  invitesClaimed: number
  deckSharesSent: number
  totalDeckViews: number
  referralInvestments: number
  referralAmountCents: number
  score: number
}

function fmtDollars(cents: number): string {
  if (cents === 0) return "$0"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function ReferralStats({ stats }: { stats: ReferralStatsData }) {
  const cards = [
    {
      icon: UserPlus,
      label: "Invites Sent",
      value: stats.invitesSent,
      sub: `${stats.invitesClaimed} claimed`,
    },
    {
      icon: Eye,
      label: "Deck Views",
      value: stats.totalDeckViews,
      sub: `${stats.deckSharesSent} shares`,
    },
    {
      icon: DollarSign,
      label: "Referral Capital",
      value: stats.referralInvestments > 0 ? fmtDollars(stats.referralAmountCents) : "—",
      sub: `${stats.referralInvestments} investment${stats.referralInvestments !== 1 ? "s" : ""}`,
    },
    {
      icon: Trophy,
      label: "Referral Score",
      value: stats.score,
      sub: "points earned",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="glass-card rounded-xl p-4">
          <card.icon className="w-4 h-4 text-brand-green mb-2" />
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{card.label}</p>
          <p className="text-xl font-display text-white tabular-nums">{card.value}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
