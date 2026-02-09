"use client"

import { useCallback } from "react"
import { useAccessToken } from "@workos-inc/authkit-nextjs/components"
import { api } from "./api"

export function useApi() {
  const { getAccessToken } = useAccessToken()

  const authedFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      const token = await getAccessToken()
      return api.fetch(path, options, token ?? undefined)
    },
    [getAccessToken]
  )

  return { fetch: authedFetch, getToken: getAccessToken }
}
