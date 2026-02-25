import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { query, queryOne } from "@/lib/investors/db"

export const runtime = "nodejs"

// GET /api/admin/research/stats — summary statistics
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

  // Count by status
  const statusCounts = await query<{ status: string; count: string }>(
    `SELECT status, COUNT(*) as count
     FROM platform_research_results
     GROUP BY status`,
  )

  const byStatus: Record<string, number> = {}
  for (const row of statusCounts) {
    byStatus[row.status] = parseInt(row.count, 10)
  }

  // Total distinct platforms with results
  const platformCount = await queryOne<{ count: string }>(
    `SELECT COUNT(DISTINCT platform_id) as count FROM platform_research_results`,
  )

  // Last completed run timestamp
  const lastRun = await queryOne<{ completed_at: string }>(
    `SELECT completed_at FROM platform_research_results
     WHERE status = 'completed' AND completed_at IS NOT NULL
     ORDER BY completed_at DESC
     LIMIT 1`,
  )

  // Average duration of completed results
  const avgDuration = await queryOne<{ avg_duration: string }>(
    `SELECT AVG(duration_ms) as avg_duration
     FROM platform_research_results
     WHERE status = 'completed' AND duration_ms IS NOT NULL`,
  )

  return NextResponse.json({
    byStatus: {
      completed: byStatus.completed || 0,
      running: byStatus.running || 0,
      failed: byStatus.failed || 0,
      pending: byStatus.pending || 0,
      skipped: byStatus.skipped || 0,
    },
    totalPlatforms: parseInt(platformCount?.count || "0", 10),
    lastRunAt: lastRun?.completed_at || null,
    avgDurationMs: avgDuration?.avg_duration
      ? Math.round(parseFloat(avgDuration.avg_duration))
      : null,
  })
}
