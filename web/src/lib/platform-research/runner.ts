import { randomUUID } from "crypto"
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs"
import { resolve, join } from "path"
import type { ResearchResult, ResearchContext, ResearchStatus, ResearchScreenshot, ResearchNotes } from "./types"
import type {
  ScreenshotAnalysisData,
  ScreenshotAnalysis,
  CategoryAnalysisSummary,
} from "./research-data-types"
import { getCredentials } from "./credentials-loader"
import { getAdapter } from "./adapter-registry"

const SCREENSHOTS_DIR = resolve(process.cwd(), "research-screenshots")

/** Directory where static research data lives (alongside section_data.json) */
const RESEARCH_PROVIDERS_DIR = resolve(
  process.cwd(),
  "../research/providers/tier1_adapter_exists",
)

export interface RunnerOptions {
  /** Override screenshot storage directory */
  screenshotDir?: string
  /** Timeout per platform in ms (default: 5 min) */
  timeoutMs?: number
  /** Callback for status updates */
  onStatusChange?: (platformId: string, status: ResearchStatus, message?: string) => void
}

/**
 * Run research for a single platform.
 * Launches Playwright, loads credentials, runs the adapter, and collects results.
 */
export async function researchPlatform(
  platformId: string,
  platformName: string,
  triggerType: "manual" | "scheduled" | "bulk" = "manual",
  options: RunnerOptions = {},
): Promise<ResearchResult> {
  const runId = randomUUID()
  const startedAt = new Date().toISOString()
  const screenshotDir = options.screenshotDir ?? resolve(SCREENSHOTS_DIR, platformId, runId)

  // Ensure screenshot directory exists
  if (!existsSync(screenshotDir)) {
    mkdirSync(screenshotDir, { recursive: true })
  }

  const result: ResearchResult = {
    id: runId,
    platformId,
    platformName,
    status: "running",
    triggerType,
    screenshots: [],
    notes: null,
    startedAt,
  }

  options.onStatusChange?.(platformId, "running", "Starting research")

  try {
    // Load credentials
    const credentials = await getCredentials(platformId)
    if (!credentials) {
      result.status = "skipped"
      result.errorMessage = `No credentials configured for platform "${platformId}"`
      result.completedAt = new Date().toISOString()
      options.onStatusChange?.(platformId, "skipped", result.errorMessage)
      return result
    }

    // Load adapter
    const adapter = await getAdapter(platformId)
    if (!adapter) {
      result.status = "skipped"
      result.errorMessage = `No research adapter available for platform "${platformId}"`
      result.completedAt = new Date().toISOString()
      options.onStatusChange?.(platformId, "skipped", result.errorMessage)
      return result
    }

    // Dynamic import of Playwright (only available when running as a script)
    const { chromium } = await import("playwright")

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    })

    const page = await context.newPage()

    const researchCtx: ResearchContext = {
      platformId,
      platformName,
      credentials,
      screenshotDir,
      runId,
    }

    try {
      // Step 1: Login
      options.onStatusChange?.(platformId, "running", "Logging in")
      await adapter.login(researchCtx, page)

      // Step 2: Navigate to parental controls
      options.onStatusChange?.(platformId, "running", "Navigating to parental controls")
      await adapter.navigateToParentalControls(researchCtx, page)

      // Step 3: Capture screenshots
      options.onStatusChange?.(platformId, "running", "Capturing screenshots")
      result.screenshots = await adapter.captureScreenshots(researchCtx, page)

      // Step 4: Extract notes
      options.onStatusChange?.(platformId, "running", "Extracting notes")
      result.notes = await adapter.extractNotes(researchCtx, page)

      // Step 5: AI Screenshot Analysis (non-fatal)
      try {
        options.onStatusChange?.(platformId, "running", "Analyzing screenshots with AI")
        const analysisData = await analyzeScreenshots(
          platformId,
          result.screenshots,
          screenshotDir,
          result.notes,
        )
        // Save to the platform's static research directory (alongside section_data.json)
        const staticDir = join(RESEARCH_PROVIDERS_DIR, platformId)
        if (existsSync(staticDir)) {
          const analysisPath = join(staticDir, "screenshot_analysis.json")
          writeFileSync(analysisPath, JSON.stringify(analysisData, null, 2))
          options.onStatusChange?.(
            platformId,
            "running",
            `Screenshot analysis saved (${Object.keys(analysisData.screenshots).length} screenshots analyzed)`,
          )
        } else {
          console.warn(
            `Static research directory not found for ${platformId}: ${staticDir}. ` +
            `Screenshot analysis was generated but not saved to disk.`,
          )
        }
      } catch (err) {
        console.error("Screenshot analysis failed (non-fatal):", err)
        options.onStatusChange?.(
          platformId,
          "running",
          `Screenshot analysis failed: ${err instanceof Error ? err.message : String(err)}`,
        )
      }

      result.status = "completed"
      options.onStatusChange?.(platformId, "completed", `Found ${result.screenshots.length} screenshots`)
    } finally {
      await browser.close()
    }
  } catch (error) {
    result.status = "failed"
    result.errorMessage = error instanceof Error ? error.message : String(error)
    options.onStatusChange?.(platformId, "failed", result.errorMessage)
  }

  result.completedAt = new Date().toISOString()
  result.durationMs = new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()

  return result
}

