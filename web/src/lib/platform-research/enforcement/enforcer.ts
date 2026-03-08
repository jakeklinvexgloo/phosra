import { randomUUID } from "crypto"
import { mkdir } from "fs/promises"
import { join } from "path"
import type {
  EnforcementContext,
  EnforcementResult,
  PolicyRule,
  RuleEnforcementResult,
  ResearchScreenshot,
} from "./types"
import { EnforcementError, resolveRating } from "./types"
import { getEnforcementAdapter } from "./enforcement-registry"
import { loadCredentials, loadCredentialsFromFile } from "./credential-vault"

export interface EnforceOptions {
  platformId: string
  childName: string
  childAge: number
  rules?: PolicyRule[]
  headless?: boolean
  screenshotDir?: string
  sessionCachePath?: string
  masterPassword?: string
}

/**
 * High-level enforcement orchestrator.
 *
 * 1. Loads credentials from vault (falls back to local JSON file)
 * 2. Gets the enforcement adapter for the platform
 * 3. Launches Playwright (headless Chromium)
 * 4. login() -> getCurrentConfig() -> for each rule: enforceRule() -> verifyRule()
 * 5. Takes screenshots at each step for audit trail
 * 6. Returns EnforcementResult
 */
export async function enforce(options: EnforceOptions): Promise<EnforcementResult> {
  const {
    platformId,
    childName,
    childAge,
    headless = true,
    masterPassword,
  } = options

  const startedAt = new Date().toISOString()
  const startMs = Date.now()
  const runId = randomUUID()

  const screenshotDir = options.screenshotDir ?? join(
    process.cwd(), "enforcement-screenshots", platformId, runId
  )
  await mkdir(screenshotDir, { recursive: true })

  // 1. Load credentials
  const credentials =
    await loadCredentials(platformId, masterPassword) ??
    await loadCredentialsFromFile(platformId)

  if (!credentials) {
    throw new EnforcementError(
      `No credentials found for platform "${platformId}". Add them to the vault or platform-credentials.local.json.`,
      "invalid_creds",
      false,
    )
  }

  // 2. Get enforcement adapter
  const adapter = await getEnforcementAdapter(platformId)
  if (!adapter) {
    throw new Error(
      `No enforcement adapter registered for platform "${platformId}". ` +
      `Available: ${(await import("./enforcement-registry")).getEnforcementAdapterIds().join(", ")}`
    )
  }

  // 3. Determine rules
  const rules: PolicyRule[] = options.rules ?? generateDefaultRules(platformId, childAge, adapter)

  const ctx: EnforcementContext = {
    platformId,
    platformName: adapter.platformName,
    credentials,
    childName,
    childAge,
    screenshotDir,
    runId,
    sessionCachePath: options.sessionCachePath,
  }

  // 4. Launch Playwright
  // Dynamic import so this module doesn't hard-depend on playwright at parse time
  const { chromium } = await import("playwright")
  const browser = await chromium.launch({ headless })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  })
  const page = await context.newPage()

  const allScreenshots: ResearchScreenshot[] = []
  const ruleResults: RuleEnforcementResult[] = []

  try {
    // 5. Login
    await adapter.login(ctx, page)

    // 6. Get current config (informational)
    await adapter.getCurrentConfig(ctx, page)

    // 7. Enforce each rule
    for (const rule of rules) {
      const supported = adapter.supportedRuleCategories()
      if (!supported.includes(rule.category)) {
        ruleResults.push({
          ruleCategory: rule.category,
          status: "unsupported",
          reason: `Adapter does not support rule category "${rule.category}"`,
        })
        continue
      }

      try {
        const result = await adapter.enforceRule(ctx, page, rule)
        ruleResults.push(result)
        if (result.screenshot) allScreenshots.push(result.screenshot)

        // Verify if applied
        if (result.status === "applied") {
          const verification = await adapter.verifyRule(ctx, page, rule)
          if (!verification.verified) {
            result.status = "failed"
            result.reason = `Verification failed: expected "${verification.expectedValue}", got "${verification.currentValue}"`
          }
          if (verification.screenshot) allScreenshots.push(verification.screenshot)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        ruleResults.push({
          ruleCategory: rule.category,
          status: "failed",
          reason: message,
        })
      }
    }
  } finally {
    await browser.close()
  }

  const completedAt = new Date().toISOString()

  return {
    platformId,
    childName,
    childAge,
    applied: ruleResults.filter((r) => r.status === "applied").length,
    skipped: ruleResults.filter((r) => r.status === "skipped").length,
    failed: ruleResults.filter((r) => r.status === "failed" || r.status === "unsupported").length,
    rules: ruleResults,
    screenshots: allScreenshots,
    startedAt,
    completedAt,
    durationMs: Date.now() - startMs,
  }
}

/**
 * Generate age-appropriate default rules using the platform's supported categories.
 */
function generateDefaultRules(
  platformId: string,
  childAge: number,
  adapter: { supportedRuleCategories(): string[] },
): PolicyRule[] {
  const supported = adapter.supportedRuleCategories()
  const rules: PolicyRule[] = []

  if (supported.includes("content_rating")) {
    rules.push({
      category: "content_rating",
      config: { maxRating: resolveRating(platformId, childAge) },
    })
  }

  if (supported.includes("screen_time_limit") && childAge < 16) {
    rules.push({
      category: "screen_time_limit",
      config: { dailyLimitMinutes: childAge < 10 ? 60 : 120 },
    })
  }

  if (supported.includes("purchase_restriction")) {
    rules.push({
      category: "purchase_restriction",
      config: { requireApproval: true },
    })
  }

  if (supported.includes("search_restriction") && childAge < 13) {
    rules.push({
      category: "search_restriction",
      config: { safeSearch: true },
    })
  }

  if (supported.includes("dms_restriction") && childAge < 16) {
    rules.push({
      category: "dms_restriction",
      config: { disableDMs: childAge < 13, friendsOnly: childAge >= 13 },
    })
  }

  return rules
}
