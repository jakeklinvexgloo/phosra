"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useStytchUser, useStytchSession } from "@stytch/nextjs"
import { useApi } from "@/lib/useApi"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useStytchUser()
  const { session } = useStytchSession()
  const { fetch: authedFetch } = useApi()
  const fetchRef = useRef(authedFetch)
  fetchRef.current = authedFetch
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) {
      setAuthorized(false)
      return
    }

    // Wait for the Stytch session to be fully initialized before checking admin
    if (!session) return

    let cancelled = false
    let retries = 0
    const maxRetries = 3

    const checkAdmin = () => {
      fetchRef.current("/auth/me")
        .then((me: { is_admin?: boolean }) => {
          if (cancelled) return
          setAuthorized(me?.is_admin ? true : false)
        })
        .catch(() => {
          if (cancelled) return
          if (retries < maxRetries) {
            retries++
            setTimeout(checkAdmin, 1000)
          } else {
            setAuthorized(prev => prev === true ? true : false)
          }
        })
    }

    checkAdmin()
    return () => { cancelled = true }
  }, [user?.user_id, session?.session_id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authorized === false) {
      router.push("/dashboard")
    }
  }, [authorized, router])

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">Verifying admin access...</div>
      </div>
    )
  }

  if (!authorized) return null

  return <>{children}</>
}
