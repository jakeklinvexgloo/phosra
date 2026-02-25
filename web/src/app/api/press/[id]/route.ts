import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { queryOne } from "@/lib/press/db"
import type { PressRelease } from "@/lib/press/types"

export const runtime = "nodejs"

interface RouteContext { params: { id: string } }

// GET /api/press/[id]
export async function GET(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const release = await queryOne<PressRelease>(
    `SELECT * FROM press_releases WHERE id = $1`, [params.id]
  )
  if (!release) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Parse JSONB
  return NextResponse.json({
    ...release,
    quotes: typeof release.quotes === "string" ? JSON.parse(release.quotes) : release.quotes,
    draft_inputs: typeof release.draft_inputs === "string" ? JSON.parse(release.draft_inputs) : release.draft_inputs,
    revision_history: typeof release.revision_history === "string" ? JSON.parse(release.revision_history) : release.revision_history,
  })
}

// PUT /api/press/[id] — update any fields
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  // Build dynamic SET clause from provided fields
  const allowedFields = [
    "title", "subtitle", "slug", "status", "release_type",
    "dateline_city", "dateline_state", "publish_date", "embargo_date",
    "headline", "body", "boilerplate", "contact_name", "contact_email",
    "contact_phone", "notes", "milestone_id",
  ]
  const jsonbFields = ["quotes", "draft_inputs", "revision_history"]

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

  // Recalculate word count if body changed
  if (body.body !== undefined) {
    const wordCount = body.body.trim().split(/\s+/).filter(Boolean).length
    sets.push(`word_count = $${paramIdx}`)
    values.push(wordCount)
    paramIdx++
  }

  // Always update updated_at
  sets.push(`updated_at = NOW()`)

  if (sets.length <= 1) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  values.push(params.id)
  const release = await queryOne<PressRelease>(
    `UPDATE press_releases SET ${sets.join(", ")} WHERE id = $${paramIdx} RETURNING *`,
    values
  )

  if (!release) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    ...release,
    quotes: typeof release.quotes === "string" ? JSON.parse(release.quotes) : release.quotes,
    draft_inputs: typeof release.draft_inputs === "string" ? JSON.parse(release.draft_inputs) : release.draft_inputs,
    revision_history: typeof release.revision_history === "string" ? JSON.parse(release.revision_history) : release.revision_history,
  })
}

// DELETE /api/press/[id] — soft delete (archive)
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await queryOne(
    `UPDATE press_releases SET status = 'archived', updated_at = NOW() WHERE id = $1`,
    [params.id]
  )

  return NextResponse.json({ success: true })
}
