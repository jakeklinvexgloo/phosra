import { randomUUID } from "crypto"
import { readFile, writeFile, mkdir } from "fs/promises"
import { dirname } from "path"
import { BaseResearchAdapter } from "../base-adapter"
import type {
  BrowserEnforcementAdapter,
  EnforcementContext,
  PolicyRule,
  RuleEnforcementResult,
  RuleVerificationResult,
  SelectorStrategy,
  PlaywrightPage,
  ResearchScreenshot,
} from "./types"
import { EnforcementError } from "./types"

/**
 * Abstract base class for platform enforcement adapters.
 * Extends BaseResearchAdapter with enforcement-specific helpers.
 */
export abstract class BaseEnforcementAdapter
  extends BaseResearchAdapter
  implements BrowserEnforcementAdapter
{
  abstract supportedRuleCategories(): string[]

  abstract login(ctx: EnforcementContext, page: PlaywrightPage): Promise<void>

  abstract getCurrentConfig(
    ctx: EnforcementContext,
    page: PlaywrightPage
  ): Promise<Record<string, unknown>>

  abstract enforceRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule
  ): Promise<RuleEnforcementResult>

  abstract verifyRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule
  ): Promise<RuleVerificationResult>

  abstract revokeRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule
  ): Promise<RuleEnforcementResult>

  // Stub the research-specific methods (not used in enforcement flow)
  async navigateToParentalControls() { /* no-op */ }
  async captureScreenshots() { return [] }
  async extractNotes() { return this.emptyNotes() }

  // ── Selector Helpers ──────────────────────────────────────────

  /**
   * Try a selector strategy: primary first, then fallbacks, then textMatch.
   * Returns the first matching element's selector or throws EnforcementError.
   */
  protected async trySelector(
    page: PlaywrightPage,
    strategy: SelectorStrategy,
    timeout = 5000,
  ): Promise<string> {
    // Try primary selector
    try {
      await page.waitForSelector(strategy.primary, { timeout, state: "visible" })
      return strategy.primary
    } catch {
      // Primary failed, try fallbacks
    }

    for (const fallback of strategy.fallbacks) {
      try {
        await page.waitForSelector(fallback, { timeout: 2000, state: "visible" })
        return fallback
      } catch {
        // Try next fallback
      }
    }

    // Try text match as last resort
    if (strategy.textMatch) {
      const textSelector = `text="${strategy.textMatch}"`
      try {
        await page.waitForSelector(textSelector, { timeout: 2000, state: "visible" })
        return textSelector
      } catch {
        // Text match also failed
      }
    }

    throw new EnforcementError(
      `No matching selector found for strategy: ${strategy.primary}`,
      "selector_not_found",
      true,
    )
  }

  // ── Idempotent Enforcement ────────────────────────────────────

  /**
   * Enforce a rule idempotently: check current value first, skip if already set.
   * Subclasses provide getCurrentValue and applyValue callbacks.
   */
  protected async enforceWithIdempotency(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
    getCurrentValue: () => Promise<string | undefined>,
    applyValue: () => Promise<void>,
    expectedValue: string,
  ): Promise<RuleEnforcementResult> {
    const currentValue = await getCurrentValue()

    if (currentValue === expectedValue) {
      const screenshot = await this.screenshotEnforcementStep(
        page, ctx, rule.category, "already_set"
      )
      return {
        ruleCategory: rule.category,
        status: "skipped",
        reason: `Already set to "${expectedValue}"`,
        previousValue: currentValue,
        newValue: expectedValue,
        screenshot,
      }
    }

    await applyValue()

    const screenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "applied"
    )

    return {
      ruleCategory: rule.category,
      status: "applied",
      previousValue: currentValue,
      newValue: expectedValue,
      screenshot,
    }
  }

  // ── Session Persistence ───────────────────────────────────────

  /**
   * Save browser session state (cookies, localStorage) for reuse.
   */
  protected async saveSessionState(
    page: PlaywrightPage,
    ctx: EnforcementContext,
  ): Promise<void> {
    if (!ctx.sessionCachePath) return

    try {
      const cookies = await page.evaluate<{ cookies: unknown; storage: unknown }>(
        `({
          cookies: document.cookie,
          storage: Object.fromEntries(
            Object.entries(localStorage)
          ),
        })`
      )
      await mkdir(dirname(ctx.sessionCachePath), { recursive: true })
      await writeFile(ctx.sessionCachePath, JSON.stringify(cookies, null, 2))
    } catch {
      // Non-fatal: session caching is best-effort
    }
  }

  /**
   * Load previously saved session state.
   * Returns true if session state was loaded.
   */
  protected async loadSessionState(
    page: PlaywrightPage,
    ctx: EnforcementContext,
  ): Promise<boolean> {
    if (!ctx.sessionCachePath) return false

    try {
      const raw = await readFile(ctx.sessionCachePath, "utf-8")
      const state = JSON.parse(raw) as { cookies: string; storage: Record<string, string> }

      // Restore cookies
      if (state.cookies) {
        await page.evaluate(`document.cookie = ${JSON.stringify(state.cookies)}`)
      }

      // Restore localStorage
      if (state.storage) {
        for (const [key, value] of Object.entries(state.storage)) {
          await page.evaluate(
            `localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(value)})`
          )
        }
      }

      return true
    } catch {
      return false
    }
  }

  // ── Screenshot Helpers ────────────────────────────────────────

  /**
   * Take a labeled screenshot for the enforcement audit trail.
   */
  protected async screenshotEnforcementStep(
    page: PlaywrightPage,
    ctx: EnforcementContext,
    ruleCategory: string,
    step: string,
  ): Promise<ResearchScreenshot> {
    const id = randomUUID()
    const label = `${ruleCategory}_${step}`
    const filename = `${ctx.platformId}_enforce_${label}_${Date.now()}.png`
    const path = `${ctx.screenshotDir}/${filename}`

    await page.screenshot({ path, fullPage: true })

    return {
      id,
      label,
      path: filename,
      url: page.url(),
      timestamp: new Date().toISOString(),
      width: 1280,
      height: 720,
    }
  }
}
