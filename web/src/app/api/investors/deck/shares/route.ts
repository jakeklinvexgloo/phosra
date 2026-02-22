import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken } from "@/lib/investors/session"
import { query } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * GET /api/investors/deck/shares
 * List the current investor's deck shares with view counts.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("investor_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifySessionToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const shares = await query<{
      id: string
      token: string
      recipient_hint: string
      created_at: string
      is_active: boolean
      view_count: string
      last_viewed: string | null
    }>(
      `SELECT ds.id, ds.token, ds.recipient_hint, ds.created_at, ds.is_active,
              COUNT(dv.id)::text AS view_count,
              MAX(dv.viewed_at)::text AS last_viewed
       FROM deck_shares ds
       LEFT JOIN deck_share_views dv ON dv.share_id = ds.id
       WHERE ds.shared_by_phone = $1
       GROUP BY ds.id
       ORDER BY ds.created_at DESC`,
      [payload.phone],
    )

    return NextResponse.json(
      shares.map((s) => ({
        id: s.id,
        token: s.token,
        recipientHint: s.recipient_hint,
        createdAt: s.created_at,
        isActive: s.is_active,
        viewCount: parseInt(s.view_count, 10),
        lastViewed: s.last_viewed,
        url: `https://phosra.com/deck/s/${s.token}`,
      })),
    )
  } catch (error) {
    console.error("deck shares list error:", error)
    return NextResponse.json({ error: "Failed to list shares" }, { status: 500 })
  }
}
