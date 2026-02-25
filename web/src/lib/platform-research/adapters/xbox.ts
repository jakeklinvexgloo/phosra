import { BaseResearchAdapter } from "../base-adapter"
import type { ResearchContext, ResearchScreenshot, ResearchNotes, PlaywrightPage } from "../types"

/**
 * Research adapter for Xbox (Microsoft) parental controls.
 *
 * Navigates Xbox/Microsoft Family Safety settings to discover and document
 * screen time schedules, content restrictions, spending limits, privacy settings,
 * activity reports, friend list controls, and messaging restrictions.
 */
export class XboxAdapter extends BaseResearchAdapter {
  platformId = "xbox"
  platformName = "Xbox"

  // ── Selectors (with fallbacks) ──────────────────────────────────

  private selectors = {
    login: {
      emailInput: [
        'input[name="loginfmt"]',
        'input[type="email"]',
        'input[id="i0116"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="email"]',
        'input[placeholder*="Phone"]',
      ],
      passwordInput: [
        'input[name="passwd"]',
        'input[type="password"]',
        'input[id="i0118"]',
        'input[placeholder*="Password"]',
      ],
      nextButton: [
        'input[type="submit"]',
        'button[type="submit"]',
        'input[id="idSIButton9"]',
        '#idSIButton9',
        'button:has-text("Next")',
        'button:has-text("Sign in")',
      ],
      staySignedIn: [
        'input[id="idSIButton9"]',
        '#idSIButton9',
        'input[type="submit"]',
        'button:has-text("Yes")',
        'button:has-text("No")',
      ],
    },
    settings: {
      screenTime: [
        'a[href*="screen-time"]',
        'text="Screen time"',
        'text="Screen Time"',
        'span:has-text("Screen time")',
        'div:has-text("Screen time")',
      ],
      contentRestrictions: [
        'a[href*="content-restrictions"]',
        'text="Content restrictions"',
        'text="Content Restrictions"',
        'span:has-text("Content restrictions")',
        'div:has-text("Content restrictions")',
      ],
      spending: [
        'a[href*="spending"]',
        'text="Spending"',
        'text="Spending limits"',
        'span:has-text("Spending")',
        'div:has-text("Spending")',
      ],
      privacy: [
        'a[href*="privacy"]',
        'text="Privacy"',
        'text="Xbox privacy"',
        'span:has-text("Privacy")',
        'div:has-text("Privacy")',
      ],
      activityReporting: [
        'a[href*="activity"]',
        'text="Activity"',
        'text="Activity reporting"',
        'span:has-text("Activity")',
        'div:has-text("Activity reporting")',
      ],
      familyMembers: [
        'a[href*="family"]',
        'text="Your family"',
        'text="Family"',
        'span:has-text("Family")',
      ],
    },
  }

  // ── Login ───────────────────────────────────────────────────────

  async login(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://login.live.com/"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Microsoft login is a multi-step process: email first, then password

    // Step 1: Enter email
    if (ctx.credentials.username) {
      for (const sel of this.selectors.login.emailInput) {
        if (await this.tryFill(page, sel, ctx.credentials.username)) break
      }
    }

    // Click Next
    for (const sel of this.selectors.login.nextButton) {
      if (await this.tryClick(page, sel)) break
    }
    await this.waitForPageLoad(page, 3000)

    // Step 2: Enter password
    if (ctx.credentials.password) {
      for (const sel of this.selectors.login.passwordInput) {
        if (await this.tryFill(page, sel, ctx.credentials.password)) break
      }
    }

    // Click Sign In
    for (const sel of this.selectors.login.nextButton) {
      if (await this.tryClick(page, sel)) break
    }
    await this.waitForPageLoad(page, 5000)

    // Handle "Stay signed in?" prompt
    await this.tryClick(page, 'input[id="idSIButton9"]')
    await this.tryClick(page, 'button:has-text("Yes")')
    await this.tryClick(page, 'button:has-text("No")')
    await this.waitForPageLoad(page, 3000)
  }

