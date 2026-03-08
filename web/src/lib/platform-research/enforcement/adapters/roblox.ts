import { BaseEnforcementAdapter } from "../base-enforcement-adapter"
import {
  EnforcementError,
  resolveRating,
  type EnforcementContext,
  type PolicyRule,
  type RuleEnforcementResult,
  type RuleVerificationResult,
  type SelectorStrategy,
  type PlaywrightPage,
} from "../types"

/**
 * Roblox browser enforcement adapter.
 *
 * Logs into Roblox via username/password and adjusts parental control settings:
 * - content_rating: Experience maturity restrictions (All Ages / 9+ / 13+ / 17+)
 * - time_daily_limit: Daily screen time limits
 * - dm_restriction: Chat/communication restrictions
 * - purchase_control: Monthly spending limits
 */
export class RobloxEnforcementAdapter extends BaseEnforcementAdapter {
  platformId = "roblox"
  platformName = "Roblox"

  // ── Selectors ──────────────────────────────────────────────────

  private sel = {
    login: {
      username: {
        primary: 'input#login-username',
        fallbacks: [
          'input[name="username"]',
          'input[placeholder*="Username"]',
          'input[placeholder*="Email"]',
        ],
      } satisfies SelectorStrategy,
      password: {
        primary: 'input#login-password',
        fallbacks: [
          'input[name="password"]',
          'input[type="password"]',
        ],
      } satisfies SelectorStrategy,
      submit: {
        primary: 'button#login-button',
        fallbacks: [
          'button[type="submit"]',
        ],
        textMatch: "Log In",
      } satisfies SelectorStrategy,
      captchaFrame: {
        primary: 'iframe[src*="funcaptcha"]',
        fallbacks: [
          'iframe[src*="captcha"]',
          '#FunCaptcha',
          'div[id*="captcha"]',
          'iframe[title*="challenge"]',
        ],
      } satisfies SelectorStrategy,
    },
    parentalControls: {
      tab: {
        primary: 'a[href*="parental-controls"]',
        fallbacks: [
          'li:has-text("Parental Controls")',
          'span:has-text("Parental Controls")',
        ],
        textMatch: "Parental Controls",
      } satisfies SelectorStrategy,
      pinInput: {
        primary: 'input[type="password"][maxlength="4"]',
        fallbacks: [
          'input[placeholder*="PIN"]',
          'input[name="pin"]',
          'input[aria-label*="PIN"]',
        ],
        textMatch: "PIN",
      } satisfies SelectorStrategy,
      pinSubmit: {
        primary: 'button:has-text("Unlock")',
        fallbacks: [
          'button:has-text("Submit")',
          'button:has-text("Confirm")',
          'button[type="submit"]',
        ],
      } satisfies SelectorStrategy,
    },
    contentRating: {
      section: {
        primary: 'text="Allowed Experiences"',
        fallbacks: [
          'text="Experience Restrictions"',
          'text="Content Maturity"',
          'span:has-text("Allowed Experiences")',
        ],
      } satisfies SelectorStrategy,
      allAges: {
        primary: 'label:has-text("All Ages")',
        fallbacks: ['text="All Ages"', 'input[value="all-ages"]'],
        textMatch: "All Ages",
      } satisfies SelectorStrategy,
      ninePlus: {
        primary: 'label:has-text("9+")',
        fallbacks: ['text="9+"', 'input[value="9+"]'],
        textMatch: "9+",
      } satisfies SelectorStrategy,
      thirteenPlus: {
        primary: 'label:has-text("13+")',
        fallbacks: ['text="13+"', 'input[value="13+"]'],
        textMatch: "13+",
      } satisfies SelectorStrategy,
      seventeenPlus: {
        primary: 'label:has-text("17+")',
        fallbacks: ['text="17+"', 'input[value="17+"]'],
        textMatch: "17+",
      } satisfies SelectorStrategy,
    },
    screenTime: {
      section: {
        primary: 'text="Screen Time"',
        fallbacks: [
          'text="Time Limits"',
          'span:has-text("Screen Time")',
          'div:has-text("Screen Time")',
        ],
      } satisfies SelectorStrategy,
      enableToggle: {
        primary: '#screen-time-toggle',
        fallbacks: [
          'button[role="switch"]:near(:text("Screen Time"))',
          'input[type="checkbox"]:near(:text("Screen Time"))',
        ],
        textMatch: "Enable",
      } satisfies SelectorStrategy,
      limitInput: {
        primary: 'input[type="number"]:near(:text("daily"))',
        fallbacks: [
          'input[aria-label*="time limit"]',
          'input[placeholder*="minutes"]',
          'select:near(:text("Screen Time"))',
        ],
      } satisfies SelectorStrategy,
      saveButton: {
        primary: 'button:has-text("Save")',
        fallbacks: [
          'button:has-text("Apply")',
          'button:has-text("Update")',
          'button[type="submit"]',
        ],
      } satisfies SelectorStrategy,
    },
    privacy: {
      tab: {
        primary: 'a[href*="privacy"]',
        fallbacks: [
          'span:has-text("Privacy")',
          '#privacy-tab',
        ],
        textMatch: "Privacy",
      } satisfies SelectorStrategy,
      chatDropdown: {
        primary: 'select:near(:text("chat with me"))',
        fallbacks: [
          'select:near(:text("communication"))',
          'select#who-can-chat',
          'div[role="listbox"]:near(:text("chat"))',
        ],
      } satisfies SelectorStrategy,
      chatEveryone: {
        primary: 'option:has-text("Everyone")',
        fallbacks: ['option[value="everyone"]'],
        textMatch: "Everyone",
      } satisfies SelectorStrategy,
      chatFriends: {
        primary: 'option:has-text("Friends")',
        fallbacks: ['option[value="friends"]'],
        textMatch: "Friends",
      } satisfies SelectorStrategy,
      chatNobody: {
        primary: 'option:has-text("No one")',
        fallbacks: [
          'option:has-text("Nobody")',
          'option[value="no-one"]',
          'option[value="nobody"]',
        ],
        textMatch: "No one",
      } satisfies SelectorStrategy,
    },
    spending: {
      section: {
        primary: 'text="Monthly Spend"',
        fallbacks: [
          'text="Spending"',
          'text="Allowance"',
          'span:has-text("Spend")',
        ],
      } satisfies SelectorStrategy,
      enableToggle: {
        primary: '#spending-toggle',
        fallbacks: [
          'button[role="switch"]:near(:text("Spend"))',
          'input[type="checkbox"]:near(:text("Spend"))',
        ],
      } satisfies SelectorStrategy,
      limitInput: {
        primary: 'input[type="number"]:near(:text("spend"))',
        fallbacks: [
          'input[aria-label*="spending"]',
          'input[placeholder*="amount"]',
          'select:near(:text("Monthly"))',
        ],
      } satisfies SelectorStrategy,
    },
  }

