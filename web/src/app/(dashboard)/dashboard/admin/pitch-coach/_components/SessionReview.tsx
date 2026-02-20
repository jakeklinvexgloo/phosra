"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ArrowLeft, RotateCcw, CheckCircle2, AlertTriangle, Loader2,
  MessageSquare, Target, Lightbulb, TrendingUp, Volume2,
} from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { PitchSession } from "@/lib/admin/types"
import { PERSONA_META, PITCH_STATUS_META } from "@/lib/admin/types"

interface SessionReviewProps {
  sessionId: string
  onBack: () => void
  onPracticeAgain: () => void
}

export function SessionReview({ sessionId, onBack, onPracticeAgain }: SessionReviewProps) {
  const { getToken } = useApi()
  const [session, setSession] = useState<PitchSession | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const data = await api.getPitchSession(sessionId, token)
      setSession(data)

      // Keep polling if processing
      if (data.status === "processing") {
        setTimeout(fetchSession, 3000)
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }, [getToken, sessionId])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  if (loading || !session || session.status === "processing") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Generating Feedback</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Analyzing your pitch for clarity, confidence, and persuasion...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (session.status === "failed") {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sessions
        </button>
        <div className="plaid-card border-destructive/50 text-center py-12">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground">Feedback Generation Failed</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The session transcript may have been too short to analyze.
          </p>
          <button
            onClick={onPracticeAgain}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const feedback = session.feedback
  const metrics = session.metrics
  const persona = PERSONA_META[session.persona]

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Session Review</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>{persona.icon} {persona.label}</span>
              <span className="text-muted-foreground/50">|</span>
              <span>{session.duration_seconds ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s` : "—"}</span>
              <span className="text-muted-foreground/50">|</span>
              <span>{new Date(session.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <button
            onClick={onPracticeAgain}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Practice Again
          </button>
        </div>
      </div>

      {/* Overall Score */}
      {session.overall_score != null && (
        <div className="plaid-card flex items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/50" />
              <circle
                cx="40" cy="40" r="35"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-brand-green"
                strokeDasharray={`${(session.overall_score / 100) * 220} 220`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-foreground">{session.overall_score}</span>
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">Overall Score</div>
            <div className="text-sm text-muted-foreground">
              {session.overall_score >= 80 ? "Excellent pitch!" : session.overall_score >= 60 ? "Good pitch with room for improvement" : "Keep practicing — you're getting better!"}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Scores */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Clarity", score: metrics.clarity_score, icon: Target },
            { label: "Persuasion", score: metrics.persuasion_score, icon: TrendingUp },
            { label: "Confidence", score: metrics.confidence_score, icon: Volume2 },
            { label: "Structure", score: metrics.structure_score, icon: Lightbulb },
          ].map(({ label, score, icon: Icon }) => (
            <div key={label} className="plaid-card text-center">
              <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground tabular-nums">{score ?? "—"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Speech Metrics */}
      {metrics && (
        <div className="grid grid-cols-3 gap-4">
          <div className="plaid-card text-center">
            <div className="text-xl font-bold text-foreground tabular-nums">{metrics.filler_word_count}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Filler Words</div>
            {metrics.filler_words && metrics.filler_words.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1 justify-center">
                {metrics.filler_words.map((w: string, i: number) => (
                  <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="plaid-card text-center">
            <div className="text-xl font-bold text-foreground tabular-nums">
              {metrics.words_per_minute ? Math.round(metrics.words_per_minute) : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Words/Minute</div>
            {metrics.words_per_minute && (
              <div className="text-[10px] text-muted-foreground mt-1">
                {metrics.words_per_minute < 120 ? "A bit slow" : metrics.words_per_minute > 170 ? "A bit fast" : "Good pace"}
              </div>
            )}
          </div>
          <div className="plaid-card text-center">
            <div className="text-xl font-bold text-foreground tabular-nums">
              {metrics.silence_percentage != null ? `${Math.round(metrics.silence_percentage)}%` : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Silence</div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <>
          {/* Summary */}
          <div className="plaid-card">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{feedback.summary}</p>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="plaid-card">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {feedback.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-brand-green mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="plaid-card">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {feedback.improvements?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Practice */}
          {feedback.recommended_practice && (
            <div className="plaid-card bg-brand-green/5 border-brand-green/20">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-brand-green" />
                Recommended Practice
              </h3>
              <p className="text-sm text-muted-foreground">{feedback.recommended_practice}</p>
            </div>
          )}
        </>
      )}

      {/* Transcript */}
      {session.transcript && session.transcript.length > 0 && (
        <div className="plaid-card">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            Full Transcript
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {session.transcript.map((entry, i) => (
              <div key={i} className="flex gap-3">
                <span className={`text-xs font-medium flex-shrink-0 w-8 pt-0.5 ${
                  entry.speaker === "user" ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {entry.speaker === "user" ? "You" : "AI"}
                </span>
                <p className="text-sm text-muted-foreground">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
