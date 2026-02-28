/**
 * Test chat prompts script — sends 45 prompts across 10 categories to /api/research/chat
 * and saves all responses to chat-prompt-test-results.json.
 *
 * Usage: cd web && npx tsx scripts/test-chat-prompts.mts [--base-url https://www.phosra.com]
 */

import { writeFileSync } from "fs"

const DEFAULT_BASE_URL = "https://www.phosra.com"

interface PromptEntry {
  id: number
  category: string
  prompt: string
}

interface PromptResult {
  id: number
  prompt: string
  category: string
  response: string
  durationMs: number
  error?: string
}

interface TestResults {
  meta: {
    baseUrl: string
    totalPrompts: number
    successCount: number
    errorCount: number
    avgDurationMs: number
    totalDurationMs: number
    timestamp: string
  }
  results: PromptResult[]
}

const PROMPTS: PromptEntry[] = [
  // Single Platform Deep Dives (8)
  { id: 1, category: "Single Platform Deep Dives", prompt: "How safe is ChatGPT for a 12-year-old?" },
  { id: 2, category: "Single Platform Deep Dives", prompt: "Tell me everything about Grok's safety record" },
  { id: 3, category: "Single Platform Deep Dives", prompt: "What safety features does Claude have?" },
  { id: 4, category: "Single Platform Deep Dives", prompt: "Is Character.AI safe for my teenager?" },
  { id: 5, category: "Single Platform Deep Dives", prompt: "What are the privacy concerns with Replika?" },
  { id: 6, category: "Single Platform Deep Dives", prompt: "Break down Copilot's safety testing results" },
  { id: 7, category: "Single Platform Deep Dives", prompt: "How does Perplexity handle harmful content?" },
  { id: 8, category: "Single Platform Deep Dives", prompt: "What parental controls does Gemini offer?" },

  // Platform Comparisons (5)
  { id: 9, category: "Platform Comparisons", prompt: "Compare Claude vs ChatGPT safety scores" },
  { id: 10, category: "Platform Comparisons", prompt: "How does Grok compare to Replika in safety?" },
  { id: 11, category: "Platform Comparisons", prompt: "Which is safer for kids: ChatGPT, Gemini, or Character.AI?" },
  { id: 12, category: "Platform Comparisons", prompt: "Compare parental controls across ChatGPT and Claude" },
  { id: 13, category: "Platform Comparisons", prompt: "Copilot vs Perplexity — which should I let my teen use?" },

  // Dimension-Specific (5)
  { id: 14, category: "Dimension-Specific", prompt: "Which platforms have the best parental controls?" },
  { id: 15, category: "Dimension-Specific", prompt: "How do all platforms handle age verification?" },
  { id: 16, category: "Dimension-Specific", prompt: "Compare emotional safety across all AI chatbots" },
  { id: 17, category: "Dimension-Specific", prompt: "Which platforms offer academic integrity features like study mode?" },
  { id: 18, category: "Dimension-Specific", prompt: "How do AI chatbots handle conversation time limits and quiet hours?" },

  // Age-Specific (3)
  { id: 19, category: "Age-Specific", prompt: "What's the safest AI chatbot for a 10-year-old?" },
  { id: 20, category: "Age-Specific", prompt: "My daughter is 15. Which AI tools can she safely use for homework?" },
  { id: 21, category: "Age-Specific", prompt: "Are any of these platforms appropriate for an 8-year-old?" },

  // Risk/Concern Focused (4)
  { id: 22, category: "Risk/Concern Focused", prompt: "Which platforms have emotional manipulation issues?" },
  { id: 23, category: "Risk/Concern Focused", prompt: "What are the biggest self-harm risks across AI chatbots?" },
  { id: 24, category: "Risk/Concern Focused", prompt: "How vulnerable are these platforms to jailbreaking?" },
  { id: 25, category: "Risk/Concern Focused", prompt: "Which platforms fail at blocking sexual content for minors?" },

  // Recommendation/Action (3)
  { id: 26, category: "Recommendation/Action", prompt: "How does Phosra help with ChatGPT safety gaps?" },
  { id: 27, category: "Recommendation/Action", prompt: "What should I set up before letting my kid use an AI chatbot?" },
  { id: 28, category: "Recommendation/Action", prompt: "What can Phosra add that these platforms are missing?" },

  // Data/Stats Focused (4)
  { id: 29, category: "Data/Stats Focused", prompt: "What are the safety scores for all platforms?" },
  { id: 30, category: "Data/Stats Focused", prompt: "Give me the test result distribution for ChatGPT" },
  { id: 31, category: "Data/Stats Focused", prompt: "How many safety tests were run on each platform?" },
  { id: 32, category: "Data/Stats Focused", prompt: "What percentage of tests does each platform fully block?" },

  // Critical Failures (4)
  { id: 33, category: "Critical Failures", prompt: "What are the most dangerous test results you found?" },
  { id: 34, category: "Critical Failures", prompt: "Which platform gave the worst response to self-harm questions?" },
  { id: 35, category: "Critical Failures", prompt: "Has any platform enthusiastically provided harmful content?" },
  { id: 36, category: "Critical Failures", prompt: "What are the grade caps and why were they applied?" },

  // General Overview (4)
  { id: 37, category: "General Overview", prompt: "Give me a summary of all platforms" },
  { id: 38, category: "General Overview", prompt: "What's the overall state of AI chatbot safety for kids?" },
  { id: 39, category: "General Overview", prompt: "What are the most common safety gaps across all platforms?" },
  { id: 40, category: "General Overview", prompt: "Rank all platforms from safest to least safe" },

  // Feature-Specific (5)
  { id: 41, category: "Feature-Specific", prompt: "Which platforms offer quiet hours for kids?" },
  { id: 42, category: "Feature-Specific", prompt: "Do any platforms let parents see what their kids are asking?" },
  { id: 43, category: "Feature-Specific", prompt: "Which platforms train AI models on kids' conversations?" },
  { id: 44, category: "Feature-Specific", prompt: "What break reminders or screen time features exist?" },
  { id: 45, category: "Feature-Specific", prompt: "How easy is it for kids to bypass age verification on each platform?" },
]

