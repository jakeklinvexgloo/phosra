"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useStytchUser, useStytchSession } from "@stytch/nextjs"
import { useApi } from "@/lib/useApi"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isInitialized } = useStytchUser()
  const { session } = useStytchSession()
  const { fetch: authedFetch } = useApi()
  const fetchRef = useRef(authedFetch)
  fetchRef.current = authedFetch
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // Don't do anything until Stytch SDK has fully initialized
    if (!isInitialized) return

    if (!user) {
      console.warn("[admin-layout] No Stytch user after SDK init — redirecting")
      setAuthorized(false)
      return
    }

    // Wait for the Stytch session to be available
    if (!session) {
      console.debug("[admin-layout] Waiting for Stytch session...")
      return
    }

    let cancelled = false
    let retries = 0
    const maxRetries = 5

    const checkAdmin = () => {
      const attempt = retries + 1
      console.debug(`[admin-layout] Checking admin status (attempt ${attempt}/${maxRetries + 1})...`)

      fetchRef.current("/auth/me")
        .then((me: { is_admin?: boolean }) => {
          if (cancelled) return
          if (me?.is_admin) {
            console.debug("[admin-layout] Admin access confirmed")
            setAuthorized(true)
          } else {
            console.warn("[admin-layout] User is not admin — redirecting to dashboard")
            setAuthorized(false)
          }
        })
        .catch((err: Error) => {
          if (cancelled) return
          console.warn(`[admin-layout] /auth/me failed (attempt ${attempt}):`, err.message)
          if (retries < maxRetries) {
            retries++
            // Exponential backoff: 500ms, 1s, 2s, 4s, 8s
            const delay = 500 * Math.pow(2, retries - 1)
            console.debug(`[admin-layout] Retrying in ${delay}ms...`)
            setTimeout(checkAdmin, delay)
          } else {
            // After exhausting retries, keep showing spinner rather than
            // kicking the user out. They can navigate away manually.
            console.error("[admin-layout] All retries exhausted — showing error state")
            setAuthorized(prev => prev === true ? true : prev)
          }
        })
    }

    checkAdmin()
    return () => { cancelled = true }
  }, [isInitialized, user?.user_id, session?.session_id]) // eslint-disable-line react-hooks/exhaustive-deps

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
