"use client"

import { useState } from "react"
import { BarChart3, ChevronDown, ChevronRight } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  isCurrentUser: boolean
}

export default function ReferralLeaderboard({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  const [expanded, setExpanded] = useState(false)

  if (leaderboard.length === 0) return null

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
      >
        <BarChart3 className="w-4 h-4 text-brand-green" />
        <span className="text-xs text-white font-semibold flex-1">Leaderboard</span>
        <span className="text-[10px] text-white/30">{leaderboard.length} referrers</span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-white/30" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-white/5 px-4 py-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 py-2 ${
                entry.isCurrentUser ? "bg-brand-green/5 -mx-4 px-4 rounded-lg" : ""
              }`}
            >
              <span className="text-xs text-white/30 tabular-nums w-5 text-right">
                {entry.rank}.
              </span>
              <span className={`text-xs flex-1 ${entry.isCurrentUser ? "text-brand-green font-semibold" : "text-white/70"}`}>
                {entry.name}
                {entry.isCurrentUser && (
                  <span className="text-[10px] text-brand-green/60 ml-1.5">(you)</span>
                )}
              </span>
              <span className="text-xs text-white/50 tabular-nums font-mono">
                {entry.score} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
