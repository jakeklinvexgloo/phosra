import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

// GET /api/admin/research/results — list latest research results
export async function GET(req: NextRequest) {
  const sandbox =
    process.env.NEXT_PUBLIC_SANDBOX_MODE === "true"
      ? req.headers.get("x-sandbox-session")
      : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200)
  const offset = parseInt(searchParams.get("offset") || "0", 10)

  // Build dynamic query
  const conditions: string[] = []
  const params: unknown[] = []
  let paramIdx = 1

  if (status) {
    conditions.push(`r.status = $${paramIdx}`)
    params.push(status)
    paramIdx++
  }

  if (search) {
    conditions.push(
      `(r.platform_id ILIKE $${paramIdx} OR r.platform_name ILIKE $${paramIdx})`,
    )
    params.push(`%${search}%`)
    paramIdx++
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  // Get total count
  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM platform_research_results r ${whereClause}`,
    params,
  )
  const total = parseInt(countResult?.count || "0", 10)

  // Use a subquery to get only the latest result per platform
  // Then apply filtering and pagination
  const results = await query<Record<string, unknown>>(
    `SELECT r.*
     FROM platform_research_results r
     INNER JOIN (
       SELECT platform_id, MAX(created_at) as max_created
       FROM platform_research_results
       GROUP BY platform_id
     ) latest ON r.platform_id = latest.platform_id AND r.created_at = latest.max_created
     ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset],
  )

  // Parse JSONB fields
  const parsed = results.map((r) => ({
    ...r,
    screenshots:
      typeof r.screenshots === "string"
        ? JSON.parse(r.screenshots)
        : r.screenshots,
    notes: typeof r.notes === "string" ? JSON.parse(r.notes) : r.notes,
  }))

  return NextResponse.json({ results: parsed, total, limit, offset })
}
