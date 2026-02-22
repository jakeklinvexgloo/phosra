import { NextRequest, NextResponse } from "next/server"
import { queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * GET /api/investors/portal/invite/[code]
 * Validate an invite link (public, no auth needed).
 * Anti-enumeration: always returns 200 with valid boolean.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params

    const invite = await queryOne<{
      created_by: string
      uses: string
      max_uses: string
      expires_at: string
    }>(
      `SELECT il.created_by, il.uses::text, il.max_uses::text, il.expires_at::text
       FROM investor_invite_links il
       WHERE il.code = $1`,
      [code],
    )

    if (!invite) {
      return NextResponse.json({ valid: false })
    }

    const isExpired = new Date(invite.expires_at) < new Date()
    const isUsed = parseInt(invite.uses, 10) >= parseInt(invite.max_uses, 10)

    if (isExpired || isUsed) {
      return NextResponse.json({ valid: false })
    }

    // Look up referrer info
    const referrer = await queryOne<{ name: string; company: string }>(
      `SELECT name, company FROM investor_approved_phones WHERE phone_e164 = $1`,
      [invite.created_by],
    )

    return NextResponse.json({
      valid: true,
      referrerName: referrer?.name || "An investor",
      referrerCompany: referrer?.company || "",
    })
  } catch (error) {
    console.error("invite validate error:", error)
    return NextResponse.json({ valid: false })
  }
}
