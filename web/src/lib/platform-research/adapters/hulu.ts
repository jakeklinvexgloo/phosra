import { BaseResearchAdapter } from "../base-adapter"
import type {
  ResearchContext,
  ResearchScreenshot,
  ResearchNotes,
  PlaywrightPage,
} from "../types"

/**
 * Hulu research adapter.
 *
 * Navigates Hulu login, profile management, Kids mode, PIN settings,
 * and privacy preferences to catalog parental control capabilities.
 */
export class HuluAdapter extends BaseResearchAdapter {
  platformId = "hulu"
  platformName = "Hulu"

  // ── Login ────────────────────────────────────────────────────────

  async login(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://auth.hulu.com/web/login"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Hulu may redirect through a Disney SSO flow or show its own form
    // Try Hulu's direct login form first
    const emailFilled =
      (await this.tryFill(page, 'input[data-automationid="email-field"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, 'input[name="email"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, 'input[type="email"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, 'input[id="email_id"]', ctx.credentials.username ?? ""))

    if (!emailFilled) {
      // May be on Disney SSO — try that flow
      const disneySSOEmail =
        (await this.tryFill(page, 'input[data-testid="email-input"]', ctx.credentials.username ?? "")) ||
        (await this.tryFill(page, '#email', ctx.credentials.username ?? ""))

      if (!disneySSOEmail) {
        throw new Error("Hulu: could not locate email input on login page")
      }

      // Click Continue on Disney SSO
      const continueClicked =
        (await this.tryClick(page, 'button[data-testid="login-continue-button"]')) ||
        (await this.tryClick(page, 'button:has-text("Continue")'))

      if (continueClicked) {
        await this.waitForPageLoad(page, 2500)
      }
    }

    // Fill password
    const passwordFilled =
      (await this.tryFill(page, 'input[data-automationid="password-field"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[name="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[type="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[data-testid="password-input"]', ctx.credentials.password ?? ""))

    if (!passwordFilled) {
      throw new Error("Hulu: could not locate password input")
    }

    // Click Log In
    const signInClicked =
      (await this.tryClick(page, 'button[data-automationid="login-button"]')) ||
      (await this.tryClick(page, 'button:has-text("Log In")')) ||
      (await this.tryClick(page, 'button:has-text("LOG IN")')) ||
      (await this.tryClick(page, 'button[data-testid="login-button"]')) ||
      (await this.tryClick(page, 'button[type="submit"]'))

    if (!signInClicked) {
      throw new Error("Hulu: could not locate Log In button")
    }

    await this.waitForPageLoad(page, 5000)

    // Handle profile picker
    const profileClicked =
      (await this.tryClick(page, '.Profiles__item:first-child')) ||
      (await this.tryClick(page, '[data-testid="profile"]:first-child')) ||
      (await this.tryClick(page, '.profile-picker__item:first-child')) ||
      (await this.tryClick(page, '.UserProfiles a:first-child'))

    if (profileClicked) {
      await this.waitForPageLoad(page, 3000)
    }
  }

  // ── Navigate to Parental Controls ────────────────────────────────

  async navigateToParentalControls(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const controlsUrl =
      ctx.credentials.parentalControlsUrl ??
      "https://secure.hulu.com/account/profiles"

    await page.goto(controlsUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Hulu may require re-authentication for account pages
    const passwordGate =
      (await this.tryFill(page, 'input[type="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[name="password"]', ctx.credentials.password ?? ""))

    if (passwordGate) {
      const confirmClicked =
        (await this.tryClick(page, 'button[type="submit"]')) ||
        (await this.tryClick(page, 'button:has-text("Log In")')) ||
        (await this.tryClick(page, 'button:has-text("Continue")'))

      if (confirmClicked) {
        await this.waitForPageLoad(page, 3000)
      }
    }

    // If the profiles page loaded, try to navigate to parental controls section
    const parentalLink =
      (await this.tryClick(page, 'a[href*="parental"]')) ||
      (await this.tryClick(page, 'a:has-text("Parental Controls")')) ||
      (await this.tryClick(page, 'button:has-text("Parental Controls")'))

    if (parentalLink) {
      await this.waitForPageLoad(page, 2000)
    }
  }

  // ── Capture Screenshots ──────────────────────────────────────────

  async captureScreenshots(
    ctx: ResearchContext,
    page: PlaywrightPage,
  ): Promise<ResearchScreenshot[]> {
    const screenshots: ResearchScreenshot[] = []

    // 1. Profile settings / parental controls overview
    screenshots.push(await this.takeScreenshot(page, ctx, "profile_settings"))

    // 2. Navigate to profile management to see Kids mode
    await page.goto("https://secure.hulu.com/account/profiles", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 2000)
    screenshots.push(await this.takeScreenshot(page, ctx, "profiles_overview"))

    // 3. Try to open a Kids profile to see its settings
    const kidsProfileClicked =
      (await this.tryClick(page, '[data-testid="kids-profile"]')) ||
      (await this.tryClick(page, '.profile-item:has-text("Kids")')) ||
      (await this.tryClick(page, 'button[aria-label*="Kids"]'))

    if (kidsProfileClicked) {
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "kids_profile_settings"))
    } else {
      // If no kids profile exists, try editing any profile to show the Kids toggle
      const editProfileClicked =
        (await this.tryClick(page, '.profile-item:first-child button:has-text("Edit")')) ||
        (await this.tryClick(page, '[data-testid="edit-profile"]:first-child')) ||
        (await this.tryClick(page, 'a[href*="profiles/edit"]'))

      if (editProfileClicked) {
        await this.waitForPageLoad(page, 2000)
        screenshots.push(await this.takeScreenshot(page, ctx, "edit_profile_kids_toggle"))
      }
    }

    // 4. PIN settings (if accessible)
    await page.goto("https://secure.hulu.com/account", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 2000)

    const pinSection =
      (await this.tryClick(page, 'a[href*="pin"]')) ||
      (await this.tryClick(page, 'button:has-text("PIN Protection")')) ||
      (await this.tryClick(page, 'a:has-text("PIN Protection")'))

    if (pinSection) {
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "pin_settings"))
    }

    // 5. Privacy and Settings
    await page.goto("https://secure.hulu.com/account/privacy", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 2000)
    screenshots.push(await this.takeScreenshot(page, ctx, "privacy_settings"))

    return screenshots
  }

