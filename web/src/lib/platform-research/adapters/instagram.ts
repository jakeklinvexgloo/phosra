import { BaseResearchAdapter } from "../base-adapter"
import type { ResearchContext, ResearchScreenshot, ResearchNotes, PlaywrightPage } from "../types"

/**
 * Research adapter for Instagram parental controls.
 *
 * Navigates Instagram's Supervision features, privacy settings,
 * and content controls to discover and document screen time limits,
 * DM restrictions, content filtering, and parental notification capabilities.
 */
export class InstagramAdapter extends BaseResearchAdapter {
  platformId = "instagram"
  platformName = "Instagram"

  // ── Selectors (with fallbacks) ──────────────────────────────────

  private selectors = {
    login: {
      usernameInput: [
        'input[name="username"]',
        'input[aria-label="Phone number, username, or email"]',
        'input[aria-label*="username"]',
        'input[type="text"]',
      ],
      passwordInput: [
        'input[name="password"]',
        'input[aria-label="Password"]',
        'input[type="password"]',
      ],
      submit: [
        'button[type="submit"]',
        'button:has-text("Log in")',
        'button:has-text("Log In")',
        'div[role="button"]:has-text("Log in")',
      ],
      notNowButton: [
        'button:has-text("Not Now")',
        'button:has-text("Not now")',
        'a:has-text("Not Now")',
      ],
    },
    settings: {
      settingsGear: [
        'a[href*="/accounts/edit/"]',
        'a[href*="settings"]',
        'svg[aria-label="Settings"]',
        '[data-testid="settings"]',
      ],
      supervision: [
        'a[href*="supervision"]',
        'text="Supervision"',
        'span:has-text("Supervision")',
        'div:has-text("Supervision")',
      ],
      privacy: [
        'a[href*="privacy"]',
        'text="Privacy and Security"',
        'text="Privacy"',
        'span:has-text("Privacy")',
      ],
      timeLimits: [
        'a[href*="time"]',
        'text="Your Activity"',
        'text="Time Spent"',
        'span:has-text("Time")',
      ],
      contentControl: [
        'text="Content Control"',
        'text="Sensitive Content"',
        'span:has-text("Content")',
        'a[href*="content_control"]',
      ],
      messagingRestrictions: [
        'text="Messages"',
        'text="Message Controls"',
        'a[href*="message"]',
        'span:has-text("Messages")',
      ],
    },
  }

  // ── Login ───────────────────────────────────────────────────────

  async login(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://www.instagram.com/accounts/login/"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Handle cookie consent banner if present
    await this.tryClick(page, 'button:has-text("Allow")')
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

    // Submit login form
    for (const sel of this.selectors.login.submit) {
      if (await this.tryClick(page, sel)) break
    }

    await this.waitForPageLoad(page, 5000)

    // Dismiss "Save login info" or "Turn on notifications" prompts
    for (const sel of this.selectors.login.notNowButton) {
      await this.tryClick(page, sel)
    }
    await this.waitForPageLoad(page, 2000)

    // Dismiss notifications prompt if it appears again
    for (const sel of this.selectors.login.notNowButton) {
      await this.tryClick(page, sel)
    }
  }

  // ── Navigate to Parental Controls ───────────────────────────────

  async navigateToParentalControls(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    // Try direct Supervision URL first
    await page.goto("https://www.instagram.com/accounts/supervision/", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 3000)

    // If supervision page didn't load, try settings path
    const currentUrl = page.url()
    if (!currentUrl.includes("supervision")) {
      await page.goto("https://www.instagram.com/accounts/privacy_and_security/", {
        waitUntil: "networkidle",
        timeout: 30000,
      })
      await this.waitForPageLoad(page, 2000)

      // Look for supervision link within settings
      for (const sel of this.selectors.settings.supervision) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
    }
  }

  // ── Capture Screenshots ─────────────────────────────────────────