/**
 * Run research for multiple platforms sequentially.
 * Includes delays between platforms to avoid rate limits.
 */
export async function researchPlatforms(
  platforms: Array<{ id: string; name: string }>,
  triggerType: "manual" | "scheduled" | "bulk" = "bulk",
  options: RunnerOptions & { delayBetweenMs?: number } = {},
): Promise<ResearchResult[]> {
  const results: ResearchResult[] = []
  const delay = options.delayBetweenMs ?? 10000 // 10s between platforms

  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i]
    const result = await researchPlatform(platform.id, platform.name, triggerType, options)
    results.push(result)

    // Delay between platforms (skip after last one)
    if (i < platforms.length - 1 && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return results
}

// ── Screenshot Analysis via Claude Vision ─────────────────────────

/** Delay helper to avoid rate-limiting between Claude API calls */
function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}

/**
 * Infer a screenshot category from its label for grouping purposes.
 * Falls back to the label itself if no known pattern matches.
 */
function inferCategory(label: string): string {
  const lower = label.toLowerCase()
  if (lower.includes("login")) return "login-flow"
  if (lower.includes("profile") && lower.includes("maturity")) return "parental-controls"
  if (lower.includes("parental") || lower.includes("maturity")) return "parental-controls"
  if (lower.includes("pin") || lower.includes("lock")) return "pin-profile-lock"
  if (lower.includes("viewing") || lower.includes("activity")) return "viewing-activity"
  if (lower.includes("title") && lower.includes("restrict")) return "maturity-restrictions"
  if (lower.includes("profile")) return "profile-management"
  if (lower.includes("privacy") || lower.includes("playback")) return "privacy-playback"
  if (lower.includes("kids")) return "kids-profile-ui"
  if (lower.includes("account")) return "account-overview"
  if (lower.includes("mfa") || lower.includes("verification")) return "mfa-verification"
  return label.replace(/\s+/g, "-").toLowerCase()
}

/**
 * Build the system prompt for analyzing a single screenshot.
 */
