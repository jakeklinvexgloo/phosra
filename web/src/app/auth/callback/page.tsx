"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useStytch, useStytchSession } from "@stytch/nextjs"
import { Loader2 } from "lucide-react"

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stytch = useStytch()
  const { session } = useStytchSession()
  const authenticating = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      router.replace("/dashboard")
      return
    }

    const token = searchParams.get("token")
    const tokenType = searchParams.get("stytch_token_type")

    if (!token) {
      router.replace("/login?error=missing_token")
      return
    }

    if (authenticating.current) return
    authenticating.current = true

    const authenticate = async () => {
      try {
        if (tokenType === "oauth") {
          await stytch.oauth.authenticate(token, {
            session_duration_minutes: 60 * 24 * 7,
          })
        } else if (tokenType === "magic_links") {
          await stytch.magicLinks.authenticate(token, {
            session_duration_minutes: 60 * 24 * 7,
          })
        } else {
          await stytch.oauth.authenticate(token, {
            session_duration_minutes: 60 * 24 * 7,
          })
        }
        // SDK sets cookies automatically — redirect to return_to or dashboard
        const returnTo = searchParams.get("return_to")
        router.replace(returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard")
      } catch (err: any) {
        console.error("Auth callback error:", err)
        const msg = err?.message || err?.error_message || JSON.stringify(err)
        setError(msg)
        // Auto-redirect after showing error briefly
        setTimeout(() => router.replace(`/login?error=auth_failed`), 3000)
      }
    }

    authenticate()
  }, [stytch, session, searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1B2A]">
        <div className="flex flex-col items-center gap-4 max-w-md px-6">
          <p className="text-red-400 text-sm font-medium">Authentication Error</p>
          <p className="text-white/60 text-xs text-center break-all">{error}</p>
          <p className="text-white/40 text-xs">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1B2A]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
        <p className="text-white/60 text-sm">Signing you in...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0D1B2A]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <p className="text-white/60 text-sm">Signing you in...</p>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  )
}
