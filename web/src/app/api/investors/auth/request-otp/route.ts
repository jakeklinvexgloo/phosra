import { NextRequest, NextResponse } from "next/server"
import { queryOne, query } from "@/lib/investors/db"
import { normalizePhone } from "@/lib/investors/phone"
import { sendVerifyOtp } from "@/lib/investors/twilio"

export const runtime = "nodejs"

/**
 * POST /api/investors/auth/request-otp
 * Accept phone number, send OTP via Twilio Verify if approved.
 * If inviteCode is provided, auto-approve the phone number first.
 * Anti-enumeration: same response regardless of approval status.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, inviteCode } = (await req.json()) as { phone?: string; inviteCode?: string }

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

    // If invite code provided, validate and auto-approve this phone
    if (inviteCode) {
      const invite = await queryOne<{
        id: string
        created_by: string
        referrer_name: string
        recipient_name: string
        uses: string
        max_uses: string
        expires_at: string
      }>(
        `SELECT id, created_by, referrer_name, recipient_name, uses::text, max_uses::text, expires_at::text
         FROM investor_invite_links
         WHERE code = $1`,
        [inviteCode],
      )

      if (invite) {
        const isExpired = new Date(invite.expires_at) < new Date()
        const isUsed = parseInt(invite.uses, 10) >= parseInt(invite.max_uses, 10)

        if (!isExpired && !isUsed) {
          const referrerLabel = invite.referrer_name || "an investor"

          // Auto-approve this phone number with referral tracking
          await query(
            `INSERT INTO investor_approved_phones (phone_e164, name, company, notes, is_active, referred_by)
             VALUES ($1, $2, '', $3, TRUE, $4)
             ON CONFLICT (phone_e164) DO UPDATE SET notes = $3, is_active = TRUE,
               referred_by = CASE WHEN investor_approved_phones.referred_by = '' THEN $4 ELSE investor_approved_phones.referred_by END`,
            [normalized, invite.recipient_name || "", `Referred by ${referrerLabel}`, invite.created_by],
          )
        }
      }
    }

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

    // Send OTP via Twilio Verify (handles code generation, storage, rate limiting)
    await sendVerifyOtp(normalized)

    return successResponse
  } catch (error) {
    console.error("request-otp error:", error)
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
