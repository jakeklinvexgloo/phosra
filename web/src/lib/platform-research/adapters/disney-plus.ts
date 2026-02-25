import { BaseResearchAdapter } from "../base-adapter"
import type {
  ResearchContext,
  ResearchScreenshot,
  ResearchNotes,
  PlaywrightPage,
} from "../types"

/**
 * Disney+ research adapter.
 *
 * Navigates Disney+ login, profile-level content ratings, Kids profile mode,
 * PIN protection, and GroupWatch settings to catalog parental controls.
 */
export class DisneyPlusAdapter extends BaseResearchAdapter {
  platformId = "disney-plus"
  platformName = "Disney+"

  // ── Login ────────────────────────────────────────────────────────

  async login(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://www.disneyplus.com/login"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Disney+ sometimes shows a "Log in" CTA before the actual form
    await this.tryClick(page, 'a[href*="/login"]')
    await this.waitForPageLoad(page, 1500)

    // Step 1: Enter email
    const emailFilled =
      (await this.tryFill(page, 'input[type="email"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, 'input[id="email"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, 'input[data-testid="email-input"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, 'input[name="email"]', ctx.credentials.username ?? ""))

    if (!emailFilled) {
      throw new Error("Disney+: could not locate email input on login page")
    }

    // Click Continue
    const continueClicked =
      (await this.tryClick(page, 'button[data-testid="login-continue-button"]')) ||
      (await this.tryClick(page, 'button:has-text("Continue")')) ||
      (await this.tryClick(page, 'button[type="submit"]'))

    if (continueClicked) {
      await this.waitForPageLoad(page, 2500)
    }

    // Step 2: Enter password
    const passwordFilled =
      (await this.tryFill(page, 'input[type="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[id="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[data-testid="password-input"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[name="password"]', ctx.credentials.password ?? ""))

    if (!passwordFilled) {
      throw new Error("Disney+: could not locate password input")
    }

    // Click Log In / Sign In
    const signInClicked =
      (await this.tryClick(page, 'button[data-testid="login-button"]')) ||
      (await this.tryClick(page, 'button:has-text("Log In")')) ||
      (await this.tryClick(page, 'button:has-text("Sign In")')) ||
      (await this.tryClick(page, 'button[type="submit"]'))

    if (!signInClicked) {
      throw new Error("Disney+: could not locate Log In button")
    }

    await this.waitForPageLoad(page, 5000)

    // Handle profile picker — select the first profile
    const profileClicked =
      (await this.tryClick(page, '[data-testid="profile-avatar"]:first-child')) ||
      (await this.tryClick(page, '.profile-avatar:first-child')) ||
      (await this.tryClick(page, '[data-gv2elementkey="profile"]:first-child'))

    if (profileClicked) {
      await this.waitForPageLoad(page, 3000)
    }
  }

  // ── Navigate to Parental Controls ────────────────────────────────

  async navigateToParentalControls(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const controlsUrl =
      ctx.credentials.parentalControlsUrl ??
      "https://www.disneyplus.com/account/parental-controls"

    await page.goto(controlsUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Disney+ may prompt for password re-entry
    const passwordGate =
      (await this.tryFill(page, 'input[type="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[data-testid="password-input"]', ctx.credentials.password ?? ""))

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

    // 1. Parental controls overview (content rating settings per profile)
    screenshots.push(await this.takeScreenshot(page, ctx, "content_rating_settings"))

    // 2. Navigate to profile edit for Kids profile
    const editProfileNav =
      (await this.tryClick(page, 'a[href*="/edit-profiles"]')) ||
      (await this.tryClick(page, 'button:has-text("Edit Profiles")'))

    if (editProfileNav) {
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "edit_profiles"))

      // Try to click into a Kids profile
      const kidsProfileClicked =
        (await this.tryClick(page, '[data-testid="kids-profile"]')) ||
        (await this.tryClick(page, '.profile-avatar[aria-label*="Kids"]')) ||
        (await this.tryClick(page, 'div:has-text("Kids"):first-child'))

      if (kidsProfileClicked) {
        await this.waitForPageLoad(page, 2000)
        screenshots.push(await this.takeScreenshot(page, ctx, "kids_profile_settings"))
      }
    }

    // 3. PIN settings
    await page.goto("https://www.disneyplus.com/account", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 2000)

    // Look for Profile PIN section
    const pinSectionClicked =
      (await this.tryClick(page, 'a[href*="profile-pin"]')) ||
      (await this.tryClick(page, 'button:has-text("Profile PIN")')) ||
      (await this.tryClick(page, '[data-testid="profile-pin"]'))

    if (pinSectionClicked) {
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "pin_settings"))
    }

    // 4. Autoplay and language settings (secondary parental concern)
    await page.goto("https://www.disneyplus.com/account", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 2000)
    screenshots.push(await this.takeScreenshot(page, ctx, "account_overview"))

    return screenshots
  }

