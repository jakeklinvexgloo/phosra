import { NextRequest, NextResponse } from "next/server"
import { queryOne, query } from "@/lib/investors/db"
import { normalizePhone } from "@/lib/investors/phone"

export const runtime = "nodejs"

/**
 * POST /api/investors/auth/check-approved
 * Lightweight approval check + invite auto-approve.
 * Returns same response shape regardless (anti-enumeration).
 * Does NOT send OTP — Stytch client SDK handles that.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, inviteCode } = (await req.json()) as {
      phone?: string
      inviteCode?: string
    }

    if (!phone) {
      return NextResponse.json({ message: "ok" })
    }

    const normalized = normalizePhone(phone)
    if (!normalized) {
      return NextResponse.json({ message: "ok" })
    }

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
        const isUsed =
          parseInt(invite.uses, 10) >= parseInt(invite.max_uses, 10)

        if (!isExpired && !isUsed) {
          const referrerLabel = invite.referrer_name || "an investor"

          // Auto-approve this phone number with referral tracking
          await query(
            `INSERT INTO investor_approved_phones (phone_e164, name, company, notes, is_active, referred_by)
             VALUES ($1, $2, '', $3, TRUE, $4)
             ON CONFLICT (phone_e164) DO UPDATE SET notes = $3, is_active = TRUE,
               referred_by = CASE WHEN investor_approved_phones.referred_by = '' THEN $4 ELSE investor_approved_phones.referred_by END`,
            [
              normalized,
              invite.recipient_name || "",
              `Referred by ${referrerLabel}`,
              invite.created_by,
            ],
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
    }

    // Always return same response (anti-enumeration)
    return NextResponse.json({ message: "ok" })
  } catch (error) {
    console.error("check-approved error:", error)
    return NextResponse.json({ message: "ok" })
  }
}
