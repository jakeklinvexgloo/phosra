import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { queryOne } from "@/lib/journalists/db"
import type { JournalistPitch } from "@/lib/journalists/types"

export const runtime = "nodejs"

interface RouteContext { params: { id: string; pitchId: string } }

// PUT /api/journalists/[id]/pitches/[pitchId] — update pitch fields
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  // Read the current pitch to detect status changes
  const currentPitch = await queryOne<JournalistPitch>(
    `SELECT * FROM admin_journalist_pitches WHERE id = $1 AND journalist_id = $2`,
    [params.pitchId, params.id]
  )
  if (!currentPitch) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const allowedFields = [
    "pitch_status", "offered_exclusive", "exclusive_deadline", "embargo_agreed",
    "embargo_date", "pitch_subject", "pitch_body", "pitch_angle",
    "gmail_thread_id", "gmail_message_id", "follow_up_count",
    "last_follow_up_at", "next_follow_up_at", "coverage_id", "notes",
  ]

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

  // Always update updated_at
  sets.push(`updated_at = NOW()`)

  if (sets.length <= 1) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  values.push(params.pitchId)
  const pitch = await queryOne<JournalistPitch>(
    `UPDATE admin_journalist_pitches SET ${sets.join(", ")} WHERE id = $${paramIdx} AND journalist_id = $${paramIdx + 1} RETURNING *`,
    [...values, params.id]
  )

  if (!pitch) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // If pitch_status changed, create activity log entry
  if (body.pitch_status !== undefined && body.pitch_status !== currentPitch.pitch_status) {
    await queryOne(
      `INSERT INTO admin_journalist_activities (journalist_id, pitch_id, activity_type, subject, metadata)
       VALUES ($1, $2, 'status_change', $3, $4::jsonb)`,
      [
        params.id,
        params.pitchId,
        `Pitch status changed: ${currentPitch.pitch_status} → ${body.pitch_status}`,
        JSON.stringify({ from: currentPitch.pitch_status, to: body.pitch_status }),
      ]
    )
  }

  return NextResponse.json(pitch)
}
