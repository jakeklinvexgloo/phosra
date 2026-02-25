import { randomUUID } from "crypto"
import { mkdirSync, existsSync } from "fs"
import { resolve } from "path"
import type { ResearchResult, ResearchContext, ResearchStatus } from "./types"
import { getCredentials } from "./credentials-loader"
import { getAdapter } from "./adapter-registry"

const SCREENSHOTS_DIR = resolve(process.cwd(), "research-screenshots")

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
