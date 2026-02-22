"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowLeft, RotateCcw, CheckCircle2, AlertTriangle, Loader2,
  MessageSquare, Target, Lightbulb, TrendingUp, Volume2, Play, Heart,
} from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { PitchSession } from "@/lib/admin/types"
import { PERSONA_META } from "@/lib/admin/types"
import { EmotionTimeline } from "./EmotionTimeline"

interface SessionReviewProps {
  sessionId: string
  onBack: () => void
  onPracticeAgain: () => void
}

export function SessionReview({ sessionId, onBack, onPracticeAgain }: SessionReviewProps) {
  const { getToken } = useApi()
  const [session, setSession] = useState<PitchSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<"feedback" | "transcript" | "metrics" | "emotions">("feedback")
  const [videoTimeMs, setVideoTimeMs] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  const toggleVideo = () => {
    if (!videoRef.current) return
    if (videoPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setVideoPlaying(!videoPlaying)
  }

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
  const hasRecording = !!session.recording_path

  // Build filler word breakdown data for the chart
  const fillerBreakdown: { word: string; count: number }[] = []
  if (metrics?.filler_words && Array.isArray(metrics.filler_words)) {
    const counts: Record<string, number> = {}
    for (const w of metrics.filler_words) {
      counts[w] = (counts[w] || 0) + 1
    }
    for (const [word, count] of Object.entries(counts)) {
      fillerBreakdown.push({ word, count })
    }
    fillerBreakdown.sort((a, b) => b.count - a.count)
  }

  // WPM classification
  const getWpmLabel = (wpm: number) => {
    if (wpm < 110) return { label: "Slow — try speaking a bit faster", color: "text-amber-500" }
    if (wpm < 130) return { label: "Good conversational pace", color: "text-brand-green" }
    if (wpm < 160) return { label: "Ideal pitch pace", color: "text-brand-green" }
    if (wpm < 180) return { label: "A bit fast — breathe more", color: "text-amber-500" }
    return { label: "Too fast — slow down", color: "text-red-500" }
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

      {/* Video Player + Overall Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video Player */}
        {hasRecording && (
          <div className="lg:col-span-2">
            <div className="plaid-card p-0 overflow-hidden">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={api.getPitchRecordingUrl(session.id)}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                  onPlay={() => setVideoPlaying(true)}
                  onPause={() => setVideoPlaying(false)}
                  onEnded={() => setVideoPlaying(false)}
                  onTimeUpdate={(e) => setVideoTimeMs(Math.round(e.currentTarget.currentTime * 1000))}
                />
                {!videoPlaying && (
                  <button
                    onClick={toggleVideo}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-black ml-0.5" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overall Score */}
        <div className={hasRecording ? "lg:col-span-1" : "lg:col-span-3"}>
          {session.overall_score != null && (
            <div className={`plaid-card flex ${hasRecording ? "flex-col items-center justify-center h-full gap-4 py-8" : "items-center gap-6"}`}>
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="7" fill="none" className="text-muted/50" />
                  <circle
                    cx="48" cy="48" r="42"
                    stroke="currentColor"
                    strokeWidth="7"
                    fill="none"
                    className="text-brand-green"
                    strokeDasharray={`${(session.overall_score / 100) * 264} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{session.overall_score}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-base font-semibold text-foreground">Overall Score</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {session.overall_score >= 80 ? "Excellent pitch!" : session.overall_score >= 60 ? "Good with room to improve" : "Keep practicing!"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-Scores */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Clarity", score: metrics.clarity_score, icon: Target, color: "text-blue-500" },
            { label: "Persuasion", score: metrics.persuasion_score, icon: TrendingUp, color: "text-emerald-500" },
            { label: "Confidence", score: metrics.confidence_score, icon: Volume2, color: "text-purple-500" },
            { label: "Structure", score: metrics.structure_score, icon: Lightbulb, color: "text-amber-500" },
          ].map(({ label, score, icon: Icon, color }) => (
            <div key={label} className="plaid-card text-center">
              <Icon className={`w-4 h-4 ${color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-foreground tabular-nums">{score ?? "—"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              {score != null && (
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      score >= 80 ? "bg-brand-green" : score >= 60 ? "bg-amber-400" : "bg-red-400"
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        {[
          { key: "feedback" as const, label: "Feedback" },
          { key: "metrics" as const, label: "Speech Metrics" },
          ...(metrics?.emotion_data ? [{ key: "emotions" as const, label: "Vocal Emotions" }] : []),
          { key: "transcript" as const, label: "Transcript" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content: Feedback */}
      {activeTab === "feedback" && feedback && (
        <div className="space-y-6">
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

          {/* Specific Moments */}
          {feedback.specific_moments && feedback.specific_moments.length > 0 && (
            <div className="plaid-card">
              <h3 className="text-sm font-semibold text-foreground mb-3">Key Moments</h3>
              <div className="space-y-2">
                {feedback.specific_moments.map((moment, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-2 rounded-md transition-colors ${
                      hasRecording ? "hover:bg-muted/50 cursor-pointer" : ""
                    }`}
                    onClick={() => {
                      if (videoRef.current && hasRecording) {
                        videoRef.current.currentTime = moment.timestamp_ms / 1000
                        videoRef.current.play()
                        setVideoPlaying(true)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                    }}
                  >
                    {hasRecording && (
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
                        {Math.floor(moment.timestamp_ms / 60000)}:{String(Math.floor((moment.timestamp_ms % 60000) / 1000)).padStart(2, "0")}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">{moment.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
        </div>
      )}

      {/* Tab Content: Speech Metrics */}
      {activeTab === "metrics" && metrics && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="plaid-card text-center">
              <div className="text-3xl font-bold text-foreground tabular-nums">{metrics.filler_word_count}</div>
              <div className="text-xs text-muted-foreground mt-1">Filler Words</div>
            </div>
            <div className="plaid-card text-center">
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {metrics.words_per_minute ? Math.round(metrics.words_per_minute) : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Words/Minute</div>
              {metrics.words_per_minute && (
                <div className={`text-[10px] mt-1 ${getWpmLabel(metrics.words_per_minute).color}`}>
                  {getWpmLabel(metrics.words_per_minute).label}
                </div>
              )}
            </div>
            <div className="plaid-card text-center">
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {metrics.silence_percentage != null ? `${Math.round(metrics.silence_percentage)}%` : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Silence</div>
              {metrics.silence_percentage != null && (
                <div className={`text-[10px] mt-1 ${
                  metrics.silence_percentage < 20 ? "text-brand-green" : metrics.silence_percentage < 40 ? "text-amber-500" : "text-red-500"
                }`}>
                  {metrics.silence_percentage < 20 ? "Good flow" : metrics.silence_percentage < 40 ? "Some pauses" : "Lots of silence"}
                </div>
              )}
            </div>
          </div>

          {/* Filler Word Breakdown Chart */}
          {fillerBreakdown.length > 0 && (
            <div className="plaid-card">
              <h3 className="text-sm font-semibold text-foreground mb-4">Filler Word Breakdown</h3>
              <div className="space-y-2.5">
                {fillerBreakdown.map(({ word, count }) => {
                  const maxCount = Math.max(...fillerBreakdown.map((f) => f.count))
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                  return (
                    <div key={word} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-20 text-right font-mono">&ldquo;{word}&rdquo;</span>
                      <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
                        <div
                          className="h-full rounded bg-amber-400/70 flex items-center px-2"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        >
                          <span className="text-xs font-medium text-amber-900">{count}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* WPM Gauge */}
          {metrics.words_per_minute && (
            <div className="plaid-card">
              <h3 className="text-sm font-semibold text-foreground mb-4">Speaking Pace</h3>
              <div className="relative h-8 rounded-full bg-gradient-to-r from-blue-200 via-green-200 to-red-200 overflow-hidden">
                {/* Marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-foreground rounded-full"
                  style={{
                    left: `${Math.min(Math.max(((metrics.words_per_minute - 80) / (220 - 80)) * 100, 2), 98)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>80 WPM (Slow)</span>
                <span>130-160 (Ideal)</span>
                <span>220 WPM (Fast)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Vocal Emotions */}
      {activeTab === "emotions" && metrics?.emotion_data && (
        <EmotionTimeline
          emotionData={metrics.emotion_data}
          currentTimeMs={videoTimeMs}
          onSeek={(timeMs) => {
            if (videoRef.current && hasRecording) {
              videoRef.current.currentTime = timeMs / 1000
              videoRef.current.play()
              setVideoPlaying(true)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          }}
        />
      )}

      {/* Tab Content: Transcript */}
      {activeTab === "transcript" && session.transcript && session.transcript.length > 0 && (
        <div className="plaid-card">
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
