"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Lock } from "lucide-react"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    // Check for Stytch session cookie (client-side check)
    const cookies = document.cookie.split(";").map(c => c.trim())
    const hasJwt = cookies.some(c => c.startsWith("stytch_session_jwt="))
    setHasSession(hasJwt)
  }, [])

  // Loading state
  if (hasSession === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    )
  }

  // Not authenticated
  if (!hasSession) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="p-4 rounded-full bg-muted">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Authentication Required</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Sign in to access the developer dashboard, manage API keys, and view usage analytics.
          </p>
        </div>
        <Link
          href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/developers/dashboard")}`}
          className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
