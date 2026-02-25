"use client"

import { useCallback } from "react"
import * as Sentry from "@sentry/nextjs"
import { api } from "./api"

/**
 * Hook that provides an authenticated fetch function.
 *
 * API calls from the browser go through the Next.js proxy at
 * /api/backend/* which reads the Stytch session JWT from the
 * HttpOnly cookie and forwards it to the Go backend. No client-side
 * token management needed.
 */
export function useApi() {
  const authedFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      try {
        // api.fetch() routes through the proxy when called from browser
        // without an explicit token — the proxy handles auth via cookie
        return await api.fetch(path, options)
      } catch (err) {
        if (err instanceof Error && err.message === "Session expired") {
          console.warn(`[useApi] 401 on ${path}`)
          Sentry.addBreadcrumb({ category: "auth", message: `401 on ${path}`, level: "warning" })
        }
        throw err
      }
    },
    []
  )

  // getToken still available for WebSocket connections etc that need explicit tokens
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/token", { credentials: "same-origin" })
      if (!res.ok) return null
      const data = await res.json()
      return data.token ?? null
    } catch {
      return null
    }
  }, [])

  return { fetch: authedFetch, getToken }
}
