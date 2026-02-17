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
const DELAY_BETWEEN_PROMPTS_MS = 3000
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
        console.error(`  HTTP ${response.status}: ${errText.slice(0, 200)}`)
        return {
          promptId: prompt.id,
          category: prompt.category,
          title: prompt.title,
          sessionId,
          messages,
          totalToolCalls,
          toolNames: allToolNames,
          durationMs: Date.now() - startTime,
          error: `HTTP ${response.status}: ${errText.slice(0, 500)}`,
        }
      }

      const { text, toolCalls } = await parseSSEStream(response)

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
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error(`  Error: ${errMsg}`)
      return {
        promptId: prompt.id,
        category: prompt.category,
        title: prompt.title,
        sessionId,
        messages,
        totalToolCalls,
        toolNames: allToolNames,
        durationMs: Date.now() - startTime,
        error: errMsg,
      }
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

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const idFlag = args.indexOf("--id")
  const catFlag = args.indexOf("--category")
  const filterId = idFlag !== -1 ? args[idFlag + 1] : null
  const filterCat = catFlag !== -1 ? args[catFlag + 1] : null

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
  console.log(`API: ${API_URL}`)
  console.log(`═══════════════════════════\n`)

  let completed = 0
  let errors = 0

  for (const prompt of toRun) {
    const transcript = await runPrompt(prompt)

    // Save transcript
    const outPath = resolve(RESULTS_DIR, `${prompt.id}.json`)
    writeFileSync(outPath, JSON.stringify(transcript, null, 2))

    if (transcript.error) errors++
    completed++

    console.log(`  Progress: ${completed}/${toRun.length} (${errors} errors)`)

    // Delay between prompts
    if (completed < toRun.length) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_PROMPTS_MS))
    }
  }

  console.log(`\n═══ Complete ═══`)
  console.log(`Ran: ${completed}`)
  console.log(`Errors: ${errors}`)
  console.log(`Results saved to: ${RESULTS_DIR}`)
}

main().catch(console.error)
