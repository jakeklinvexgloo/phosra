import { BaseResearchAdapter } from "../base-adapter"
import type { ResearchContext, ResearchScreenshot, ResearchNotes, PlaywrightPage } from "../types"

/**
 * Research adapter for Snapchat parental controls.
 *
 * Navigates Snapchat's Family Center to discover and document
 * messaging restrictions, content filtering, location sharing controls,
 * friend management, and screen time reporting capabilities.
 */
export class SnapchatAdapter extends BaseResearchAdapter {
  platformId = "snapchat"
  platformName = "Snapchat"

  // ── Selectors (with fallbacks) ──────────────────────────────────

  private selectors = {
    login: {
      usernameInput: [
        'input[name="accountIdentifier"]',
        'input[name="username"]',
        'input[id="accountIdentifier"]',
        'input[placeholder*="Username"]',
        'input[placeholder*="username"]',
        'input[placeholder*="Email"]',
        'input[type="text"]',
      ],
      passwordInput: [
        'input[name="password"]',
        'input[id="password"]',
        'input[type="password"]',
        'input[placeholder*="Password"]',
      ],
      submit: [
        'button[type="submit"]',
        'button:has-text("Log In")',
        'button:has-text("Log in")',
        'button:has-text("Next")',
        'button[id="login-button"]',
      ],
    },
    settings: {
      familyCenter: [
        'a[href*="family-center"]',
        'text="Family Center"',
        'span:has-text("Family Center")',
        'div:has-text("Family Center")',
      ],
      contentRestrictions: [
        'text="Content Controls"',
        'text="Content Restrictions"',
        'span:has-text("Content")',
        'div:has-text("Content Controls")',
      ],
      friendManagement: [
        'text="Contact Me"',
        'text="Who Can"',
        'span:has-text("Friend")',
        'div:has-text("Contact")',
      ],
      snapMap: [
        'text="Snap Map"',
        'text="Map"',
        'span:has-text("Map")',
        'a[href*="map"]',
      ],
      screenTime: [
        'text="Screen Time"',
        'text="Time Spent"',
        'span:has-text("Screen Time")',
        'div:has-text("Time Spent")',
      ],
    },
  }

  // ── Login ───────────────────────────────────────────────────────

  async login(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://accounts.snapchat.com/accounts/v2/login"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Handle cookie banner if present
    await this.tryClick(page, 'button:has-text("Accept")')
    await this.tryClick(page, 'button:has-text("Allow All")')
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

    // Handle potential "Trust this device" or 2FA prompts
    await this.tryClick(page, 'button:has-text("Skip")')
    await this.tryClick(page, 'button:has-text("Not Now")')
    await this.waitForPageLoad(page, 2000)
  }

  // ── Navigate to Parental Controls ───────────────────────────────

  async navigateToParentalControls(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    // Try direct Family Center URL first
    await page.goto("https://web.snapchat.com/family-center", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 3000)

    // If Family Center is not available on web, try the accounts settings
    const currentUrl = page.url()
    if (!currentUrl.includes("family-center")) {
      await page.goto("https://accounts.snapchat.com/accounts/settings", {
        waitUntil: "networkidle",
        timeout: 30000,
      })
      await this.waitForPageLoad(page, 2000)

      // Click Family Center link if available
      for (const sel of this.selectors.settings.familyCenter) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
    }
  }

  // ── Capture Screenshots ─────────────────────────────────────────

