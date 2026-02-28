import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { STATIC_RESEARCH_CONTEXT } from "@/lib/platform-research/static-research-context"
import { RESEARCH_SYSTEM_PROMPT_INTRO } from "@/lib/platform-research/chat-context"

export const runtime = "nodejs"
export const maxDuration = 60

let cachedContext: string | null = null

async function getContext(): Promise<string> {
  if (!cachedContext) {
    try {
      const { buildResearchContext } = await import(
        "@/lib/platform-research/chat-context"
      )
      const ctx = await buildResearchContext()
      // If the dynamic build returned only the intro (no data loaded), fall back to static
      if (ctx.length > RESEARCH_SYSTEM_PROMPT_INTRO.length + 100) {
        cachedContext = ctx
      } else {
        console.warn(
          "[research/chat] Dynamic context empty, using static fallback"
        )
        cachedContext = STATIC_RESEARCH_CONTEXT
      }
    } catch (err) {
      console.warn(
        "[research/chat] Failed to build dynamic context, using static fallback:",
        err
      )
      cachedContext = STATIC_RESEARCH_CONTEXT
    }
  }
  return cachedContext
}

export async function POST(req: Request) {
  const apiKey =
    process.env.PLAYGROUND_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    )
  }

  const body = await req.json()
  const uiMessages: UIMessage[] = body.messages ?? []

  const anthropic = createAnthropic({ apiKey })
  const modelMessages = await convertToModelMessages(uiMessages)
  const systemPrompt = await getContext()

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemPrompt,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
