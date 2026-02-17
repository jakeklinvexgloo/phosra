/**
 * Phosra Eval Runner — sends multi-turn conversations to production chat API
 * and saves transcripts for scoring.
 *
 * Usage:
 *   npx tsx runner.ts                       # run all 200 prompts
 *   npx tsx runner.ts --id setup-001        # run one prompt
 *   npx tsx runner.ts --category edge-cases # run one category
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs"
import { resolve, dirname } from "path"

// ─── Types ──────────────────────────────────────────────────────────────────

interface PromptTurn {
  role: "user"
  text: string
}

interface Assertions {
  tools_must_call: string[]
  tools_must_not_call: string[]
  response_must_mention: string[]
  min_tool_calls: number
}

interface EvalPrompt {
  id: string
  category: string
  title: string
  turns: PromptTurn[]
  assertions: Assertions
}

interface ToolCall {
  toolCallId: string
  toolName: string
  args: unknown
  result?: unknown
}

interface AssistantMessage {
  role: "assistant"
  id: string
  text: string
  toolCalls: ToolCall[]
}

interface UserMessage {
  role: "user"
  id: string
  text: string
}

type Message = AssistantMessage | UserMessage

interface Transcript {
  promptId: string
  category: string
  title: string
  sessionId: string
  messages: Message[]
  totalToolCalls: number
  toolNames: string[]
  durationMs: number
  error?: string
}

// ─── Config ─────────────────────────────────────────────────────────────────

const API_URL = process.env.EVAL_API_URL || "https://www.phosra.com/api/playground/chat"
const DELAY_BETWEEN_TURNS_MS = 2000
const DEFAULT_CONCURRENCY = 1 // Each request is ~40k input tokens, rate limit is 50k/min — must run sequentially
const STAGGER_DELAY_MS = 35000 // Stagger worker starts to spread out rate limit usage
const RESULTS_DIR = resolve(dirname(new URL(import.meta.url).pathname), "results")

// ─── SSE Stream Parser ──────────────────────────────────────────────────────

/**
 * Parses the Vercel AI SDK UI message stream protocol.
 * Lines are formatted as: data: {"type":"...", ...}\n
 * Event types:
 *   text-delta: { delta: string }
 *   tool-input-start: { toolCallId, toolName }
 *   tool-input-delta: { toolCallId, inputTextDelta }
 *   tool-input-available: { toolCallId, toolName, input }
 *   tool-output-available: { toolCallId, output }
 *   error: { ... }
 */
async function parseSSEStream(response: Response): Promise<{ text: string; toolCalls: ToolCall[] }> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  let fullText = ""
  const toolCalls = new Map<string, ToolCall>()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith("data: ")) continue

      const jsonStr = trimmed.slice(6)

      try {
        const event = JSON.parse(jsonStr)

        switch (event.type) {
          case "text-delta": {
            fullText += event.delta || ""
            break
          }
          case "tool-input-start": {
            toolCalls.set(event.toolCallId, {
              toolCallId: event.toolCallId,
              toolName: event.toolName,
              args: {},
            })
            break
          }
          case "tool-input-available": {
            // Final args available
            const tc = toolCalls.get(event.toolCallId)
            if (tc) {
              tc.args = event.input || {}
            } else {
              // Sometimes input-available comes without input-start
              toolCalls.set(event.toolCallId, {
                toolCallId: event.toolCallId,
                toolName: event.toolName,
                args: event.input || {},
              })
            }
            break
          }
          case "tool-output-available": {
            const tc = toolCalls.get(event.toolCallId)
            if (tc) {
              tc.result = event.output
            }
            break
          }
          case "error": {
            console.error(`  Stream error: ${JSON.stringify(event)}`)
            break
          }
        }
      } catch {
        // Skip malformed lines
      }
    }
  }

  return { text: fullText, toolCalls: Array.from(toolCalls.values()) }
}

// ─── Build UI Message Format ────────────────────────────────────────────────

