import { NextRequest, NextResponse } from "next/server"
import { createSessionToken, hashToken } from "@/lib/investors/session"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * POST /api/investors/portal/invite/[code]/claim
 * Claim an invite link (public, no auth needed).
 * Creates a session and grants immediate portal access.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params
    const { name, company, email } = (await req.json()) as {
      name?: string
      company?: string
      email?: string
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Validate invite
    const invite = await queryOne<{
      id: string
      created_by: string
      uses: string
      max_uses: string
      expires_at: string
    }>(
      `SELECT id, created_by, uses::text, max_uses::text, expires_at::text
       FROM investor_invite_links
       WHERE code = $1`,
      [code],
    )

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite link" }, { status: 400 })
    }

    const isExpired = new Date(invite.expires_at) < new Date()
    const isUsed = parseInt(invite.uses, 10) >= parseInt(invite.max_uses, 10)

    if (isExpired || isUsed) {
      return NextResponse.json({ error: "This invite link has expired or already been used" }, { status: 400 })
    }

    // Look up referrer info for the note
    const referrer = await queryOne<{ name: string; company: string }>(
      `SELECT name, company FROM investor_approved_phones WHERE phone_e164 = $1`,
      [invite.created_by],
    )
    const referrerLabel = referrer ? `${referrer.name}${referrer.company ? ` (${referrer.company})` : ""}` : "an investor"

    // Use a synthetic phone to identify this referred investor (invite:CODE)
    const syntheticPhone = `invite:${code}`

    const ua = req.headers.get("user-agent") ?? ""
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      ""

    // Increment uses on the invite
    await query(
      `UPDATE investor_invite_links SET uses = uses + 1 WHERE id = $1`,
      [invite.id],
    )

    // Record the claim
    await query(
      `INSERT INTO investor_invite_claims (invite_code, name, company, email, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [code, name.trim(), company?.trim() || "", email?.trim() || "", ip, ua],
    )

    // Auto-add to approved phones so admin can see them
    await query(
      `INSERT INTO investor_approved_phones (phone_e164, name, company, notes, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (phone_e164) DO UPDATE SET name = $2, company = $3, notes = $4`,
      [syntheticPhone, name.trim(), company?.trim() || "", `Referred by ${referrerLabel}`],
    )

    // Create JWT session
    const { token, jti, expiresAt } = await createSessionToken({
      phone: syntheticPhone,
      name: name.trim(),
      company: company?.trim() || "",
    })

    // Store session in DB
    await query(
      `INSERT INTO investor_sessions (phone_e164, token_hash, expires_at, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [syntheticPhone, hashToken(jti), expiresAt.toISOString(), ua, ip],
    )

    // Set httpOnly cookie
    const isProd = process.env.NODE_ENV === "production"
    const sessionDays = parseInt(process.env.INVESTOR_SESSION_DAYS ?? "30", 10)

    const res = NextResponse.json({
      message: "Authenticated",
      investor: { phone: syntheticPhone, name: name.trim(), company: company?.trim() || "" },
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
    console.error("invite claim error:", error)
    return NextResponse.json({ error: "Failed to claim invite" }, { status: 500 })
  }
}
