"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react"
import {
  gradeTextColor,
  gradeBgColor,
  gradeBorderColor,
} from "@/lib/shared/grade-colors"
import type { CategoryPlatformEntry } from "./page"

interface CategoryLeaderboardClientProps {
  categoryId: string
  label: string
  description: string
  group: string
  portal: "ai_chatbot" | "streaming" | "both"
  weight: number
  entries: CategoryPlatformEntry[]
  relatedCategories: { id: string; label: string; portal: string }[]
  allCategories: { id: string; label: string; group: string; portal: string }[]
}

function WeightBadge({ weight }: { weight: number }) {
  const level = weight >= 5 ? "Critical" : weight >= 4 ? "High" : weight >= 3 ? "Medium" : "Low"
  const color = weight >= 5 ? "text-red-400 bg-red-500/15 border-red-500/25" : weight >= 4 ? "text-orange-400 bg-orange-500/15 border-orange-500/25" : weight >= 3 ? "text-amber-400 bg-amber-500/15 border-amber-500/25" : "text-emerald-400 bg-emerald-500/15 border-emerald-500/25"
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
      <Zap className="w-3 h-3" />
      {level} Priority (×{weight})
    </span>
  )
}

function PortalBadge({ portal }: { portal: string }) {
  if (portal === "ai_chatbot") {
    return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-violet-500/15 border-violet-500/25 text-violet-300">AI Chatbot</span>
  }
  if (portal === "streaming") {
    return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-sky-500/15 border-sky-500/25 text-sky-300">Streaming</span>
  }
  return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-white/[0.08] border-white/[0.12] text-white/50">All Platforms</span>
}

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  const color = score >= 90 ? "bg-emerald-500" : score >= 80 ? "bg-blue-500" : score >= 70 ? "bg-amber-500" : score >= 60 ? "bg-orange-500" : "bg-red-500"
  return (
    <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function CategoryLeaderboardClient({
  categoryId,
  label,
  description,
  group,
  portal,
  weight,
  entries,
  relatedCategories,
  allCategories,
}: CategoryLeaderboardClientProps) {
  const [showAll, setShowAll] = useState(false)

  // Group all categories by group for nav
  const groupedCategories = allCategories.reduce<Record<string, typeof allCategories>>((acc, c) => {
    if (!acc[c.group]) acc[c.group] = []
    acc[c.group].push(c)
    return acc
  }, {})

  const maxScore = entries.length > 0 ? entries[0].score : 100
  const avgScore = entries.length > 0 ? entries.reduce((s, e) => s + e.score, 0) / entries.length : 0
  const topEntry = entries[0]
  const bottomEntry = entries[entries.length - 1]
  const spread = topEntry && bottomEntry ? topEntry.score - bottomEntry.score : 0

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <Link
          href="/research/scores"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scorecard
        </Link>

        <div className="flex items-start gap-3 mb-2">
          <Shield className="w-6 h-6 text-[#00D47E] flex-shrink-0 mt-1" />
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#00D47E]/60">
                Category Leaderboard
              </span>
              <span className="text-xs text-white/20">•</span>
              <span className="text-xs text-white/30">{group}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{label}</h1>
            <p className="text-sm text-white/50 max-w-2xl">{description}</p>
            <div className="flex items-center gap-3 mt-3">
              <WeightBadge weight={weight} />
              <PortalBadge portal={portal} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-8">
        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Platforms Tested", value: entries.length.toString() },
            { label: "Avg Score", value: `${avgScore.toFixed(1)}/100` },
            { label: "Score Spread", value: `${spread.toFixed(1)} pts` },
            { label: "Best Score", value: topEntry ? `${topEntry.score.toFixed(1)}` : "—" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-[11px] text-white/30 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Rankings */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">Rankings</h2>
            <span className="text-xs text-white/25">{entries.length} platforms</span>
          </div>

          <div className="space-y-3">
            {entries.map((entry, idx) => (
              <Link
                key={entry.platformId}
                href={entry.detailUrl}
                className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#00D47E]/30 hover:bg-white/[0.04] transition-all"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 text-center">
                  {entry.rank === 1 ? (
                    <Trophy className="w-5 h-5 text-amber-400 mx-auto" />
                  ) : (
                    <span className="text-lg font-bold text-white/30">{entry.rank}</span>
                  )}
                </div>

                {/* Grade badge */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${gradeBgColor(entry.grade)} ${gradeBorderColor(entry.grade)} border ${gradeTextColor(entry.grade)}`}>
                  {entry.grade}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white group-hover:text-[#00D47E] transition truncate">
                      {entry.platformName}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${entry.portal === "ai_chatbot" ? "bg-violet-500/15 border-violet-500/25 text-violet-300" : "bg-sky-500/15 border-sky-500/25 text-sky-300"}`}>
                      {entry.portalLabel}
                    </span>
                  </div>
                  <ScoreBar score={entry.score} maxScore={100} />
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-white">{entry.score.toFixed(1)}</div>
                  <div className="text-[10px] text-white/30">{entry.testCount} tests</div>
                </div>

                <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-[#00D47E] flex-shrink-0 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Key insight */}
        {topEntry && bottomEntry && spread > 20 && (
          <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-400 mb-1">Wide Performance Gap</h3>
                <p className="text-sm text-white/50">
                  There is a {spread.toFixed(0)}-point gap between the top scorer ({topEntry.platformName}, {topEntry.score.toFixed(1)}/100)
                  and the lowest scorer ({bottomEntry.platformName}, {bottomEntry.score.toFixed(1)}/100) in {label.toLowerCase()}.
                  {spread > 40 && " This suggests major inconsistency in how platforms address this safety area."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Related categories */}
        {relatedCategories.length > 0 && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">
              Related Categories in {group}
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/research/scores/categories/${cat.id}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-[#00D47E]/30 text-sm text-white/60 hover:text-white/80 transition-all"
                >
                  {cat.label}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All categories nav */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">
              All {allCategories.length} Test Categories
            </h2>
            {showAll ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
          </button>

          {showAll && (
            <div className="mt-4 space-y-4">
              {Object.entries(groupedCategories).map(([groupName, cats]) => (
                <div key={groupName}>
                  <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">{groupName}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cats.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/research/scores/categories/${cat.id}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${cat.id === categoryId ? "bg-[#00D47E]/10 border border-[#00D47E]/30 text-[#00D47E]" : "bg-white/[0.02] border border-white/[0.04] text-white/50 hover:text-white/70 hover:border-white/[0.08]"}`}
                      >
                        <span className="truncate">{cat.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${cat.portal === "ai_chatbot" ? "bg-violet-500/10 border-violet-500/20 text-violet-300/60" : "bg-sky-500/10 border-sky-500/20 text-sky-300/60"}`}>
                          {cat.portal === "ai_chatbot" ? "AI" : "Stream"}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/research/scores"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#00D47E]/10 border border-[#00D47E]/20 text-[#00D47E] hover:bg-[#00D47E]/20 transition inline-flex items-center gap-2"
          >
            View Full Scorecard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/research/scores/platforms"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
          >
            All Platforms <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {portal === "ai_chatbot" && (
            <Link
              href={`/research/ai-chatbots/categories/${categoryId}`}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
            >
              AI Chatbot Deep Dive <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {portal === "streaming" && (
            <Link
              href={`/research/streaming/categories/${categoryId}`}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
            >
              Streaming Deep Dive <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
