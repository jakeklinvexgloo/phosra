import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/investors/db"
import { requireAdmin } from "@/lib/stytch-auth"

export const runtime = "nodejs"

async function checkAdmin(): Promise<
  { authorized: true } | { authorized: false; response: NextResponse }
> {
  const auth = await requireAdmin()
  if (auth.authorized) return { authorized: true }
  return {
    authorized: false,
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  }
}

/**
 * GET /api/admin/fundraise-state
 * Returns both milestones and investor_ratings state.
 */
export async function GET(_req: NextRequest) {
  const auth = await checkAdmin()
  if (!auth.authorized) return auth.response

  try {
    const rows = await query<{ key: string; value: unknown }>(
      `SELECT key, value FROM admin_fundraise_state`,
    )
    const state: Record<string, unknown> = {}
    for (const row of rows) {
      state[row.key] = row.value
    }
    return NextResponse.json(state)
  } catch (error) {
    console.error("fundraise-state GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch state" },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/admin/fundraise-state
 * Updates one key at a time (milestones or investor_ratings).
 */
export async function PUT(req: NextRequest) {
  const auth = await checkAdmin()
  if (!auth.authorized) return auth.response

  try {
    const { key, value } = (await req.json()) as {
      key?: string
      value?: unknown
    }

    if (!key || !["milestones", "investor_ratings"].includes(key)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 })
    }
    if (value === undefined) {
      return NextResponse.json(
        { error: "value is required" },
        { status: 400 },
      )
    }

    await query(
      `INSERT INTO admin_fundraise_state (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, JSON.stringify(value)],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("fundraise-state PUT error:", error)
    return NextResponse.json(
      { error: "Failed to save state" },
      { status: 500 },
    )
  }
}