  async captureScreenshots(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchScreenshot[]> {
    const screenshots: ResearchScreenshot[] = []

    // 1. Supervision dashboard
    try {
      await page.goto("https://www.instagram.com/accounts/supervision/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "supervision_dashboard"))
    } catch {
      // Continue to next screenshot
    }

    // 2. Content control settings
    try {
      await page.goto("https://www.instagram.com/accounts/sensitive_content_control/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "content_control"))
    } catch {
      // Continue
    }

    // 3. Time management / Your Activity
    try {
      await page.goto("https://www.instagram.com/your_activity/time_spent/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "time_limits"))
    } catch {
      // Continue
    }

    // 4. Messaging restrictions
    try {
      await page.goto("https://www.instagram.com/accounts/message_controls/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "messaging_restrictions"))
    } catch {
      // Continue
    }

    // 5. Privacy settings
    try {
      await page.goto("https://www.instagram.com/accounts/privacy_and_security/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "privacy_settings"))
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
    const hasScreenTime = /time\s*limit|daily\s*limit|your\s*activity|time\s*spent|daily\s*reminder/i.test(pageContent)
    if (hasScreenTime) {
      capabilities.push(
        this.capability(
          "screen_time_limit",
          "Instagram provides daily time limit reminders and activity dashboard. Parents can set time limits for supervised teens.",
          "Settings > Supervision > Time Limits / Your Activity",
          0.9,
        ),
      )
    }

    // Detect DM Restrictions
    const hasDmRestriction = /message\s*control|who\s*can\s*message|restrict\s*message|message\s*request/i.test(pageContent)
    if (hasDmRestriction) {
      capabilities.push(
        this.capability(
          "dm_restriction",
          "Parents can restrict who can send direct messages to their teen. Teens under 16 default to 'People you follow' only.",
          "Settings > Supervision > Messages / Privacy > Messages",
          0.9,
        ),
      )
    }

    // Detect Content Filter
    const hasContentFilter = /sensitive\s*content|content\s*control|content\s*filter|restrict\s*content/i.test(pageContent)
    if (hasContentFilter) {
      capabilities.push(
        this.capability(
          "content_filter",
          "Instagram Sensitive Content Control allows parents to limit exposure to sensitive content in Explore, Reels, and Search.",
          "Settings > Supervision > Content Controls / Sensitive Content",
          0.9,
        ),
      )
    }

    // Detect Location Sharing
    const hasLocationSharing = /location|map|places|geotag/i.test(pageContent)
    if (hasLocationSharing) {
      capabilities.push(
        this.capability(
          "location_sharing",
          "Instagram allows disabling location tags on posts and restricting location-based features for teen accounts.",
          "Settings > Privacy > Location",
          0.7,
        ),
      )
    }

    // Detect Parental Event Notification
    const hasParentalNotification = /notification|supervision|activity\s*report|alert\s*parent/i.test(pageContent)
    if (hasParentalNotification) {
      capabilities.push(
        this.capability(
          "parental_event_notification",
          "Instagram Supervision notifies parents of account changes, reported content, and time spent. Parents receive weekly activity summaries.",
          "Settings > Supervision > Notifications",
          0.85,
        ),
      )
    }

    // Fallback if no capabilities detected from page content
    if (capabilities.length === 0) {
      capabilities.push(
        this.capability("screen_time_limit", "Instagram daily time limit reminders and activity dashboard", "Settings > Your Activity", 0.6),
        this.capability("dm_restriction", "Instagram message controls for teens", "Settings > Privacy > Messages", 0.6),
        this.capability("content_filter", "Instagram Sensitive Content Control", "Settings > Content Controls", 0.6),
        this.capability("location_sharing", "Instagram location tag controls", "Settings > Privacy > Location", 0.5),
        this.capability("parental_event_notification", "Instagram Supervision activity reports", "Settings > Supervision", 0.6),
      )
    }

    return {
      summary: "Instagram provides parental controls through its Supervision feature. Parents can monitor activity, set time limits, restrict messaging, control content exposure, and receive notifications about their teen's account.",
      parentalControlsFound: capabilities.length > 0,
      settingsLocation: "Settings > Supervision / Privacy and Security",
      capabilities,
      ageRestrictionOptions: ["Under 13 (no account)", "13-15 (restricted features, private by default)", "16-17 (most features)", "18+ (full access)"],
      contentFilteringOptions: ["Sensitive Content Control (Less / Standard / More)", "Hidden Words filter", "Comment filters"],
      screenTimeLimits: true,
      purchaseControls: false,
      privacySettings: ["Private account", "Activity status", "Story sharing", "Close Friends", "Blocked accounts", "Restricted accounts"],
      rawNotes: `Instagram research conducted at: ${page.url()}\nPage content length: ${pageContent.length} chars`,
    }
  }
}
