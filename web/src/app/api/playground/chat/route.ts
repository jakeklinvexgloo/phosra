import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { SYSTEM_PROMPT } from "@/lib/playground/system-prompt"
import { buildTools, type ToolHttpCapture } from "@/lib/playground/tools-ai-sdk"

export const runtime = "nodejs"
export const maxDuration = 120

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
  const sessionId: string = body.chatId ?? body.sessionId ?? "default"
  const sandboxToken = `sandbox-${sessionId}`

  // Collect HTTP captures — the frontend reads these from the tool results
  const httpCaptures: ToolHttpCapture[] = []
  const tools = buildTools(sandboxToken, (capture) => {
    httpCaptures.push(capture)
  })

  const anthropic = createAnthropic({ apiKey })

  // Convert UI messages to model messages for streamText
  const modelMessages = await convertToModelMessages(uiMessages)

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(20),
  })

  return result.toUIMessageStreamResponse()
}
