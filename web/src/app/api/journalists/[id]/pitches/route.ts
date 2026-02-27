import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { query, queryOne } from "@/lib/journalists/db"
import type { JournalistPitch } from "@/lib/journalists/types"

export const runtime = "nodejs"

interface RouteContext { params: { id: string } }

// GET /api/journalists/[id]/pitches — list pitches for this journalist
export async function GET(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pitches = await query<JournalistPitch>(
    `SELECT jp.*, pr.title AS press_release_title
     FROM admin_journalist_pitches jp
     LEFT JOIN press_releases pr ON jp.press_release_id = pr.id
     WHERE jp.journalist_id = $1
     ORDER BY jp.created_at DESC`,
    [params.id]
  )

  return NextResponse.json({ pitches })
}

// POST /api/journalists/[id]/pitches — create a new pitch
export async function POST(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { press_release_id, pitch_status, offered_exclusive, exclusive_deadline, embargo_agreed, embargo_date, pitch_subject, pitch_body, pitch_angle, notes } = body

  const pitch = await queryOne<JournalistPitch>(
    `INSERT INTO admin_journalist_pitches (journalist_id, press_release_id, pitch_status, offered_exclusive, exclusive_deadline, embargo_agreed, embargo_date, pitch_subject, pitch_body, pitch_angle, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      params.id,
      press_release_id,
      pitch_status || "draft",
      offered_exclusive ?? false,
      exclusive_deadline || null,
      embargo_agreed ?? false,
      embargo_date || null,
      pitch_subject || null,
      pitch_body || null,
      pitch_angle || null,
      notes || null,
    ]
  )

  // Create activity log entry
  await queryOne(
    `INSERT INTO admin_journalist_activities (journalist_id, pitch_id, activity_type, subject)
     VALUES ($1, $2, 'note', 'Pitch created')`,
    [params.id, pitch!.id]
  )

  return NextResponse.json(pitch, { status: 201 })
}
