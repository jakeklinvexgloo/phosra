import { BaseResearchAdapter } from "../base-adapter"
import type {
  ResearchContext,
  ResearchScreenshot,
  ResearchNotes,
  PlaywrightPage,
} from "../types"

/**
 * YouTube / YouTube Kids research adapter.
 *
 * Logs in via Google, navigates Restricted Mode, Family Link integration,
 * supervised account settings, and watch history to catalog parental controls.
 */
export class YouTubeAdapter extends BaseResearchAdapter {
  platformId = "youtube"
  platformName = "YouTube"

  // ── Login ────────────────────────────────────────────────────────

  async login(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://accounts.google.com/signin"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Step 1: Enter email / phone
    const emailFilled =
      (await this.tryFill(page, 'input[type="email"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, '#identifierId', ctx.credentials.username ?? ""))

    if (!emailFilled) {
      throw new Error("YouTube/Google: could not locate email input")
    }

    // Click Next
    const nextClicked =
      (await this.tryClick(page, '#identifierNext button')) ||
      (await this.tryClick(page, '#identifierNext')) ||
      (await this.tryClick(page, 'button:has-text("Next")'))

    if (!nextClicked) {
      throw new Error("YouTube/Google: could not click Next after email")
    }

    await this.waitForPageLoad(page, 3000)

    // Step 2: Enter password
    const passwordFilled =
      (await this.tryFill(page, 'input[type="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[name="Passwd"]', ctx.credentials.password ?? ""))

    if (!passwordFilled) {
      throw new Error("YouTube/Google: could not locate password input")
    }

    // Click Next
    const passNextClicked =
      (await this.tryClick(page, '#passwordNext button')) ||
      (await this.tryClick(page, '#passwordNext')) ||
      (await this.tryClick(page, 'button:has-text("Next")'))

    if (!passNextClicked) {
      throw new Error("YouTube/Google: could not click Next after password")
    }

    await this.waitForPageLoad(page, 5000)

    // Handle possible 2-Step Verification prompt (TOTP)
    if (ctx.credentials.totpSecret) {
      // If the adapter caller has provided a TOTP secret, a higher-level script
      // should have generated the current code and placed it in extra.totpCode
      const totpCode = ctx.credentials.extra?.totpCode
      if (totpCode) {
        const totpFilled =
          (await this.tryFill(page, 'input[name="totpPin"]', totpCode)) ||
          (await this.tryFill(page, '#totpPin', totpCode)) ||
          (await this.tryFill(page, 'input[type="tel"]', totpCode))

        if (totpFilled) {
          await this.tryClick(page, '#totpNext button')
          await this.waitForPageLoad(page, 3000)
        }
      }
    }

    // Navigate to YouTube to ensure we are on the right domain
    await page.goto("https://www.youtube.com", { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)
  }

  // ── Navigate to Parental Controls ────────────────────────────────

  async navigateToParentalControls(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const controlsUrl =
      ctx.credentials.parentalControlsUrl ??
      "https://families.google.com/families"

    await page.goto(controlsUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // If Google redirects to a sign-in again, try continuing
    const currentUrl = page.url()
    if (currentUrl.includes("accounts.google.com")) {
      // Already authenticated — just wait for redirect
      await this.waitForPageLoad(page, 5000)
    }
  }

  // ── Capture Screenshots ──────────────────────────────────────────

  async captureScreenshots(
    ctx: ResearchContext,
    page: PlaywrightPage,
  ): Promise<ResearchScreenshot[]> {
    const screenshots: ResearchScreenshot[] = []

    // 1. Family Link overview (families.google.com)
    screenshots.push(await this.takeScreenshot(page, ctx, "family_link_overview"))

    // 2. YouTube Restricted Mode settings
    await page.goto("https://www.youtube.com/account", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 2000)
    screenshots.push(await this.takeScreenshot(page, ctx, "youtube_account_settings"))

    // 3. Restricted Mode toggle — click profile icon, then Restricted Mode
    await page.goto("https://www.youtube.com", { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 2000)

    // Open avatar menu
    const avatarClicked =
      (await this.tryClick(page, '#avatar-btn')) ||
      (await this.tryClick(page, 'button[aria-label="Account"]')) ||
      (await this.tryClick(page, 'button#button[aria-label]'))

    if (avatarClicked) {
      await this.waitForPageLoad(page, 1500)

      // Click Restricted Mode item
      const restrictedClicked =
        (await this.tryClick(page, 'yt-multi-page-menu-section-renderer a[href*="restricted"]')) ||
        (await this.tryClick(page, 'tp-yt-paper-item:has-text("Restricted Mode")')) ||
        (await this.tryClick(page, 'ytd-toggle-theme-compact-link-renderer:last-child'))

      if (restrictedClicked) {
        await this.waitForPageLoad(page, 1500)
      }

      screenshots.push(await this.takeScreenshot(page, ctx, "restricted_mode_settings"))
    }

    // 4. Content settings / supervised experience page
    await page.goto("https://families.google.com/supervision/settings", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 2000)
    screenshots.push(await this.takeScreenshot(page, ctx, "supervision_content_settings"))

    // 5. Watch history
    await page.goto("https://www.youtube.com/feed/history", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 2000)
    screenshots.push(await this.takeScreenshot(page, ctx, "watch_history"))

    return screenshots
  }

  // ── Extract Notes ────────────────────────────────────────────────

  async extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes> {
    const notes = this.emptyNotes("YouTube parental controls research")
    notes.parentalControlsFound = true
    notes.settingsLocation = "https://families.google.com + YouTube Restricted Mode"

    notes.ageRestrictionOptions = [
      "YouTube Kids (preschool, younger, older)",
      "Supervised Experience — Explore (9+)",
      "Supervised Experience — Explore More (13+)",
      "Supervised Experience — Most of YouTube (with some filtering)",
      "Restricted Mode (account-level toggle)",
    ]

    notes.contentFilteringOptions = [
      "Restricted Mode (hides potentially mature content)",
      "Supervised account content tiers",
      "YouTube Kids app with curated content",
      "Block individual channels",
      "Approve-only mode in YouTube Kids",
    ]

    notes.screenTimeLimits = true // via Google Family Link
    notes.purchaseControls = false // YouTube itself has no purchase controls (handled at Google Play level)

    notes.privacySettings = [
      "Watch history per account",
      "Search history per account",
      "Ad personalization controls",
      "Data sharing controls via Google Account",
    ]

    notes.capabilities = [
      this.capability(
        "content_filter",
        "Restricted Mode hides potentially mature content site-wide. Supervised accounts offer three content tiers: Explore (9+), Explore More (13+), and Most of YouTube. YouTube Kids has curated content with approve-only option.",
        "YouTube > Settings > Restricted Mode; Family Link > YouTube Settings",
        0.95,
      ),
      this.capability(
        "screen_time_limit",
        "Google Family Link allows parents to set daily screen time limits, schedule device downtime, and set app-specific time limits that apply to YouTube.",
        "Family Link > Screen time > App limits",
        0.85,
      ),
      this.capability(
        "search_restriction",
        "YouTube Kids allows disabling search entirely. Supervised accounts can restrict search results based on content tier. Restricted Mode filters search results.",
        "YouTube Kids Settings > Search; Family Link > YouTube Settings",
        0.90,
      ),
      this.capability(
        "age_gate",
        "Supervised accounts enforce age-based content tiers. YouTube Kids separates children into preschool, younger (5-8), and older (9-12) brackets with corresponding content libraries.",
        "Family Link > YouTube Settings > Content settings",
        0.90,
      ),
      this.capability(
        "parental_consent_gate",
        "Google requires parental consent to create supervised accounts for children under 13. Parents must use their own Google account to set up and approve the child account.",
        "Family Link > Add child account flow",
        0.85,
      ),
    ]

    notes.rawNotes = [
      "YouTube parental controls span multiple products: YouTube main, YouTube Kids, and Google Family Link.",
      "Restricted Mode is a simple on/off toggle that filters potentially mature content; it can be locked per browser.",
      "Supervised accounts (via Family Link) provide granular content tiers: Explore (9+), Explore More (13+), Most of YouTube.",
      "YouTube Kids offers curated, age-appropriate content in three buckets: preschool, younger, older.",
      "In YouTube Kids, search can be disabled entirely and parents can approve-only mode.",
      "Family Link provides screen time limits, app timers, and device bedtime scheduling.",
      "Watch and search history are visible per account.",
      "Autoplay can be disabled in YouTube Kids but not locked off in main YouTube.",
      "Comments are disabled by default on videos identified as made for kids.",
      "Live chat is disabled on kids content.",
    ].join("\n")

    return notes
  }
}
