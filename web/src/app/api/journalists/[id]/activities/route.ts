import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { query } from "@/lib/journalists/db"
import type { JournalistActivity } from "@/lib/journalists/types"

export const runtime = "nodejs"

interface RouteContext { params: { id: string } }

// GET /api/journalists/[id]/activities — list activities for journalist
export async function GET(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const activities = await query<JournalistActivity>(
    `SELECT * FROM admin_journalist_activities
     WHERE journalist_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [params.id]
  )

  const parsed = activities.map(a => ({
    ...a,
    metadata: typeof a.metadata === "string" ? JSON.parse(a.metadata) : a.metadata,
  }))

  return NextResponse.json({ activities: parsed })
}
