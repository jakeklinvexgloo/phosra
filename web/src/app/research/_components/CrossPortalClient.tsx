"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Shield,
  ArrowRight,
  ArrowUpDown,
  Bot,
  Monitor,
  AlertTriangle,
  Trophy,
  Zap,
} from "lucide-react"
import {
  gradeTextColor,
  gradeBgColor,
  gradeBorderColor,
} from "@/lib/shared/grade-colors"

// ── Types ───────────────────────────────────────────────────────────

export interface UnifiedPlatform {
  id: string
  name: string
  type: "ai-chatbot" | "streaming"
  overallGrade: string
  overallScore: number
  gradeCap?: string
  gradeCapReasons?: string[]
  detailHref: string
  testCount: number
}

type FilterOption = "all" | "ai-chatbot" | "streaming"
type SortOption = "score-desc" | "score-asc" | "name"

// ── Helpers ─────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: "ai-chatbot" | "streaming" }) {
  if (type === "ai-chatbot") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[11px] font-medium text-violet-400 border border-violet-500/20">
        <Bot className="h-3 w-3" />
        AI Chatbot
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-400 border border-sky-500/20">
      <Monitor className="h-3 w-3" />
      Streaming
    </span>
  )
}

function GradeBadge({ grade, isCapped }: { grade: string; isCapped?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-2.5 py-1 text-sm font-bold border ${gradeBgColor(grade)} ${gradeTextColor(grade)} ${gradeBorderColor(grade)}`}
    >
      {grade}
      {isCapped && <span className="text-[10px] text-orange-400">*</span>}
    </span>
  )
}

function ScoreBar({ score }: { score: number }) {
  const width = Math.max(2, Math.min(100, score))
  let barColor = "bg-red-500"
  if (score >= 80) barColor = "bg-emerald-500"
  else if (score >= 60) barColor = "bg-blue-500"
  else if (score >= 40) barColor = "bg-amber-500"
  else if (score >= 20) barColor = "bg-orange-500"

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums w-8 text-right shrink-0">
        {score.toFixed(0)}
      </span>
    </div>
  )
}

// ── Insight Card ─────────────────────────────────────────────────────

function InsightCard({
  icon,
  label,
  platform,
  grade,
  score,
  accent,
}: {
  icon: React.ReactNode
  label: string
  platform: string
  grade: string
  score: number
  accent: string
}) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.02] p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${accent}`}>{icon}</div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-foreground">{platform}</span>
        <GradeBadge grade={grade} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Score: {score.toFixed(1)} / 100
      </p>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────

interface CrossPortalClientProps {
  platforms: UnifiedPlatform[]
}

export function CrossPortalClient({ platforms }: CrossPortalClientProps) {
  const [filter, setFilter] = useState<FilterOption>("all")
  const [sortBy, setSortBy] = useState<SortOption>("score-desc")

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = platforms
    if (filter !== "all") {
      list = list.filter((p) => p.type === filter)
    }
    const sorted = [...list]
    switch (sortBy) {
      case "score-desc":
        sorted.sort((a, b) => b.overallScore - a.overallScore)
        break
      case "score-asc":
        sorted.sort((a, b) => a.overallScore - b.overallScore)
        break
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
    }
    return sorted
  }, [platforms, filter, sortBy])

  // Insights
  const safestOverall = useMemo(() => {
    if (platforms.length === 0) return null
    return [...platforms].sort((a, b) => b.overallScore - a.overallScore)[0]
  }, [platforms])

  const safestChatbot = useMemo(() => {
    const chatbots = platforms.filter((p) => p.type === "ai-chatbot")
    if (chatbots.length === 0) return null
    return [...chatbots].sort((a, b) => b.overallScore - a.overallScore)[0]
  }, [platforms])

  const safestStreaming = useMemo(() => {
    const streaming = platforms.filter((p) => p.type === "streaming")
    if (streaming.length === 0) return null
    return [...streaming].sort((a, b) => b.overallScore - a.overallScore)[0]
  }, [platforms])

  const chatbotCount = platforms.filter((p) => p.type === "ai-chatbot").length
  const streamingCount = platforms.filter((p) => p.type === "streaming").length
  const totalTests = platforms.reduce((sum, p) => sum + p.testCount, 0)
  const cappedCount = platforms.filter((p) => !!p.gradeCap).length

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-brand-green/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-brand-green" />
              <span className="text-xs font-medium text-brand-green uppercase tracking-wider">
                Cross-Portal Comparison
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Cross-Portal Safety Comparison
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Is Netflix Kids safer than ChatGPT for a 7-year-old? Compare child
              safety across {chatbotCount} AI chatbot platforms and{" "}
              {streamingCount} streaming services on a unified 0&ndash;100 safety
              scale.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {platforms.length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Total Platforms
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-400">
                {chatbotCount}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                AI Chatbots
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-400">
                {streamingCount}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Streaming Services
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {totalTests}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Total Tests Run
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insight Cards */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {safestOverall && (
            <InsightCard
              icon={<Trophy className="h-4 w-4 text-amber-400" />}
              label="Safest Overall"
              platform={safestOverall.name}
              grade={safestOverall.overallGrade}
              score={safestOverall.overallScore}
              accent="bg-amber-500/15"
            />
          )}
          {safestChatbot && (
            <InsightCard
              icon={<Bot className="h-4 w-4 text-violet-400" />}
              label="Safest AI Chatbot"
              platform={safestChatbot.name}
              grade={safestChatbot.overallGrade}
              score={safestChatbot.overallScore}
              accent="bg-violet-500/15"
            />
          )}
          {safestStreaming && (
            <InsightCard
              icon={<Monitor className="h-4 w-4 text-sky-400" />}
              label="Safest Streaming"
              platform={safestStreaming.name}
              grade={safestStreaming.overallGrade}
              score={safestStreaming.overallScore}
              accent="bg-sky-500/15"
            />
          )}
        </div>

        {cappedCount > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
            <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-300/80">
              <strong>{cappedCount} platform{cappedCount !== 1 ? "s" : ""}</strong>{" "}
              had grade caps applied due to critical safety failures. Capped grades
              are marked with an asterisk (*).
            </p>
          </div>
        )}
      </section>

      {/* Filters + Rankings */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Filter Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
            {(
              [
                ["all", "All Platforms"],
                ["ai-chatbot", "AI Chatbots"],
                ["streaming", "Streaming"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === key
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs bg-transparent border border-white/10 rounded-md px-2 py-1.5 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-green/50"
            >
              <option value="score-desc">Highest Score First</option>
              <option value="score-asc">Lowest Score First</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2.5rem_1fr_6rem_1fr_5rem] sm:grid-cols-[2.5rem_1fr_7rem_6rem_1fr_5rem] gap-3 items-center px-4 py-3 bg-white/[0.03] border-b border-white/10 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            <span className="text-center">#</span>
            <span>Platform</span>
            <span className="hidden sm:block">Type</span>
            <span className="text-center">Grade</span>
            <span>Score</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.map((p, i) => (
            <Link
              key={p.id}
              href={p.detailHref}
              className="grid grid-cols-[2.5rem_1fr_6rem_1fr_5rem] sm:grid-cols-[2.5rem_1fr_7rem_6rem_1fr_5rem] gap-3 items-center px-4 py-3.5 border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
            >
              <span className="text-center text-sm font-medium text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors truncate block">
                  {p.name}
                </span>
                <span className="sm:hidden mt-0.5 block">
                  <TypeBadge type={p.type} />
                </span>
              </div>
              <span className="hidden sm:block">
                <TypeBadge type={p.type} />
              </span>
              <span className="text-center">
                <GradeBadge grade={p.overallGrade} isCapped={!!p.gradeCap} />
              </span>
              <ScoreBar score={p.overallScore} />
              <span className="flex justify-end">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-green transition-colors" />
              </span>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No platforms match the selected filter.
            </div>
          )}
        </div>

        {/* Score Legend */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-brand-green" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              About the Scores
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All platforms are scored on the same <strong className="text-foreground">0&ndash;100 safety scale</strong>.
            AI chatbots are tested against 40 adversarial prompts across 8 safety
            categories. Streaming platforms are tested across 9 content-safety
            categories on child, tween, and teen profiles. Both use
            exponential penalties for critical failures and grade caps for the
            worst violations. A higher score means better child safety.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
            {[
              { grade: "A+", range: "97-100" },
              { grade: "A", range: "93-96" },
              { grade: "B+", range: "87-89" },
              { grade: "C+", range: "77-79" },
              { grade: "D", range: "60-66" },
              { grade: "F", range: "0-59" },
            ].map((g) => (
              <div key={g.grade} className="flex items-center gap-2">
                <GradeBadge grade={g.grade} />
                <span className="text-[11px] text-muted-foreground">
                  {g.range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