function buildUIMessages(messages: Message[]): unknown[] {
  return messages.map((m) => {
    if (m.role === "user") {
      return {
        id: m.id,
        role: "user",
        parts: [{ type: "text", text: m.text }],
      }
    }
    // Assistant message — interleave text and tool invocations
    const parts: unknown[] = []
    if (m.text) {
      parts.push({ type: "text", text: m.text })
    }
    for (const tc of m.toolCalls) {
      // Use "dynamic-tool" type with "input"/"output" fields (Vercel AI SDK v5 UIMessage format)
      if (tc.result !== undefined) {
        parts.push({
          type: "dynamic-tool",
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          state: "output-available",
          input: tc.args,
          output: tc.result,
        })
      } else {
        parts.push({
          type: "dynamic-tool",
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          state: "input-available",
          input: tc.args,
        })
      }
    }
    return {
      id: m.id,
      role: "assistant",
      parts,
    }
  })
}

// ─── Send a single turn with retry on rate limits ──────────────────────────

async function sendTurnWithRetry(
  uiMessages: unknown[],
  sessionId: string,
  maxRetries = 3
): Promise<{ text: string; toolCalls: ToolCall[] } | { error: string }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: uiMessages,
          sessionId,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        if (response.status === 429 || errText.includes("rate_limit")) {
          const backoff = (attempt + 1) * 30000 // 30s, 60s, 90s
          console.log(`    Rate limited (HTTP ${response.status}), waiting ${backoff / 1000}s...`)
          await new Promise((r) => setTimeout(r, backoff))
          continue
        }
        return { error: `HTTP ${response.status}: ${errText.slice(0, 500)}` }
      }

      const { text, toolCalls } = await parseSSEStream(response)

      // Check if the stream itself contained rate limit errors with minimal content
      if (text.length < 100 && toolCalls.length <= 2) {
        // Might be a partial response due to rate limit mid-stream
        // Only retry if we got very little back
        const hasRateLimitError = text.includes("rate limit") || text.includes("rate_limit")
        if (hasRateLimitError && attempt < maxRetries - 1) {
          const backoff = (attempt + 1) * 30000
          console.log(`    Stream rate limited, waiting ${backoff / 1000}s...`)
          await new Promise((r) => setTimeout(r, backoff))
          continue
        }
      }

      return { text, toolCalls }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes("rate") && attempt < maxRetries - 1) {
        const backoff = (attempt + 1) * 30000
        console.log(`    Network error (rate limit?), waiting ${backoff / 1000}s...`)
        await new Promise((r) => setTimeout(r, backoff))
        continue
      }
      return { error: errMsg }
    }
  }
  return { error: "Max retries exceeded (rate limit)" }
}

// ─── Run One Prompt ─────────────────────────────────────────────────────────

async function runPrompt(prompt: EvalPrompt): Promise<Transcript> {
  const sessionId = `eval-${prompt.id}-${Date.now()}`
  const messages: Message[] = []
  const allToolNames: string[] = []
  let totalToolCalls = 0
  const startTime = Date.now()

  console.log(`\n▶ [${prompt.id}] ${prompt.title} (${prompt.turns.length} turns)`)

  for (let i = 0; i < prompt.turns.length; i++) {
    const turn = prompt.turns[i]
    const userMsg: UserMessage = {
      role: "user",
      id: `eval-user-${i}-${Date.now()}`,
      text: turn.text,
    }
    messages.push(userMsg)

    console.log(`  Turn ${i + 1}: "${turn.text.slice(0, 60)}${turn.text.length > 60 ? "..." : ""}"`)

    // Build the messages payload
    const uiMessages = buildUIMessages(messages)
    const result = await sendTurnWithRetry(uiMessages, sessionId)

    if ("error" in result) {
      console.error(`  Error: ${result.error}`)
      return {
        promptId: prompt.id,
        category: prompt.category,
        title: prompt.title,
        sessionId,
        messages,
        totalToolCalls,
        toolNames: allToolNames,
        durationMs: Date.now() - startTime,
        error: result.error,
      }
    }

    const { text, toolCalls } = result

    const assistantMsg: AssistantMessage = {
      role: "assistant",
      id: `eval-asst-${i}-${Date.now()}`,
      text,
      toolCalls,
    }
    messages.push(assistantMsg)

    totalToolCalls += toolCalls.length
    allToolNames.push(...toolCalls.map((tc) => tc.toolName))

    console.log(`  → ${toolCalls.length} tool calls, ${text.length} chars text`)
    if (toolCalls.length > 0) {
      console.log(`    Tools: ${toolCalls.map((tc) => tc.toolName).join(", ")}`)
    }

    // Delay between turns
    if (i < prompt.turns.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_TURNS_MS))
    }
  }

  const durationMs = Date.now() - startTime
  console.log(`  ✓ Done in ${(durationMs / 1000).toFixed(1)}s`)

  return {
    promptId: prompt.id,
    category: prompt.category,
    title: prompt.title,
    sessionId,
    messages,
    totalToolCalls,
    toolNames: allToolNames,
    durationMs,
  }
}