  // Rating selectors map for content_rating enforcement
  private ratingSelectors: Record<string, SelectorStrategy> = {
    "All Ages": this.sel.contentRating.allAges,
    "9+": this.sel.contentRating.ninePlus,
    "13+": this.sel.contentRating.thirteenPlus,
    "17+": this.sel.contentRating.seventeenPlus,
  }

  // ── Public API ─────────────────────────────────────────────────

  supportedRuleCategories(): string[] {
    return ["content_rating", "time_daily_limit", "dm_restriction", "purchase_control"]
  }

  // ── Login ──────────────────────────────────────────────────────

  async login(ctx: EnforcementContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://www.roblox.com/login"

    // Try restoring a cached session first
    const restored = await this.loadSessionState(page, ctx)
    if (restored) {
      await page.goto("https://www.roblox.com/home", { waitUntil: "networkidle", timeout: 30000 })
      await this.waitForPageLoad(page, 3000)
      const url = page.url()
      if (!url.includes("/login") && !url.includes("/newlogin")) {
        return // Session still valid
      }
    }

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Dismiss cookie consent
    await this.tryClick(page, 'button:has-text("Accept All")')
    await this.tryClick(page, 'button:has-text("Accept")')
    await this.waitForPageLoad(page, 1000)

    // Fill username
    if (ctx.credentials.username) {
      const userSel = await this.trySelector(page, this.sel.login.username)
      await page.fill(userSel, ctx.credentials.username)
    }

    // Fill password
    if (ctx.credentials.password) {
      const passSel = await this.trySelector(page, this.sel.login.password)
      await page.fill(passSel, ctx.credentials.password)
    }

    // Submit
    const submitSel = await this.trySelector(page, this.sel.login.submit)
    await page.click(submitSel)
    await this.waitForPageLoad(page, 5000)

    // Check for CAPTCHA
    await this.detectCaptcha(page)

    // Check login success
    const postLoginUrl = page.url()
    if (postLoginUrl.includes("/login") || postLoginUrl.includes("/newlogin")) {
      throw new EnforcementError(
        "Login failed: still on login page after submitting credentials",
        "invalid_creds",
        false,
      )
    }

    // Cache session for future runs
    await this.saveSessionState(page, ctx)
  }

