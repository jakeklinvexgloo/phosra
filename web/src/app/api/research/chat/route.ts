import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { STATIC_RESEARCH_CONTEXT } from "@/lib/platform-research/static-research-context"
import { RESEARCH_SYSTEM_PROMPT_INTRO } from "@/lib/platform-research/chat-context"

export const runtime = "nodejs"
export const maxDuration = 60

let cachedContext: string | null = null

async function getContext(): Promise<string> {
  if (!cachedContext) {
    let chatbotContext = ""
    let streamingContext = ""

    // Load chatbot research context
    try {
      const { buildResearchContext } = await import(
        "@/lib/platform-research/chat-context"
      )
      const ctx = await buildResearchContext()
      // If the dynamic build returned only the intro (no data loaded), fall back to static
      if (ctx.length > RESEARCH_SYSTEM_PROMPT_INTRO.length + 100) {
        chatbotContext = ctx
      } else {
        console.warn(
          "[research/chat] Dynamic context empty, using static fallback"
        )
        chatbotContext = STATIC_RESEARCH_CONTEXT
      }
    } catch (err) {
      console.warn(
        "[research/chat] Failed to build dynamic context, using static fallback:",
        err
      )
      chatbotContext = STATIC_RESEARCH_CONTEXT
    }

    // Load streaming platform safety context
    try {
      const { buildStreamingResearchContext } = await import(
        "@/lib/streaming-research/chat-context"
      )
      streamingContext = await buildStreamingResearchContext()
    } catch (err) {
      console.warn(
        "[research/chat] Failed to build streaming context, skipping:",
        err
      )
    }

    // Combine both contexts
    if (streamingContext) {
      cachedContext =
        chatbotContext +
        "\n\n## STREAMING PLATFORM SAFETY DATA\n" +
        "You also have access to comprehensive safety research on streaming video platforms (Netflix, Peacock, Prime Video). " +
        "These platforms were tested across 9 categories including Profile Escape, Search & Discovery, Direct URL/Deep Link, " +
        "Kids Mode Escape, Recommendation Leakage, Cross-Profile Bleed, Content Rating Gaps, PIN/Lock Bypass, and Maturity Filter Effectiveness. " +
        "Each platform was tested with three age profiles: TestChild7 (kids), TestChild12 (kids/teen), and TestTeen16 (teen). " +
        "When asked about streaming safety, use this data to provide informed answers.\n\n" +
        streamingContext
    } else {
      cachedContext = chatbotContext
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
