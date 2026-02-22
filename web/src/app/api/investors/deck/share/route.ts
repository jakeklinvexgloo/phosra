import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { verifySessionToken } from "@/lib/investors/session"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * POST /api/investors/deck/share
 * Generate a trackable deck share link. Requires authenticated investor session.
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

    const body = (await req.json().catch(() => ({}))) as {
      recipientHint?: string
    }
    const recipientHint = body.recipientHint?.trim() || ""

    // Rate limit: max 20 active shares per investor
    const active = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM deck_shares
       WHERE shared_by_phone = $1 AND is_active = true`,
      [payload.phone],
    )
    if (active && parseInt(active.count, 10) >= 20) {
      return NextResponse.json(
        { error: "You have too many active share links. Deactivate some before creating more." },
        { status: 429 },
      )
    }

    const shareToken = randomBytes(16).toString("hex")

    await query(
      `INSERT INTO deck_shares (token, shared_by_phone, shared_by_name, shared_by_company, recipient_hint)
       VALUES ($1, $2, $3, $4, $5)`,
      [shareToken, payload.phone, payload.name || "", payload.company || "", recipientHint],
    )

    return NextResponse.json({
      token: shareToken,
      url: `https://phosra.com/deck/s/${shareToken}`,
    })
  } catch (error) {
    console.error("deck share create error:", error)
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
  }
}
