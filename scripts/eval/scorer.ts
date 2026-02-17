/**
 * Phosra Eval Scorer — scores transcripts using assertions + LLM-as-judge,
 * then posts scores to Langfuse.
 *
 * Usage:
 *   npx tsx scorer.ts                   # score all results
 *   npx tsx scorer.ts --id setup-001    # score one result
 */

import { readFileSync, writeFileSync, readdirSync } from "fs"
import { resolve, dirname } from "path"
import Anthropic from "@anthropic-ai/sdk"

// ─── Types ──────────────────────────────────────────────────────────────────

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
  turns: { role: string; text: string }[]
  assertions: Assertions
}

interface Score {
  promptId: string
  category: string
  title: string
  sessionId: string
  taskCompletion: number
  responseQuality: number
  combined: number
  assertionDetails: {
    toolsCalledPass: boolean
    toolsNotCalledPass: boolean
    mentionsPass: boolean
    minToolCallsPass: boolean
    noErrorPass: boolean
  }
  qualityDetails: {
    accuracy: number
    helpfulness: number
    completeness: number
    tone: number
    efficiency: number
  }
  error?: string
}

// ─── Config ─────────────────────────────────────────────────────────────────

const RESULTS_DIR = resolve(dirname(new URL(import.meta.url).pathname), "results")
const SCORES_PATH = resolve(dirname(new URL(import.meta.url).pathname), "scores.json")
const PROMPTS_PATH = resolve(dirname(new URL(import.meta.url).pathname), "prompts.json")

const LANGFUSE_SECRET_KEY = process.env.LANGFUSE_SECRET_KEY || ""
const LANGFUSE_PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY || ""
const LANGFUSE_BASE_URL = process.env.LANGFUSE_BASE_URL || "https://us.cloud.langfuse.com"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ""

// ─── Task Completion Scorer (Assertions) ────────────────────────────────────

function scoreTaskCompletion(transcript: Transcript, assertions: Assertions): {
  score: number
  details: Score["assertionDetails"]
} {
  const toolNames = new Set(transcript.toolNames)
  const allText = transcript.messages
    .filter((m): m is AssistantMessage => m.role === "assistant")
    .map((m) => m.text)
    .join(" ")
    .toLowerCase()

  // 1. Required tools called
  const toolsCalledPass =
    assertions.tools_must_call.length === 0 ||
    assertions.tools_must_call.every((t) => toolNames.has(t))

  // 2. Forbidden tools not called
  const toolsNotCalledPass =
    assertions.tools_must_not_call.length === 0 ||
    assertions.tools_must_not_call.every((t) => !toolNames.has(t))

  // 3. Response mentions required terms
  const mentionsPass =
    assertions.response_must_mention.length === 0 ||
    assertions.response_must_mention.every((term) => allText.includes(term.toLowerCase()))

  // 4. Minimum tool calls met
  const minToolCallsPass = transcript.totalToolCalls >= assertions.min_tool_calls

  // 5. No errors
  const noErrorPass = !transcript.error

  const checks = [toolsCalledPass, toolsNotCalledPass, mentionsPass, minToolCallsPass, noErrorPass]
  const passCount = checks.filter(Boolean).length
  const score = Math.round((passCount / checks.length) * 100)

  return {
    score,
    details: { toolsCalledPass, toolsNotCalledPass, mentionsPass, minToolCallsPass, noErrorPass },
  }
}

// ─── Response Quality Scorer (LLM-as-Judge) ─────────────────────────────────

const JUDGE_SYSTEM = `You are an expert evaluator for a parental controls AI assistant called Phosra.
You will be given a conversation between a parent and the AI assistant. The assistant helps set up parental controls across platforms like Netflix, YouTube, Fire Tablet, etc.

Score the assistant's responses on these 5 dimensions (each 0-20, total 0-100):

1. ACCURACY (0-20): Did the assistant give correct information about rules, platforms, and capabilities? Did it use the right tools with correct parameters?

2. HELPFULNESS (0-20): Did it explain what happened clearly? Did it provide useful context about the changes being made?

3. COMPLETENESS (0-20): Did it address ALL parts of the parent's request? Did it handle every child, platform, and rule mentioned?

4. TONE (0-20): Was it parent-friendly and reassuring? Not too technical? Empathetic to parental concerns?

5. EFFICIENCY (0-20): Did it use the minimum necessary tool calls? No redundant API calls? Batched operations where possible?

Respond ONLY with a JSON object in this exact format (no markdown, no explanation):
{"accuracy":N,"helpfulness":N,"completeness":N,"tone":N,"efficiency":N}`

