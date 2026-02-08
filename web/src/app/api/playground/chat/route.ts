import Anthropic from "@anthropic-ai/sdk"
import { TOOLS, toAnthropicTools, resolveToolPath } from "@/lib/playground/tools"
import { SYSTEM_PROMPT } from "@/lib/playground/system-prompt"
import type { HttpCapture } from "@/lib/playground/types"

const API_BASE = process.env.PHOSRA_API_URL || "http://localhost:8080/api/v1"

export const runtime = "nodejs"
export const maxDuration = 120 // allow long-running tool chains

interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>
  sessionId?: string
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 })
  }

  const body: ChatRequest = await req.json()
  const sessionId = body.sessionId || "default"
  const sandboxToken = `sandbox-${sessionId}`

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      try {
        const client = new Anthropic({ apiKey })

        // Convert our messages to Anthropic format
        const messages: Anthropic.MessageParam[] = body.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        // Agentic loop: keep calling Claude until it stops using tools
        let continueLoop = true
        while (continueLoop) {
          const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools: toAnthropicTools() as Anthropic.Tool[],
            messages,
          })

          // Process response content blocks
          let hasToolUse = false
          const toolResults: Anthropic.ToolResultBlockParam[] = []

          for (const block of response.content) {
            if (block.type === "text") {
              send({ type: "text_delta", content: block.text })
            } else if (block.type === "tool_use") {
              hasToolUse = true
              const toolDef = TOOLS.find((t) => t.name === block.name)
              if (!toolDef) {
                send({ type: "error", message: `Unknown tool: ${block.name}` })
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: `Error: unknown tool ${block.name}`,
                  is_error: true,
                })
                continue
              }

              const input = block.input as Record<string, unknown>
              send({ type: "tool_call_start", id: block.id, name: block.name, input })

              // Execute the actual HTTP call to Phosra API
              const { result, httpReq, httpRes } = await executeToolCall(
                toolDef,
                input,
                sandboxToken
              )

              send({
                type: "tool_call_http",
                id: block.id,
                request: httpReq,
                response: httpRes,
              })
              send({ type: "tool_call_end", id: block.id, result })

              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify(result),
              })
            }
          }

          // If Claude used tools, add the assistant response + tool results and loop
          if (hasToolUse) {
            messages.push({ role: "assistant", content: response.content })
            messages.push({ role: "user", content: toolResults })
          } else {
            continueLoop = false
          }

          send({
            type: "message_end",
            usage: {
              input_tokens: response.usage.input_tokens,
              output_tokens: response.usage.output_tokens,
            },
          })

          // Safety: break after too many iterations
          if (messages.length > 40) {
            send({ type: "error", message: "Too many tool call iterations, stopping." })
            break
          }
        }
      } catch (err) {
        send({ type: "error", message: String(err) })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

async function executeToolCall(
  toolDef: (typeof TOOLS)[0],
  input: Record<string, unknown>,
  token: string
): Promise<{ result: unknown; httpReq: HttpCapture; httpRes: HttpCapture }> {
  const { path, query, body } = resolveToolPath(toolDef, input)

  // Build URL
  let url = `${API_BASE}${path}`
  const queryStr = new URLSearchParams(query).toString()
  if (queryStr) url += `?${queryStr}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Sandbox-Session": token.replace("sandbox-", ""),
  }

  const fetchOpts: RequestInit = {
    method: toolDef.http.method,
    headers,
  }
  if (body) {
    fetchOpts.body = JSON.stringify(body)
  }

  const httpReq: HttpCapture = {
    method: toolDef.http.method,
    url,
    headers: { ...headers, Authorization: "Bearer $SANDBOX_TOKEN" }, // redact in display
    body: body ?? undefined,
  }

  const start = Date.now()
  let result: unknown
  let status = 0

  try {
    const res = await fetch(url, fetchOpts)
    status = res.status
    const text = await res.text()
    try {
      result = JSON.parse(text)
    } catch {
      result = text
    }
  } catch (err) {
    result = { error: String(err) }
    status = 0
  }

  const httpRes: HttpCapture = {
    method: toolDef.http.method,
    url,
    headers: {},
    body: result,
    status,
    latency_ms: Date.now() - start,
  }

  return { result, httpReq, httpRes }
}
