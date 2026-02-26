import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { queryOne } from "@/lib/journalists/db"

export const runtime = "nodejs"

interface RouteContext { params: { id: string } }

function parseJsonb<T>(val: T | string): T {
  return typeof val === "string" ? JSON.parse(val) : val
}

// POST /api/journalists/[id]/coverage — create coverage entry
export async function POST(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const {
    press_release_id, pitch_id, article_title, article_url, publication,
    published_at, tone, phosra_prominence, quotes_used, key_messages_included,
    estimated_reach, domain_authority, notes,
  } = body

  if (!article_title?.trim()) {
    return NextResponse.json({ error: "article_title is required" }, { status: 400 })
  }
  if (!article_url?.trim()) {
    return NextResponse.json({ error: "article_url is required" }, { status: 400 })
  }
  if (!publication?.trim()) {
    return NextResponse.json({ error: "publication is required" }, { status: 400 })
  }
  if (!published_at) {
    return NextResponse.json({ error: "published_at is required" }, { status: 400 })
  }

  const coverage = await queryOne(
    `INSERT INTO admin_press_coverage (journalist_id, press_release_id, pitch_id, article_title, article_url, publication, published_at, tone, phosra_prominence, quotes_used, key_messages_included, estimated_reach, domain_authority, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::text[], $12, $13, $14)
     RETURNING *`,
    [
      params.id,
      press_release_id || null,
      pitch_id || null,
      article_title.trim(),
      article_url.trim(),
      publication.trim(),
      published_at,
      tone || "neutral",
      phosra_prominence || "mentioned",
      JSON.stringify(quotes_used || []),
      key_messages_included || [],
      estimated_reach ?? null,
      domain_authority ?? null,
      notes || null,
    ]
  )

  // Create activity log entry
  await queryOne(
    `INSERT INTO admin_journalist_activities (journalist_id, activity_type, subject, metadata)
     VALUES ($1, 'coverage_published', $2, $3::jsonb)`,
    [
      params.id,
      `Coverage published: ${article_title.trim()}`,
      JSON.stringify({ article_url, publication, coverage_id: coverage!.id }),
    ]
  )

  return NextResponse.json({
    ...coverage!,
    quotes_used: parseJsonb(coverage!.quotes_used),
  }, { status: 201 })
}
