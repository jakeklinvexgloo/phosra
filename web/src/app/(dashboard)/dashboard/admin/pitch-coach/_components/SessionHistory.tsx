"use client"

import { Mic, Trash2, Plus, Loader2, TrendingUp, GraduationCap } from "lucide-react"
import type { PitchSession } from "@/lib/admin/types"
import { PERSONA_META, PITCH_STATUS_META } from "@/lib/admin/types"

interface SessionHistoryProps {
  sessions: PitchSession[]
  loading: boolean
  onNewSession: () => void
  onViewSession: (id: string) => void
  onDeleteSession: (id: string) => void
  onViewTrends?: () => void
  onViewCoaching?: () => void
}

export function SessionHistory({
  sessions,
  loading,
  onNewSession,
  onViewSession,
  onDeleteSession,
  onViewTrends,
  onViewCoaching,
}: SessionHistoryProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const completedCount = sessions.filter((s) => s.status === "completed").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pitch Coach</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Practice pitching Phosra with realistic AI mock calls and get coaching feedback.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {completedCount >= 3 && onViewCoaching && (
            <button
              onClick={onViewCoaching}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-green/40 text-brand-green font-medium text-sm hover:bg-brand-green/5 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Coaching Plan
            </button>
          )}
          {completedCount >= 2 && onViewTrends && (
            <button
              onClick={onViewTrends}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted/50 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Trends
            </button>
          )}
          <button
            onClick={onNewSession}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            New Session
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && sessions.length === 0 && (
        <div className="plaid-card text-center py-16">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No practice sessions yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Start a practice session to rehearse your pitch with an AI investor, partner, or legislator.
          </p>
          <button
            onClick={onNewSession}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Start Your First Session
          </button>
        </div>
      )}

      {/* Session List */}
      {!loading && sessions.length > 0 && (
        <div className="plaid-card p-0 divide-y divide-border">
          {sessions.map((session) => {
            const persona = PERSONA_META[session.persona]
            const status = PITCH_STATUS_META[session.status]
            const isClickable = session.status === "completed" || session.status === "failed"
            return (
              <div
                key={session.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                  isClickable ? "hover:bg-muted/30 cursor-pointer" : ""
                }`}
                onClick={() => isClickable && onViewSession(session.id)}
              >
                <div className={`w-9 h-9 rounded-lg ${persona.bgColor} flex items-center justify-center text-base flex-shrink-0`}>
                  {persona.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{persona.label}</span>
                    <span className={`text-xs ${status.color}`}>{status.label}</span>
                    {session.recording_path && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">📹 Recorded</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(session.created_at)}
                    {session.duration_seconds ? ` · ${formatDuration(session.duration_seconds)}` : ""}
                  </div>
                </div>
                {session.overall_score != null && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-foreground tabular-nums">{session.overall_score}</div>
                    <div className="text-[10px] text-muted-foreground">score</div>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession(session.id)
                  }}
                  className="p-1.5 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                  title="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