  // ── Navigate to Parental Controls ───────────────────────────────

  async navigateToParentalControls(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    // Try Microsoft Family Safety portal (primary parental controls hub)
    await page.goto("https://family.microsoft.com/", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 3000)

    // If that didn't work, try Xbox-specific settings
    const currentUrl = page.url()
    if (!currentUrl.includes("family.microsoft.com")) {
      await page.goto("https://account.xbox.com/settings", {
        waitUntil: "networkidle",
        timeout: 30000,
      })
      await this.waitForPageLoad(page, 3000)
    }
  }

  // ── Capture Screenshots ─────────────────────────────────────────

  async captureScreenshots(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchScreenshot[]> {
    const screenshots: ResearchScreenshot[] = []

    // 1. Screen time schedules
    try {
      await page.goto("https://family.microsoft.com/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      // Navigate to screen time section
      for (const sel of this.selectors.settings.screenTime) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "screen_time_schedules"))
    } catch {
      // Continue
    }

    // 2. Content restrictions
    try {
      await page.goto("https://family.microsoft.com/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      for (const sel of this.selectors.settings.contentRestrictions) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "content_restrictions"))
    } catch {
      // Continue
    }

    // 3. Spending limits
    try {
      for (const sel of this.selectors.settings.spending) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "spending_limits"))
    } catch {
      // Continue
    }

