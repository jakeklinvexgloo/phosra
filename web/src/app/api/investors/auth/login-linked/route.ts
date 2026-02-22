import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/investors/db"
import { createSessionToken, hashToken } from "@/lib/investors/session"

export const runtime = "nodejs"

/**
 * POST /api/investors/auth/login-linked
 * Login via linked email magic link or Google token (skips phone OTP).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      provider: "google" | "email"
      idToken?: string
      email?: string
    }

    let providerLookup: { provider: string; provider_id: string } | null = null

    if (body.provider === "google" && body.idToken) {
      // Verify Google id_token
      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${body.idToken}`,
      )
      if (!googleRes.ok) {
        return NextResponse.json(
          { error: "Invalid Google token" },
          { status: 400 },
        )
      }
      const googlePayload = (await googleRes.json()) as {
        sub: string
        email: string
      }
      providerLookup = { provider: "google", provider_id: googlePayload.sub }
    } else if (body.provider === "email" && body.email) {
      providerLookup = {
        provider: "email",
        provider_id: body.email.toLowerCase(),
      }
    } else {
      return NextResponse.json(
        { error: "Invalid login request" },
        { status: 400 },
      )
    }

    // Look up linked account
    const linked = await queryOne<{ phone_e164: string }>(
      `SELECT phone_e164 FROM investor_linked_accounts
       WHERE provider = $1 AND provider_id = $2`,
      [providerLookup.provider, providerLookup.provider_id],
    )

    if (!linked) {
      return NextResponse.json(
        { error: "No account found. Please sign in with your phone number first." },
        { status: 404 },
      )
    }

    // Verify phone is still active
    const investor = await queryOne<{
      name: string
      company: string
      is_active: boolean
    }>(
      `SELECT name, company, is_active FROM investor_approved_phones WHERE phone_e164 = $1`,
      [linked.phone_e164],
    )

    if (!investor?.is_active) {
      return NextResponse.json(
        { error: "Access has been revoked" },
        { status: 403 },
      )
    }

    // Create session
    const { token, jti, expiresAt } = await createSessionToken({
      phone: linked.phone_e164,
      name: investor.name,
      company: investor.company,
    })

    const ua = req.headers.get("user-agent") ?? ""
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      ""

    await query(
      `INSERT INTO investor_sessions (phone_e164, token_hash, expires_at, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [linked.phone_e164, hashToken(jti), expiresAt.toISOString(), ua, ip],
    )

    const isProd = process.env.NODE_ENV === "production"
    const sessionDays = parseInt(
      process.env.INVESTOR_SESSION_DAYS ?? "30",
      10,
    )

    const res = NextResponse.json({
      message: "Authenticated",
      investor: {
        phone: linked.phone_e164,
        name: investor.name,
        company: investor.company,
      },
    })

    res.cookies.set("investor_session", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: sessionDays * 24 * 60 * 60,
    })

    return res
  } catch (error) {
    console.error("login-linked error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    )
  }
}
