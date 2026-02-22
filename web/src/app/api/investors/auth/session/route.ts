import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken, hashToken } from "@/lib/investors/session"
import { queryOne, query } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * GET /api/investors/auth/session
 * Check session validity, return investor info.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("investor_session")?.value
    if (!token) {
      return NextResponse.json({ error: "No session" }, { status: 401 })
    }

    const payload = await verifySessionToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check server-side revocation
    const session = await queryOne<{ revoked_at: string | null }>(
      `SELECT revoked_at FROM investor_sessions WHERE token_hash = $1 AND expires_at > NOW()`,
      [hashToken(payload.jti)],
    )

    if (!session || session.revoked_at) {
      const res = NextResponse.json({ error: "Session revoked" }, { status: 401 })
      res.cookies.delete("investor_session")
      return res
    }

    // Verify phone is still active
    const approved = await queryOne<{ is_active: boolean }>(
      `SELECT is_active FROM investor_approved_phones WHERE phone_e164 = $1`,
      [payload.phone],
    )

    if (!approved?.is_active) {
      // Revoke the session
      await query(
        `UPDATE investor_sessions SET revoked_at = NOW() WHERE token_hash = $1`,
        [hashToken(payload.jti)],
      )
      const res = NextResponse.json({ error: "Access revoked" }, { status: 403 })
      res.cookies.delete("investor_session")
      return res
    }

    return NextResponse.json({
      phone: payload.phone,
      name: payload.name,
      company: payload.company,
    })
  } catch (error) {
    console.error("session check error:", error)
    return NextResponse.json({ error: "Session error" }, { status: 500 })
  }
}

/**
 * DELETE /api/investors/auth/session
 * Revoke session, clear cookie.
 */
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("investor_session")?.value
    if (token) {
      const payload = await verifySessionToken(token)
      if (payload) {
        await query(
          `UPDATE investor_sessions SET revoked_at = NOW() WHERE token_hash = $1`,
          [hashToken(payload.jti)],
        )
      }
    }

    const res = NextResponse.json({ message: "Signed out" })
    res.cookies.delete("investor_session")
    return res
  } catch {
    const res = NextResponse.json({ message: "Signed out" })
    res.cookies.delete("investor_session")
    return res
  }
}
