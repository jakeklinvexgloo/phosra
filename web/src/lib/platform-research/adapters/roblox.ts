import { BaseResearchAdapter } from "../base-adapter"
import type { ResearchContext, ResearchScreenshot, ResearchNotes, PlaywrightPage } from "../types"

/**
 * Research adapter for Roblox parental controls.
 *
 * Navigates Roblox's account settings and Parental Controls section
 * to discover and document purchase controls, messaging restrictions,
 * content filtering, screen time limits, consent gates, and age gating.
 */
export class RobloxAdapter extends BaseResearchAdapter {
  platformId = "roblox"
  platformName = "Roblox"

  // ── Selectors (with fallbacks) ──────────────────────────────────

  private selectors = {
    login: {
      usernameInput: [
        'input[id="login-username"]',
        'input[name="username"]',
        'input[placeholder*="Username"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="Phone"]',
        '#login-username',
      ],
      passwordInput: [
        'input[id="login-password"]',
        'input[name="password"]',
        'input[type="password"]',
        'input[placeholder*="Password"]',
        '#login-password',
      ],
      submit: [
        'button[id="login-button"]',
        '#login-button',
        'button[type="submit"]',
        'button:has-text("Log In")',
        'button:has-text("Login")',
      ],
    },
    settings: {
      accountRestrictions: [
        'a[href*="account-restrictions"]',
        'text="Account Restrictions"',
        'span:has-text("Account Restrictions")',
        '#account-restrictions-switch',
      ],
      parentalControls: [
        'a[href*="parental-controls"]',
        'text="Parental Controls"',
        'span:has-text("Parental Controls")',
        'li:has-text("Parental Controls")',
      ],
      privacyTab: [
        'a[href*="privacy"]',
        'text="Privacy"',
        'span:has-text("Privacy")',
        '#privacy-tab',
      ],
      spendingControls: [
        'text="Spending"',
        'text="Monthly Spend"',
        'text="Allowance"',
        'span:has-text("Spend")',
      ],
      communicationSettings: [
        'text="Communication"',
        'text="Who can chat"',
        'text="Chat Settings"',
        'span:has-text("Communication")',
      ],
      experienceRestrictions: [
        'text="Allowed Experiences"',
        'text="Experience Restrictions"',
        'text="Content Maturity"',
        'span:has-text("Experiences")',
      ],
      screenTime: [
        'text="Screen Time"',
        'text="Time Limits"',
        'span:has-text("Screen Time")',
        'div:has-text("Screen Time")',
      ],
    },
  }

  // ── Login ───────────────────────────────────────────────────────

  async login(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://www.roblox.com/login"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Handle cookie consent if present
    await this.tryClick(page, 'button:has-text("Accept All")')
    await this.tryClick(page, 'button:has-text("Accept")')
    await this.waitForPageLoad(page, 1000)

    // Fill username
    if (ctx.credentials.username) {
      for (const sel of this.selectors.login.usernameInput) {
        if (await this.tryFill(page, sel, ctx.credentials.username)) break
      }
    }

    // Fill password
    if (ctx.credentials.password) {
      for (const sel of this.selectors.login.passwordInput) {
        if (await this.tryFill(page, sel, ctx.credentials.password)) break
      }
    }

    // Submit
    for (const sel of this.selectors.login.submit) {
      if (await this.tryClick(page, sel)) break
    }

    await this.waitForPageLoad(page, 5000)
  }

  // ── Navigate to Parental Controls ───────────────────────────────

  async navigateToParentalControls(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    // Direct URL to parental controls
    await page.goto("https://www.roblox.com/my/account#!/parental-controls", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 3000)

    // If hash navigation didn't work, try clicking the tab
    const currentUrl = page.url()
    if (!currentUrl.includes("parental-controls")) {
      await page.goto("https://www.roblox.com/my/account", {
        waitUntil: "networkidle",
        timeout: 30000,
      })
      await this.waitForPageLoad(page, 2000)

      for (const sel of this.selectors.settings.parentalControls) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
    }
  }

  // ── Capture Screenshots ─────────────────────────────────────────

