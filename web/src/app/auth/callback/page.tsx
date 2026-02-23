"use client"

import { Suspense, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useStytch, useStytchSession } from "@stytch/nextjs"
import { Loader2 } from "lucide-react"

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stytch = useStytch()
  const { session } = useStytchSession()
  const authenticating = useRef(false)

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
        router.replace("/dashboard")
      } catch (err) {
        console.error("Auth callback error:", err)
        router.replace("/login?error=auth_failed")
      }
    }

    authenticate()
  }, [stytch, session, searchParams, router])

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
