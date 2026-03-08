import { randomUUID } from "crypto"
import path from "path"
import type {
  BrowserEnforcementAdapter,
  EnforcementContext,
  PolicyRule,
  RuleEnforcementResult,
  RuleVerificationResult,
  PlaywrightPage,
  ResearchScreenshot,
  SelectorStrategy,
} from "../types"
import { EnforcementError, resolveRating } from "../types"

// ── Selector strategies ──────────────────────────────────────────

const SELECTORS = {
  // Google login
  emailInput: {
    primary: 'input[type="email"]',
    fallbacks: ["#identifierId"],
  } satisfies SelectorStrategy,

  emailNext: {
    primary: "#identifierNext button",
    fallbacks: ["#identifierNext", 'button:has-text("Next")'],
  } satisfies SelectorStrategy,

  passwordInput: {
    primary: 'input[type="password"]',
    fallbacks: ['input[name="Passwd"]'],
  } satisfies SelectorStrategy,

  passwordNext: {
    primary: "#passwordNext button",
    fallbacks: ["#passwordNext", 'button:has-text("Next")'],
  } satisfies SelectorStrategy,

  totpInput: {
    primary: 'input[name="totpPin"]',
    fallbacks: ["#totpPin", 'input[type="tel"]'],
  } satisfies SelectorStrategy,

  totpNext: {
    primary: "#totpNext button",
    fallbacks: ["#totpNext"],
  } satisfies SelectorStrategy,

  // YouTube profile / avatar menu
  avatarButton: {
    primary: "#avatar-btn",
    fallbacks: [
      'button[aria-label="Account"]',
      "button#button.ytd-topbar-menu-button-renderer",
      "img.ytd-topbar-menu-button-renderer",
    ],
  } satisfies SelectorStrategy,

  // Restricted Mode menu item
  restrictedModeMenuItem: {
    primary: 'tp-yt-paper-item:has-text("Restricted Mode")',
    fallbacks: [
      'ytd-toggle-theme-compact-link-renderer:has-text("Restricted Mode")',
      'a[href*="restricted"]',
      "ytd-toggle-theme-compact-link-renderer:last-child",
    ],
    textMatch: "Restricted Mode",
  } satisfies SelectorStrategy,

  // Restricted Mode toggle
  restrictedModeToggle: {
    primary: "#restricted-mode-toggle #toggle",
    fallbacks: [
      "#restricted-mode-toggle paper-toggle-button",
      'paper-toggle-button[aria-label*="Restricted"]',
      "#restricted tp-yt-paper-toggle-button",
    ],
  } satisfies SelectorStrategy,

  // Autoplay toggle on settings page
  autoplayToggle: {
    primary: '#toggle[aria-label*="Autoplay"]',
    fallbacks: [
      'paper-toggle-button[aria-label*="Autoplay"]',
      "#autoplay #toggle",
      'tp-yt-paper-toggle-button[aria-label*="Autoplay"]',
    ],
  } satisfies SelectorStrategy,
} as const

/**
 * YouTube enforcement adapter.
 *
 * Supports two rule categories:
 * - content_rating: Toggle YouTube Restricted Mode
 * - autoplay_disable: Disable autoplay for videos
 */
export class YouTubeEnforcementAdapter implements BrowserEnforcementAdapter {
  platformId = "youtube"
  platformName = "YouTube"

  supportedRuleCategories(): string[] {
    return ["content_rating", "autoplay_disable"]
  }

  // ── Login ────────────────────────────────────────────────────────

  async login(ctx: EnforcementContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://accounts.google.com/signin"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30_000 })
    await page.waitForTimeout(3000)

    // Step 1: Email
    const emailFilled = await this.tryFillWithStrategy(page, SELECTORS.emailInput, ctx.credentials.username ?? "")
    if (!emailFilled) {
      throw new EnforcementError("Could not locate email input on Google sign-in", "selector_not_found", false)
    }

    const emailNextClicked = await this.tryClickWithStrategy(page, SELECTORS.emailNext)
    if (!emailNextClicked) {
      throw new EnforcementError("Could not click Next after email", "selector_not_found", false)
    }

    await page.waitForTimeout(3000)

    // Step 2: Password
    const passwordFilled = await this.tryFillWithStrategy(page, SELECTORS.passwordInput, ctx.credentials.password ?? "")
    if (!passwordFilled) {
      throw new EnforcementError("Could not locate password input on Google sign-in", "selector_not_found", false)
    }

    const passwordNextClicked = await this.tryClickWithStrategy(page, SELECTORS.passwordNext)
    if (!passwordNextClicked) {
      throw new EnforcementError("Could not click Next after password", "selector_not_found", false)
    }

    await page.waitForTimeout(5000)

    // Step 3: Handle 2FA if TOTP secret is provided
    if (ctx.credentials.totpSecret) {
      const totpCode = ctx.credentials.extra?.totpCode
      if (totpCode) {
        const totpFilled = await this.tryFillWithStrategy(page, SELECTORS.totpInput, totpCode)
        if (totpFilled) {
          await this.tryClickWithStrategy(page, SELECTORS.totpNext)
          await page.waitForTimeout(3000)
        }
      }
    }

    // Navigate to YouTube to confirm auth
    await page.goto("https://www.youtube.com", { waitUntil: "networkidle", timeout: 30_000 })
    await page.waitForTimeout(3000)

    // Verify we're logged in by checking for avatar button
    const loggedIn = await this.elementExists(page, SELECTORS.avatarButton)
    if (!loggedIn) {
      throw new EnforcementError(
        "Login completed but avatar button not found -- may not be authenticated",
        "invalid_creds",
        true,
      )
    }
  }

