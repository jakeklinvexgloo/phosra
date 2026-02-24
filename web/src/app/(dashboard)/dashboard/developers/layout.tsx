"use client"

import { useCallback, useEffect, useState } from "react"
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

  const provision = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = (await getToken()) ?? undefined

      // Build auth headers for the ensure-dev-org route
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      const sandboxSession =
        typeof window !== "undefined" ? localStorage.getItem("sandbox-session") : null
      if (sandboxSession) {
        headers["X-Sandbox-Session"] = sandboxSession
      } else if (token) {
        headers["Authorization"] = `Bearer ${token}`
      } else {
        setError("Not authenticated")
        setLoading(false)
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
  }, [provision])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">
          Setting up developer environment...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={provision}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <DevOrgContext.Provider value={{ org, keys, loading, error, refetch: provision }}>
      {children}
    </DevOrgContext.Provider>
  )
}
