import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { query } from "@/lib/journalists/db"
import type { Journalist, JournalistStats, JournalistRelationshipStatus } from "@/lib/journalists/types"

export const runtime = "nodejs"

// GET /api/journalists — list all journalists + stats
export async function GET(req: NextRequest) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const journalists = await query<Journalist>(
    `SELECT * FROM admin_journalists ORDER BY tier ASC, relevance_score DESC NULLS LAST`
  )

  // Parse JSONB fields
  const parsed = journalists.map(j => ({
    ...j,
    pitch_angles: typeof j.pitch_angles === "string" ? JSON.parse(j.pitch_angles) : j.pitch_angles,
    recent_articles: typeof j.recent_articles === "string" ? JSON.parse(j.recent_articles) : j.recent_articles,
    coverage_preferences: typeof j.coverage_preferences === "string" ? JSON.parse(j.coverage_preferences) : j.coverage_preferences,
    previous_publications: typeof j.previous_publications === "string" ? JSON.parse(j.previous_publications) : j.previous_publications,
  }))

  // Compute stats
  const byStatus = {} as Record<JournalistRelationshipStatus, number>
  const allStatuses: JournalistRelationshipStatus[] = [
    "identified", "researching", "pitched", "in_dialogue", "warm_contact", "champion", "inactive",
  ]
  for (const s of allStatuses) byStatus[s] = 0
  for (const j of parsed) byStatus[j.relationship_status] = (byStatus[j.relationship_status] || 0) + 1

  // Pitched / responded / covered stats via separate queries
  const [pitchedRows, respondedRows, coveredRows] = await Promise.all([
    query<{ cnt: string }>(`SELECT COUNT(DISTINCT journalist_id) AS cnt FROM admin_journalist_pitches`),
    query<{ cnt: string }>(`SELECT COUNT(DISTINCT journalist_id) AS cnt FROM admin_journalist_pitches WHERE pitch_status IN ('replied', 'interested', 'covered')`),
    query<{ cnt: string }>(`SELECT COUNT(DISTINCT journalist_id) AS cnt FROM admin_press_coverage`),
  ])

  const stats: JournalistStats = {
    total: parsed.length,
    by_tier: {
      tier1: parsed.filter(j => j.tier === 1).length,
      tier2: parsed.filter(j => j.tier === 2).length,
      tier3: parsed.filter(j => j.tier === 3).length,
    },
    by_status: byStatus,
    pitched: parseInt(pitchedRows[0]?.cnt || "0", 10),
    responded: parseInt(respondedRows[0]?.cnt || "0", 10),
    covered: parseInt(coveredRows[0]?.cnt || "0", 10),
  }

  return NextResponse.json({ journalists: parsed, stats })
}

// POST /api/journalists — create a new journalist
export async function POST(req: NextRequest) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const {
    name, publication, title, beat, sub_beats, email, twitter_handle, linkedin_url, signal_handle, phone,
    relevance_score, tier, relationship_status, pitch_angles, recent_articles, coverage_preferences, notes,
    bluesky_handle, mastodon_handle, personal_site_url, newsletter_url, podcast_name, photo_url, location,
    estimated_audience_size, publication_domain_authority, email_confidence, email_source,
    previous_publications, publication_status, tags, warmup_stage,
  } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }
  if (!publication?.trim()) {
    return NextResponse.json({ error: "Publication is required" }, { status: 400 })
  }

  const journalist = await query<Journalist>(
    `INSERT INTO admin_journalists(
      name, publication, title, beat, sub_beats, email, twitter_handle, linkedin_url, signal_handle, phone,
      relevance_score, tier, relationship_status, pitch_angles, recent_articles, coverage_preferences, notes,
      bluesky_handle, mastodon_handle, personal_site_url, newsletter_url, podcast_name, photo_url, location,
      estimated_audience_size, publication_domain_authority, email_confidence, email_source,
      previous_publications, publication_status, tags, warmup_stage
    )
     VALUES (
      $1, $2, $3, $4, $5::text[], $6, $7, $8, $9, $10,
      $11, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb, $17,
      $18, $19, $20, $21, $22, $23, $24,
      $25, $26, $27, $28,
      $29::jsonb, $30, $31::text[], $32
     )
     RETURNING *`,
    [
      name.trim(),
      publication.trim(),
      title || null,
      beat || null,
      sub_beats || [],
      email || null,
      twitter_handle || null,
      linkedin_url || null,
      signal_handle || null,
      phone || null,
      relevance_score ?? null,
      tier ?? 3,
      relationship_status || "identified",
      JSON.stringify(pitch_angles || []),
      JSON.stringify(recent_articles || []),
      JSON.stringify(coverage_preferences || {}),
      notes || null,
      bluesky_handle || null,
      mastodon_handle || null,
      personal_site_url || null,
      newsletter_url || null,
      podcast_name || null,
      photo_url || null,
      location || null,
      estimated_audience_size ?? null,
      publication_domain_authority ?? null,
      email_confidence || "unknown",
      email_source || null,
      JSON.stringify(previous_publications || []),
      publication_status || "active",
      tags || [],
      warmup_stage || "none",
    ]
  )

  return NextResponse.json(journalist[0], { status: 201 })
}
