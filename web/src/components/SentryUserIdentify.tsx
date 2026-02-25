"use client"

import { useEffect } from "react"
import { useStytchUser } from "@stytch/nextjs"
import * as Sentry from "@sentry/nextjs"

/**
 * Sets the Sentry user context whenever the Stytch user changes.
 * Render this once near the root of authenticated layouts.
 */
export function SentryUserIdentify() {
  const { user } = useStytchUser()

  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.user_id,
        email: user.emails?.[0]?.email,
      })
    } else {
      Sentry.setUser(null)
    }
  }, [user])

  return null
}
