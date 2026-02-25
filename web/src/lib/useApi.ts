"use client"

import { useCallback } from "react"
import { useStytch } from "@stytch/nextjs"
import * as Sentry from "@sentry/nextjs"
import { api } from "./api"

export function useApi() {
  const stytch = useStytch()

  const getToken = useCallback(async (): Promise<string | null> => {
    // Sandbox mode bypass (dev only)
    if (process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" && typeof window !== "undefined" && localStorage.getItem("sandbox-session")) {
      return null
    }
    try {
      const tokens = stytch.session.getTokens()
      if (tokens?.session_jwt) return tokens.session_jwt
      console.debug("[useApi] No JWT on first try, waiting 500ms...")
      // SDK may not have initialized tokens yet — wait briefly and retry
      await new Promise(r => setTimeout(r, 500))
      const retry = stytch.session.getTokens()
      if (!retry?.session_jwt) {
        console.warn("[useApi] No JWT after retry — session may not be ready")
      }
      return retry?.session_jwt ?? null
    } catch (err) {
      console.warn("[useApi] getToken error:", err)
      return null
    }
  }, [stytch])

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      console.debug("[useApi] Forcing session refresh via stytch.session.authenticate...")
      const resp = await stytch.session.authenticate({ session_duration_minutes: 60 * 24 * 7 })
      console.debug("[useApi] Session refresh succeeded")
      return resp.session_jwt ?? null
    } catch (err) {
      console.warn("[useApi] Session refresh failed:", err)
      Sentry.captureException(err, { tags: { context: "token_refresh" } })
      return null
    }
  }, [stytch])

  const authedFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      const token = await getToken()
      if (!token) {
        console.warn(`[useApi] Making request to ${path} without auth token`)
      }
      try {
        return await api.fetch(path, options, token ?? undefined)
      } catch (err) {
        // On 401, force a session refresh and retry once
        if (err instanceof Error && err.message === "Session expired") {
          console.warn(`[useApi] 401 on ${path} — attempting token refresh`)
          Sentry.addBreadcrumb({ category: "auth", message: `401 on ${path}`, level: "warning" })
          const freshToken = await refreshToken()
          if (freshToken) {
            console.debug(`[useApi] Retrying ${path} with fresh token`)
            return api.fetch(path, options, freshToken)
          }
          console.error(`[useApi] Token refresh failed — cannot retry ${path}`)
          Sentry.captureMessage(`Auth retry failed for ${path}`, "error")
        }
        throw err
      }
    },
    [getToken, refreshToken]
  )

  return { fetch: authedFetch, getToken }
}
