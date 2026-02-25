"use client"

import { useCallback } from "react"
import { useStytch } from "@stytch/nextjs"
import * as Sentry from "@sentry/nextjs"
import { api } from "./api"

/** Read the Stytch session JWT directly from the browser cookie. */
function getJwtFromCookie(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)stytch_session_jwt=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function useApi() {
  const stytch = useStytch()

  const getToken = useCallback(async (): Promise<string | null> => {
    // Sandbox mode bypass (dev only)
    if (process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" && typeof window !== "undefined" && localStorage.getItem("sandbox-session")) {
      return null
    }

    // 1. Try the SDK's getTokens() first
    try {
      const tokens = stytch.session.getTokens()
      if (tokens?.session_jwt) {
        console.debug("[useApi] Got JWT from SDK getTokens()")
        return tokens.session_jwt
      }
    } catch {}

    // 2. Fall back to reading the cookie directly (most reliable)
    const cookieJwt = getJwtFromCookie()
    if (cookieJwt) {
      console.debug("[useApi] Got JWT from cookie fallback")
      return cookieJwt
    }

    // 3. SDK may not have initialized yet — wait briefly and retry both
    console.debug("[useApi] No JWT yet, waiting 500ms for SDK init...")
    await new Promise(r => setTimeout(r, 500))

    try {
      const retry = stytch.session.getTokens()
      if (retry?.session_jwt) {
        console.debug("[useApi] Got JWT from SDK after wait")
        return retry.session_jwt
      }
    } catch {}

    const retryCookie = getJwtFromCookie()
    if (retryCookie) {
      console.debug("[useApi] Got JWT from cookie after wait")
      return retryCookie
    }

    console.warn("[useApi] No JWT available from SDK or cookie")
    return null
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
