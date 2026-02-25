"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useStytchUser } from "@stytch/nextjs"
import { useApi } from "@/lib/useApi"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useStytchUser()
  const { fetch: authedFetch } = useApi()
  const fetchRef = useRef(authedFetch)
  fetchRef.current = authedFetch
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) {
      setAuthorized(false)
      return
    }

    fetchRef.current("/auth/me")
      .then((me: { is_admin?: boolean }) => {
        if (me?.is_admin) {
          setAuthorized(true)
        } else {
          setAuthorized(false)
        }
      })
      .catch(() => {
        // Only deny if we haven't already authorized
        setAuthorized(prev => prev === true ? true : false)
      })
  }, [user?.user_id]) // eslint-disable-line react-hooks/exhaustive-deps

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
