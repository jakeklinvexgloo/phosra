import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

interface RouteContext {
  params: { platformId: string }
}

// GET /api/admin/research/results/[platformId] — single platform results + history
export async function GET(req: NextRequest, { params }: RouteContext) {
  const sandbox =
    process.env.NEXT_PUBLIC_SANDBOX_MODE === "true"
      ? req.headers.get("x-sandbox-session")
      : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { platformId } = params

  // Get the latest result
  const latest = await queryOne<Record<string, unknown>>(
    `SELECT * FROM platform_research_results
     WHERE platform_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [platformId],
  )

  if (!latest) {
    return NextResponse.json(
      { error: "No results found for this platform" },
      { status: 404 },
    )
  }

  // Get previous results (up to 10, excluding the latest)
  const history = await query<Record<string, unknown>>(
    `SELECT * FROM platform_research_results
     WHERE platform_id = $1 AND id != $2
     ORDER BY created_at DESC
     LIMIT 10`,
    [platformId, latest.id],
  )

  // Get screenshots for the latest result
  const screenshots = await query<Record<string, unknown>>(
    `SELECT * FROM platform_research_screenshots
     WHERE result_id = $1
     ORDER BY created_at ASC`,
    [latest.id],
  )

  // Parse JSONB fields
  const parseResult = (r: Record<string, unknown>) => ({
    ...r,
    screenshots:
      typeof r.screenshots === "string"
        ? JSON.parse(r.screenshots)
        : r.screenshots,
    notes: typeof r.notes === "string" ? JSON.parse(r.notes) : r.notes,
  })

  return NextResponse.json({
    latest: parseResult(latest),
    screenshots,
    history: history.map(parseResult),
  })
}
