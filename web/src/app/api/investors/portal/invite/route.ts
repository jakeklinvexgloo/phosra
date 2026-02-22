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
      `INSERT INTO investor_invite_links (code, created_by, max_uses, expires_at)
       VALUES ($1, $2, 1, $3)`,
      [code, payload.phone, expiresAt.toISOString()],
    )

    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "https://phosra.com"

    return NextResponse.json({
      code,
      url: `${baseUrl}/investors/portal?invite=${code}`,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("invite generate error:", error)
    return NextResponse.json({ error: "Failed to generate invite" }, { status: 500 })
  }
}