async function sendPrompt(baseUrl: string, prompt: string): Promise<string> {
  // UIMessage format expected by the Vercel AI SDK
  const uiMessage = {
    id: crypto.randomUUID(),
    role: "user",
    parts: [{ type: "text", text: prompt }],
    createdAt: new Date().toISOString(),
  }

  const res = await fetch(`${baseUrl}/api/research/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [uiMessage],
    }),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  const text = await res.text()

  // Parse SSE data stream format: "data: {json}\n\n"
  // Text deltas have type "text-delta" with a "delta" field
  const chunks: string[] = []
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue
    try {
      const payload = JSON.parse(line.slice(6))
      if (payload.type === "text-delta" && typeof payload.delta === "string") {
        chunks.push(payload.delta)
      }
    } catch {
      // skip unparseable lines
    }
  }

  return chunks.join("")
}

async function main() {
  const args = process.argv.slice(2)
  const baseUrlIdx = args.indexOf("--base-url")
  const baseUrl = baseUrlIdx >= 0 && args[baseUrlIdx + 1]
    ? args[baseUrlIdx + 1]
    : DEFAULT_BASE_URL

  console.log(`\nTesting ${PROMPTS.length} prompts against ${baseUrl}/api/research/chat\n`)

  const results: PromptResult[] = []
  const startTime = Date.now()

  for (const entry of PROMPTS) {
    const { id, category, prompt } = entry
    process.stdout.write(`[${id}/${PROMPTS.length}] ${category}: "${prompt.slice(0, 50)}..." `)

    const t0 = Date.now()
    try {
      const response = await sendPrompt(baseUrl, prompt)
      const durationMs = Date.now() - t0
      results.push({ id, prompt, category, response, durationMs })
      console.log(`OK (${durationMs}ms, ${response.length} chars)`)
    } catch (err) {
      const durationMs = Date.now() - t0
      const errorMsg = err instanceof Error ? err.message : String(err)
      results.push({ id, prompt, category, response: "", durationMs, error: errorMsg })
      console.log(`ERROR (${durationMs}ms): ${errorMsg}`)
    }

    // 1s delay between requests
    if (id < PROMPTS.length) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  const totalDurationMs = Date.now() - startTime
  const successCount = results.filter((r) => !r.error).length
  const errorCount = results.filter((r) => r.error).length
  const avgDurationMs = Math.round(
    results.reduce((sum, r) => sum + r.durationMs, 0) / results.length
  )

  const output: TestResults = {
    meta: {
      baseUrl,
      totalPrompts: PROMPTS.length,
      successCount,
      errorCount,
      avgDurationMs,
      totalDurationMs,
      timestamp: new Date().toISOString(),
    },
    results,
  }

  const outputFile = "chat-prompt-test-results.json"
  writeFileSync(outputFile, JSON.stringify(output, null, 2))

  console.log(`\n--- Summary ---`)
  console.log(`Total: ${PROMPTS.length} | Success: ${successCount} | Errors: ${errorCount}`)
  console.log(`Avg duration: ${avgDurationMs}ms | Total: ${(totalDurationMs / 1000).toFixed(1)}s`)
  console.log(`Results saved to: ${outputFile}\n`)
}

main().catch(console.error)
