"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useStytchUser } from "@stytch/nextjs"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import { DevOrgContext } from "@/contexts/dev-org-context"
import type { DeveloperOrg, DeveloperAPIKey } from "@/lib/types"

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  const { getToken } = useApi()
  const { user } = useStytchUser()
  const [org, setOrg] = useState<DeveloperOrg | null>(null)
  const [keys, setKeys] = useState<DeveloperAPIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const provision = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = (await getToken()) ?? undefined

      // Build auth headers for the ensure-dev-org route
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      const sandboxSession =
        process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" && typeof window !== "undefined" ? localStorage.getItem("sandbox-session") : null
      if (sandboxSession) {
        headers["X-Sandbox-Session"] = sandboxSession
      } else if (token) {
        headers["Authorization"] = `Bearer ${token}`
      } else {
        // Token not ready yet — parent layout guarantees auth, so retry shortly
        setLoading(false)
        if (retryTimer.current) clearTimeout(retryTimer.current)
        retryTimer.current = setTimeout(() => provision(), 500)
        return
      }

      // Derive org name from user info
      const name = user?.name?.first_name
        ? `${user.name.first_name}${user.name.last_name ? ` ${user.name.last_name}` : ""}'s Organization`
        : user?.emails?.[0]?.email
          ? `${user.emails[0].email.split("@")[0]}'s Organization`
          : "My Organization"

      const res = await fetch("/api/ensure-dev-org", {
        method: "POST",
        headers,
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(body.error || res.statusText)
      }

      const ensuredOrg: DeveloperOrg = await res.json()
      setOrg(ensuredOrg)

      // Fetch keys for the org
      const authToken = token || undefined
      try {
        const orgKeys = await api.listDeveloperKeys(authToken!, ensuredOrg.id)
        setKeys(orgKeys || [])
      } catch {
        // Keys fetch failure is non-blocking — page still loads
        setKeys([])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to provision developer org"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [getToken, user])

  useEffect(() => {
    provision()
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [provision])

  return (
    <DevOrgContext.Provider value={{ org, keys, loading, error, refetch: provision }}>
      {children}
    </DevOrgContext.Provider>
  )
}
