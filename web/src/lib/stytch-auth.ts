import { cookies } from "next/headers"
import { getStytchClient } from "./stytch-server"

interface StytchAuthResult {
  authenticated: true
  userId: string
  session: any
  user: any
}

interface StytchUnauthResult {
  authenticated: false
  userId: null
  session: null
  user: null
}

export async function requireAuth(): Promise<StytchAuthResult | StytchUnauthResult> {
  // Sandbox mode bypass
  if (process.env.NEXT_PUBLIC_SANDBOX_MODE === "true") {
    return {
      authenticated: true,
      userId: "sandbox-user",
      session: { user_id: "sandbox-user" },
      user: {
        user_id: "sandbox-user",
        name: { first_name: "Dev", last_name: "User" },
        trusted_metadata: { role: "admin" },
      },
    }
  }

  const cookieStore = await cookies()
  const sessionJwt = cookieStore.get("stytch_session_jwt")?.value

  if (!sessionJwt) {
    return { authenticated: false, userId: null, session: null, user: null }
  }

  try {
    const client = getStytchClient()
    const { session } = await client.sessions.authenticateJwt({
      session_jwt: sessionJwt,
    })
    const user = await client.users.get({ user_id: session.user_id })
    return { authenticated: true, userId: session.user_id, session, user }
  } catch {
    return { authenticated: false, userId: null, session: null, user: null }
  }
}

export interface InvestorPayload {
  phone: string
  name: string
  company: string
}

/**
 * Authenticate an investor from Stytch session.
 * Returns the same shape as the old verifySessionToken() payload.
 */
export async function requireInvestor(): Promise<
  { authenticated: true; payload: InvestorPayload } | { authenticated: false; payload: null }
> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authenticated: false, payload: null }
  }

  const phone = auth.user.phone_numbers?.[0]?.phone_number || ""
  const firstName = auth.user.name?.first_name || ""
  const lastName = auth.user.name?.last_name || ""
  const name = [firstName, lastName].filter(Boolean).join(" ")
  const company = (auth.user.trusted_metadata as any)?.company || ""

  return { authenticated: true, payload: { phone, name, company } }
}

export async function requireAdmin(): Promise<
  { authorized: true; user: any } | { authorized: false; user: null }
> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authorized: false, user: null }
  }

  const role = (auth.user.trusted_metadata as any)?.role
  if (role !== "admin") {
    return { authorized: false, user: null }
  }

  return { authorized: true, user: auth.user }
}
