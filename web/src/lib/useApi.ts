"use client"

import { useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { api } from "./api"

export function useApi() {
  const { getToken } = useAuth()

  const authedFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      const token = await getToken()
      return api.fetch(path, options, token ?? undefined)
    },
    [getToken]
  )

  return { fetch: authedFetch, getToken }
}
