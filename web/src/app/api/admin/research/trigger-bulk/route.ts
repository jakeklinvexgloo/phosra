import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { query, queryOne } from "@/lib/investors/db"
import { spawn } from "child_process"
import path from "path"

export const runtime = "nodejs"

// POST /api/admin/research/trigger-bulk — trigger research for multiple platforms
export async function POST(req: NextRequest) {
  const sandbox =
    process.env.NEXT_PUBLIC_SANDBOX_MODE === "true"
      ? req.headers.get("x-sandbox-session")
      : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { platformIds } = body

  if (!Array.isArray(platformIds) || platformIds.length === 0) {
    return NextResponse.json(
      { error: "platformIds array is required and must not be empty" },
      { status: 400 },
    )
  }

  // Create a research run record
  const run = await queryOne<Record<string, unknown>>(
    `INSERT INTO platform_research_runs (trigger_type, status, platform_ids, total_count)
     VALUES ('bulk', 'running', $1::jsonb, $2)
     RETURNING *`,
    [JSON.stringify(platformIds.map((p: { id: string }) => p.id)), platformIds.length],
  )

  if (!run) {
    return NextResponse.json(
      { error: "Failed to create research run" },
      { status: 500 },
    )
  }

  // Create a pending result for each platform
  const resultIds: string[] = []
  for (const platform of platformIds) {
    const result = await queryOne<Record<string, unknown>>(
      `INSERT INTO platform_research_results (platform_id, platform_name, status, trigger_type, run_id)
       VALUES ($1, $2, 'pending', 'bulk', $3)
       RETURNING id`,
      [platform.id, platform.name, run.id],
    )
    if (result) {
      resultIds.push(String(result.id))
    }
  }

  // Spawn the researcher script for each platform asynchronously
  const scriptPath = path.resolve(
    process.cwd(),
    "scripts/workers/platform-researcher.mjs",
  )
  for (let i = 0; i < platformIds.length; i++) {
    const platform = platformIds[i]
    const resultId = resultIds[i]
    if (!resultId) continue
    try {
      const child = spawn(
        "node",
        [
          scriptPath,
          "--platform-id",
          platform.id,
          "--result-id",
          resultId,
          "--run-id",
          String(run.id),
        ],
        {
          detached: true,
          stdio: "ignore",
          env: { ...process.env },
        },
      )
      child.unref()
    } catch {
      await queryOne(
        `UPDATE platform_research_results SET status = 'failed', error_message = $1, completed_at = NOW() WHERE id = $2`,
        ["Failed to spawn researcher process", resultId],
      )
    }
  }

  return NextResponse.json(
    {
      runId: run.id,
      totalCount: platformIds.length,
      resultIds,
      status: "running",
    },
    { status: 201 },
  )
}
