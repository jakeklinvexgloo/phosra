import { NextRequest, NextResponse } from "next/server"
import { normalizePhone } from "@/lib/investors/phone"
import { verifyOtp } from "@/lib/investors/otp"
import { createSessionToken, hashToken } from "@/lib/investors/session"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

const MAX_ATTEMPTS = 3

/**
 * POST /api/investors/auth/verify-otp
 * Verify 6-digit code, create JWT session, set httpOnly cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, code } = (await req.json()) as {
      phone?: string
      code?: string
    }

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone and code are required" },
        { status: 400 },
      )
    }

    const normalized = normalizePhone(phone)
    if (!normalized) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 },
      )
    }

    // Find the latest unused, unexpired OTP for this phone
    const otp = await queryOne<{
      id: string
      code_hash: string
      attempts: number
    }>(
      `SELECT id, code_hash, attempts FROM investor_otp_codes
       WHERE phone_e164 = $1 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [normalized],
    )

    if (!otp) {
      return NextResponse.json(
        { error: "Code expired or not found. Please request a new one." },
        { status: 400 },
      )
    }

    // Check attempts
    if (otp.attempts >= MAX_ATTEMPTS) {
      // Mark as used to prevent further attempts
      await query(`UPDATE investor_otp_codes SET used = TRUE WHERE id = $1`, [
        otp.id,
      ])
      return NextResponse.json(
        { error: "Too many attempts. Please request a new code." },
        { status: 400 },
      )
    }

    // Increment attempts
    await query(
      `UPDATE investor_otp_codes SET attempts = attempts + 1 WHERE id = $1`,
      [otp.id],
    )

    // Verify code
    if (!verifyOtp(code, otp.code_hash)) {
      const remaining = MAX_ATTEMPTS - otp.attempts - 1
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
              : "Too many attempts. Please request a new code.",
        },
        { status: 400 },
      )
    }

    // Mark OTP as used
    await query(`UPDATE investor_otp_codes SET used = TRUE WHERE id = $1`, [
      otp.id,
    ])

    // Get investor info
    const investor = await queryOne<{ name: string; company: string }>(
      `SELECT name, company FROM investor_approved_phones WHERE phone_e164 = $1 AND is_active = TRUE`,
      [normalized],
    )

    if (!investor) {
      return NextResponse.json(
        { error: "Phone number is no longer approved" },
        { status: 403 },
      )
    }

    // Create session
    const { token, jti, expiresAt } = await createSessionToken({
      phone: normalized,
      name: investor.name,
      company: investor.company,
    })

    // Store session in DB
    const ua = req.headers.get("user-agent") ?? ""
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      ""

    await query(
      `INSERT INTO investor_sessions (phone_e164, token_hash, expires_at, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [normalized, hashToken(jti), expiresAt.toISOString(), ua, ip],
    )

    // Set httpOnly cookie
    const isProd = process.env.NODE_ENV === "production"
    const sessionDays = parseInt(
      process.env.INVESTOR_SESSION_DAYS ?? "30",
      10,
    )

    const res = NextResponse.json({
      message: "Authenticated",
      investor: { phone: normalized, name: investor.name, company: investor.company },
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
    console.error("verify-otp error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    )
  }
}
