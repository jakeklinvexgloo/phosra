"use client"

import { useState, useEffect, useCallback, useRef } from "react"

/**
 * Manages a sandbox session lifecycle for the hero modal.
 *
 * - Generates a unique session ID
 * - Calls /api/playground/setup to pre-populate the Klinvex Family
 * - Provides a sandbox token for useChat() transport
 * - Resets session data on cleanup
 */
export function useHeroSession() {
  const [sessionId] = useState(
    () => `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  )
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const setupCalledRef = useRef(false)

  const sandboxToken = `sandbox-${sessionId}`

  // Run setup on mount
  useEffect(() => {
    if (setupCalledRef.current) return
    setupCalledRef.current = true

    async function setup() {
      try {
        const res = await fetch("/api/playground/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })
        if (!res.ok) {
          throw new Error(`Setup failed: ${res.status}`)
        }
        setIsReady(true)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Setup failed"))
      }
    }

    setup()
  }, [sessionId])

  const reset = useCallback(async () => {
    try {
      await fetch("/api/playground/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
    } catch {
      // ignore cleanup errors
    }
  }, [sessionId])

  return { sessionId, sandboxToken, isReady, error, reset }
}
