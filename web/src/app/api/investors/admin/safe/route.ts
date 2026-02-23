import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/investors/db"
import { withAuth } from "@workos-inc/authkit-nextjs"

export const runtime = "nodejs"

/**
 * Verify the caller is an authenticated admin via WorkOS (or sandbox session).
 */
async function requireAdmin(req: NextRequest): Promise<{ authorized: true } | { authorized: false; response: NextResponse }> {
  try {
    const { user } = await withAuth()
    if (user) return { authorized: true }
  } catch {
    // WorkOS auth failed, try sandbox fallback below
  }

  const sandbox = req.headers.get("x-sandbox-session")
  if (sandbox) {
    return { authorized: true }
  }

  return { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
}

/**
 * GET /api/investors/admin/safe
 * List all SAFE agreements with stats.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.authorized) return auth.response

  try {
    const safes = await query<{
      id: string
      investor_phone: string
      investor_name: string
      investor_email: string
      investor_company: string
      investment_amount_cents: string
      valuation_cap_cents: string
      status: string
      investor_signed_at: string | null
      company_signed_at: string | null
      created_at: string
    }>(
      `SELECT id, investor_phone, investor_name, investor_email, investor_company,
              investment_amount_cents::text, valuation_cap_cents::text, status,
              investor_signed_at, company_signed_at, created_at
       FROM safe_agreements
       ORDER BY created_at DESC`,
    )

    // Compute stats
    const stats = {
      total: safes.length,
      totalCommittedCents: 0,
      pending: 0,
      investorSigned: 0,
      countersigned: 0,
      voided: 0,
    }

    for (const s of safes) {
      const amountCents = parseInt(s.investment_amount_cents, 10)
      switch (s.status) {
        case "pending_investor":
          stats.pending++
          stats.totalCommittedCents += amountCents
          break
        case "investor_signed":
          stats.investorSigned++
          stats.totalCommittedCents += amountCents
          break
        case "countersigned":
          stats.countersigned++
          stats.totalCommittedCents += amountCents
          break
        case "voided":
          stats.voided++
          break
      }
    }

    return NextResponse.json({ safes, stats })
  } catch (error) {
    console.error("admin/safe GET error:", error)
    return NextResponse.json({ error: "Failed to fetch SAFEs" }, { status: 500 })
  }
}

/**
 * POST /api/investors/admin/safe
 * Countersign or void a SAFE. Body: { safeId, action: "countersign" | "void" }
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.authorized) return auth.response

  try {
    const { safeId, action } = (await req.json()) as {
      safeId?: string
      action?: "countersign" | "void"
    }

    if (!safeId || !action) {
      return NextResponse.json({ error: "safeId and action are required" }, { status: 400 })
    }

    const safe = await queryOne<{ id: string; status: string }>(
      `SELECT id, status FROM safe_agreements WHERE id = $1`,
      [safeId],
    )

    if (!safe) {
      return NextResponse.json({ error: "SAFE not found" }, { status: 404 })
    }

    if (action === "countersign") {
      if (safe.status !== "investor_signed") {
        return NextResponse.json(
          { error: "Can only countersign SAFEs that have been signed by the investor" },
          { status: 400 },
        )
      }

      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"

      await query(
        `UPDATE safe_agreements
         SET status = 'countersigned',
             company_signature = 'Jake Klinvex',
             company_signed_at = NOW(),
             company_sign_ip = $2,
             updated_at = NOW()
         WHERE id = $1`,
        [safeId, ip],
      )

      return NextResponse.json({ success: true, status: "countersigned" })
    }

    if (action === "void") {
      if (safe.status === "voided") {
        return NextResponse.json({ error: "SAFE is already voided" }, { status: 400 })
      }

      await query(
        `UPDATE safe_agreements SET status = 'voided', updated_at = NOW() WHERE id = $1`,
        [safeId],
      )

      return NextResponse.json({ success: true, status: "voided" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("admin/safe POST error:", error)
    return NextResponse.json({ error: "Failed to update SAFE" }, { status: 500 })
  }
}
