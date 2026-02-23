"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export interface LeaderboardRow {
  phone: string
  name: string
  company: string
  invitesSent: number
  invitesClaimed: number
  deckShares: number
  deckViews: number
  referralSafes: number
  referralAmountCents: number
  score: number
}

type SortKey = "score" | "invitesSent" | "invitesClaimed" | "deckViews" | "referralAmountCents"

function fmtDollars(cents: number): string {
  if (cents === 0) return "$0"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function ReferralLeaderboardAdmin({ rows }: { rows: LeaderboardRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("score")
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey]
    return sortAsc ? diff : -diff
  })

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null
    return sortAsc ? (
      <ChevronUp className="w-2.5 h-2.5 inline ml-0.5" />
    ) : (
      <ChevronDown className="w-2.5 h-2.5 inline ml-0.5" />
    )
  }

  if (rows.length === 0) return null

  return (
    <div className="plaid-card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Investor</th>
              <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Company</th>
              <th
                className="text-right py-2.5 px-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                onClick={() => handleSort("invitesSent")}
              >
                Sent <SortIcon col="invitesSent" />
              </th>
              <th
                className="text-right py-2.5 px-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                onClick={() => handleSort("invitesClaimed")}
              >
                Claimed <SortIcon col="invitesClaimed" />
              </th>
              <th
                className="text-right py-2.5 px-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                onClick={() => handleSort("deckViews")}
              >
                Views <SortIcon col="deckViews" />
              </th>
              <th className="text-right py-2.5 px-4 text-muted-foreground font-medium">
                Ref. SAFEs
              </th>
              <th
                className="text-right py-2.5 px-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                onClick={() => handleSort("referralAmountCents")}
              >
                Ref. $ <SortIcon col="referralAmountCents" />
              </th>
              <th
                className="text-right py-2.5 px-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                onClick={() => handleSort("score")}
              >
                Score <SortIcon col="score" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.phone} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="py-2.5 px-4 text-foreground font-medium">{row.name || "—"}</td>
                <td className="py-2.5 px-4 text-muted-foreground">{row.company || "—"}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-muted-foreground">{row.invitesSent}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-muted-foreground">{row.invitesClaimed}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-muted-foreground">{row.deckViews}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-muted-foreground">{row.referralSafes}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-foreground font-medium">
                  {row.referralAmountCents > 0 ? fmtDollars(row.referralAmountCents) : "—"}
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-brand-green font-semibold">{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