  // ── Extract Notes ────────────────────────────────────────────────

  async extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes> {
    const notes = this.emptyNotes("Disney+ parental controls research")
    notes.parentalControlsFound = true
    notes.settingsLocation = "https://www.disneyplus.com/account/parental-controls"

    notes.ageRestrictionOptions = [
      "TV-Y / G (suitable for all ages)",
      "TV-Y7 / TV-Y7-FV / TV-G / PG (ages 7+)",
      "PG / TV-PG (parental guidance suggested)",
      "PG-13 / TV-14 (ages 13+)",
      "R / TV-MA (mature audiences only)",
    ]

    notes.contentFilteringOptions = [
      "Per-profile content rating limit",
      "Junior Mode (Kids profile with simplified UI)",
      "Autoplay controls (next episode, previews)",
      "Content rating displayed on all titles",
    ]

    notes.screenTimeLimits = false // Disney+ does not natively offer screen time limits
    notes.purchaseControls = true // Profile PIN

    notes.privacySettings = [
      "Profile PIN for restricting profile access",
      "Watch history per profile",
      "Personalized content recommendations toggle",
    ]

    notes.capabilities = [
      this.capability(
        "content_filter",
        "Each profile can be assigned a maximum content rating from TV-Y/G up to R/TV-MA. Content above the selected rating is hidden from the profile. The rating scale covers US content ratings.",
        "Account > Parental Controls > [Profile] > Content Rating",
        0.95,
      ),
      this.capability(
        "purchase_control",
        "Profile PIN: a 4-digit PIN locks a specific profile so that children cannot switch to an unrestricted profile without the code.",
        "Account > Profile > Profile PIN",
        0.85,
      ),
      this.capability(
        "age_gate",
        "Junior Mode (Kids profile) provides a simplified, age-appropriate interface. The profile is locked to TV-Y7/TV-G content and cannot be changed without the account password. Adult profiles require PIN to access.",
        "Account > Add Profile > Junior Mode toggle",
        0.90,
      ),
      this.capability(
        "screen_time_limit",
        "Disney+ does not currently offer built-in screen time limits or viewing time notifications. Parents must rely on device-level controls (e.g., Screen Time on iOS, Family Link on Android).",
        "N/A — not available in Disney+ settings",
        0.40,
      ),
    ]

    notes.rawNotes = [
      "Disney+ merged with Hulu content in late 2023, expanding the range of mature content on the platform.",
      "Parental controls are profile-based. Each profile can have a content rating cap.",
      "Junior Mode (Kids profile) creates a walled garden with age-appropriate content and a simplified tile-based UI.",
      "Profile PIN requires a 4-digit code to enter the profile, preventing profile switching.",
      "Autoplay can be toggled per profile (next episode and previews).",
      "GroupWatch allows synchronized viewing; parental rating of the session follows the host profile's rating.",
      "Disney+ does not offer native screen-time limits, viewing time alerts, or scheduled access windows.",
      "Watch history is per-profile and accessible from the profile settings.",
      "Content ratings are prominently displayed on all title detail pages.",
      "Downloads can be restricted by disabling the feature at the device management level.",
    ].join("\n")

    return notes
  }
}
