import { NextRequest, NextResponse } from "next/server"
import { queryOne } from "@/lib/investors/db"
import { normalizePhone } from "@/lib/investors/phone"
import { generateOtp, hashOtp } from "@/lib/investors/otp"
import { isRateLimited } from "@/lib/investors/rate-limit"
import { sendOtpSms } from "@/lib/investors/twilio"
import { query } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * POST /api/investors/auth/request-otp
 * Accept phone number, send OTP if approved.
 * Anti-enumeration: same response regardless of approval status.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone } = (await req.json()) as { phone?: string }

    if (!phone) {
      return NextResponse.json(
        { message: "Phone number is required" },
        { status: 400 },
      )
    }

    const normalized = normalizePhone(phone)
    if (!normalized) {
      return NextResponse.json(
        { message: "Invalid phone number format" },
        { status: 400 },
      )
    }

    // Always return the same response shape (anti-enumeration)
    const successResponse = NextResponse.json({
      message: "If this number is approved, you will receive a code shortly.",
    })

    // Check if phone is approved and active
    const approved = await queryOne<{ phone_e164: string }>(
      `SELECT phone_e164 FROM investor_approved_phones WHERE phone_e164 = $1 AND is_active = TRUE`,
      [normalized],
    )

    if (!approved) {
      // Random delay to prevent timing attacks (200-800ms)
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 600))
      return successResponse
    }

    // Check rate limit
    if (await isRateLimited(normalized)) {
      // Still return same shape — don't reveal rate limit to unapproved users
      return successResponse
    }

    // Generate and store OTP
    const code = generateOtp()
    const codeHash = hashOtp(code)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    await query(
      `INSERT INTO investor_otp_codes (phone_e164, code_hash, expires_at) VALUES ($1, $2, $3)`,
      [normalized, codeHash, expiresAt.toISOString()],
    )

    // Send SMS
    await sendOtpSms(normalized, code)

    return successResponse
  } catch (error) {
    console.error("request-otp error:", error)
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
