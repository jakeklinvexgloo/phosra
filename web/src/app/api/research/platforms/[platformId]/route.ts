import { NextResponse } from "next/server"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"

export const runtime = "nodejs"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
}

/** GET /api/research/platforms/:platformId — Single platform detail */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ platformId: string }> }
) {
  const { platformId } = await params
  const platforms = await loadAllChatbotResearch()
  const platform = platforms.find((p) => p.platformId === platformId)

  if (!platform) {
    return NextResponse.json(
      { error: `Platform "${platformId}" not found` },
      { status: 404, headers: CORS_HEADERS }
    )
  }

  return NextResponse.json(platform, { headers: CORS_HEADERS })
}