  // ── Get Current Config ─────────────────────────────────────────

  async getCurrentConfig(
    ctx: EnforcementContext,
    page: PlaywrightPage,
  ): Promise<Record<string, unknown>> {
    const config: Record<string, unknown> = {}

    // Navigate to parental controls
    await this.navigateToParentalControlsPage(page)
    await this.enterPinIfRequired(page, ctx)

    // Read content rating
    const pageContent = await page.content()
    config.contentRating = this.detectCurrentRating(pageContent)

    // Read screen time
    config.screenTimeEnabled = /screen\s*time.*enabled|daily\s*limit.*\d/i.test(pageContent)
    const timeMatch = pageContent.match(/(\d+)\s*(?:minutes?|mins?|hours?|hrs?)\s*(?:daily|per\s*day)/i)
    if (timeMatch) {
      const val = parseInt(timeMatch[1], 10)
      config.screenTimeLimitMinutes = timeMatch[0].toLowerCase().includes("hour") ? val * 60 : val
    }

    // Read spending
    config.spendingLimitEnabled = /monthly\s*spend.*enabled|spending.*limit.*\$/i.test(pageContent)

    // Navigate to privacy for DM settings
    await page.goto("https://www.roblox.com/my/account#!/privacy", {
      waitUntil: "networkidle",
      timeout: 20000,
    })
    await this.waitForPageLoad(page, 2000)
    const privacyContent = await page.content()
    config.chatSetting = this.detectChatSetting(privacyContent)

    return config
  }

  // ── Enforce Rule ───────────────────────────────────────────────

  async enforceRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    if (!this.supportedRuleCategories().includes(rule.category)) {
      return {
        ruleCategory: rule.category,
        status: "unsupported",
        reason: `Rule "${rule.category}" is not supported on Roblox`,
      }
    }

