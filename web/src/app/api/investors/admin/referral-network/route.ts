import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/investors/db"
import { requireAdmin } from "@/lib/stytch-auth"

export const runtime = "nodejs"

async function checkAdmin(req: NextRequest): Promise<{ authorized: true } | { authorized: false; response: NextResponse }> {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (sandbox) return { authorized: true }

  const auth = await requireAdmin()
  if (auth.authorized) return { authorized: true }

  return { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
}

/**
 * GET /api/investors/admin/referral-network
 * Returns full investor network data for admin dashboard.
 * No privacy restrictions — admin sees full names, amounts, etc.
 */
export async function GET(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth.authorized) return auth.response

  try {
    const [investors, sessions, invites, inviteClaims, deckShares, deckViews, safes] = await Promise.all([
      // All investors with referral info
      query<{
        phone_e164: string
        name: string
        company: string
        referred_by: string
        is_active: boolean
        created_at: string
        notes: string
      }>(
        `SELECT phone_e164, name, company, referred_by, is_active, created_at::text, notes
         FROM investor_approved_phones
         ORDER BY created_at ASC`,
      ),
      // Session activity (latest session per phone)
      query<{ phone_e164: string; last_active: string }>(
        `SELECT phone_e164, MAX(created_at)::text AS last_active
         FROM investor_sessions
         WHERE revoked_at IS NULL AND expires_at > NOW()
         GROUP BY phone_e164`,
      ),
      // All invite links
      query<{
        code: string
        created_by: string
        referrer_name: string
        recipient_name: string
        uses: string
        max_uses: string
        created_at: string
        expires_at: string
      }>(
        `SELECT code, created_by, referrer_name, recipient_name,
                uses::text, max_uses::text, created_at::text, expires_at::text
         FROM investor_invite_links
         ORDER BY created_at DESC`,
      ),
      // Invite claims
      query<{
        invite_code: string
        claimed_by_phone: string
        name: string
        created_at: string
      }>(
        `SELECT invite_code, claimed_by_phone, name, created_at::text
         FROM investor_invite_claims
         ORDER BY created_at DESC`,
      ),
      // Deck shares
      query<{
        id: string
        shared_by_phone: string
        recipient_hint: string
        created_at: string
        view_count: string
      }>(
        `SELECT ds.id::text, ds.shared_by_phone, ds.recipient_hint, ds.created_at::text,
                COALESCE((SELECT COUNT(*) FROM deck_share_views dsv WHERE dsv.share_id = ds.id), 0)::text AS view_count
         FROM deck_shares ds
         ORDER BY ds.created_at DESC`,
      ),
      // Deck views
      query<{
        share_id: string
        viewed_at: string
      }>(
        `SELECT share_id::text, viewed_at::text
         FROM deck_share_views
         ORDER BY viewed_at DESC`,
      ),
      // SAFE agreements
      query<{
        id: string
        investor_phone: string
        investor_name: string
        investor_company: string
        investment_amount_cents: string
        status: string
        investor_signed_at: string | null
        company_signed_at: string | null
        created_at: string
      }>(
        `SELECT id::text, investor_phone, investor_name, investor_company,
                investment_amount_cents::text, status,
                investor_signed_at::text, company_signed_at::text, created_at::text
         FROM safe_agreements
         ORDER BY created_at DESC`,
      ),
    ])

    return NextResponse.json({
      investors,
      sessions,
      invites,
      inviteClaims,
      deckShares,
      deckViews,
      safes,
    })
  } catch (error) {
    console.error("admin/referral-network GET error:", error)
    return NextResponse.json({ error: "Failed to fetch network data" }, { status: 500 })
  }
}
