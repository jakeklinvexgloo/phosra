import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * POST /api/investors/portal/invite/[code]/claim
 * Record that an invite was used (called after OTP verification).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params
    const { phone } = (await req.json()) as { phone?: string }

    const invite = await queryOne<{
      id: string
      uses: string
      max_uses: string
      expires_at: string
    }>(
      `SELECT id, uses::text, max_uses::text, expires_at::text
       FROM investor_invite_links
       WHERE code = $1`,
      [code],
    )

    if (!invite) {
      return NextResponse.json({ ok: true })
    }

    const isExpired = new Date(invite.expires_at) < new Date()
    const isUsed = parseInt(invite.uses, 10) >= parseInt(invite.max_uses, 10)

    if (isExpired || isUsed) {
      return NextResponse.json({ ok: true })
    }

    const ua = req.headers.get("user-agent") ?? ""
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      ""

    // Increment uses
    await query(
      `UPDATE investor_invite_links SET uses = uses + 1 WHERE id = $1`,
      [invite.id],
    )

    // Record claim
    await query(
      `INSERT INTO investor_invite_claims (invite_code, name, company, email, ip_address, user_agent)
       VALUES ($1, $2, '', '', $3, $4)`,
      [code, phone || "", ip, ua],
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("invite claim error:", error)
    return NextResponse.json({ ok: true })
  }
}