// ─── Concurrent Worker Pool ─────────────────────────────────────────────────

async function runWithConcurrency(prompts: EvalPrompt[], concurrency: number) {
  let completed = 0
  let errors = 0
  const total = prompts.length
  const queue = [...prompts]

  async function worker(workerId: number) {
    while (queue.length > 0) {
      const prompt = queue.shift()
      if (!prompt) break

      try {
        const transcript = await runPrompt(prompt)

        // Save transcript
        const outPath = resolve(RESULTS_DIR, `${prompt.id}.json`)
        writeFileSync(outPath, JSON.stringify(transcript, null, 2))

        if (transcript.error) errors++
        completed++

        console.log(`  [W${workerId}] Progress: ${completed}/${total} (${errors} errors)`)
      } catch (err) {
        errors++
        completed++
        console.error(`  [W${workerId}] Fatal error on ${prompt.id}: ${err}`)
      }
    }
  }

  // Stagger worker starts to avoid hammering rate limits
  const workers = Array.from({ length: Math.min(concurrency, prompts.length) }, (_, i) =>
    new Promise<void>((resolve) => {
      setTimeout(async () => {
        await worker(i + 1)
        resolve()
      }, i * STAGGER_DELAY_MS)
    })
  )
  await Promise.all(workers)

  return { completed, errors }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const idFlag = args.indexOf("--id")
  const catFlag = args.indexOf("--category")
  const concFlag = args.indexOf("--concurrency")
  const filterId = idFlag !== -1 ? args[idFlag + 1] : null
  const filterCat = catFlag !== -1 ? args[catFlag + 1] : null
  const concurrency = concFlag !== -1 ? parseInt(args[concFlag + 1], 10) : DEFAULT_CONCURRENCY

  // Load prompts
  const promptsPath = resolve(dirname(new URL(import.meta.url).pathname), "prompts.json")
  let prompts: EvalPrompt[] = JSON.parse(readFileSync(promptsPath, "utf-8"))

  if (filterId) {
    prompts = prompts.filter((p) => p.id === filterId)
  } else if (filterCat) {
    prompts = prompts.filter((p) => p.category === filterCat)
  }

  if (prompts.length === 0) {
    console.error("No prompts match the filter.")
    process.exit(1)
  }

  // Ensure results dir
  mkdirSync(RESULTS_DIR, { recursive: true })

  // Skip already-completed prompts (for resumability)
  const existing = new Set(
    existsSync(RESULTS_DIR)
      ? readdirSync(RESULTS_DIR)
          .filter((f) => f.endsWith(".json"))
          .map((f) => f.replace(".json", ""))
      : []
  )

  const toRun = prompts.filter((p) => !existing.has(p.id))
  console.log(`\n═══ Phosra Eval Runner ═══`)
  console.log(`Total prompts: ${prompts.length}`)
  console.log(`Already done: ${prompts.length - toRun.length}`)
  console.log(`To run: ${toRun.length}`)
  console.log(`Concurrency: ${concurrency}`)
  console.log(`API: ${API_URL}`)
  console.log(`═══════════════════════════\n`)

  if (toRun.length === 0) {
    console.log("All prompts already completed!")
    return
  }

  const { completed, errors } = await runWithConcurrency(toRun, concurrency)

  console.log(`\n═══ Complete ═══`)
  console.log(`Ran: ${completed}`)
  console.log(`Errors: ${errors}`)
  console.log(`Results saved to: ${RESULTS_DIR}`)
}

main().catch(console.error)
