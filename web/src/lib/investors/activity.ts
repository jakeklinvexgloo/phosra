import { query } from "@/lib/investors/db"

/**
 * Anonymize a full name to "FirstName L." format for investor-facing views.
 */
export function anonymizeName(fullName: string): string {
  if (!fullName || !fullName.trim()) return "Anonymous"
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

/**
 * Badge definitions for investor gamification.
 */
export const BADGE_DEFINITIONS = [
  {
    key: "first_share",
    label: "First Share",
    description: "Sent your first invite",
    icon: "UserPlus",
  },
  {
    key: "connector",
    label: "Connector",
    description: "3 people joined from your invites",
    icon: "Users",
  },
  {
    key: "evangelist",
    label: "Evangelist",
    description: "5+ deck shares with views",
    icon: "Megaphone",
  },
  {
    key: "closer",
    label: "Closer",
    description: "A referral signed a SAFE",
    icon: "Scale",
  },
  {
    key: "champion",
    label: "Champion",
    description: "Referral score of 50+",
    icon: "Trophy",
  },
] as const

/**
 * Check referral activity and award badges as earned.
 * Upserts into investor_badges — safe to call on every request.
 */
export async function checkAndAwardBadges(phone: string): Promise<void> {
  // Gather stats for badge evaluation
  const [inviteStats, deckStats, safeStats, scoreResult] = await Promise.all([
    // Invites sent and claimed
    query<{ sent: string; claimed: string }>(
      `SELECT
         COUNT(*)::text AS sent,
         COALESCE(SUM(CASE WHEN il.uses > 0 THEN 1 ELSE 0 END), 0)::text AS claimed
       FROM investor_invite_links il
       WHERE il.created_by = $1`,
      [phone],
    ),
    // Deck shares with views
    query<{ shares_with_views: string }>(
      `SELECT COUNT(*)::text AS shares_with_views
       FROM deck_shares ds
       WHERE ds.shared_by_phone = $1
         AND EXISTS (SELECT 1 FROM deck_share_views dsv WHERE dsv.share_id = ds.id)`,
      [phone],
    ),
    // Referral SAFEs (people referred by this phone who signed a SAFE)
    query<{ referral_safes: string }>(
      `SELECT COUNT(DISTINCT sa.investor_phone)::text AS referral_safes
       FROM safe_agreements sa
       JOIN investor_approved_phones ap ON ap.phone_e164 = sa.investor_phone
       WHERE ap.referred_by = $1
         AND sa.status IN ('investor_signed', 'countersigned')`,
      [phone],
    ),
    // Score calculation
    query<{ score: string }>(
      `SELECT (
         COALESCE((SELECT COUNT(*) FROM investor_invite_links WHERE created_by = $1), 0) * 1 +
         COALESCE((SELECT SUM(uses) FROM investor_invite_links WHERE created_by = $1), 0) * 5 +
         COALESCE((SELECT COUNT(*) FROM deck_share_views dsv JOIN deck_shares ds ON ds.id = dsv.share_id WHERE ds.shared_by_phone = $1), 0) * 2 +
         COALESCE((SELECT COUNT(*) FROM safe_agreements sa JOIN investor_approved_phones ap ON ap.phone_e164 = sa.investor_phone WHERE ap.referred_by = $1 AND sa.status IN ('investor_signed', 'countersigned')), 0) * 20
       )::text AS score`,
      [phone],
    ),
  ])

  const sent = parseInt(inviteStats[0]?.sent ?? "0", 10)
  const claimed = parseInt(inviteStats[0]?.claimed ?? "0", 10)
  const sharesWithViews = parseInt(deckStats[0]?.shares_with_views ?? "0", 10)
  const referralSafes = parseInt(safeStats[0]?.referral_safes ?? "0", 10)
  const score = parseInt(scoreResult[0]?.score ?? "0", 10)

  const badgesToAward: string[] = []

  if (sent >= 1) badgesToAward.push("first_share")
  if (claimed >= 3) badgesToAward.push("connector")
  if (sharesWithViews >= 5) badgesToAward.push("evangelist")
  if (referralSafes >= 1) badgesToAward.push("closer")
  if (score >= 50) badgesToAward.push("champion")

  if (badgesToAward.length > 0) {
    // Upsert badges — ON CONFLICT DO NOTHING makes this idempotent
    const values = badgesToAward
      .map((_, i) => `($1, $${i + 2})`)
      .join(", ")
    await query(
      `INSERT INTO investor_badges (phone_e164, badge_key)
       VALUES ${values}
       ON CONFLICT (phone_e164, badge_key) DO NOTHING`,
      [phone, ...badgesToAward],
    )
  }
}
