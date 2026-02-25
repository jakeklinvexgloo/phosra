import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/investors/db"
import { requireAdmin } from "@/lib/stytch-auth"

export const runtime = "nodejs"

const ALLOWED_KEYS = [
  "milestones",
  "investor_ratings",
  "pipeline_status",
  "outreach_last_visit",
]

async function checkAdmin(): Promise<
  | { authorized: true; userId: string }
  | { authorized: false; response: NextResponse }
> {
  const auth = await requireAdmin()
  if (auth.authorized) return { authorized: true, userId: auth.user.user_id }
  return {
    authorized: false,
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  }
}

/**
 * GET /api/admin/dashboard-state
 * Returns all persisted dashboard state for the current user.
 */
export async function GET(_req: NextRequest) {
  const auth = await checkAdmin()
  if (!auth.authorized) return auth.response

  try {
    const rows = await query<{ key: string; value: unknown }>(
      `SELECT key, value FROM admin_dashboard_state WHERE user_id = $1`,
      [auth.userId],
    )
    const state: Record<string, unknown> = {}
    for (const row of rows) {
      state[row.key] = row.value
    }
    return NextResponse.json(state)
  } catch (error) {
    console.error("dashboard-state GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch state" },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/admin/dashboard-state
 * Upserts one key at a time, scoped to the current user.
 */
export async function PUT(req: NextRequest) {
  const auth = await checkAdmin()
  if (!auth.authorized) return auth.response

  try {
    const { key, value } = (await req.json()) as {
      key?: string
      value?: unknown
    }

    if (!key || !ALLOWED_KEYS.includes(key)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 })
    }
    if (value === undefined) {
      return NextResponse.json(
        { error: "value is required" },
        { status: 400 },
      )
    }

    await query(
      `INSERT INTO admin_dashboard_state (user_id, key, value, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, key) DO UPDATE SET value = $3, updated_at = NOW()`,
      [auth.userId, key, JSON.stringify(value)],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("dashboard-state PUT error:", error)
    return NextResponse.json(
      { error: "Failed to save state" },
      { status: 500 },
    )
  }
}
