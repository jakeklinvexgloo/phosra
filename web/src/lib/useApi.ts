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
      return tokens?.session_jwt ?? null
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
