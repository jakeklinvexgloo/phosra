import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken, hashToken } from "@/lib/investors/session"
import { query, queryOne } from "@/lib/investors/db"
import { createHash, randomBytes } from "crypto"

export const runtime = "nodejs"

/**
 * POST /api/investors/auth/link-email
 * Send a magic link email to link an email account.
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

    const { email } = (await req.json()) as { email?: string }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if already linked
    const existing = await queryOne(
      `SELECT id FROM investor_linked_accounts WHERE phone_e164 = $1 AND provider = 'email' AND provider_email = $2`,
      [payload.phone, email.toLowerCase()],
    )
    if (existing) {
      return NextResponse.json({ error: "This email is already linked" }, { status: 400 })
    }

    // Generate magic link token
    const linkToken = randomBytes(32).toString("hex")
    const linkHash = createHash("sha256").update(linkToken).digest("hex")
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store temporarily in OTP table (reuse the structure)
    await query(
      `INSERT INTO investor_otp_codes (phone_e164, code_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [`link:${email.toLowerCase()}:${payload.phone}`, linkHash, expiresAt.toISOString()],
    )

    // Send magic link email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "https://phosra.com"

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Phosra <noreply@phosra.com>",
          to: email,
          subject: "Link your email to Phosra Investor Portal",
          html: `<p>Click the link below to link your email to your investor portal account:</p>
                 <p><a href="${baseUrl}/api/investors/auth/link-email?token=${linkToken}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(payload.phone)}">Link Email</a></p>
                 <p>This link expires in 15 minutes.</p>`,
        }),
      })
    }

    return NextResponse.json({ message: "Magic link sent to your email" })
  } catch (error) {
    console.error("link-email POST error:", error)
    return NextResponse.json({ error: "Failed to send link" }, { status: 500 })
  }
}

/**
 * GET /api/investors/auth/link-email?token=...&email=...&phone=...
 * Verify magic link and create linked account.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const linkToken = searchParams.get("token")
    const email = searchParams.get("email")
    const phone = searchParams.get("phone")

    if (!linkToken || !email || !phone) {
      return NextResponse.redirect(new URL("/investors/portal?link_error=invalid", req.url))
    }

    const linkHash = createHash("sha256").update(linkToken).digest("hex")
    const key = `link:${email.toLowerCase()}:${phone}`

    const record = await queryOne<{ id: string }>(
      `SELECT id FROM investor_otp_codes
       WHERE phone_e164 = $1 AND code_hash = $2 AND used = FALSE AND expires_at > NOW()`,
      [key, linkHash],
    )

    if (!record) {
      return NextResponse.redirect(new URL("/investors/portal?link_error=expired", req.url))
    }

    // Mark as used
    await query(`UPDATE investor_otp_codes SET used = TRUE WHERE id = $1`, [record.id])

    // Create linked account
    await query(
      `INSERT INTO investor_linked_accounts (phone_e164, provider, provider_id, provider_email)
       VALUES ($1, 'email', $2, $2)
       ON CONFLICT (provider, provider_id) DO NOTHING`,
      [phone, email.toLowerCase()],
    )

    return NextResponse.redirect(new URL("/investors/portal?link_success=email", req.url))
  } catch (error) {
    console.error("link-email GET error:", error)
    return NextResponse.redirect(new URL("/investors/portal?link_error=failed", req.url))
  }
}
