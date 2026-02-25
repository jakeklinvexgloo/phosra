import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const HOOKS: Record<string, string | undefined> = {
  "vercel-preview": process.env.VERCEL_DEPLOY_HOOK_PREVIEW,
  "vercel-production": process.env.VERCEL_DEPLOY_HOOK_PRODUCTION,
  "fly": process.env.FLY_DEPLOY_HOOK,
}

export async function POST(req: NextRequest) {
  const { target } = await req.json()

  const hookUrl = HOOKS[target]
  if (!hookUrl) {
    return NextResponse.json(
      { error: `No deploy hook configured for "${target}". Add the env var in your hosting settings.` },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(hookUrl, { method: "POST" })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Deploy hook returned ${res.status}: ${text}` },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true, target })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to reach deploy hook: ${err.message}` },
      { status: 502 }
    )
  }
}
