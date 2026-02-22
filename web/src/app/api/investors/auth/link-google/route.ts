import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken } from "@/lib/investors/session"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * POST /api/investors/auth/link-google
 * Accept Google OAuth id_token, verify, and create linked account.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("investor_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifySessionToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { idToken } = (await req.json()) as { idToken?: string }
    if (!idToken) {
      return NextResponse.json(
        { error: "Google id_token is required" },
        { status: 400 },
      )
    }

    // Verify Google id_token
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
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
      email_verified: string
    }

    if (!googlePayload.sub || !googlePayload.email) {
      return NextResponse.json(
        { error: "Invalid Google token payload" },
        { status: 400 },
      )
    }

    // Check if already linked
    const existing = await queryOne(
      `SELECT id FROM investor_linked_accounts WHERE phone_e164 = $1 AND provider = 'google'`,
      [payload.phone],
    )
    if (existing) {
      return NextResponse.json(
        { error: "Google account already linked" },
        { status: 400 },
      )
    }

    // Create linked account
    await query(
      `INSERT INTO investor_linked_accounts (phone_e164, provider, provider_id, provider_email)
       VALUES ($1, 'google', $2, $3)
       ON CONFLICT (provider, provider_id) DO NOTHING`,
      [payload.phone, googlePayload.sub, googlePayload.email],
    )

    return NextResponse.json({ message: "Google account linked" })
  } catch (error) {
    console.error("link-google error:", error)
    return NextResponse.json(
      { error: "Failed to link Google account" },
      { status: 500 },
    )
  }
}
