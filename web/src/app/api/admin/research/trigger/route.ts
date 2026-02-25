import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { query, queryOne } from "@/lib/investors/db"
import { spawn } from "child_process"
import path from "path"

export const runtime = "nodejs"

// POST /api/admin/research/trigger — trigger research for a single platform
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
  const { platformId, platformName } = body

  if (!platformId?.trim()) {
    return NextResponse.json(
      { error: "platformId is required" },
      { status: 400 },
    )
  }
  if (!platformName?.trim()) {
    return NextResponse.json(
      { error: "platformName is required" },
      { status: 400 },
    )
  }

  // Insert a pending result record
  const result = await queryOne<Record<string, unknown>>(
    `INSERT INTO platform_research_results (platform_id, platform_name, status, trigger_type)
     VALUES ($1, $2, 'pending', 'manual')
     RETURNING *`,
    [platformId.trim(), platformName.trim()],
  )

  if (!result) {
    return NextResponse.json(
      { error: "Failed to create research result" },
      { status: 500 },
    )
  }

  // Spawn the researcher script asynchronously
  const scriptPath = path.resolve(
    process.cwd(),
    "scripts/workers/platform-researcher.mjs",
  )
  try {
    const child = spawn(
      "node",
      [scriptPath, "--platform-id", platformId.trim(), "--result-id", String(result.id)],
      {
        detached: true,
        stdio: "ignore",
        env: { ...process.env },
      },
    )
    child.unref()
  } catch {
    // Update the result to failed if spawn itself errors
    await queryOne(
      `UPDATE platform_research_results SET status = 'failed', error_message = $1, completed_at = NOW() WHERE id = $2`,
      ["Failed to spawn researcher process", result.id],
    )
  }

  return NextResponse.json(
    { id: result.id, platformId, status: "pending" },
    { status: 201 },
  )
}
