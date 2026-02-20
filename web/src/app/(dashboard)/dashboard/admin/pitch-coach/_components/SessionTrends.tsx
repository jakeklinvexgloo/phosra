"use client"

import { useMemo } from "react"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Target, Volume2, Lightbulb } from "lucide-react"
import type { PitchSession, PitchPersona } from "@/lib/admin/types"
import { PERSONA_META } from "@/lib/admin/types"

interface SessionTrendsProps {
  sessions: PitchSession[]
  onBack: () => void
}

export function SessionTrends({ sessions, onBack }: SessionTrendsProps) {
  // Only include completed sessions with scores
  const scoredSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.status === "completed" && s.overall_score != null)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [sessions]
  )

  const latestMetrics = useMemo(() => {
    const recent = [...scoredSessions].reverse()
    return {
      latest: recent[0],
      previous: recent[1],
    }
  }, [scoredSessions])

  // Calculate trend (latest vs previous)
  const trend = useMemo(() => {
    const { latest, previous } = latestMetrics
    if (!latest || !previous) return null
    const diff = (latest.overall_score ?? 0) - (previous.overall_score ?? 0)
    return { diff, positive: diff > 0, flat: diff === 0 }
  }, [latestMetrics])

  // Per-persona breakdown
  const personaStats = useMemo(() => {
    const stats: Record<PitchPersona, { count: number; avgScore: number; bestScore: number }> = {
      investor: { count: 0, avgScore: 0, bestScore: 0 },
      partner: { count: 0, avgScore: 0, bestScore: 0 },
      legislator: { count: 0, avgScore: 0, bestScore: 0 },
    }
    for (const s of scoredSessions) {
      const persona = s.persona as PitchPersona
      if (stats[persona]) {
        stats[persona].count++
        stats[persona].avgScore += s.overall_score ?? 0
        stats[persona].bestScore = Math.max(stats[persona].bestScore, s.overall_score ?? 0)
      }
    }
    for (const key of Object.keys(stats) as PitchPersona[]) {
      if (stats[key].count > 0) {
        stats[key].avgScore = Math.round(stats[key].avgScore / stats[key].count)
      }
    }
    return stats
  }, [scoredSessions])

  // Average filler word count trend
  const fillerTrend = useMemo(() => {
    const withFillers = scoredSessions.filter((s) => s.metrics?.filler_word_count != null)
    if (withFillers.length < 2) return null
    const firstHalf = withFillers.slice(0, Math.ceil(withFillers.length / 2))
    const secondHalf = withFillers.slice(Math.ceil(withFillers.length / 2))
    const avgFirst = firstHalf.reduce((sum, s) => sum + (s.metrics?.filler_word_count ?? 0), 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((sum, s) => sum + (s.metrics?.filler_word_count ?? 0), 0) / secondHalf.length
    const pctChange = avgFirst > 0 ? Math.round(((avgSecond - avgFirst) / avgFirst) * 100) : 0
    return { avgFirst: Math.round(avgFirst), avgSecond: Math.round(avgSecond), pctChange }
  }, [scoredSessions])

  // Mini sparkline chart (pure CSS)
  const scoreData = scoredSessions.map((s) => s.overall_score ?? 0)
  const maxScore = Math.max(...scoreData, 100)
  const minScore = Math.min(...scoreData, 0)
  const range = maxScore - minScore || 1

  if (scoredSessions.length === 0) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sessions
        </button>
        <div className="plaid-card text-center py-16">
          <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground">No Trend Data Yet</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete at least 2 practice sessions to see your progress trends.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sessions
        </button>
        <h1 className="text-2xl font-semibold text-foreground">Session Trends</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your pitch improvement across {scoredSessions.length} completed session{scoredSessions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Latest Score */}
        <div className="plaid-card">
          <div className="text-xs text-muted-foreground mb-1">Latest Score</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground tabular-nums">
              {latestMetrics.latest?.overall_score ?? "—"}
            </span>
            {trend && (
              <span className={`flex items-center gap-0.5 text-sm font-medium ${
                trend.positive ? "text-brand-green" : trend.flat ? "text-muted-foreground" : "text-red-500"
              }`}>
                {trend.positive ? <TrendingUp className="w-3.5 h-3.5" /> : trend.flat ? <Minus className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {trend.positive ? "+" : ""}{trend.diff}
              </span>
            )}
          </div>
        </div>

        {/* Best Score */}
        <div className="plaid-card">
          <div className="text-xs text-muted-foreground mb-1">Best Score</div>
          <div className="text-3xl font-bold text-foreground tabular-nums">
            {Math.max(...scoreData)}
          </div>
        </div>

        {/* Average Score */}
        <div className="plaid-card">
          <div className="text-xs text-muted-foreground mb-1">Average Score</div>
          <div className="text-3xl font-bold text-foreground tabular-nums">
            {Math.round(scoreData.reduce((a, b) => a + b, 0) / scoreData.length)}
          </div>
        </div>
      </div>

      {/* Score Timeline (CSS-based chart) */}
      <div className="plaid-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Score Over Time</h3>
        <div className="relative h-40">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-4 w-8 flex flex-col justify-between text-[10px] text-muted-foreground">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
          {/* Chart area */}
          <div className="ml-10 h-full flex items-end gap-1 pb-4">
            {scoredSessions.map((s, i) => {
              const score = s.overall_score ?? 0
              const height = ((score - minScore) / range) * 100
              const persona = PERSONA_META[s.persona as PitchPersona]
              return (
                <div
                  key={s.id}
                  className="flex-1 flex flex-col items-center gap-1 group"
                  title={`${new Date(s.created_at).toLocaleDateString()} — ${score}`}
                >
                  <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    {score}
                  </span>
                  <div
                    className={`w-full max-w-8 rounded-t transition-all ${
                      score >= 80 ? "bg-brand-green" : score >= 60 ? "bg-amber-400" : "bg-red-400"
                    } group-hover:opacity-80`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-[8px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {persona?.icon}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filler Words Trend */}
      {fillerTrend && (
        <div className="plaid-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Filler Words Trend</h3>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-muted-foreground mb-1">First half avg</div>
              <div className="text-xl font-bold text-foreground tabular-nums">{fillerTrend.avgFirst}</div>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Second half avg</div>
              <div className="text-xl font-bold text-foreground tabular-nums">{fillerTrend.avgSecond}</div>
            </div>
            <div className={`text-sm font-medium ${
              fillerTrend.pctChange < 0 ? "text-brand-green" : fillerTrend.pctChange > 0 ? "text-red-500" : "text-muted-foreground"
            }`}>
              {fillerTrend.pctChange < 0 ? "↓" : fillerTrend.pctChange > 0 ? "↑" : "—"} {Math.abs(fillerTrend.pctChange)}%
              <div className="text-[10px] text-muted-foreground font-normal">
                {fillerTrend.pctChange < 0 ? "Improving!" : fillerTrend.pctChange > 0 ? "Getting worse" : "No change"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-Persona Stats */}
      <div className="plaid-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">By Persona</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["investor", "partner", "legislator"] as PitchPersona[]).map((p) => {
            const meta = PERSONA_META[p]
            const stats = personaStats[p]
            return (
              <div key={p} className={`p-4 rounded-lg border border-border ${stats.count > 0 ? "" : "opacity-50"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{meta.icon}</span>
                  <span className="text-sm font-medium text-foreground">{meta.label}</span>
                </div>
                {stats.count > 0 ? (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-foreground tabular-nums">{stats.count}</div>
                      <div className="text-[10px] text-muted-foreground">Sessions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground tabular-nums">{stats.avgScore}</div>
                      <div className="text-[10px] text-muted-foreground">Avg Score</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground tabular-nums">{stats.bestScore}</div>
                      <div className="text-[10px] text-muted-foreground">Best</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No sessions yet</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
