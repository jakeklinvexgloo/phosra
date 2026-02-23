import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/investors/db"
import { verifySessionToken, hashToken } from "@/lib/investors/session"
import { queryOne } from "@/lib/investors/db"
import { anonymizeName, checkAndAwardBadges, BADGE_DEFINITIONS } from "@/lib/investors/activity"

export const runtime = "nodejs"

/**
 * GET /api/investors/referrals
 * Returns the authenticated investor's referral dashboard data.
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate via investor_session cookie
    const token = req.cookies.get("investor_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifySessionToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Verify session not revoked
    const session = await queryOne<{ revoked_at: string | null }>(
      `SELECT revoked_at FROM investor_sessions WHERE token_hash = $1 AND expires_at > NOW()`,
      [hashToken(payload.jti)],
    )
    if (!session || session.revoked_at) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    const phone = payload.phone

    // Run badge check (upserts, low cost)
    await checkAndAwardBadges(phone)

    // Fetch all data in parallel
    const [
      inviteStatsRows,
      deckStatsRows,
      referralInvestmentRows,
      activityRows,
      leaderboardRows,
      badgeRows,
      referralRows,
    ] = await Promise.all([
      // Invites sent & claimed
      query<{ sent: string; claimed: string }>(
        `SELECT
           COUNT(*)::text AS sent,
           COALESCE(SUM(uses), 0)::text AS claimed
         FROM investor_invite_links
         WHERE created_by = $1`,
        [phone],
      ),
      // Deck shares & views
      query<{ shares_sent: string; total_views: string }>(
        `SELECT
           COUNT(DISTINCT ds.id)::text AS shares_sent,
           COALESCE((SELECT COUNT(*) FROM deck_share_views dsv JOIN deck_shares d ON d.id = dsv.share_id WHERE d.shared_by_phone = $1), 0)::text AS total_views
         FROM deck_shares ds
         WHERE ds.shared_by_phone = $1`,
        [phone],
      ),
      // Referral investments (SAFEs from people referred by this investor)
      query<{ count: string; total_cents: string }>(
        `SELECT
           COUNT(*)::text AS count,
           COALESCE(SUM(sa.investment_amount_cents), 0)::text AS total_cents
         FROM safe_agreements sa
         JOIN investor_approved_phones ap ON ap.phone_e164 = sa.investor_phone
         WHERE ap.referred_by = $1
           AND sa.status IN ('investor_signed', 'countersigned')`,
        [phone],
      ),
      // Activity feed — last 10 events
      query<{ type: string; actor_name: string; detail: string; ts: string }>(
        `(
           SELECT 'invite_claimed' AS type,
                  COALESCE(ap.name, ic.name) AS actor_name,
                  'joined via your invite' AS detail,
                  ic.created_at::text AS ts
           FROM investor_invite_claims ic
           JOIN investor_invite_links il ON il.code = ic.invite_code
           LEFT JOIN investor_approved_phones ap ON ap.phone_e164 = ic.claimed_by_phone
           WHERE il.created_by = $1
         )
         UNION ALL
         (
           SELECT 'deck_viewed' AS type,
                  '' AS actor_name,
                  'viewed your shared deck' AS detail,
                  dsv.viewed_at::text AS ts
           FROM deck_share_views dsv
           JOIN deck_shares ds ON ds.id = dsv.share_id
           WHERE ds.shared_by_phone = $1
         )
         UNION ALL
         (
           SELECT 'safe_signed' AS type,
                  sa.investor_name AS actor_name,
                  'signed a SAFE' AS detail,
                  sa.investor_signed_at::text AS ts
           FROM safe_agreements sa
           JOIN investor_approved_phones ap ON ap.phone_e164 = sa.investor_phone
           WHERE ap.referred_by = $1
             AND sa.status IN ('investor_signed', 'countersigned')
             AND sa.investor_signed_at IS NOT NULL
         )
         ORDER BY ts DESC NULLS LAST
         LIMIT 10`,
        [phone],
      ),
      // Leaderboard — top 10 referrers by score
      query<{ phone_e164: string; name: string; score: string }>(
        `SELECT
           ap.phone_e164,
           ap.name,
           (
             COALESCE((SELECT COUNT(*) FROM investor_invite_links WHERE created_by = ap.phone_e164), 0) * 1 +
             COALESCE((SELECT SUM(uses) FROM investor_invite_links WHERE created_by = ap.phone_e164), 0) * 5 +
             COALESCE((SELECT COUNT(*) FROM deck_share_views dsv JOIN deck_shares ds ON ds.id = dsv.share_id WHERE ds.shared_by_phone = ap.phone_e164), 0) * 2 +
             COALESCE((SELECT COUNT(*) FROM safe_agreements sa JOIN investor_approved_phones a2 ON a2.phone_e164 = sa.investor_phone WHERE a2.referred_by = ap.phone_e164 AND sa.status IN ('investor_signed', 'countersigned')), 0) * 20
           )::text AS score
         FROM investor_approved_phones ap
         WHERE ap.is_active = TRUE
         ORDER BY score DESC
         LIMIT 10`,
      ),
      // Badges earned by this investor
      query<{ badge_key: string; earned_at: string }>(
        `SELECT badge_key, earned_at::text
         FROM investor_badges
         WHERE phone_e164 = $1`,
        [phone],
      ),
      // Direct referrals
      query<{ name: string; company: string; joined_at: string; has_session: string; has_deck_view: string; has_safe: string; sub_referral_count: string }>(
        `SELECT
           ap.name,
           ap.company,
           ap.created_at::text AS joined_at,
           CASE WHEN EXISTS (SELECT 1 FROM investor_sessions s WHERE s.phone_e164 = ap.phone_e164) THEN 'true' ELSE 'false' END AS has_session,
           CASE WHEN EXISTS (SELECT 1 FROM deck_share_views dsv JOIN deck_shares ds ON ds.id = dsv.share_id WHERE ds.shared_by_phone = ap.phone_e164) THEN 'true' ELSE 'false' END AS has_deck_view,
           CASE WHEN EXISTS (SELECT 1 FROM safe_agreements sa WHERE sa.investor_phone = ap.phone_e164 AND sa.status IN ('investor_signed', 'countersigned')) THEN 'true' ELSE 'false' END AS has_safe,
           COALESCE((SELECT COUNT(*) FROM investor_approved_phones a2 WHERE a2.referred_by = ap.phone_e164), 0)::text AS sub_referral_count
         FROM investor_approved_phones ap
         WHERE ap.referred_by = $1
         ORDER BY ap.created_at DESC`,
        [phone],
      ),
    ])

    const invitesSent = parseInt(inviteStatsRows[0]?.sent ?? "0", 10)
    const invitesClaimed = parseInt(inviteStatsRows[0]?.claimed ?? "0", 10)
    const deckSharesSent = parseInt(deckStatsRows[0]?.shares_sent ?? "0", 10)
    const totalDeckViews = parseInt(deckStatsRows[0]?.total_views ?? "0", 10)
    const referralInvestments = parseInt(referralInvestmentRows[0]?.count ?? "0", 10)
    const referralAmountCents = parseInt(referralInvestmentRows[0]?.total_cents ?? "0", 10)
    const score =
      invitesSent * 1 + invitesClaimed * 5 + totalDeckViews * 2 + referralInvestments * 20

    // Build badges with earned status
    const earnedBadgeMap = new Map(
      badgeRows.map((b) => [b.badge_key, b.earned_at]),
    )
    const badges = BADGE_DEFINITIONS.map((def) => ({
      key: def.key,
      label: def.label,
      description: def.description,
      earned: earnedBadgeMap.has(def.key),
      earnedAt: earnedBadgeMap.get(def.key) ?? null,
    }))

    // Build activity feed with anonymized names
    const activity = activityRows.map((row) => ({
      type: row.type as "invite_claimed" | "deck_viewed" | "safe_signed",
      actorName: row.actor_name ? anonymizeName(row.actor_name) : "Someone",
      detail: row.detail,
      timestamp: row.ts,
    }))

    // Build leaderboard with anonymized names
    const leaderboard = leaderboardRows
      .filter((row) => parseInt(row.score, 10) > 0)
      .map((row, i) => ({
        rank: i + 1,
        name: anonymizeName(row.name),
        score: parseInt(row.score, 10),
        isCurrentUser: row.phone_e164 === phone,
      }))

    // Build referral list with engagement levels
    const referrals = referralRows.map((r) => {
      let engagementLevel: "invited" | "joined" | "engaged" | "committed" | "invested" = "invited"
      if (r.has_safe === "true") engagementLevel = "invested"
      else if (r.has_deck_view === "true") engagementLevel = "engaged"
      else if (r.has_session === "true") engagementLevel = "joined"

      return {
        name: anonymizeName(r.name),
        company: r.company || "",
        joinedAt: r.joined_at,
        engagementLevel,
        subReferralCount: parseInt(r.sub_referral_count, 10),
      }
    })

    return NextResponse.json({
      stats: {
        invitesSent,
        invitesClaimed,
        deckSharesSent,
        totalDeckViews,
        referralInvestments,
        referralAmountCents,
        score,
      },
      activity,
      leaderboard,
      badges,
      referrals,
    })
  } catch (error) {
    console.error("referrals GET error:", error)
    return NextResponse.json({ error: "Failed to fetch referral data" }, { status: 500 })
  }
}
