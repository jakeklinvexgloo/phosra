import { NextResponse } from "next/server"
import { requireInvestor } from "@/lib/stytch-auth"
import { query } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * POST /api/investors/portal/link-account
 * Link an email address to the authenticated investor's account.
 */
export async function POST(req: Request) {
  try {
    const auth = await requireInvestor()
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({})) as { email?: string }
    const email = body.email?.trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    // Upsert into investor_linked_accounts
    await query(
      `INSERT INTO investor_linked_accounts (phone_e164, provider, provider_id, provider_email)
       VALUES ($1, 'email', $2, $2)
       ON CONFLICT (provider, provider_id) DO NOTHING`,
      [auth.payload.phone, email],
    )

    return NextResponse.json({ linked: true, email })
  } catch (error) {
    console.error("link-account error:", error)
    return NextResponse.json({ error: "Failed to link account" }, { status: 500 })
  }
}
