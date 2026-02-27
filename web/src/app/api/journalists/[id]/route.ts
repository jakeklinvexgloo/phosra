import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { query, queryOne } from "@/lib/journalists/db"
import type { Journalist, JournalistPitch, PressCoverage, JournalistActivity } from "@/lib/journalists/types"

export const runtime = "nodejs"

interface RouteContext { params: { id: string } }

function parseJsonb<T>(val: T | string): T {
  return typeof val === "string" ? JSON.parse(val) : val
}

// GET /api/journalists/[id] — single journalist + pitches, coverage, activities
export async function GET(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const journalist = await queryOne<Journalist>(
    `SELECT * FROM admin_journalists WHERE id = $1`, [params.id]
  )
  if (!journalist) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [pitches, coverage, activities] = await Promise.all([
    query<JournalistPitch>(
      `SELECT jp.*, pr.title AS press_release_title
       FROM admin_journalist_pitches jp
       LEFT JOIN press_releases pr ON jp.press_release_id = pr.id
       WHERE jp.journalist_id = $1
       ORDER BY jp.created_at DESC`,
      [params.id]
    ),
    query<PressCoverage>(
      `SELECT pc.*, pr.title AS press_release_title
       FROM admin_press_coverage pc
       LEFT JOIN press_releases pr ON pc.press_release_id = pr.id
       WHERE pc.journalist_id = $1
       ORDER BY pc.published_at DESC`,
      [params.id]
    ),
    query<JournalistActivity>(
      `SELECT * FROM admin_journalist_activities
       WHERE journalist_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [params.id]
    ),
  ])

  return NextResponse.json({
    ...journalist,
    pitch_angles: parseJsonb(journalist.pitch_angles),
    recent_articles: parseJsonb(journalist.recent_articles),
    coverage_preferences: parseJsonb(journalist.coverage_preferences),
    previous_publications: parseJsonb(journalist.previous_publications),
    pitches: pitches.map(p => ({
      ...p,
    })),
    coverage: coverage.map(c => ({
      ...c,
      quotes_used: parseJsonb(c.quotes_used),
    })),
    activities: activities.map(a => ({
      ...a,
      metadata: parseJsonb(a.metadata),
    })),
  })
}

// PUT /api/journalists/[id] — update journalist fields
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const allowedFields = [
    "name", "publication", "title", "beat", "email", "twitter_handle",
    "linkedin_url", "signal_handle", "phone", "relevance_score", "tier",
    "relationship_status", "notes", "last_contact_at", "next_followup_at",
    "bluesky_handle", "mastodon_handle", "personal_site_url", "newsletter_url",
    "podcast_name", "photo_url", "location", "estimated_audience_size",
    "publication_domain_authority", "email_confidence", "email_source",
    "publication_verified_at", "publication_status", "ai_research_summary",
    "last_researched_at", "warmup_stage",
  ]
  const jsonbFields = ["pitch_angles", "recent_articles", "coverage_preferences", "previous_publications"]
  const textArrayFields = ["sub_beats", "tags"]

  const sets: string[] = []
  const values: unknown[] = []
  let paramIdx = 1

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      sets.push(`${field} = $${paramIdx}`)
      values.push(body[field])
      paramIdx++
    }
  }

  for (const field of jsonbFields) {
    if (body[field] !== undefined) {
      sets.push(`${field} = $${paramIdx}::jsonb`)
      values.push(JSON.stringify(body[field]))
      paramIdx++
    }
  }

  for (const field of textArrayFields) {
    if (body[field] !== undefined) {
      sets.push(`${field} = $${paramIdx}::text[]`)
      values.push(body[field])
      paramIdx++
    }
  }

  // Always update updated_at
  sets.push(`updated_at = NOW()`)

  if (sets.length <= 1) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  values.push(params.id)
  const journalist = await queryOne<Journalist>(
    `UPDATE admin_journalists SET ${sets.join(", ")} WHERE id = $${paramIdx} RETURNING *`,
    values
  )

  if (!journalist) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    ...journalist,
    pitch_angles: parseJsonb(journalist.pitch_angles),
    recent_articles: parseJsonb(journalist.recent_articles),
    coverage_preferences: parseJsonb(journalist.coverage_preferences),
    previous_publications: parseJsonb(journalist.previous_publications),
  })
}

// DELETE /api/journalists/[id] — hard delete
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await queryOne(
    `DELETE FROM admin_journalists WHERE id = $1`, [params.id]
  )

  return NextResponse.json({ success: true })
}
