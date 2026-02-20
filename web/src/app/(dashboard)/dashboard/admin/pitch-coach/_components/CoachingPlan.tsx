"use client"

import { useMemo } from "react"
import { ArrowLeft, Target, Lightbulb, TrendingUp, TrendingDown, Mic, Star, AlertTriangle } from "lucide-react"
import type { PitchSession, PitchPersona } from "@/lib/admin/types"
import { PERSONA_META } from "@/lib/admin/types"

interface CoachingPlanProps {
  sessions: PitchSession[]
  onBack: () => void
  onPractice: () => void
}

export function CoachingPlan({ sessions, onBack, onPractice }: CoachingPlanProps) {
  // Only include completed sessions with scores
  const scoredSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.status === "completed" && s.overall_score != null)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [sessions]
  )

  // Analyze weakest areas
  const weakestAreas = useMemo(() => {
    if (scoredSessions.length === 0) return []

    type Area = { key: string; label: string; scores: number[] }
    const areas: Area[] = [
      { key: "clarity", label: "Clarity", scores: [] },
      { key: "persuasion", label: "Persuasion", scores: [] },
      { key: "confidence", label: "Confidence", scores: [] },
      { key: "structure", label: "Structure", scores: [] },
    ]

    for (const s of scoredSessions) {
      const m = s.metrics
      if (!m) continue
      if (m.clarity_score != null) areas[0].scores.push(m.clarity_score)
      if (m.persuasion_score != null) areas[1].scores.push(m.persuasion_score)
      if (m.confidence_score != null) areas[2].scores.push(m.confidence_score)
      if (m.structure_score != null) areas[3].scores.push(m.structure_score)
    }

    return areas
      .filter((a) => a.scores.length > 0)
      .map((a) => ({
        ...a,
        avg: Math.round(a.scores.reduce((sum, s) => sum + s, 0) / a.scores.length),
        trend: a.scores.length >= 2
          ? a.scores[a.scores.length - 1] - a.scores[0]
          : 0,
      }))
      .sort((a, b) => a.avg - b.avg)
  }, [scoredSessions])

  // Most improved area
  const mostImproved = useMemo(() => {
    if (weakestAreas.length === 0) return null
    const sorted = [...weakestAreas].sort((a, b) => b.trend - a.trend)
    return sorted[0]?.trend > 0 ? sorted[0] : null
  }, [weakestAreas])

  // Filler word progress
  const fillerProgress = useMemo(() => {
    const withFillers = scoredSessions.filter((s) => s.metrics?.filler_word_count != null)
    if (withFillers.length < 2) return null
    const first = withFillers[0].metrics!.filler_word_count
    const last = withFillers[withFillers.length - 1].metrics!.filler_word_count
    const pctChange = first > 0 ? Math.round(((last - first) / first) * 100) : 0
    return { first, last, pctChange, improving: last < first }
  }, [scoredSessions])

  // Best session
  const bestSession = useMemo(() => {
    if (scoredSessions.length === 0) return null
    return scoredSessions.reduce((best, s) =>
      (s.overall_score ?? 0) > (best.overall_score ?? 0) ? s : best
    )
  }, [scoredSessions])

  // Under-practiced persona
  const underPracticedPersona = useMemo(() => {
    const counts: Record<PitchPersona, number> = { investor: 0, partner: 0, legislator: 0 }
    for (const s of scoredSessions) {
      counts[s.persona as PitchPersona]++
    }
    const min = Math.min(...Object.values(counts))
    const personas = (Object.keys(counts) as PitchPersona[]).filter((p) => counts[p] === min)
    return personas[0]
  }, [scoredSessions])

  // Generate top 3 focus recommendations
  const recommendations = useMemo(() => {
    const recs: { title: string; description: string; icon: typeof Target; priority: "high" | "medium" | "low" }[] = []

    // 1. Weakest skill area
    if (weakestAreas.length > 0 && weakestAreas[0].avg < 70) {
      recs.push({
        title: `Improve your ${weakestAreas[0].label.toLowerCase()}`,
        description: `Your average ${weakestAreas[0].label.toLowerCase()} score is ${weakestAreas[0].avg}/100. Focus on ${
          weakestAreas[0].key === "clarity"
            ? "using simpler language, concrete examples, and clear transitions"
            : weakestAreas[0].key === "persuasion"
            ? "leading with outcomes, using data points, and addressing objections proactively"
            : weakestAreas[0].key === "confidence"
            ? "speaking with conviction, reducing hedging language, and maintaining steady pace"
            : "opening with a clear thesis, following a logical arc, and summarizing key points"
        }.`,
        icon: Target,
        priority: "high",
      })
    }

    // 2. Filler words
    if (fillerProgress && !fillerProgress.improving) {
      recs.push({
        title: "Reduce filler words",
        description: `Your filler word count went from ${fillerProgress.first} to ${fillerProgress.last} (${fillerProgress.pctChange > 0 ? "+" : ""}${fillerProgress.pctChange}%). Try pausing silently instead of filling gaps with "um" or "uh."`,
        icon: Mic,
        priority: "high",
      })
    } else if (fillerProgress && fillerProgress.improving) {
      recs.push({
        title: "Keep reducing filler words",
        description: `Great progress! Filler words down ${Math.abs(fillerProgress.pctChange)}% (${fillerProgress.first} → ${fillerProgress.last}). Keep it up — aim for under 5 per session.`,
        icon: Mic,
        priority: "low",
      })
    }

    // 3. Under-practiced persona
    if (underPracticedPersona) {
      const meta = PERSONA_META[underPracticedPersona]
      recs.push({
        title: `Practice with ${meta.label}`,
        description: `You haven't practiced enough with the ${meta.label.toLowerCase()} persona. Different audiences require different approaches — try a session targeting this audience.`,
        icon: Lightbulb,
        priority: "medium",
      })
    }

    // 4. If second weakest area is also low
    if (weakestAreas.length > 1 && weakestAreas[1].avg < 65) {
      recs.push({
        title: `Work on ${weakestAreas[1].label.toLowerCase()} too`,
        description: `Your ${weakestAreas[1].label.toLowerCase()} averages ${weakestAreas[1].avg}/100. Consider recording a standalone 60-second practice clip focusing just on this skill.`,
        icon: Target,
        priority: "medium",
      })
    }

    return recs.slice(0, 3)
  }, [weakestAreas, fillerProgress, underPracticedPersona])

  if (scoredSessions.length < 3) {
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
          <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground">Need More Data</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete at least 3 practice sessions to generate your personalized coaching plan.
          </p>
          <button
            onClick={onPractice}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Mic className="w-3.5 h-3.5" />
            Start Practicing
          </button>
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
        <h1 className="text-2xl font-semibold text-foreground">Your Coaching Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personalized recommendations based on {scoredSessions.length} completed sessions.
        </p>
      </div>

      {/* Top Recommendations */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Top Focus Areas This Week</h2>
        {recommendations.map((rec, i) => {
          const Icon = rec.icon
          return (
            <div
              key={i}
              className={`plaid-card flex items-start gap-4 ${
                rec.priority === "high"
                  ? "border-l-4 border-l-red-400"
                  : rec.priority === "medium"
                  ? "border-l-4 border-l-amber-400"
                  : "border-l-4 border-l-brand-green"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                rec.priority === "high"
                  ? "bg-red-100 dark:bg-red-900/20"
                  : rec.priority === "medium"
                  ? "bg-amber-100 dark:bg-amber-900/20"
                  : "bg-emerald-100 dark:bg-emerald-900/20"
              }`}>
                <Icon className={`w-4 h-4 ${
                  rec.priority === "high"
                    ? "text-red-500"
                    : rec.priority === "medium"
                    ? "text-amber-500"
                    : "text-brand-green"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">{rec.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rec.description}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                rec.priority === "high"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : rec.priority === "medium"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              }`}>
                {rec.priority}
              </span>
            </div>
          )
        })}
      </div>

      {/* Skill Breakdown */}
      <div className="plaid-card">
        <h2 className="text-sm font-semibold text-foreground mb-4">Skill Breakdown (All Sessions)</h2>
        <div className="space-y-4">
          {weakestAreas.map((area) => (
            <div key={area.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-foreground font-medium">{area.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground tabular-nums">{area.avg}</span>
                  {area.trend !== 0 && (
                    <span className={`flex items-center gap-0.5 text-xs ${
                      area.trend > 0 ? "text-brand-green" : "text-red-500"
                    }`}>
                      {area.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {area.trend > 0 ? "+" : ""}{area.trend}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    area.avg >= 80 ? "bg-brand-green" : area.avg >= 60 ? "bg-amber-400" : "bg-red-400"
                  }`}
                  style={{ width: `${area.avg}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Session */}
        {bestSession && (
          <div className="plaid-card">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">Best Session</span>
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums">{bestSession.overall_score}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {PERSONA_META[bestSession.persona as PitchPersona]?.icon}{" "}
              {PERSONA_META[bestSession.persona as PitchPersona]?.label} &middot;{" "}
              {new Date(bestSession.created_at).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Most Improved Area */}
        {mostImproved && (
          <div className="plaid-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-brand-green" />
              <span className="text-sm font-semibold text-foreground">Most Improved</span>
            </div>
            <div className="text-3xl font-bold text-brand-green tabular-nums">+{mostImproved.trend}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {mostImproved.label} (avg {mostImproved.avg}/100)
            </div>
          </div>
        )}

        {/* Sessions Completed */}
        <div className="plaid-card">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-foreground">Total Sessions</span>
          </div>
          <div className="text-3xl font-bold text-foreground tabular-nums">{scoredSessions.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Avg score: {Math.round(scoredSessions.reduce((sum, s) => sum + (s.overall_score ?? 0), 0) / scoredSessions.length)}/100
          </div>
        </div>
      </div>

      {/* Practice CTA */}
      <div className="plaid-card bg-brand-green/5 border-brand-green/20 text-center py-6">
        <h3 className="text-base font-semibold text-foreground mb-1">Ready to Improve?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {recommendations.length > 0
            ? `Focus on ${recommendations[0].title.toLowerCase()} in your next session.`
            : "Start a new practice session to continue improving."}
        </p>
        <button
          onClick={onPractice}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Mic className="w-4 h-4" />
          Start Practice Session
        </button>
      </div>
    </div>
  )
}
