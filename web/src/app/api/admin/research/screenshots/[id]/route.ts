import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { queryOne } from "@/lib/investors/db"
import fs from "fs/promises"
import path from "path"

export const runtime = "nodejs"

interface RouteContext {
  params: { id: string }
}

// GET /api/admin/research/screenshots/[id] — serve a screenshot image
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

  const screenshot = await queryOne<{
    id: string
    storage_path: string
    label: string
  }>(
    `SELECT id, storage_path, label FROM platform_research_screenshots WHERE id = $1`,
    [params.id],
  )

  if (!screenshot) {
    return NextResponse.json(
      { error: "Screenshot not found" },
      { status: 404 },
    )
  }

  // Read the file from the storage path
  const filePath = path.resolve(screenshot.storage_path)
  try {
    const fileBuffer = await fs.readFile(filePath)

    // Determine content type from file extension
    const ext = path.extname(filePath).toLowerCase()
    const contentTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
    }
    const contentType = contentTypes[ext] || "image/png"

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${screenshot.label}${ext}"`,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Screenshot file not found on disk" },
      { status: 404 },
    )
  }
}