    switch (rule.category) {
      case "content_rating":
        return this.enforceContentRating(ctx, page, rule)
      case "time_daily_limit":
        return this.enforceTimeDailyLimit(ctx, page, rule)
      case "dm_restriction":
        return this.enforceDmRestriction(ctx, page, rule)
      case "purchase_control":
        return this.enforcePurchaseControl(ctx, page, rule)
      default:
        return {
          ruleCategory: rule.category,
          status: "unsupported",
          reason: `Unknown rule category "${rule.category}"`,
        }
    }
  }

  // ── Verify Rule ────────────────────────────────────────────────

  async verifyRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    switch (rule.category) {
      case "content_rating":
        return this.verifyContentRating(ctx, page, rule)
      case "time_daily_limit":
        return this.verifyTimeDailyLimit(ctx, page, rule)
      case "dm_restriction":
        return this.verifyDmRestriction(ctx, page, rule)
      case "purchase_control":
        return this.verifyPurchaseControl(ctx, page, rule)
      default:
        return { ruleCategory: rule.category, verified: false, expectedValue: "unknown" }
    }
  }

  // ── Revoke Rule ────────────────────────────────────────────────

  async revokeRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    switch (rule.category) {
      case "content_rating":
        // Revoke = set to most permissive
        return this.enforceContentRating(ctx, page, {
          ...rule,
          config: { maxRating: "17+" },
        })
      case "time_daily_limit":
        // Revoke = disable screen time
        return this.enforceTimeDailyLimit(ctx, page, {
          ...rule,
          config: { limitMinutes: 0 },
        })
      case "dm_restriction":
        // Revoke = allow everyone
        return this.enforceDmRestriction(ctx, page, {
          ...rule,
          config: { mode: "everyone" },
        })
      case "purchase_control":
        // Revoke = disable spending limit
        return this.enforcePurchaseControl(ctx, page, {
          ...rule,
          config: { enabled: false },
        })
      default:
        return {
          ruleCategory: rule.category,
          status: "unsupported",
          reason: `Cannot revoke unsupported rule "${rule.category}"`,
        }
    }
  }

  // ── Content Rating ─────────────────────────────────────────────

  private async enforceContentRating(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    const maxRating = (rule.config.maxRating as string) ?? resolveRating("roblox", ctx.childAge)

    if (!this.ratingSelectors[maxRating]) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: `Invalid rating "${maxRating}". Expected one of: All Ages, 9+, 13+, 17+`,
      }
    }

    await this.navigateToParentalControlsPage(page)
    await this.enterPinIfRequired(page, ctx)

    // Click the Allowed Experiences section
    try {
      await this.trySelector(page, this.sel.contentRating.section, 5000)
    } catch {
      // Section might already be visible
    }

    const content = await page.content()
    const currentRating = this.detectCurrentRating(content)

    return this.enforceWithIdempotency(
      ctx,
      page,
      rule,
      async () => currentRating,
      async () => {
        const ratingSel = await this.trySelector(page, this.ratingSelectors[maxRating])
        await page.click(ratingSel)
        await this.waitForPageLoad(page, 2000)

        // Try to save
        await this.tryClick(page, 'button:has-text("Save")')
        await this.tryClick(page, 'button:has-text("Apply")')
        await this.waitForPageLoad(page, 2000)
      },
      maxRating,
    )
  }

  private async verifyContentRating(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    const expected = (rule.config.maxRating as string) ?? resolveRating("roblox", ctx.childAge)

    await this.navigateToParentalControlsPage(page)
    await this.enterPinIfRequired(page, ctx)

    const content = await page.content()
    const current = this.detectCurrentRating(content)

    const screenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "verify"
    )

    return {
      ruleCategory: rule.category,
      verified: current === expected,
      currentValue: current,
      expectedValue: expected,
      screenshot,
    }
  }

  // ── Time Daily Limit ───────────────────────────────────────────

  private async enforceTimeDailyLimit(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    const limitMinutes = rule.config.limitMinutes as number

    await this.navigateToParentalControlsPage(page)
    await this.enterPinIfRequired(page, ctx)

    // Navigate to screen time section
    try {
      const sectionSel = await this.trySelector(page, this.sel.screenTime.section, 5000)
      await page.click(sectionSel)
      await this.waitForPageLoad(page, 2000)
    } catch {
      // Section might already be open
    }

    const beforeScreenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "before"
    )

    if (limitMinutes === 0) {
      // Disable screen time
      try {
        const toggleSel = await this.trySelector(page, this.sel.screenTime.enableToggle, 3000)
        const isEnabled = await page.evaluate(
          `document.querySelector('${toggleSel.replace(/'/g, "\\'")}')?.getAttribute('aria-checked') === 'true' || document.querySelector('${toggleSel.replace(/'/g, "\\'")}')?.checked === true`
        )
        if (isEnabled) {
          await page.click(toggleSel)
          await this.waitForPageLoad(page, 2000)
        }
      } catch {
        // Toggle might not exist; attempt to clear input instead
      }
    } else {
      // Enable and set limit
      try {
        const toggleSel = await this.trySelector(page, this.sel.screenTime.enableToggle, 3000)
        const isEnabled = await page.evaluate(
          `document.querySelector('${toggleSel.replace(/'/g, "\\'")}')?.getAttribute('aria-checked') === 'true' || document.querySelector('${toggleSel.replace(/'/g, "\\'")}')?.checked === true`
        )
        if (!isEnabled) {
          await page.click(toggleSel)
          await this.waitForPageLoad(page, 1000)
        }
      } catch {
        // Toggle might not exist, continue
      }

      // Set the limit value
      try {
        const inputSel = await this.trySelector(page, this.sel.screenTime.limitInput, 5000)
        await page.fill(inputSel, String(limitMinutes))
      } catch {
        // Input might be a dropdown/select
        await this.trySelectOption(page, limitMinutes)
      }
    }

    // Save changes
    await this.tryClick(page, 'button:has-text("Save")')
    await this.tryClick(page, 'button:has-text("Apply")')
    await this.waitForPageLoad(page, 2000)

    const afterScreenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "after"
    )

    return {
      ruleCategory: rule.category,
      status: "applied",
      previousValue: beforeScreenshot.label,
      newValue: limitMinutes === 0 ? "disabled" : `${limitMinutes} minutes`,
      screenshot: afterScreenshot,
    }
  }

  private async verifyTimeDailyLimit(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    const expected = rule.config.limitMinutes as number

    await this.navigateToParentalControlsPage(page)
    await this.enterPinIfRequired(page, ctx)

    const content = await page.content()
    const timeMatch = content.match(/(\d+)\s*(?:minutes?|mins?|hours?|hrs?)/i)
    let currentMinutes: number | undefined
    if (timeMatch) {
      const val = parseInt(timeMatch[1], 10)
      currentMinutes = timeMatch[0].toLowerCase().includes("hour") ? val * 60 : val
    }

    const screenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "verify"
    )

    return {
      ruleCategory: rule.category,
      verified: currentMinutes === expected,
      currentValue: currentMinutes !== undefined ? `${currentMinutes} minutes` : "unknown",
      expectedValue: expected === 0 ? "disabled" : `${expected} minutes`,
      screenshot,
    }
  }

  // ── DM Restriction ─────────────────────────────────────────────

  private async enforceDmRestriction(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    const mode = rule.config.mode as "everyone" | "friends" | "nobody"

    await page.goto("https://www.roblox.com/my/account#!/privacy", {
      waitUntil: "networkidle",
      timeout: 20000,
    })
    await this.waitForPageLoad(page, 3000)
    await this.enterPinIfRequired(page, ctx)

    const beforeScreenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "before"
    )

    // Try to find and use the chat restriction dropdown
    try {
      const dropdownSel = await this.trySelector(page, this.sel.privacy.chatDropdown, 5000)
      const optionValue = this.chatModeToOptionValue(mode)
      await page.evaluate(
        `document.querySelector('${dropdownSel.replace(/'/g, "\\'")}').value = '${optionValue}'`
      )
      // Dispatch change event to trigger Roblox's form handlers
      await page.evaluate(
        `document.querySelector('${dropdownSel.replace(/'/g, "\\'")}')?.dispatchEvent(new Event('change', { bubbles: true }))`
      )
    } catch {
      // Fallback: click-based option selection
      const selectorMap: Record<string, SelectorStrategy> = {
        everyone: this.sel.privacy.chatEveryone,
        friends: this.sel.privacy.chatFriends,
        nobody: this.sel.privacy.chatNobody,
      }
      const optionStrategy = selectorMap[mode]
      if (optionStrategy) {
        const optSel = await this.trySelector(page, optionStrategy, 3000)
        await page.click(optSel)
      }
    }

    await this.waitForPageLoad(page, 1000)
    await this.tryClick(page, 'button:has-text("Save")')
    await this.tryClick(page, 'button:has-text("Apply")')
    await this.waitForPageLoad(page, 2000)

    const afterScreenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "after"
    )

    return {
      ruleCategory: rule.category,
      status: "applied",
      previousValue: beforeScreenshot.label,
      newValue: mode,
      screenshot: afterScreenshot,
    }
  }

  private async verifyDmRestriction(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    const expected = rule.config.mode as string

    await page.goto("https://www.roblox.com/my/account#!/privacy", {
      waitUntil: "networkidle",
      timeout: 20000,
    })
    await this.waitForPageLoad(page, 2000)

    const content = await page.content()
    const current = this.detectChatSetting(content)

    const screenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "verify"
    )

    return {
      ruleCategory: rule.category,
      verified: current === expected,
      currentValue: current ?? "unknown",
      expectedValue: expected,
      screenshot,
    }
  }

  // ── Purchase Control ───────────────────────────────────────────

  private async enforcePurchaseControl(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    const enabled = rule.config.enabled !== false
    const monthlyLimitCents = rule.config.monthlyLimitCents as number | undefined

    await this.navigateToParentalControlsPage(page)
    await this.enterPinIfRequired(page, ctx)

    // Navigate to spending section
    try {
      const sectionSel = await this.trySelector(page, this.sel.spending.section, 5000)
      await page.click(sectionSel)
      await this.waitForPageLoad(page, 2000)
    } catch {
      // Section may already be visible
    }

    const beforeScreenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "before"
    )

    // Toggle spending limit
    try {
      const toggleSel = await this.trySelector(page, this.sel.spending.enableToggle, 3000)
      const isCurrentlyEnabled = await page.evaluate(
        `document.querySelector('${toggleSel.replace(/'/g, "\\'")}')?.getAttribute('aria-checked') === 'true' || document.querySelector('${toggleSel.replace(/'/g, "\\'")}')?.checked === true`
      )
      if (enabled && !isCurrentlyEnabled) {
        await page.click(toggleSel)
        await this.waitForPageLoad(page, 1000)
      } else if (!enabled && isCurrentlyEnabled) {
        await page.click(toggleSel)
        await this.waitForPageLoad(page, 1000)
      }
    } catch {
      // Toggle might not exist
    }

    // Set amount if enabled and a limit is provided
    if (enabled && monthlyLimitCents !== undefined) {
      try {
        const inputSel = await this.trySelector(page, this.sel.spending.limitInput, 3000)
        const dollars = Math.round(monthlyLimitCents / 100)
        await page.fill(inputSel, String(dollars))
      } catch {
        // Input might not be available
      }
    }

    // Save changes
    await this.tryClick(page, 'button:has-text("Save")')
    await this.tryClick(page, 'button:has-text("Apply")')
    await this.waitForPageLoad(page, 2000)

    const afterScreenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "after"
    )

    return {
      ruleCategory: rule.category,
      status: "applied",
      newValue: enabled
        ? (monthlyLimitCents !== undefined ? `$${Math.round(monthlyLimitCents / 100)}/month` : "enabled")
        : "disabled",
      screenshot: afterScreenshot,
    }
  }

  private async verifyPurchaseControl(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    const enabled = rule.config.enabled !== false

    await this.navigateToParentalControlsPage(page)
    await this.enterPinIfRequired(page, ctx)

    const content = await page.content()
    const hasSpendingLimit = /monthly\s*spend.*enabled|spending.*limit.*\$|spend.*restrict/i.test(content)

    const screenshot = await this.screenshotEnforcementStep(
      page, ctx, rule.category, "verify"
    )

    return {
      ruleCategory: rule.category,
      verified: hasSpendingLimit === enabled,
      currentValue: hasSpendingLimit ? "enabled" : "disabled",
      expectedValue: enabled ? "enabled" : "disabled",
      screenshot,
    }
  }

  // ── Private Helpers ────────────────────────────────────────────

  private async navigateToParentalControlsPage(page: PlaywrightPage): Promise<void> {
    await page.goto("https://www.roblox.com/my/account#!/parental-controls", {
      waitUntil: "networkidle",
      timeout: 20000,
    })
    await this.waitForPageLoad(page, 3000)

    // If hash navigation didn't work, try clicking the tab
    const currentUrl = page.url()
    if (!currentUrl.includes("parental-controls")) {
      await page.goto("https://www.roblox.com/my/account", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)

      try {
        const tabSel = await this.trySelector(page, this.sel.parentalControls.tab, 5000)
        await page.click(tabSel)
        await this.waitForPageLoad(page, 2000)
      } catch {
        // Tab might not exist; we might already be on the right page
      }
    }
  }

  private async enterPinIfRequired(page: PlaywrightPage, ctx: EnforcementContext): Promise<void> {
    const pin = ctx.credentials.extra?.pin
    if (!pin) return

    try {
      const pinSel = await this.trySelector(page, this.sel.parentalControls.pinInput, 3000)
      await page.fill(pinSel, pin)
      const submitSel = await this.trySelector(page, this.sel.parentalControls.pinSubmit, 3000)
      await page.click(submitSel)
      await this.waitForPageLoad(page, 2000)
    } catch {
      // PIN field not present — controls may not be PIN-protected
    }
  }

  private async detectCaptcha(page: PlaywrightPage): Promise<void> {
    try {
      await this.trySelector(page, this.sel.login.captchaFrame, 3000)
      const screenshotPath = `captcha_${Date.now()}.png`
      await page.screenshot({ path: screenshotPath })
      throw new EnforcementError(
        "CAPTCHA challenge detected during Roblox login. Manual intervention required.",
        "captcha",
        false,
        screenshotPath,
      )
    } catch (err) {
      if (err instanceof EnforcementError) throw err
      // No CAPTCHA detected — continue
    }
  }

  private detectCurrentRating(html: string): string | undefined {
    // Check for selected/active rating indicators
    if (/all\s*ages.*(?:selected|active|checked|current)/i.test(html)) return "All Ages"
    if (/9\+.*(?:selected|active|checked|current)/i.test(html)) return "9+"
    if (/13\+.*(?:selected|active|checked|current)/i.test(html)) return "13+"
    if (/17\+.*(?:selected|active|checked|current)/i.test(html)) return "17+"
    return undefined
  }

  private detectChatSetting(html: string): string | undefined {
    if (/(?:no\s*one|nobody).*(?:selected|active|checked|current)/i.test(html)) return "nobody"
    if (/friends.*(?:selected|active|checked|current)/i.test(html)) return "friends"
    if (/everyone.*(?:selected|active|checked|current)/i.test(html)) return "everyone"
    return undefined
  }

  private chatModeToOptionValue(mode: "everyone" | "friends" | "nobody"): string {
    switch (mode) {
      case "everyone": return "Everyone"
      case "friends": return "Friends"
      case "nobody": return "NoOne"
    }
  }

  private async trySelectOption(page: PlaywrightPage, minutes: number): Promise<void> {
    // Common Roblox screen time presets
    const presets = [30, 60, 90, 120, 180, 240]
    const closest = presets.reduce((a, b) =>
      Math.abs(b - minutes) < Math.abs(a - minutes) ? b : a
    )
    await this.tryClick(page, `option:has-text("${closest}")`)
    await this.tryClick(page, `text="${closest} minutes"`)
    await this.tryClick(page, `text="${closest / 60} hour"`)
  }
}