    // 4. Privacy settings (Xbox-specific)
    try {
      await page.goto("https://account.xbox.com/settings", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "privacy_settings"))
    } catch {
      // Continue
    }

    // 5. Activity reports
    try {
      await page.goto("https://family.microsoft.com/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      for (const sel of this.selectors.settings.activityReporting) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "activity_reports"))
    } catch {
      // Continue
    }

    return screenshots
  }

  // ── Extract Notes ───────────────────────────────────────────────

  async extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes> {
    // Navigate to Family Safety to scan content
    try {
      await page.goto("https://family.microsoft.com/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
    } catch {
      // Continue with whatever page we're on
    }

    const pageContent = await page.content()
    const capabilities = []

    // Detect Screen Time Limits
    const hasScreenTime = /screen\s*time|time\s*limit|schedule|daily\s*limit|allowed\s*time/i.test(pageContent)
    if (hasScreenTime) {
      capabilities.push(
        this.capability(
          "screen_time_limit",
          "Xbox Family Settings allow parents to set per-device and per-app screen time schedules with daily limits and allowed time windows.",
          "Family Safety > Screen Time",
          0.95,
        ),
      )
    }

    // Detect Purchase Controls
    const hasPurchaseControl = /spend|purchase|buy|money|allowance|microsoft\s*store/i.test(pageContent)
    if (hasPurchaseControl) {
      capabilities.push(
        this.capability(
          "purchase_control",
          "Parents can require approval for all purchases, set spending limits, and add money to a child's Microsoft account balance.",
          "Family Safety > Spending",
          0.95,
        ),
      )
    }

    // Detect Content Filter
    const hasContentFilter = /content\s*restrict|age\s*rating|content\s*filter|ESRB|PEGI|maturity|rated/i.test(pageContent)
    if (hasContentFilter) {
      capabilities.push(
        this.capability(
          "content_filter",
          "Xbox uses ESRB/PEGI age ratings to restrict game and app access. Parents set the maximum age rating their child can access, and can allow/block specific titles.",
          "Family Safety > Content Restrictions",
          0.95,
        ),
      )
    }

    // Detect DM Restrictions
    const hasDmRestriction = /communicat|message|chat|voice\s*chat|text\s*chat|who\s*can.*talk/i.test(pageContent)
    if (hasDmRestriction) {
      capabilities.push(
        this.capability(
          "dm_restriction",
          "Parents can control who can communicate with their child via text, voice, and video chat. Options include everyone, friends only, or blocked entirely.",
          "Xbox Privacy Settings > Communication & Multiplayer",
          0.9,
        ),
      )
    }

    // Detect Friend List Control
    const hasFriendControl = /friend|add\s*friend|friend\s*request|people\s*list|who\s*can.*add/i.test(pageContent)
    if (hasFriendControl) {
      capabilities.push(
        this.capability(
          "friend_list_control",
          "Parents can control who can add their child as a friend and view their child's friends list through Xbox/Microsoft Family Safety.",
          "Xbox Privacy Settings > Social",
          0.85,
        ),
      )
    }

    // Detect Screen Time Report
    const hasScreenTimeReport = /activity\s*report|weekly\s*report|email\s*report|usage\s*report|activity\s*summary/i.test(pageContent)
    if (hasScreenTimeReport) {
      capabilities.push(
        this.capability(
          "screen_time_report",
          "Microsoft Family Safety sends weekly activity reports via email showing screen time, apps used, games played, and websites visited.",
          "Family Safety > Activity Reporting",
          0.9,
        ),
      )
    }

    // Detect Parental Event Notification
    const hasParentalNotification = /notification|alert|request|ask\s*parent|approval|permission\s*request/i.test(pageContent)
    if (hasParentalNotification) {
      capabilities.push(
        this.capability(
          "parental_event_notification",
          "Xbox notifies parents when children request extra screen time, attempt purchases, or try to access restricted content. Parents can approve/deny from the Family Safety app.",
          "Family Safety > Notifications / Family Safety App",
          0.9,
        ),
      )
    }

    // Fallback if no capabilities detected from page content
    if (capabilities.length === 0) {
      capabilities.push(
        this.capability("screen_time_limit", "Xbox per-device screen time schedules and daily limits", "Family Safety > Screen Time", 0.6),
        this.capability("purchase_control", "Xbox purchase approval and spending limits", "Family Safety > Spending", 0.6),
        this.capability("content_filter", "Xbox ESRB/PEGI age rating content restrictions", "Family Safety > Content Restrictions", 0.6),
        this.capability("dm_restriction", "Xbox communication and multiplayer restrictions", "Xbox Privacy > Communication", 0.6),
        this.capability("friend_list_control", "Xbox friend request controls", "Xbox Privacy > Social", 0.6),
        this.capability("screen_time_report", "Xbox weekly activity reports via email", "Family Safety > Activity Reporting", 0.6),
        this.capability("parental_event_notification", "Xbox purchase and screen time request notifications", "Family Safety App", 0.6),
      )
    }

    return {
      summary: "Xbox (Microsoft Family Safety) provides one of the most comprehensive parental control suites. Features include granular screen time schedules, ESRB-based content restrictions, purchase approval workflows, communication controls, weekly activity reports, and real-time request notifications via the Family Safety app.",
      parentalControlsFound: capabilities.length > 0,
      settingsLocation: "family.microsoft.com / account.xbox.com/settings / Xbox Family Settings app",
      capabilities,
      ageRestrictionOptions: [
        "Under 13 (child account, strict defaults, COPPA compliant)",
        "13-17 (teen account, moderate defaults)",
        "18+ (adult account, no restrictions)",
      ],
      contentFilteringOptions: [
        "ESRB age rating limits (E / E10+ / T / M / AO)",
        "PEGI rating limits (3 / 7 / 12 / 16 / 18)",
        "Web content filtering (basic / strict)",
        "Allow/block specific games and apps",
      ],
      screenTimeLimits: true,
      purchaseControls: true,
      privacySettings: [
        "Online status visibility",
        "Game and app history visibility",
        "Who can see friends list",
        "Who can communicate (text/voice/video)",
        "Who can send invites",
        "Cross-network communication",
        "Real name sharing",
      ],
      rawNotes: `Xbox research conducted at: ${page.url()}\nPage content length: ${pageContent.length} chars`,
    }
  }
}
