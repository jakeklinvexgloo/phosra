import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { query, queryOne } from "@/lib/press/db"
import type { PressRelease, PressStats } from "@/lib/press/types"

export const runtime = "nodejs"

// GET /api/press — list all releases + stats
export async function GET(req: NextRequest) {
  // sandbox bypass
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const releases = await query<PressRelease>(
    `SELECT * FROM press_releases WHERE status != 'archived' ORDER BY created_at DESC`
  )

  // Parse JSONB fields
  const parsed = releases.map(r => ({
    ...r,
    quotes: typeof r.quotes === "string" ? JSON.parse(r.quotes) : r.quotes,
    draft_inputs: typeof r.draft_inputs === "string" ? JSON.parse(r.draft_inputs) : r.draft_inputs,
    revision_history: typeof r.revision_history === "string" ? JSON.parse(r.revision_history) : r.revision_history,
  }))

  const stats: PressStats = {
    total: parsed.length,
    drafts: parsed.filter(r => ["idea", "draft", "in_review"].includes(r.status)).length,
    scheduled: parsed.filter(r => ["approved", "scheduled"].includes(r.status)).length,
    distributed: parsed.filter(r => r.status === "distributed").length,
  }

  return NextResponse.json({ releases: parsed, stats })
}

// POST /api/press — create a new release
// Body: { title: string, release_type?: string, dateline_city?: string, dateline_state?: string, notes?: string }
export async function POST(req: NextRequest) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { title, release_type, dateline_city, dateline_state, notes, milestone_id, publish_date, draft_inputs } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  // Generate slug from title
  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const release = await queryOne<PressRelease>(
    `INSERT INTO press_releases (title, slug, release_type, dateline_city, dateline_state, notes, milestone_id, publish_date, draft_inputs)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
     RETURNING *`,
    [
      title.trim(),
      slug,
      release_type || "product_launch",
      dateline_city || "AUSTIN",
      dateline_state || "TX",
      notes || "",
      milestone_id || null,
      publish_date || null,
      JSON.stringify(draft_inputs || {}),
    ]
  )

  return NextResponse.json(release, { status: 201 })
}