  // ── Get Current Config ──────────────────────────────────────────

  async getCurrentConfig(ctx: EnforcementContext, page: PlaywrightPage): Promise<Record<string, unknown>> {
    const config: Record<string, unknown> = {
      restrictedMode: false,
      autoplay: true,
    }

    // Check Restricted Mode
    try {
      const rmState = await this.getRestrictedModeState(page)
      config.restrictedMode = rmState
    } catch {
      // Could not determine state
    }

    return config
  }

  // ── Enforce Rule ────────────────────────────────────────────────

  async enforceRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    switch (rule.category) {
      case "content_rating":
        return this.enforceContentRating(ctx, page, rule)
      case "autoplay_disable":
        return this.enforceAutoplay(ctx, page, rule)
      default:
        return {
          ruleCategory: rule.category,
          status: "unsupported",
          reason: `Rule category "${rule.category}" is not supported by YouTube adapter`,
        }
    }
  }

  // ── Verify Rule ─────────────────────────────────────────────────

  async verifyRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    switch (rule.category) {
      case "content_rating":
        return this.verifyContentRating(ctx, page, rule)
      case "autoplay_disable":
        return this.verifyAutoplay(ctx, page, rule)
      default:
        return {
          ruleCategory: rule.category,
          verified: false,
          currentValue: "unknown",
          expectedValue: "unknown",
        }
    }
  }

  // ── Revoke Rule ─────────────────────────────────────────────────

  async revokeRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    switch (rule.category) {
      case "content_rating":
        // Revoke = disable Restricted Mode
        return this.enforceContentRating(ctx, page, {
          ...rule,
          config: { enabled: false },
        })
      case "autoplay_disable":
        // Revoke = re-enable autoplay
        return this.enforceAutoplay(ctx, page, {
          ...rule,
          config: { enabled: false },
        })
      default:
        return {
          ruleCategory: rule.category,
          status: "unsupported",
          reason: `Rule category "${rule.category}" is not supported by YouTube adapter`,
        }
    }
  }

  // ── Content Rating (Restricted Mode) ────────────────────────────

  private async enforceContentRating(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    // Determine desired state
    let wantRestricted = true
    if (rule.config.enabled === false) {
      wantRestricted = false
    } else if (rule.config.mode) {
      wantRestricted = rule.config.mode === "restricted"
    } else {
      // Use age-based rating
      const rating = resolveRating("youtube", ctx.childAge)
      wantRestricted = rating === "restricted"
    }

    // Take before screenshot
    const beforeShot = await this.takeScreenshot(page, ctx.screenshotDir, "restricted-mode-before")

    try {
      // Navigate to the restricted mode toggle
      await this.openRestrictedModePanel(page)

      // Check current state
      const currentState = await this.isRestrictedModeEnabled(page)
      const previousValue = currentState ? "on" : "off"

      if (currentState === wantRestricted) {
        return {
          ruleCategory: rule.category,
          status: "skipped",
          reason: `Restricted Mode is already ${wantRestricted ? "on" : "off"}`,
          previousValue,
          newValue: previousValue,
          screenshot: beforeShot,
        }
      }

      // Click the toggle
      const toggled = await this.tryClickWithStrategy(page, SELECTORS.restrictedModeToggle)
      if (!toggled) {
        throw new EnforcementError(
          "Could not find Restricted Mode toggle",
          "selector_not_found",
          true,
        )
      }

      await page.waitForTimeout(2000)

      // Take after screenshot
      const afterShot = await this.takeScreenshot(page, ctx.screenshotDir, "restricted-mode-after")

      return {
        ruleCategory: rule.category,
        status: "applied",
        previousValue,
        newValue: wantRestricted ? "on" : "off",
        screenshot: afterShot,
      }
    } catch (err) {
      if (err instanceof EnforcementError) throw err
      const screenshot = await this.takeScreenshot(page, ctx.screenshotDir, "restricted-mode-error")
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: err instanceof Error ? err.message : String(err),
        screenshot,
      }
    }
  }

  private async verifyContentRating(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    let wantRestricted = true
    if (rule.config.enabled === false) {
      wantRestricted = false
    } else if (rule.config.mode) {
      wantRestricted = rule.config.mode === "restricted"
    } else {
      const rating = resolveRating("youtube", ctx.childAge)
      wantRestricted = rating === "restricted"
    }

    try {
      await this.openRestrictedModePanel(page)
      const currentState = await this.isRestrictedModeEnabled(page)

      const screenshot = await this.takeScreenshot(page, ctx.screenshotDir, "restricted-mode-verify")

      return {
        ruleCategory: rule.category,
        verified: currentState === wantRestricted,
        currentValue: currentState ? "on" : "off",
        expectedValue: wantRestricted ? "on" : "off",
        screenshot,
      }
    } catch {
      return {
        ruleCategory: rule.category,
        verified: false,
        currentValue: "unknown",
        expectedValue: wantRestricted ? "on" : "off",
      }
    }
  }

  // ── Autoplay ────────────────────────────────────────────────────

  private async enforceAutoplay(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    // enabled: true means "disable autoplay" (the rule is autoplay_disable)
    const wantAutoplayOff = rule.config.enabled !== false

    try {
      // Go to YouTube settings for playback
      await page.goto("https://www.youtube.com/account_playback", {
        waitUntil: "networkidle",
        timeout: 30_000,
      })
      await page.waitForTimeout(2000)

      const beforeShot = await this.takeScreenshot(page, ctx.screenshotDir, "autoplay-before")

      // Check current autoplay state via the toggle
      const autoplayOn = await this.isAutoplayEnabled(page)
      const previousValue = autoplayOn ? "on" : "off"

      if ((wantAutoplayOff && !autoplayOn) || (!wantAutoplayOff && autoplayOn)) {
        return {
          ruleCategory: rule.category,
          status: "skipped",
          reason: `Autoplay is already ${autoplayOn ? "on" : "off"}`,
          previousValue,
          newValue: previousValue,
          screenshot: beforeShot,
        }
      }

      // Toggle autoplay
      const toggled = await this.tryClickWithStrategy(page, SELECTORS.autoplayToggle)
      if (!toggled) {
        throw new EnforcementError("Could not find autoplay toggle", "selector_not_found", true)
      }

      await page.waitForTimeout(2000)

      const afterShot = await this.takeScreenshot(page, ctx.screenshotDir, "autoplay-after")

      return {
        ruleCategory: rule.category,
        status: "applied",
        previousValue,
        newValue: wantAutoplayOff ? "off" : "on",
        screenshot: afterShot,
      }
    } catch (err) {
      if (err instanceof EnforcementError) throw err
      const screenshot = await this.takeScreenshot(page, ctx.screenshotDir, "autoplay-error")
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: err instanceof Error ? err.message : String(err),
        screenshot,
      }
    }
  }

  private async verifyAutoplay(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    const wantAutoplayOff = rule.config.enabled !== false

    try {
      await page.goto("https://www.youtube.com/account_playback", {
        waitUntil: "networkidle",
        timeout: 30_000,
      })
      await page.waitForTimeout(2000)

      const autoplayOn = await this.isAutoplayEnabled(page)
      const screenshot = await this.takeScreenshot(page, ctx.screenshotDir, "autoplay-verify")

      return {
        ruleCategory: rule.category,
        verified: wantAutoplayOff ? !autoplayOn : autoplayOn,
        currentValue: autoplayOn ? "on" : "off",
        expectedValue: wantAutoplayOff ? "off" : "on",
        screenshot,
      }
    } catch {
      return {
        ruleCategory: rule.category,
        verified: false,
        currentValue: "unknown",
        expectedValue: wantAutoplayOff ? "off" : "on",
      }
    }
  }

  // ── Private Helpers ─────────────────────────────────────────────

  private async openRestrictedModePanel(page: PlaywrightPage): Promise<void> {
    // Ensure we're on YouTube
    const url = page.url()
    if (!url.includes("youtube.com")) {
      await page.goto("https://www.youtube.com", { waitUntil: "networkidle", timeout: 30_000 })
      await page.waitForTimeout(2000)
    }

    // Open avatar menu
    const avatarClicked = await this.tryClickWithStrategy(page, SELECTORS.avatarButton)
    if (!avatarClicked) {
      throw new EnforcementError("Could not open YouTube profile menu", "selector_not_found", true)
    }
    await page.waitForTimeout(1500)

    // Click "Restricted Mode" menu item
    const rmClicked = await this.tryClickWithStrategy(page, SELECTORS.restrictedModeMenuItem)
    if (!rmClicked) {
      throw new EnforcementError("Could not find Restricted Mode menu item", "selector_not_found", true)
    }
    await page.waitForTimeout(1500)
  }

  private async isRestrictedModeEnabled(page: PlaywrightPage): Promise<boolean> {
    try {
      const toggle = await page.$(SELECTORS.restrictedModeToggle.primary)
      if (toggle) {
        const checked = await page.evaluate(
          (el) => {
            const element = el as HTMLElement
            return (
              element.getAttribute("aria-pressed") === "true" ||
              element.getAttribute("checked") !== null ||
              element.classList?.contains("checked") ||
              element.hasAttribute("active")
            )
          },
          toggle,
        )
        return Boolean(checked)
      }

      // Try fallbacks
      for (const sel of SELECTORS.restrictedModeToggle.fallbacks) {
        const el = await page.$(sel)
        if (el) {
          const checked = await page.evaluate(
            (e) => {
              const element = e as HTMLElement
              return (
                element.getAttribute("aria-pressed") === "true" ||
                element.getAttribute("checked") !== null ||
                element.classList?.contains("checked") ||
                element.hasAttribute("active")
              )
            },
            el,
          )
          return Boolean(checked)
        }
      }
    } catch {
      // Fall through
    }

    return false
  }

  private async getRestrictedModeState(page: PlaywrightPage): Promise<boolean> {
    await this.openRestrictedModePanel(page)
    return this.isRestrictedModeEnabled(page)
  }

  private async isAutoplayEnabled(page: PlaywrightPage): Promise<boolean> {
    try {
      const toggle = await page.$(SELECTORS.autoplayToggle.primary)
      if (toggle) {
        const checked = await page.evaluate(
          (el) => {
            const element = el as HTMLElement
            return (
              element.getAttribute("aria-pressed") === "true" ||
              element.getAttribute("checked") !== null ||
              element.classList?.contains("checked") ||
              element.hasAttribute("active")
            )
          },
          toggle,
        )
        return Boolean(checked)
      }

      for (const sel of SELECTORS.autoplayToggle.fallbacks) {
        const el = await page.$(sel)
        if (el) {
          const checked = await page.evaluate(
            (e) => {
              const element = e as HTMLElement
              return (
                element.getAttribute("aria-pressed") === "true" ||
                element.getAttribute("checked") !== null ||
                element.classList?.contains("checked") ||
                element.hasAttribute("active")
              )
            },
            el,
          )
          return Boolean(checked)
        }
      }
    } catch {
      // Fall through
    }

    return true // Default assumption: autoplay is on
  }

  private async tryFillWithStrategy(
    page: PlaywrightPage,
    strategy: SelectorStrategy,
    value: string,
  ): Promise<boolean> {
    if (await this.tryFill(page, strategy.primary, value)) return true
    for (const sel of strategy.fallbacks) {
      if (await this.tryFill(page, sel, value)) return true
    }
    return false
  }

  private async tryClickWithStrategy(
    page: PlaywrightPage,
    strategy: SelectorStrategy,
  ): Promise<boolean> {
    if (await this.tryClick(page, strategy.primary)) return true
    for (const sel of strategy.fallbacks) {
      if (await this.tryClick(page, sel)) return true
    }
    return false
  }

  private async tryFill(page: PlaywrightPage, selector: string, value: string): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: 5000, state: "visible" })
      await page.fill(selector, value)
      return true
    } catch {
      return false
    }
  }

  private async tryClick(page: PlaywrightPage, selector: string): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: 5000, state: "visible" })
      await page.click(selector)
      return true
    } catch {
      return false
    }
  }

  private async elementExists(page: PlaywrightPage, strategy: SelectorStrategy): Promise<boolean> {
    const el = await page.$(strategy.primary)
    if (el) return true
    for (const sel of strategy.fallbacks) {
      const fallback = await page.$(sel)
      if (fallback) return true
    }
    return false
  }

  private async takeScreenshot(
    page: PlaywrightPage,
    dir: string,
    label: string,
  ): Promise<ResearchScreenshot> {
    const filename = `${label}-${Date.now()}.png`
    const filepath = path.join(dir, filename)
    await page.screenshot({ path: filepath, fullPage: false })
    return {
      id: randomUUID(),
      label,
      path: filepath,
      url: page.url(),
      timestamp: new Date().toISOString(),
      width: 1280,
      height: 720,
    }
  }
}