  // ── Extract Notes ────────────────────────────────────────────────

  async extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes> {
    const notes = this.emptyNotes("Hulu parental controls research")
    notes.parentalControlsFound = true
    notes.settingsLocation = "https://secure.hulu.com/account/profiles"

    notes.ageRestrictionOptions = [
      "Kids Mode (TV-Y, TV-Y7, TV-G, G rated content only)",
      "No granular maturity tiers outside Kids Mode",
      "Account-level PIN to prevent profile switching",
    ]

    notes.contentFilteringOptions = [
      "Kids profile (curated, age-appropriate content only)",
      "PIN Protection for non-Kids profiles",
      "Content ratings displayed on title detail pages",
    ]

    notes.screenTimeLimits = false // Hulu does not offer native screen time limits
    notes.purchaseControls = true // PIN prevents unauthorized profile access and add-on purchases

    notes.privacySettings = [
      "Advertising preferences",
      "Do Not Sell or Share My Personal Information toggle",
      "Watch history per profile",
      "Viewing data usage preferences",
    ]

    notes.capabilities = [
      this.capability(
        "content_filter",
        "Kids profile restricts content to TV-Y, TV-Y7, TV-G, and G-rated titles only. The Kids profile shows a curated, child-friendly interface. No intermediate maturity tiers are available (e.g., no PG-13-only mode).",
        "Account > Profiles > Kids Profile toggle",
        0.90,
      ),
      this.capability(
        "age_gate",
        "Kids Mode acts as a binary age gate: content is either in the Kids library or not. Non-Kids profiles have access to all content on the account. There is no per-profile maturity rating slider.",
        "Account > Profiles > Create/Edit Profile > Kids toggle",
        0.85,
      ),
      this.capability(
        "purchase_control",
        "PIN Protection allows setting a 4-digit PIN on the account to prevent unauthorized profile switching and account changes. This prevents children from leaving Kids Mode.",
        "Account > PIN Protection",
        0.80,
      ),
    ]

    notes.rawNotes = [
      "Hulu parental controls are simpler than Netflix or Disney+ — primarily a Kids profile toggle and PIN protection.",
      "Kids Mode creates a separate, curated content environment with only G/TV-Y/TV-Y7/TV-G-rated titles.",
      "There is no granular maturity rating slider; it is a binary Kids vs. non-Kids split.",
      "PIN Protection is account-level and prevents switching profiles or modifying account settings without the 4-digit PIN.",
      "Hulu does not offer native screen time limits, viewing time alerts, or scheduled access.",
      "After the Disney+ bundle merger, some parental settings now overlap with Disney+ account settings.",
      "Watch history is per-profile and can be cleared.",
      "Live TV channels in Hulu + Live TV do not have parental filtering (standard TV-Parental guidelines apply via the broadcast).",
      "Hulu shows content ratings (TV-MA, TV-14, etc.) on title detail pages but does not allow filtering by rating for non-Kids profiles.",
      "Ad-supported plans show ads even on Kids profiles, though ads are supposed to be child-appropriate.",
    ].join("\n")

    return notes
  }
}
