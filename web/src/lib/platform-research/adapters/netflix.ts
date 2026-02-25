import { BaseResearchAdapter } from "../base-adapter"
import type {
  ResearchContext,
  ResearchScreenshot,
  ResearchNotes,
  PlaywrightPage,
} from "../types"

/**
 * Netflix research adapter.
 *
 * Navigates Netflix's login flow, profile maturity settings, PIN configuration,
 * title restrictions, and viewing activity to catalog parental control capabilities.
 */
export class NetflixAdapter extends BaseResearchAdapter {
  platformId = "netflix"
  platformName = "Netflix"

  // ── Login ────────────────────────────────────────────────────────

  async login(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://www.netflix.com/login"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Netflix may show a "Sign In" landing before the actual form
    await this.tryClick(page, 'a[href*="/login"]')
    await this.waitForPageLoad(page, 1500)

    // Fill email / phone field — Netflix uses multiple possible selectors
    const emailFilled =
      (await this.tryFill(page, 'input[name="userLoginId"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, 'input[id="id_userLoginId"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, 'input[data-uia="login-field"]', ctx.credentials.username ?? ""))

    if (!emailFilled) {
      throw new Error("Netflix: could not locate email/phone input on login page")
    }

    // Fill password
    const passwordFilled =
      (await this.tryFill(page, 'input[name="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[id="id_password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[data-uia="password-field"]', ctx.credentials.password ?? ""))

    if (!passwordFilled) {
      throw new Error("Netflix: could not locate password input on login page")
    }

    // Click Sign In
    const signedIn =
      (await this.tryClick(page, 'button[data-uia="login-submit-button"]')) ||
      (await this.tryClick(page, 'button[type="submit"]')) ||
      (await this.tryClick(page, 'button:has-text("Sign In")'))

    if (!signedIn) {
      throw new Error("Netflix: could not locate Sign In button")
    }

    await this.waitForPageLoad(page, 5000)

    // Handle profile picker — select the first (main) profile
    const profileClicked =
      (await this.tryClick(page, '.profile-link:first-child')) ||
      (await this.tryClick(page, '[data-profile-guid]:first-child')) ||
      (await this.tryClick(page, '.choose-profile .profile:first-child'))

    if (profileClicked) {
      await this.waitForPageLoad(page, 3000)
    }
  }

  // ── Navigate to Parental Controls ────────────────────────────────

  async navigateToParentalControls(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const controlsUrl =
      ctx.credentials.parentalControlsUrl ??
      "https://www.netflix.com/settings/parental-controls"

    await page.goto(controlsUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Netflix may require re-entering the password to access maturity settings
    const passwordGate =
      (await this.tryFill(page, 'input[id="id_password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[name="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[type="password"]', ctx.credentials.password ?? ""))

    if (passwordGate) {
      const confirmClicked =
        (await this.tryClick(page, 'button[type="submit"]')) ||
        (await this.tryClick(page, 'button:has-text("Continue")'))

      if (confirmClicked) {
        await this.waitForPageLoad(page, 3000)
      }
    }
  }

  // ── Capture Screenshots ──────────────────────────────────────────

  async captureScreenshots(
    ctx: ResearchContext,
    page: PlaywrightPage,
  ): Promise<ResearchScreenshot[]> {
    const screenshots: ResearchScreenshot[] = []

    // 1. Profile maturity settings overview
    screenshots.push(await this.takeScreenshot(page, ctx, "profile_maturity_settings"))

    // 2. Navigate to PIN settings (if available)
    const pinClicked =
      (await this.tryClick(page, 'a[href*="pin"]')) ||
      (await this.tryClick(page, 'button:has-text("Profile Lock")')) ||
      (await this.tryClick(page, '[data-uia="profile-lock"]'))

    if (pinClicked) {
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "pin_settings"))
      await page.goto(
        ctx.credentials.parentalControlsUrl ?? "https://www.netflix.com/settings/parental-controls",
        { waitUntil: "networkidle", timeout: 30000 },
      )
      await this.waitForPageLoad(page, 2000)
    }

    // 3. Expand a profile to see title restrictions
    const profileExpanded =
      (await this.tryClick(page, '.profile-header:first-child')) ||
      (await this.tryClick(page, '[data-uia="profile-section"]:first-child')) ||
      (await this.tryClick(page, '.accordion-header:first-child'))

    if (profileExpanded) {
      await this.waitForPageLoad(page, 1500)
      screenshots.push(await this.takeScreenshot(page, ctx, "title_restrictions"))
    }

    // 4. Viewing activity
    await page.goto("https://www.netflix.com/viewingactivity", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 2000)
    screenshots.push(await this.takeScreenshot(page, ctx, "viewing_activity"))

    return screenshots
  }

  // ── Extract Notes ────────────────────────────────────────────────

  async extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes> {
    const notes = this.emptyNotes("Netflix parental controls research")
    notes.parentalControlsFound = true
    notes.settingsLocation = "https://www.netflix.com/settings/parental-controls"

    // Content maturity levels
    notes.ageRestrictionOptions = [
      "Little Kids (G, TV-Y, TV-G)",
      "Older Kids (PG, TV-Y7, TV-Y7-FV, TV-G, TV-PG)",
      "Teens (PG-13, TV-14)",
      "All Maturity Ratings (R, NC-17, TV-MA)",
    ]

    notes.contentFilteringOptions = [
      "Maturity rating per profile",
      "Title-specific restrictions",
      "Auto-play controls",
    ]

    notes.purchaseControls = true // PIN required to access restricted profiles
    notes.screenTimeLimits = false // Netflix does not offer native screen-time limits

    notes.privacySettings = [
      "Viewing activity per profile",
      "Profile lock (PIN)",
      "Profile transfer option",
    ]

    notes.capabilities = [
      this.capability(
        "content_filter",
        "Per-profile maturity rating filter with four tiers: Little Kids, Older Kids, Teens, All Maturity Ratings. Also supports blocking individual titles by name.",
        "Account > Profile & Parental Controls > [Profile] > Viewing Restrictions",
        0.95,
      ),
      this.capability(
        "purchase_control",
        "Profile Lock (PIN): requires a 4-digit PIN to access a specific profile, preventing children from switching to an unrestricted profile.",
        "Account > Profile & Parental Controls > [Profile] > Profile Lock",
        0.90,
      ),
      this.capability(
        "screen_time_report",
        "Viewing Activity page shows a chronological history of titles watched per profile, including date/time. No real-time alerts or weekly summaries.",
        "Account > Profile & Parental Controls > [Profile] > Viewing Activity",
        0.70,
      ),
      this.capability(
        "age_gate",
        "Profile maturity level acts as an age gate: content beyond the selected rating is hidden from that profile entirely.",
        "Account > Profile & Parental Controls > [Profile] > Maturity Rating",
        0.90,
      ),
    ]

    notes.rawNotes = [
      "Netflix parental controls are profile-based rather than account-wide.",
      "Each profile can be set to a maturity level: Little Kids, Older Kids, Teens, or All.",
      "Specific titles can be blocked by name regardless of rating.",
      "Profile Lock requires a 4-digit PIN to switch into a profile.",
      "Kids profiles have a simplified UI and are restricted to G/TV-Y content.",
      "Viewing activity is available per profile but there is no screen time limit feature.",
      "Auto-play next episode and auto-play previews can be toggled per profile.",
    ].join("\n")

    return notes
  }
}
