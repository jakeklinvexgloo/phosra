"use client"

import { useCallback, useEffect, useState } from "react"

export interface InvestorSession {
  phone: string
  name: string
  company: string
}

type AuthState = "checking" | "unauthenticated" | "authenticated"

export function useInvestorSession() {
  const [state, setState] = useState<AuthState>("checking")
  const [investor, setInvestor] = useState<InvestorSession | null>(null)

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/investors/auth/session", {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setInvestor(data)
        setState("authenticated")
      } else {
        setInvestor(null)
        setState("unauthenticated")
      }
    } catch {
      setInvestor(null)
      setState("unauthenticated")
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const signOut = useCallback(async () => {
    await fetch("/api/investors/auth/session", {
      method: "DELETE",
      credentials: "include",
    })
    setInvestor(null)
    setState("unauthenticated")
  }, [])

  return {
    state,
    investor,
    isAuthenticated: state === "authenticated",
    isLoading: state === "checking",
    signOut,
    refreshSession: checkSession,
  }
}