function buildScreenshotPrompt(
  platformId: string,
  filename: string,
  category: string,
  capabilities: unknown[],
): string {
  return `You are analyzing a screenshot from a streaming platform's parental controls interface for Phosra, a unified parental controls platform. Analyze this screenshot and provide structured JSON output.

Platform: ${platformId}
Screenshot filename: ${filename}
Screenshot category: ${category}
Platform capabilities discovered so far: ${JSON.stringify(capabilities)}

Respond with a JSON object matching this exact schema:
{
  "description": "Plain-language description of what this screenshot shows",
  "phosraRelevance": "How this relates to Phosra's automation goals",
  "relatedRuleCategories": ["content_rating_filter", ...],
  "automation": {
    "feasibility": "fully_automatable" | "partially_automatable" | "read_only" | "not_automatable",
    "method": "e.g., Playwright, REST API, GraphQL",
    "notes": "Details on automation approach",
    "technicalDetails": "Any visible selectors, URLs, API patterns"
  },
  "findings": [
    { "label": "Short label", "detail": "Detailed finding", "severity": "critical" | "important" | "informational", "ruleCategory": "optional_category" }
  ],
  "ux": {
    "rating": "excellent" | "good" | "fair" | "poor",
    "notes": "Parent-friendliness assessment"
  },
  "securityNotes": ["Security observation 1", ...],
  "apiIndicators": ["Visible API clue 1", ...],
  "comparisonNotes": "How this compares to other streaming platforms",
  "gapsIdentified": ["Missing feature 1", ...],
  "relevance": "high" | "medium" | "low" | "none"
}

Focus on:
- What a parent would need from this screen
- Whether Phosra can automate interactions with this screen
- Security gaps that could let a child bypass controls
- Visible technical indicators (URLs, form fields, API patterns)
- What's missing that parents would expect

Only output valid JSON, no markdown formatting.`
}

/**
 * Build the prompt for generating category summaries from individual analyses.
 */
function buildCategorySummaryPrompt(
  platformId: string,
  groupedAnalyses: Record<string, ScreenshotAnalysis[]>,
): string {
  const categorySections = Object.entries(groupedAnalyses)
    .map(([categoryId, analyses]) => {
      const summaryParts = analyses.map(
        (a) =>
          `  - ${a.filename}: ${a.description} (relevance: ${a.relevance}, automation: ${a.automation.feasibility})`,
      )
      return `Category: ${categoryId}\n${summaryParts.join("\n")}`
    })
    .join("\n\n")

  return `You are summarizing screenshot analysis results for Phosra, a unified parental controls platform.

Platform: ${platformId}

Below are the individual screenshot analyses grouped by category:

${categorySections}

For each category, provide a JSON array of category summary objects matching this exact schema:
[
  {
    "categoryId": "the-category-id",
    "summary": "2-3 sentence summary of what this category reveals about the platform's parental controls",
    "automationFeasibility": "fully_automatable" | "partially_automatable" | "read_only" | "not_automatable",
    "keyTakeaways": ["takeaway 1", "takeaway 2"],
    "relatedAdapterMethods": ["login", "setMaturityRating", etc.],
    "comparisonSummary": "Optional: how this category compares to other platforms"
  }
]

Only output valid JSON, no markdown formatting.`
}

/**
 * Analyze a single screenshot using Claude's vision API.
 * Returns the structured ScreenshotAnalysis or null if the file is missing / analysis fails.
 */
async function analyzeSingleScreenshot(
  anthropic: InstanceType<typeof import("@anthropic-ai/sdk").default>,
  platformId: string,
  screenshot: ResearchScreenshot,
  screenshotDir: string,
  capabilities: unknown[],
): Promise<ScreenshotAnalysis | null> {
  const filePath = join(screenshotDir, screenshot.path)

  if (!existsSync(filePath)) {
    console.warn(`Screenshot file not found, skipping: ${filePath}`)
    return null
  }

  const imageBuffer = readFileSync(filePath)
  const base64Image = imageBuffer.toString("base64")

  // Determine media type from file extension
  const ext = screenshot.path.toLowerCase().split(".").pop()
  const mediaType =
    ext === "png"
      ? "image/png"
      : ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "webp"
          ? "image/webp"
          : "image/png"

  const category = inferCategory(screenshot.label)
  const prompt = buildScreenshotPrompt(platformId, screenshot.path, category, capabilities)

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  })

  // Extract text content from the response
  const textBlock = response.content.find((block) => block.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    console.warn(`No text response for screenshot: ${screenshot.path}`)
    return null
  }

  try {
    // Strip any markdown code fences if present
    let jsonText = textBlock.text.trim()
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")
    }

    const parsed = JSON.parse(jsonText) as Omit<ScreenshotAnalysis, "filename" | "analyst" | "analyzedAt">
    return {
      ...parsed,
      filename: screenshot.path,
      analyst: "claude-haiku-4-5-20251001",
      analyzedAt: new Date().toISOString(),
    }
  } catch (parseErr) {
    console.warn(`Failed to parse analysis JSON for ${screenshot.path}:`, parseErr)
    return null
  }
}

