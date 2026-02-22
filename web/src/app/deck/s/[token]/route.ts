import { NextRequest } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { queryOne, query } from "@/lib/investors/db"

export const runtime = "nodejs"

/**
 * GET /deck/s/[token]
 * Public route: logs a view then serves the pitch deck HTML.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  try {
    const share = await queryOne<{ id: string; is_active: boolean }>(
      `SELECT id, is_active FROM deck_shares WHERE token = $1`,
      [token],
    )

    if (!share || !share.is_active) {
      return new Response(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Link Not Found</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#060D16;color:#fff;}
.c{text-align:center;}.c h1{font-size:1.5rem;margin-bottom:0.5rem;}.c p{color:rgba(255,255,255,0.4);font-size:0.875rem;}</style></head>
<body><div class="c"><h1>Link Not Found</h1><p>This share link is invalid or has been deactivated.</p></div></body></html>`,
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
      )
    }

    // Log the view
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
    const userAgent = req.headers.get("user-agent") || null
    const referrer = req.headers.get("referer") || null

    await query(
      `INSERT INTO deck_share_views (share_id, ip_address, user_agent, referrer)
       VALUES ($1, $2, $3, $4)`,
      [share.id, ip, userAgent, referrer],
    )

    // Serve the deck HTML
    const deckPath = join(process.cwd(), "public", "deck", "index.html")
    const html = readFileSync(deckPath, "utf-8")

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("deck share view error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