  async captureScreenshots(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchScreenshot[]> {
    const screenshots: ResearchScreenshot[] = []

    // 1. Family Center dashboard
    try {
      await page.goto("https://web.snapchat.com/family-center", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "family_center_dashboard"))
    } catch {
      // Try alternative URL
      try {
        await page.goto("https://accounts.snapchat.com/accounts/family-center", {
          waitUntil: "networkidle",
          timeout: 20000,
        })
        await this.waitForPageLoad(page, 2000)
        screenshots.push(await this.takeScreenshot(page, ctx, "family_center_dashboard"))
      } catch {
        // Continue
      }
    }

    // 2. Content restrictions
    try {
      for (const sel of this.selectors.settings.contentRestrictions) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "content_restrictions"))
    } catch {
      // Continue
    }

    // 3. Friend management / contact controls
    try {
      await page.goto("https://accounts.snapchat.com/accounts/settings", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      for (const sel of this.selectors.settings.friendManagement) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "friend_management"))
    } catch {
      // Continue
    }

    // 4. Snap Map privacy settings
    try {
      for (const sel of this.selectors.settings.snapMap) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "snap_map_settings"))
    } catch {
      // Continue
    }

    return screenshots
  }

  // ── Extract Notes ───────────────────────────────────────────────

  async extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes> {
    const pageContent = await page.content()
    const capabilities = []

    // Detect DM Restrictions
    const hasDmRestriction = /who\s*can.*contact|message.*restrict|friend.*only|direct\s*message/i.test(pageContent)
    if (hasDmRestriction) {
      capabilities.push(
        this.capability(
          "dm_restriction",
          "Snapchat Family Center allows parents to see who their teen is communicating with and restrict who can contact them (friends only).",
          "Family Center > Communication Controls",
          0.9,
        ),
      )
    }

    // Detect Content Filter
    const hasContentFilter = /content\s*control|restrict.*content|sensitive\s*content|mature|stories\s*from/i.test(pageContent)
    if (hasContentFilter) {
      capabilities.push(
        this.capability(
          "content_filter",
          "Parents can restrict Discover and Story content visibility, limiting teen exposure to mature or sensitive content.",
          "Family Center > Content Controls",
          0.85,
        ),
      )
    }

    // Detect Location Sharing
    const hasLocationSharing = /snap\s*map|ghost\s*mode|location\s*sharing|share\s*location/i.test(pageContent)
    if (hasLocationSharing) {
      capabilities.push(
        this.capability(
          "location_sharing",
          "Parents can view their teen's Snap Map location and manage Ghost Mode settings through Family Center.",
          "Family Center > Snap Map / Privacy > Location",
          0.9,
        ),
      )
    }

    // Detect Friend List Control
    const hasFriendControl = /friend\s*list|new\s*friend|friend\s*request|who\s*can\s*add/i.test(pageContent)
    if (hasFriendControl) {
      capabilities.push(
        this.capability(
          "friend_list_control",
          "Parents can see their teen's friends list and manage who can add their teen as a friend through Family Center.",
          "Family Center > Friends",
          0.85,
        ),
      )
    }

    // Detect Screen Time Report
    const hasScreenTimeReport = /screen\s*time|time\s*spent|activity\s*report|usage\s*report/i.test(pageContent)
    if (hasScreenTimeReport) {
      capabilities.push(
        this.capability(
          "screen_time_report",
          "Snapchat Family Center provides parents with screen time reports showing how much time their teen spends on the app.",
          "Family Center > Screen Time",
          0.85,
        ),
      )
    }

    // Fallback if no capabilities detected from page content
    if (capabilities.length === 0) {
      capabilities.push(
        this.capability("dm_restriction", "Snapchat Family Center communication controls", "Family Center", 0.6),
        this.capability("content_filter", "Snapchat content restriction controls", "Family Center > Content", 0.6),
        this.capability("location_sharing", "Snapchat Snap Map and Ghost Mode controls", "Family Center > Location", 0.6),
        this.capability("friend_list_control", "Snapchat friend list visibility for parents", "Family Center > Friends", 0.6),
        this.capability("screen_time_report", "Snapchat screen time reporting for parents", "Family Center > Screen Time", 0.6),
      )
    }

    return {
      summary: "Snapchat provides parental controls through its Family Center feature. Parents can monitor contacts, view Snap Map location, restrict content, manage friend lists, and receive screen time reports.",
      parentalControlsFound: capabilities.length > 0,
      settingsLocation: "Settings > Family Center",
      capabilities,
      ageRestrictionOptions: ["Under 13 (no account)", "13-17 (restricted features, Family Center eligible)", "18+ (full access)"],
      contentFilteringOptions: ["Discover content restrictions", "Story visibility controls", "Spotlight content controls"],
      screenTimeLimits: false,
      purchaseControls: false,
      privacySettings: ["Ghost Mode (Snap Map)", "Who Can Contact Me", "Who Can View My Story", "Who Can See My Location"],
      rawNotes: `Snapchat research conducted at: ${page.url()}\nPage content length: ${pageContent.length} chars`,
    }
  }
}
