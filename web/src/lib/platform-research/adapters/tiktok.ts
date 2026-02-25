import { BaseResearchAdapter } from "../base-adapter"
import type { ResearchContext, ResearchScreenshot, ResearchNotes, PlaywrightPage } from "../types"

/**
 * Research adapter for TikTok parental controls.
 *
 * Navigates Digital Wellbeing settings and Family Pairing features
 * to discover and document screen time, content filter, messaging,
 * and search restriction capabilities.
 */
export class TikTokAdapter extends BaseResearchAdapter {
  platformId = "tiktok"
  platformName = "TikTok"

  // ── Selectors (with fallbacks) ──────────────────────────────────

  private selectors = {
    login: {
      emailTab: [
        'a[href*="email"]',
        'div[data-e2e="channel-item"]:has-text("email")',
        'text="Use phone / email / username"',
      ],
      emailInput: [
        'input[name="username"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="email"]',
        'input[type="email"]',
        'input[placeholder*="Phone"]',
      ],
      passwordInput: [
        'input[name="password"]',
        'input[type="password"]',
        'input[placeholder*="Password"]',
        'input[placeholder*="password"]',
      ],
      submit: [
        'button[data-e2e="login-button"]',
        'button[type="submit"]',
        'button:has-text("Log in")',
        'button:has-text("Sign in")',
      ],
    },
    settings: {
      menuButton: [
        'button[data-e2e="profile-icon"]',
        '[data-e2e="nav-setting"]',
        'a[href*="setting"]',
      ],
      digitalWellbeing: [
        'a[href*="digital-wellbeing"]',
        'text="Digital Wellbeing"',
        'div:has-text("Digital Wellbeing")',
        'span:has-text("Screen Time")',
      ],
      familyPairing: [
        'a[href*="family-pairing"]',
        'text="Family Pairing"',
        'div:has-text("Family Pairing")',
      ],
      restrictedMode: [
        'div:has-text("Restricted Mode")',
        'text="Restricted Mode"',
        'span:has-text("Restricted Mode")',
      ],
      screenTimeToggle: [
        'div[data-e2e="screen-time-toggle"]',
        'div:has-text("Screen Time") >> button',
        '[role="switch"]:near(:text("Screen Time"))',
      ],
      contentPreferences: [
        'text="Content Preferences"',
        'div:has-text("Content Preferences")',
        'a[href*="content-preferences"]',
      ],
    },
  }

  // ── Login ───────────────────────────────────────────────────────

  async login(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://www.tiktok.com/login/phone-or-email/email"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // TikTok may show a method selection screen first
    for (const sel of this.selectors.login.emailTab) {
      if (await this.tryClick(page, sel)) break
    }
    await this.waitForPageLoad(page, 2000)

    // Fill email/username
    if (ctx.credentials.username) {
      for (const sel of this.selectors.login.emailInput) {
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
    // Try direct URL first
    await page.goto("https://www.tiktok.com/setting/digital-wellbeing", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 3000)

    // If direct URL failed, try navigating via settings menu
    const currentUrl = page.url()
    if (!currentUrl.includes("digital-wellbeing") && !currentUrl.includes("setting")) {
      // Navigate to settings
      await page.goto("https://www.tiktok.com/setting", {
        waitUntil: "networkidle",
        timeout: 30000,
      })
      await this.waitForPageLoad(page, 2000)

      // Click Digital Wellbeing
      for (const sel of this.selectors.settings.digitalWellbeing) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
    }
  }

  // ── Capture Screenshots ─────────────────────────────────────────

  async captureScreenshots(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchScreenshot[]> {
    const screenshots: ResearchScreenshot[] = []

    // 1. Screen Time Dashboard
    try {
      await page.goto("https://www.tiktok.com/setting/digital-wellbeing", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "screen_time_dashboard"))
    } catch {
      // Continue to next screenshot
    }

    // 2. Restricted Mode
    try {
      for (const sel of this.selectors.settings.restrictedMode) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "restricted_mode"))
    } catch {
      // Continue
    }

    // 3. Family Pairing settings
    try {
      await page.goto("https://www.tiktok.com/setting/family-pairing", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "family_pairing_settings"))
    } catch {
      // Continue
    }

