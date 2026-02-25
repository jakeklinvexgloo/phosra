import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/investors/db"
import { normalizePhone } from "@/lib/investors/phone"
// Note: raw SMS requires A2P 10DLC registration.
// Invite link is shared manually by admin for now.
import { requireAdmin } from "@/lib/stytch-auth"

export const runtime = "nodejs"

/**
 * Verify the caller is an authenticated admin via Stytch (or sandbox session).
 */
async function checkAdmin(req: NextRequest): Promise<{ authorized: true } | { authorized: false; response: NextResponse }> {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (sandbox) return { authorized: true }

  const auth = await requireAdmin()
  if (auth.authorized) return { authorized: true }

  return { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
}

/**
 * GET /api/investors/admin/phones
 * List all approved phone numbers with last login info.
 */
export async function GET(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth.authorized) return auth.response

  try {
    const phones = await query<{
      id: string
      phone_e164: string
      name: string
      company: string
      notes: string
      is_active: boolean
      created_at: string
      last_login: string | null
    }>(`
      SELECT
        p.id, p.phone_e164, p.name, p.company, p.notes, p.is_active, p.created_at,
        (SELECT MAX(s.created_at) FROM investor_sessions s WHERE s.phone_e164 = p.phone_e164 AND s.revoked_at IS NULL) as last_login
      FROM investor_approved_phones p
      ORDER BY p.created_at DESC
    `)

    return NextResponse.json({ phones })
  } catch (error) {
    console.error("admin/phones GET error:", error)
    return NextResponse.json({ error: "Failed to fetch investors" }, { status: 500 })
  }
}

/**
 * POST /api/investors/admin/phones
 * Add an approved phone number and auto-send invite SMS.
 */
export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth.authorized) return auth.response

  try {
    const { phone, name, company, notes } = (await req.json()) as {
      phone?: string
      name?: string
      company?: string
      notes?: string
    }

    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 })
    }

    const normalized = normalizePhone(phone)
    if (!normalized) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // Upsert: if phone exists but inactive, reactivate
    const existing = await queryOne<{ id: string; is_active: boolean }>(
      `SELECT id, is_active FROM investor_approved_phones WHERE phone_e164 = $1`,
      [normalized],
    )

    if (existing) {
      await query(
        `UPDATE investor_approved_phones
         SET name = $2, company = $3, notes = $4, is_active = TRUE, updated_at = NOW()
         WHERE phone_e164 = $1`,
        [normalized, name ?? "", company ?? "", notes ?? ""],
      )
    } else {
      await query(
        `INSERT INTO investor_approved_phones (phone_e164, name, company, notes)
         VALUES ($1, $2, $3, $4)`,
        [normalized, name ?? "", company ?? "", notes ?? ""],
      )
    }

    return NextResponse.json({ message: "Investor added", phone: normalized })
  } catch (error) {
    console.error("admin/phones POST error:", error)
    return NextResponse.json({ error: "Failed to add investor" }, { status: 500 })
  }
}

/**
 * DELETE /api/investors/admin/phones
 * Deactivate an approved phone number (soft delete).
 */
export async function DELETE(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth.authorized) return auth.response

  try {
    const { phone } = (await req.json()) as { phone?: string }

    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 })
    }

    const normalized = normalizePhone(phone)
    if (!normalized) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }

    await query(
      `UPDATE investor_approved_phones SET is_active = FALSE, updated_at = NOW() WHERE phone_e164 = $1`,
      [normalized],
    )

    // Also revoke all active sessions for this phone
    await query(
      `UPDATE investor_sessions SET revoked_at = NOW() WHERE phone_e164 = $1 AND revoked_at IS NULL`,
      [normalized],
    )

    return NextResponse.json({ message: "Investor deactivated" })
  } catch (error) {
    console.error("admin/phones DELETE error:", error)
    return NextResponse.json({ error: "Failed to deactivate" }, { status: 500 })
  }
}
