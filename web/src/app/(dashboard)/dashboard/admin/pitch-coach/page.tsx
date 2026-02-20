"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { PitchSession, PitchPersona } from "@/lib/admin/types"
import { SessionSetup } from "./_components/SessionSetup"
import { LiveSession } from "./_components/LiveSession"
import { SessionReview } from "./_components/SessionReview"
import { SessionHistory } from "./_components/SessionHistory"

type Phase = "list" | "setup" | "live" | "review"

export default function PitchCoachPage() {
  const { getToken } = useApi()
  const [phase, setPhase] = useState<Phase>("list")
  const [sessions, setSessions] = useState<PitchSession[]>([])
  const [activeSession, setActiveSession] = useState<PitchSession | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const data = await api.listPitchSessions(token)
      setSessions(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleStartSession = async (persona: PitchPersona) => {
    const token = (await getToken()) ?? undefined
    const session = await api.createPitchSession(persona, {}, token)
    setActiveSession(session)
    setPhase("live")
  }

  const handleEndSession = async () => {
    if (!activeSession) return
    const token = (await getToken()) ?? undefined
    await api.endPitchSession(activeSession.id, token)
    // Transition to review — poll for completion
    setPhase("review")
  }

  const handleViewSession = async (id: string) => {
    const token = (await getToken()) ?? undefined
    const session = await api.getPitchSession(id, token)
    setActiveSession(session)
    setPhase("review")
  }

  const handleDeleteSession = async (id: string) => {
    const token = (await getToken()) ?? undefined
    await api.deletePitchSession(id, token)
    fetchSessions()
  }

  const handleBackToList = () => {
    setActiveSession(null)
    setPhase("list")
    fetchSessions()
  }

  switch (phase) {
    case "list":
      return (
        <SessionHistory
          sessions={sessions}
          loading={loading}
          onNewSession={() => setPhase("setup")}
          onViewSession={handleViewSession}
          onDeleteSession={handleDeleteSession}
        />
      )

    case "setup":
      return (
        <SessionSetup
          onStart={handleStartSession}
          onBack={handleBackToList}
        />
      )

    case "live":
      return activeSession ? (
        <LiveSession
          session={activeSession}
          onEnd={handleEndSession}
          onBack={handleBackToList}
        />
      ) : null

    case "review":
      return activeSession ? (
        <SessionReview
          sessionId={activeSession.id}
          onBack={handleBackToList}
          onPracticeAgain={() => setPhase("setup")}
        />
      ) : null

    default:
      return null
  }
}