/**
 * Generate category summaries from grouped individual analyses.
 */
async function generateCategorySummaries(
  anthropic: InstanceType<typeof import("@anthropic-ai/sdk").default>,
  platformId: string,
  groupedAnalyses: Record<string, ScreenshotAnalysis[]>,
): Promise<CategoryAnalysisSummary[]> {
  const prompt = buildCategorySummaryPrompt(platformId, groupedAnalyses)

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    console.warn("No text response for category summaries")
    return []
  }

  try {
    let jsonText = textBlock.text.trim()
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")
    }
    return JSON.parse(jsonText) as CategoryAnalysisSummary[]
  } catch (parseErr) {
    console.warn("Failed to parse category summaries JSON:", parseErr)
    return []
  }
}

/**
 * Analyze all screenshots from a research run using Claude's vision API.
 *
 * Sends each screenshot to Claude Haiku 4.5 for structured analysis,
 * groups results by category, generates category summaries, and returns
 * the full ScreenshotAnalysisData object.
 *
 * Uses a 1-second delay between API calls to avoid rate-limiting.
 */
export async function analyzeScreenshots(
  platformId: string,
  screenshots: ResearchScreenshot[],
  screenshotDir: string,
  notes: ResearchNotes,
): Promise<ScreenshotAnalysisData> {
  if (screenshots.length === 0) {
    return {
      platformId,
      lastUpdated: new Date().toISOString(),
      categorySummaries: [],
      screenshots: {},
    }
  }

  // Dynamic import of the Anthropic SDK
  const AnthropicModule = await import("@anthropic-ai/sdk")
  const Anthropic = AnthropicModule.default
  const apiKey = process.env.PLAYGROUND_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY or PLAYGROUND_ANTHROPIC_KEY — cannot run screenshot analysis",
    )
  }

  const anthropic = new Anthropic({ apiKey })

  // Analyze each screenshot individually
  const analysisMap: Record<string, ScreenshotAnalysis> = {}
  const capabilities = notes.capabilities ?? []

  for (let i = 0; i < screenshots.length; i++) {
    const ss = screenshots[i]

    const analysis = await analyzeSingleScreenshot(
      anthropic,
      platformId,
      ss,
      screenshotDir,
      capabilities,
    )

    if (analysis) {
      analysisMap[ss.path] = analysis
    }

    // 1-second delay between API calls to avoid rate limiting (skip after last)
    if (i < screenshots.length - 1) {
      await delay(1000)
    }
  }

  // Group analyses by category for summary generation
  const grouped: Record<string, ScreenshotAnalysis[]> = {}
  for (const analysis of Object.values(analysisMap)) {
    const category = inferCategory(
      screenshots.find((s) => s.path === analysis.filename)?.label ?? analysis.filename,
    )
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(analysis)
  }

  // Generate category summaries if we have any analyses
  let categorySummaries: CategoryAnalysisSummary[] = []
  if (Object.keys(grouped).length > 0) {
    await delay(1000) // Delay before summary call
    categorySummaries = await generateCategorySummaries(anthropic, platformId, grouped)
  }

  return {
    platformId,
    lastUpdated: new Date().toISOString(),
    categorySummaries,
    screenshots: analysisMap,
  }
}
