import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"

export const runtime = "nodejs"
export const maxDuration = 60

let cachedContext: string | null = null

async function getContext(): Promise<string> {
  if (!cachedContext) {
    const { buildResearchContext } = await import(
      "@/lib/platform-research/chat-context"
    )
    cachedContext = await buildResearchContext()
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