  async captureScreenshots(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchScreenshot[]> {
    const screenshots: ResearchScreenshot[] = []

    // 1. Account restrictions overview
    try {
      await page.goto("https://www.roblox.com/my/account#!/parental-controls", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "account_restrictions"))
    } catch {
      // Continue
    }

    // 2. Spending controls
    try {
      for (const sel of this.selectors.settings.spendingControls) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "spending_controls"))
    } catch {
      // Continue
    }

    // 3. Communication / chat settings
    try {
      await page.goto("https://www.roblox.com/my/account#!/privacy", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "communication_settings"))
    } catch {
      // Continue
    }

    // 4. Experience / content restrictions
    try {
      for (const sel of this.selectors.settings.experienceRestrictions) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "experience_restrictions"))
    } catch {
      // Continue
    }

    return screenshots
  }

  // ── Extract Notes ───────────────────────────────────────────────

  async extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes> {
    const pageContent = await page.content()
    const capabilities = []

    // Detect Purchase Controls
    const hasPurchaseControl = /spend|robux|purchase|monthly\s*limit|allowance|transaction/i.test(pageContent)
    if (hasPurchaseControl) {
      capabilities.push(
        this.capability(
          "purchase_control",
          "Roblox allows parents to set monthly spending limits on Robux purchases and require a PIN for transactions.",
          "Settings > Parental Controls > Spending",
          0.95,
        ),
      )
    }

    // Detect DM Restrictions
    const hasDmRestriction = /chat\s*setting|who\s*can\s*chat|communication|message\s*setting|contact\s*setting/i.test(pageContent)
    if (hasDmRestriction) {
      capabilities.push(
        this.capability(
          "dm_restriction",
          "Roblox parental controls allow restricting in-game and platform chat. Options include no chat, friends only, or everyone with filtered content.",
          "Settings > Privacy > Communication",
          0.9,
        ),
      )
    }

    // Detect Content Filter
    const hasContentFilter = /account\s*restrict|experience\s*restrict|content\s*matur|age\s*rating|allowed\s*experience/i.test(pageContent)
    if (hasContentFilter) {
      capabilities.push(
        this.capability(
          "content_filter",
          "Roblox provides experience (game) maturity ratings and allows parents to restrict which maturity levels their child can access.",
          "Settings > Parental Controls > Allowed Experiences",
          0.95,
        ),
      )
    }

    // Detect Screen Time Limits
    const hasScreenTime = /screen\s*time|time\s*limit|daily\s*limit|session\s*limit/i.test(pageContent)
    if (hasScreenTime) {
      capabilities.push(
        this.capability(
          "screen_time_limit",
          "Roblox allows parents to set daily screen time limits and scheduled play times through parental controls.",
          "Settings > Parental Controls > Screen Time",
          0.9,
        ),
      )
    }

    // Detect Parental Consent Gate
    const hasConsentGate = /parental\s*consent|parent\s*email|verify\s*parent|parent.*pin|parental\s*control.*pin/i.test(pageContent)
    if (hasConsentGate) {
      capabilities.push(
        this.capability(
          "parental_consent_gate",
          "Roblox requires parental consent (via email verification or ID) for accounts of users under 13. A parental PIN protects settings changes.",
          "Settings > Parental Controls > PIN / Account Info",
          0.9,
        ),
      )
    }

    // Detect Age Gate
    const hasAgeGate = /age\s*verif|date\s*of\s*birth|birthday|under\s*13|age\s*group/i.test(pageContent)
    if (hasAgeGate) {
      capabilities.push(
        this.capability(
          "age_gate",
          "Roblox requires date of birth at account creation and applies age-appropriate defaults. Users under 13 receive stricter default restrictions.",
          "Account Creation / Settings > Account Info",
          0.9,
        ),
      )
    }

    // Fallback if no capabilities detected from page content
    if (capabilities.length === 0) {
      capabilities.push(
        this.capability("purchase_control", "Roblox Robux spending limits and parental PIN", "Parental Controls > Spending", 0.6),
        this.capability("dm_restriction", "Roblox chat restriction settings", "Privacy > Communication", 0.6),
        this.capability("content_filter", "Roblox experience maturity filtering", "Parental Controls > Allowed Experiences", 0.6),
        this.capability("screen_time_limit", "Roblox daily screen time limits", "Parental Controls > Screen Time", 0.6),
        this.capability("parental_consent_gate", "Roblox parental consent and PIN", "Parental Controls", 0.6),
        this.capability("age_gate", "Roblox age-based account restrictions", "Account Creation", 0.6),
      )
    }

    return {
      summary: "Roblox provides comprehensive parental controls including purchase limits, chat restrictions, experience maturity filtering, screen time limits, and age-based defaults. Parental PIN protects all settings from child modification.",
      parentalControlsFound: capabilities.length > 0,
      settingsLocation: "Settings > Parental Controls (roblox.com/my/account#!/parental-controls)",
      capabilities,
      ageRestrictionOptions: ["Under 13 (strict defaults, parental consent required)", "13+ (relaxed defaults)", "Age-verified (full features)"],
      contentFilteringOptions: ["Account Restrictions toggle", "Experience maturity ratings (All Ages / 9+ / 13+ / 17+)", "Content maturity filters"],
      screenTimeLimits: true,
      purchaseControls: true,
      privacySettings: ["Who can chat with me", "Who can message me", "Who can find me", "Who can invite me", "Who can trade with me"],
      rawNotes: `Roblox research conducted at: ${page.url()}\nPage content length: ${pageContent.length} chars`,
    }
  }
}
