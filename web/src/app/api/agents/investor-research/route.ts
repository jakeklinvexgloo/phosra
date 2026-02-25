import { NextRequest, NextResponse } from "next/server"
import { streamText, type UIMessage, convertToModelMessages } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { requireAdmin } from "@/lib/stytch-auth"

export const runtime = "nodejs"
export const maxDuration = 120

async function checkAdmin(
  req: NextRequest,
): Promise<
  { authorized: true } | { authorized: false; response: NextResponse }
> {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (sandbox) return { authorized: true }

  const auth = await requireAdmin()
  if (auth.authorized) return { authorized: true }

  return {
    authorized: false,
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  }
}

const SYSTEM_PROMPT = `You are Phosra's Investor Research Agent — an expert on fundraising strategy for B2B compliance infrastructure startups.

## Context
- **Company:** Phosra (formerly GuardianGate) — "Plaid for child safety compliance"
- **Product:** Single API mapping 45 enforcement rule categories across 67+ child safety laws to 15+ provider adapters
- **Raise:** $950K pre-seed, post-money SAFE, $6M cap, May 31 2026 deadline
- **Regulatory tailwind:** COPPA 2.0 enforcement April 22, 2026; 67+ laws tracked globally
- **Founder:** Serial entrepreneur with 3 exits, Mastercard infrastructure background, 5 kids dog-fooding

## Existing Pipeline
We have 70 warm intro targets across these categories:
- Regtech/child-safety VCs (Konvoy, Okta Ventures, Anthemis, Speedinvest, Tribeca VP, etc.)
- EdTech-adjacent funds (Reach Capital, Magnify, Emerge Education)
- Solo-founder-friendly funds (Precursor, Hustle Fund, SaaStr Fund, a16z Speedrun)
- Strategic T&S angels (Antigone Davis/Meta, Cormac Keenan/TikTok, Clint Smith/Discord)
- FTC alumni (Jules Polonetsky, Lina Khan, Rebecca Slaughter)
- Child safety nonprofit leaders (Jim Steyer, Baroness Kidron, Julie Cordua/Thorn)
- RegTech founders (Dimitri Sirota/BigID, Kabir Barday/OneTrust)
- Angel syndicates (HBS Alumni Angels, Pipeline Angels, Gaingels)

## Your Capabilities
1. Research and profile new investor targets with thesis alignment scoring
2. Draft personalized outreach messages (email, LinkedIn, intro requests)
3. Analyze warm intro paths and recommend sequencing strategy
4. Provide regulatory context for investor conversations
5. Generate competitive positioning for different investor audiences
6. Suggest follow-up strategies based on meeting outcomes

Always be specific, data-driven, and actionable. Format responses with clear headings and bullet points.`

export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth.authorized) return auth.response

  const apiKey =
    process.env.PLAYGROUND_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    )
  }

  const body = await req.json()
  const uiMessages: UIMessage[] = body.messages ?? []

  const anthropic = createAnthropic({ apiKey })
  const modelMessages = await convertToModelMessages(uiMessages)

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250514"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
