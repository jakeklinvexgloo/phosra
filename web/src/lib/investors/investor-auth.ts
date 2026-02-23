"use client"

import { useCallback, useState, useEffect } from "react"
import { useStytch, useStytchUser, useStytchSession } from "@stytch/nextjs"

export interface InvestorSession {
  phone: string
  name: string
  company: string
}

type AuthState = "checking" | "unauthenticated" | "authenticated"

export function useInvestorSession() {
  const stytch = useStytch()
  const { user, isInitialized: userInitialized } = useStytchUser()
  const { session } = useStytchSession()
  const [state, setState] = useState<AuthState>("checking")
  const [investor, setInvestor] = useState<InvestorSession | null>(null)

  useEffect(() => {
    if (!userInitialized) return

    if (session && user) {
      const phone = user.phone_numbers?.[0]?.phone_number || ""
      const firstName = user.name?.first_name || ""
      const lastName = user.name?.last_name || ""
      const name = [firstName, lastName].filter(Boolean).join(" ")
      const company = (user.trusted_metadata as Record<string, unknown>)?.company as string || ""

      setInvestor({ phone, name, company })
      setState("authenticated")
    } else {
      setInvestor(null)
      setState("unauthenticated")
    }
  }, [session, user, userInitialized])

  const signOut = useCallback(async () => {
    try {
      await stytch.session.revoke()
    } catch {
      // Session may already be expired
    }
    setInvestor(null)
    setState("unauthenticated")
  }, [stytch])

  const refreshSession = useCallback(() => {
    // Stytch SDK auto-refreshes; trigger re-check by resetting state
    if (!userInitialized) return
    if (session && user) {
      const phone = user.phone_numbers?.[0]?.phone_number || ""
      const firstName = user.name?.first_name || ""
      const lastName = user.name?.last_name || ""
      const name = [firstName, lastName].filter(Boolean).join(" ")
      const company = (user.trusted_metadata as Record<string, unknown>)?.company as string || ""

      setInvestor({ phone, name, company })
      setState("authenticated")
    }
  }, [session, user, userInitialized])

  return {
    state,
    investor,
    isAuthenticated: state === "authenticated",
    isLoading: state === "checking",
    signOut,
    refreshSession,
  }
}
