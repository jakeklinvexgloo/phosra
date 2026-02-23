import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { verifySessionToken } from "@/lib/investors/session"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * POST /api/investors/safe/sign
 * Sign a SAFE agreement. Body: { safeId, legalName, consentElectronic, consentAccredited, consentTerms }
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
      safeId?: string
      legalName?: string
      consentElectronic?: boolean
      consentAccredited?: boolean
      consentTerms?: boolean
    }

    const { safeId, legalName, consentElectronic, consentAccredited, consentTerms } = body

    if (!safeId) {
      return NextResponse.json({ error: "SAFE ID is required" }, { status: 400 })
    }
    if (!legalName?.trim()) {
      return NextResponse.json({ error: "Legal name is required" }, { status: 400 })
    }
    if (!consentElectronic) {
      return NextResponse.json({ error: "Electronic signature consent is required" }, { status: 400 })
    }
    if (!consentAccredited) {
      return NextResponse.json({ error: "Accredited investor confirmation is required" }, { status: 400 })
    }
    if (!consentTerms) {
      return NextResponse.json({ error: "Agreement to terms is required" }, { status: 400 })
    }

    // Fetch the SAFE
    const safe = await queryOne<{
      id: string
      investor_phone: string
      investor_name: string
      investment_amount_cents: string
      valuation_cap_cents: string
      status: string
    }>(
      `SELECT id, investor_phone, investor_name, investment_amount_cents::text,
              valuation_cap_cents::text, status
       FROM safe_agreements WHERE id = $1`,
      [safeId],
    )

    if (!safe) {
      return NextResponse.json({ error: "SAFE not found" }, { status: 404 })
    }

    if (safe.investor_phone !== payload.phone) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (safe.status !== "pending_investor") {
      return NextResponse.json(
        { error: "This SAFE has already been signed" },
        { status: 400 },
      )
    }

    // Validate name matches (case-insensitive)
    if (legalName.trim().toLowerCase() !== safe.investor_name.toLowerCase()) {
      return NextResponse.json(
        { error: "Signature name must match your legal name on the SAFE" },
        { status: 400 },
      )
    }

    // Collect audit trail
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown"
    const ua = req.headers.get("user-agent") || "unknown"
    const signedAt = new Date().toISOString()

    // Generate document hash for tamper detection
    const hashInput = [
      safe.investment_amount_cents,
      safe.valuation_cap_cents,
      safe.investor_name,
      "Jake Klinvex",
      signedAt,
    ].join("|")
    const documentHash = createHash("sha256").update(hashInput).digest("hex")

    await query(
      `UPDATE safe_agreements
       SET status = 'investor_signed',
           investor_signature = $2,
           investor_signed_at = $3,
           investor_sign_ip = $4,
           investor_sign_ua = $5,
           document_hash = $6,
           updated_at = NOW()
       WHERE id = $1`,
      [safeId, legalName.trim(), signedAt, ip, ua, documentHash],
    )

    return NextResponse.json({ success: true, status: "investor_signed" })
  } catch (error) {
    console.error("safe sign error:", error)
    return NextResponse.json({ error: "Failed to sign SAFE" }, { status: 500 })
  }
}