async function scoreResponseQuality(
  transcript: Transcript,
  anthropic: Anthropic
): Promise<{ score: number; details: Score["qualityDetails"] }> {
  // Build conversation summary for the judge
  const convSummary = transcript.messages
    .map((m) => {
      if (m.role === "user") return `USER: ${m.text}`
      const toolSummary = m.toolCalls.length > 0
        ? `\n  [Tool calls: ${m.toolCalls.map((tc) => `${tc.toolName}(${JSON.stringify(tc.args).slice(0, 100)})`).join(", ")}]`
        : ""
      return `ASSISTANT: ${m.text.slice(0, 1000)}${toolSummary}`
    })
    .join("\n\n")

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 200,
      system: JUDGE_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Evaluate this conversation:\n\n${convSummary}`,
        },
      ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const scores = JSON.parse(text) as Score["qualityDetails"]

    const total = scores.accuracy + scores.helpfulness + scores.completeness + scores.tone + scores.efficiency
    return { score: total, details: scores }
  } catch (err) {
    console.error(`  LLM judge error: ${err instanceof Error ? err.message : err}`)
    return {
      score: 50, // Default middle score on error
      details: { accuracy: 10, helpfulness: 10, completeness: 10, tone: 10, efficiency: 10 },
    }
  }
}

// ─── Langfuse Score Posting ─────────────────────────────────────────────────

async function postLangfuseScore(sessionId: string, name: string, value: number) {
  if (!LANGFUSE_SECRET_KEY || !LANGFUSE_PUBLIC_KEY) return

  try {
    const auth = Buffer.from(`${LANGFUSE_PUBLIC_KEY}:${LANGFUSE_SECRET_KEY}`).toString("base64")
    await fetch(`${LANGFUSE_BASE_URL}/api/public/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        name,
        value,
        traceId: sessionId,
        comment: `Eval score for ${name}`,
      }),
    })
  } catch {
    // Non-blocking
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const idFlag = args.indexOf("--id")
  const filterId = idFlag !== -1 ? args[idFlag + 1] : null

  // Load prompts for assertions
  const prompts: EvalPrompt[] = JSON.parse(readFileSync(PROMPTS_PATH, "utf-8"))
  const promptMap = new Map(prompts.map((p) => [p.id, p]))

  // Load transcripts
  let files = readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json"))
  if (filterId) {
    files = files.filter((f) => f === `${filterId}.json`)
  }

  if (files.length === 0) {
    console.error("No transcripts found. Run runner.ts first.")
    process.exit(1)
  }

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

  console.log(`\n═══ Phosra Eval Scorer ═══`)
  console.log(`Transcripts: ${files.length}`)
  console.log(`Langfuse: ${LANGFUSE_SECRET_KEY ? "enabled" : "disabled (no key)"}`)
  console.log(`═══════════════════════════\n`)

  const scores: Score[] = []

  for (const file of files) {
    const transcript: Transcript = JSON.parse(
      readFileSync(resolve(RESULTS_DIR, file), "utf-8")
    )
    const prompt = promptMap.get(transcript.promptId)
    if (!prompt) {
      console.warn(`  Skip ${transcript.promptId}: no matching prompt`)
      continue
    }

    console.log(`▶ Scoring ${transcript.promptId}...`)

    // Task completion (instant)
    const tc = scoreTaskCompletion(transcript, prompt.assertions)

    // Response quality (LLM call)
    const rq = await scoreResponseQuality(transcript, anthropic)

    const combined = Math.round(tc.score * 0.5 + rq.score * 0.5)

    const score: Score = {
      promptId: transcript.promptId,
      category: transcript.category,
      title: transcript.title,
      sessionId: transcript.sessionId,
      taskCompletion: tc.score,
      responseQuality: rq.score,
      combined,
      assertionDetails: tc.details,
      qualityDetails: rq.details,
      error: transcript.error,
    }
    scores.push(score)

    console.log(`  TC: ${tc.score} | RQ: ${rq.score} | Combined: ${combined}`)

    // Post to Langfuse
    await postLangfuseScore(transcript.sessionId, "task_completion", tc.score)
    await postLangfuseScore(transcript.sessionId, "response_quality", rq.score)
    await postLangfuseScore(transcript.sessionId, "combined", combined)

    // Small delay to avoid rate limiting the judge
    await new Promise((r) => setTimeout(r, 500))
  }

  // Save scores
  writeFileSync(SCORES_PATH, JSON.stringify(scores, null, 2))
  console.log(`\n═══ Complete ═══`)
  console.log(`Scored: ${scores.length}`)
  console.log(`Average combined: ${Math.round(scores.reduce((s, x) => s + x.combined, 0) / scores.length)}`)
  console.log(`Scores saved to: ${SCORES_PATH}`)
}

main().catch(console.error)
