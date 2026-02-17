import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { observe, updateActiveTrace } from "@langfuse/tracing"
import { SYSTEM_PROMPT } from "@/lib/playground/system-prompt"
import { buildTools, type ToolHttpCapture } from "@/lib/playground/tools-ai-sdk"
import { langfuseSpanProcessor } from "@/instrumentation"

export const runtime = "nodejs"
export const maxDuration = 120

const handler = async (req: Request) => {
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

  // Tag this trace with the session so all messages in one chat are grouped
  updateActiveTrace({
    name: "playground-chat",
    sessionId,
    metadata: { messageCount: uiMessages.length },
  })

  // On first message, pre-populate the Klinvex Family (children + platforms, no policies)
  const isFirstMessage = uiMessages.length <= 1
  if (isFirstMessage) {
    try {
      const setupUrl = new URL("/api/playground/setup", req.url)
      await fetch(setupUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
    } catch {
      // setup failure shouldn't block chat
    }
  }

  // Collect HTTP captures — the frontend reads these from the tool results
  const httpCaptures: ToolHttpCapture[] = []
  const tools = buildTools(sandboxToken, (capture) => {
    httpCaptures.push(capture)
  })

  const anthropic = createAnthropic({ apiKey })

  // Convert UI messages to model messages for streamText
  const modelMessages = await convertToModelMessages(uiMessages)

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(20),
    experimental_telemetry: { isEnabled: true },
    onFinish: async () => {
      // Flush Langfuse traces after the AI finishes generating
      await langfuseSpanProcessor.forceFlush()
    },
  })

  return result.toUIMessageStreamResponse()
}

export const POST = observe(handler, {
  name: "playground-chat",
  endOnExit: false,
})