    // 4. Content Preferences
    try {
      for (const sel of this.selectors.settings.contentPreferences) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "content_preferences"))
    } catch {
      // Continue
    }

    return screenshots
  }

  // ── Extract Notes ───────────────────────────────────────────────

  async extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes> {
    const pageContent = await page.content()
    const capabilities = []

    // Detect Screen Time controls
    const hasScreenTime = /screen\s*time|daily\s*screen\s*time|time\s*limit/i.test(pageContent)
    if (hasScreenTime) {
      capabilities.push(
        this.capability(
          "screen_time_limit",
          "TikTok allows parents to set daily screen time limits via Digital Wellbeing and Family Pairing. Teens can also self-manage.",
          "Settings > Digital Wellbeing > Screen Time Management",
          0.95,
        ),
      )
    }

    // Detect Content Filter / Restricted Mode
    const hasContentFilter = /restricted\s*mode|content\s*filter|mature\s*content/i.test(pageContent)
    if (hasContentFilter) {
      capabilities.push(
        this.capability(
          "content_filter",
          "Restricted Mode limits the appearance of content that may not be appropriate for all audiences. Parents can lock this setting via Family Pairing.",
          "Settings > Digital Wellbeing > Restricted Mode",
          0.9,
        ),
      )
    }

    // Detect DM Restrictions
    const hasDmRestriction = /direct\s*message|dm|who\s*can\s*send|messaging/i.test(pageContent)
    if (hasDmRestriction) {
      capabilities.push(
        this.capability(
          "dm_restriction",
          "Parents can restrict who can send direct messages to their teen via Family Pairing. Options include everyone, friends, or no one.",
          "Settings > Family Pairing > Direct Messages",
          0.85,
        ),
      )
    }

    // Detect Search Restrictions
    const hasSearchRestriction = /search\s*restrict|discover|search\s*setting/i.test(pageContent)
    if (hasSearchRestriction) {
      capabilities.push(
        this.capability(
          "search_restriction",
          "Parents can turn off the Discover page and limit search functionality for their teen's account through Family Pairing.",
          "Settings > Family Pairing > Search",
          0.8,
        ),
      )
    }

    // Detect Parental Consent Gate
    const hasConsentGate = /family\s*pairing|parental?\s*consent|link\s*account/i.test(pageContent)
    if (hasConsentGate) {
      capabilities.push(
        this.capability(
          "parental_consent_gate",
          "Family Pairing requires a parent to link their TikTok account with their teen's account via QR code, establishing parental oversight.",
          "Settings > Family Pairing",
          0.85,
        ),
      )
    }

    // If page analysis couldn't find evidence, add known capabilities with lower confidence
    if (capabilities.length === 0) {
      capabilities.push(
        this.capability("screen_time_limit", "TikTok Digital Wellbeing screen time management", "Settings > Digital Wellbeing", 0.6),
        this.capability("content_filter", "TikTok Restricted Mode for content filtering", "Settings > Digital Wellbeing", 0.6),
        this.capability("dm_restriction", "TikTok Family Pairing DM restrictions", "Settings > Family Pairing", 0.6),
        this.capability("search_restriction", "TikTok search and Discover restrictions", "Settings > Family Pairing", 0.6),
        this.capability("parental_consent_gate", "TikTok Family Pairing linked accounts", "Settings > Family Pairing", 0.6),
      )
    }

    return {
      summary: "TikTok provides parental controls through Digital Wellbeing settings and Family Pairing. Features include screen time limits, Restricted Mode for content filtering, DM restrictions, and search controls.",
      parentalControlsFound: capabilities.length > 0,
      settingsLocation: "Settings > Digital Wellbeing / Family Pairing",
      capabilities,
      ageRestrictionOptions: ["Under 13 (no account)", "13-15 (restricted features)", "16-17 (most features)", "18+ (full access)"],
      contentFilteringOptions: ["Restricted Mode (on/off)", "Content Preferences", "Keyword filtering"],
      screenTimeLimits: true,
      purchaseControls: false,
      privacySettings: ["Private account", "Who can view videos", "Who can comment", "Who can duet/stitch"],
      rawNotes: `TikTok research conducted at: ${page.url()}\nPage content length: ${pageContent.length} chars`,
    }
  }
}
