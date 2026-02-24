import { NextResponse } from "next/server"
import { requireInvestor } from "@/lib/stytch-auth"
import { query } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * POST /api/investors/portal/link-account
 * Link an email or Google account to the authenticated investor.
 * Body: { email: string } OR { provider: "google", providerId: string, email?: string }
 */
export async function POST(req: Request) {
  try {
    const auth = await requireInvestor()
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({})) as {
      email?: string
      provider?: string
      providerId?: string
    }

    const provider = body.provider || "email"
    const email = body.email?.trim().toLowerCase() || ""
    const providerId = body.providerId || email

    if (provider === "email") {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
      }
    } else if (provider === "google") {
      if (!providerId) {
        return NextResponse.json({ error: "Provider ID is required" }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
    }

    await query(
      `INSERT INTO investor_linked_accounts (phone_e164, provider, provider_id, provider_email)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (provider, provider_id) DO NOTHING`,
      [auth.payload.phone, provider, providerId, email],
    )

    return NextResponse.json({ linked: true, provider, email })
  } catch (error) {
    console.error("link-account error:", error)
    return NextResponse.json({ error: "Failed to link account" }, { status: 500 })
  }
}
