"use client"

import { useCallback } from "react"
import { useStytch } from "@stytch/nextjs"
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
      // SDK may not have initialized tokens yet — wait briefly and retry
      await new Promise(r => setTimeout(r, 500))
      const retry = stytch.session.getTokens()
      return retry?.session_jwt ?? null
    } catch {
      return null
    }
  }, [stytch])

  const authedFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      const token = await getToken()
      return api.fetch(path, options, token ?? undefined)
    },
    [getToken]
  )

  return { fetch: authedFetch, getToken }
}
