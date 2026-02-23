"use client"

import { GitBranch, TrendingUp, Crown, DollarSign } from "lucide-react"

interface NetworkStats {
  maxChainDepth: number
  viralCoefficient: string
  topReferrer: { name: string; count: number } | null
  referralAmountCents: number
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

export default function ReferralNetworkStats({ stats }: { stats: NetworkStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="plaid-card !py-3 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <GitBranch className="w-3.5 h-3.5 text-brand-green" />
        </div>
        <div className="text-lg font-semibold text-foreground tabular-nums">{stats.maxChainDepth}</div>
        <div className="text-[10px] text-muted-foreground">Max Chain Depth</div>
      </div>
      <div className="plaid-card !py-3 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <div className="text-lg font-semibold text-foreground tabular-nums">{stats.viralCoefficient}</div>
        <div className="text-[10px] text-muted-foreground">Viral Coefficient</div>
      </div>
      <div className="plaid-card !py-3 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div className="text-lg font-semibold text-foreground tabular-nums truncate px-2">
          {stats.topReferrer ? stats.topReferrer.name : "—"}
        </div>
        <div className="text-[10px] text-muted-foreground">
          {stats.topReferrer ? `${stats.topReferrer.count} referrals` : "Top Referrer"}
        </div>
      </div>
      <div className="plaid-card !py-3 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <DollarSign className="w-3.5 h-3.5 text-brand-green" />
        </div>
        <div className="text-lg font-semibold text-brand-green tabular-nums">
          {fmtDollars(stats.referralAmountCents)}
        </div>
        <div className="text-[10px] text-muted-foreground">Referral Capital</div>
      </div>
    </div>
  )
}
