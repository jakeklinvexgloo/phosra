import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { verifySessionToken } from "@/lib/investors/session"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * POST /api/investors/portal/invite
 * Generate a one-time invite link. Requires authenticated investor session.
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

    const body = await req.json().catch(() => ({})) as { name?: string; recipientName?: string }
    const referrerName = body.name?.trim() || payload.name || ""
    const recipientName = body.recipientName?.trim() || ""

    if (!referrerName) {
      return NextResponse.json({ error: "Your full name is required to generate an invite" }, { status: 400 })
    }

    if (!recipientName) {
      return NextResponse.json({ error: "Recipient's name is required" }, { status: 400 })
    }

    // Update the investor's name in approved phones if provided
    if (body.name?.trim()) {
      await query(
        `UPDATE investor_approved_phones SET name = $1 WHERE phone_e164 = $2`,
        [referrerName, payload.phone],
      )
    }

    // Rate limit: max 5 active (unclaimed, unexpired) invites per investor
    const active = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM investor_invite_links
       WHERE created_by = $1 AND uses < max_uses AND expires_at > NOW()`,
      [payload.phone],
    )
    if (active && parseInt(active.count, 10) >= 5) {
      return NextResponse.json(
        { error: "You have too many active invites. Wait for them to expire or be used." },
        { status: 429 },
      )
    }

    const code = randomBytes(16).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await query(
      `INSERT INTO investor_invite_links (code, created_by, referrer_name, recipient_name, max_uses, expires_at)
       VALUES ($1, $2, $3, $4, 1, $5)`,
      [code, payload.phone, referrerName, recipientName, expiresAt.toISOString()],
    )

    return NextResponse.json({
      code,
      url: `https://phosra.com/investors/portal?invite=${code}`,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("invite generate error:", error)
    return NextResponse.json({ error: "Failed to generate invite" }, { status: 500 })
  }
}
