import { NextRequest, NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"
import React from "react"
import { requireInvestor } from "@/lib/stytch-auth"
import { queryOne } from "@/lib/investors/db"
import { SafePdf } from "@/lib/investors/safe-pdf"
import type { SafePdfData } from "@/lib/investors/safe-pdf"

export const runtime = "nodejs"

/**
 * GET /api/investors/safe/[id]/pdf
 * Render and return the SAFE agreement as a PDF.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireInvestor()
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const { payload } = auth

    const safe = await queryOne<{
      id: string
      investor_phone: string
      investor_name: string
      investor_email: string
      investor_company: string
      investment_amount_cents: string
      valuation_cap_cents: string
      status: string
      investor_signature: string
      investor_signed_at: string | null
      investor_sign_ip: string
      investor_sign_ua: string
      document_hash: string
      company_signature: string
      company_signed_at: string | null
      company_sign_ip: string
      created_at: string
    }>(
      `SELECT id, investor_phone, investor_name, investor_email, investor_company,
              investment_amount_cents::text, valuation_cap_cents::text, status,
              investor_signature, investor_signed_at, investor_sign_ip, investor_sign_ua,
              document_hash, company_signature, company_signed_at, company_sign_ip,
              created_at
       FROM safe_agreements WHERE id = $1`,
      [params.id],
    )

    if (!safe) {
      return NextResponse.json({ error: "SAFE not found" }, { status: 404 })
    }

    if (safe.investor_phone !== payload.phone) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const pdfData: SafePdfData = {
      investorName: safe.investor_name,
      investorCompany: safe.investor_company,
      investorEmail: safe.investor_email,
      purchaseAmountCents: parseInt(safe.investment_amount_cents, 10),
      valuationCapCents: parseInt(safe.valuation_cap_cents, 10),
      date: safe.created_at,
      ...(safe.investor_signature && {
        investorSignature: safe.investor_signature,
        investorSignedAt: safe.investor_signed_at || undefined,
        investorSignIp: safe.investor_sign_ip,
        investorSignUa: safe.investor_sign_ua,
        documentHash: safe.document_hash,
      }),
      ...(safe.company_signature && {
        companySignature: safe.company_signature,
        companySignedAt: safe.company_signed_at || undefined,
        companySignIp: safe.company_sign_ip,
      }),
    }

    const stream = await renderToStream(
      React.createElement(SafePdf, { data: pdfData }) as any,
    )

    // Convert Node.js readable stream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk: Buffer) => controller.enqueue(chunk))
        stream.on("end", () => controller.close())
        stream.on("error", (err: Error) => controller.error(err))
      },
    })

    const filename = safe.company_signature
      ? `phosra-safe-executed-${safe.investor_name.replace(/\s+/g, "-").toLowerCase()}.pdf`
      : `phosra-safe-${safe.investor_name.replace(/\s+/g, "-").toLowerCase()}.pdf`

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("safe pdf error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
