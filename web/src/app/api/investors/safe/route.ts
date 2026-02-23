import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken } from "@/lib/investors/session"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

const MIN_CHECK_CENTS = 25_000_00 // $25,000

/**
 * GET /api/investors/safe
 * Returns the investor's current SAFE agreement (if any).
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("investor_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifySessionToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const safe = await queryOne<{
      id: string
      investor_name: string
      investor_email: string
      investor_company: string
      investment_amount_cents: string
      valuation_cap_cents: string
      safe_type: string
      status: string
      investor_signed_at: string | null
      company_signed_at: string | null
      created_at: string
    }>(
      `SELECT id, investor_name, investor_email, investor_company,
              investment_amount_cents::text, valuation_cap_cents::text, safe_type, status,
              investor_signed_at, company_signed_at, created_at
       FROM safe_agreements
       WHERE investor_phone = $1 AND status != 'voided'
       ORDER BY created_at DESC
       LIMIT 1`,
      [payload.phone],
    )

    return NextResponse.json({ safe: safe || null })
  } catch (error) {
    console.error("safe GET error:", error)
    return NextResponse.json({ error: "Failed to fetch SAFE" }, { status: 500 })
  }
}

/**
 * POST /api/investors/safe
 * Create a new SAFE agreement. Body: { legalName, email, company, investmentAmount }
 * investmentAmount is in dollars (e.g. 25000).
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

    const body = (await req.json()) as {
      legalName?: string
      email?: string
      company?: string
      investmentAmount?: number
    }

    const { legalName, email, company, investmentAmount } = body

    if (!legalName?.trim()) {
      return NextResponse.json({ error: "Legal name is required" }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }
    if (!investmentAmount || investmentAmount < 25000) {
      return NextResponse.json(
        { error: "Minimum investment amount is $25,000" },
        { status: 400 },
      )
    }

    const amountCents = Math.round(investmentAmount * 100)
    if (amountCents < MIN_CHECK_CENTS) {
      return NextResponse.json(
        { error: "Minimum investment amount is $25,000" },
        { status: 400 },
      )
    }

    // Check for existing non-voided SAFE
    const existing = await queryOne<{ id: string; status: string }>(
      `SELECT id, status FROM safe_agreements
       WHERE investor_phone = $1 AND status != 'voided'
       ORDER BY created_at DESC LIMIT 1`,
      [payload.phone],
    )

    if (existing) {
      return NextResponse.json(
        { error: "You already have an active SAFE agreement. Contact us to make changes." },
        { status: 409 },
      )
    }

    const safe = await queryOne<{ id: string }>(
      `INSERT INTO safe_agreements (investor_phone, investor_name, investor_email, investor_company, investment_amount_cents)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [payload.phone, legalName.trim(), email.trim(), company?.trim() || "", amountCents],
    )

    return NextResponse.json({ safe: { id: safe!.id, status: "pending_investor" } })
  } catch (error) {
    console.error("safe POST error:", error)
    return NextResponse.json({ error: "Failed to create SAFE" }, { status: 500 })
  }
}
