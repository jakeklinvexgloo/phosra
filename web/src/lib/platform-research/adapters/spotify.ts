import { BaseResearchAdapter } from "../base-adapter"
import type { ResearchContext, ResearchScreenshot, ResearchNotes, PlaywrightPage } from "../types"

/**
 * Research adapter for Spotify parental controls.
 *
 * Navigates Spotify's account settings and content restriction features
 * to discover and document content filtering (explicit content toggle)
 * and age gating capabilities. Also examines Spotify Kids profile settings.
 */
export class SpotifyAdapter extends BaseResearchAdapter {
  platformId = "spotify"
  platformName = "Spotify"

  // ── Selectors (with fallbacks) ──────────────────────────────────

  private selectors = {
    login: {
      emailInput: [
        'input[id="login-username"]',
        'input[name="username"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="email"]',
        'input[placeholder*="Username"]',
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
        'button:has-text("Log in")',
        'button[data-testid="login-button"]',
      ],
    },
    settings: {
      explicitContent: [
        'text="Explicit Content"',
        'text="Allow explicit content"',
        'span:has-text("Explicit")',
        'div:has-text("Explicit Content")',
        '#explicit-content-toggle',
      ],
      privateSession: [
        'text="Private Session"',
        'text="Private session"',
        'span:has-text("Private")',
        'div:has-text("Private Session")',
      ],
      accountSettings: [
        'a[href*="account"]',
        'text="Account"',
        'span:has-text("Account")',
        'button:has-text("Account")',
      ],
      contentRestrictions: [
        'text="Content Restrictions"',
        'text="Filter"',
        'span:has-text("Content")',
        'a[href*="content"]',
      ],
      kidsProfile: [
        'text="Spotify Kids"',
        'text="Kids"',
        'span:has-text("Kids")',
        'a[href*="kids"]',
      ],
    },
  }

  // ── Login ───────────────────────────────────────────────────────

  async login(ctx: ResearchContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://accounts.spotify.com/login"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 3000)

    // Handle cookie consent if present
    await this.tryClick(page, 'button[id="onetrust-accept-btn-handler"]')
    await this.tryClick(page, 'button:has-text("Accept")')
    await this.tryClick(page, 'button:has-text("Accept Cookies")')
    await this.waitForPageLoad(page, 1000)

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
    // Spotify's parental controls are primarily in the web player settings
    // and in the account page
    await page.goto("https://www.spotify.com/account/profile/", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await this.waitForPageLoad(page, 3000)

    // Also try the web player settings where explicit content toggle lives
    const currentUrl = page.url()
    if (!currentUrl.includes("account")) {
      await page.goto("https://open.spotify.com/preferences", {
        waitUntil: "networkidle",
        timeout: 30000,
      })
      await this.waitForPageLoad(page, 3000)
    }
  }

  // ── Capture Screenshots ─────────────────────────────────────────

  async captureScreenshots(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchScreenshot[]> {
    const screenshots: ResearchScreenshot[] = []

    // 1. Explicit content filter / preferences
    try {
      await page.goto("https://open.spotify.com/preferences", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 3000)
      screenshots.push(await this.takeScreenshot(page, ctx, "explicit_content_filter"))
    } catch {
      // Continue
    }

    // 2. Account settings (may show age-related info)
    try {
      await page.goto("https://www.spotify.com/account/profile/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "account_profile"))
    } catch {
      // Continue
    }

    // 3. Private session / social settings
    try {
      await page.goto("https://open.spotify.com/preferences", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      // Scroll down to find social / private session settings
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
      await this.waitForPageLoad(page, 1500)
      screenshots.push(await this.takeScreenshot(page, ctx, "private_session"))
    } catch {
      // Continue
    }

    // 4. Spotify Kids profile (if available on web)
    try {
      await page.goto("https://www.spotify.com/account/profile/", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
      // Look for Kids section
      for (const sel of this.selectors.settings.kidsProfile) {
        if (await this.tryClick(page, sel)) break
      }
      await this.waitForPageLoad(page, 2000)
      screenshots.push(await this.takeScreenshot(page, ctx, "spotify_kids_profile"))
    } catch {
      // Continue
    }

    return screenshots
  }

  // ── Extract Notes ───────────────────────────────────────────────

  async extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes> {
    // Navigate to preferences page to scan content
    try {
      await page.goto("https://open.spotify.com/preferences", {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await this.waitForPageLoad(page, 2000)
    } catch {
      // Continue with whatever page we are on
    }

    const pageContent = await page.content()
    const capabilities = []

    // Detect Content Filter (Explicit Content)
    const hasContentFilter = /explicit\s*content|allow\s*explicit|filter\s*explicit|clean\s*version|content\s*restrict/i.test(pageContent)
    if (hasContentFilter) {
      capabilities.push(
        this.capability(
          "content_filter",
          "Spotify allows toggling explicit content on/off. When disabled, songs marked explicit are hidden and clean versions are played when available. On family plans, the account owner can lock this for child profiles.",
          "Settings > Explicit Content / Account > Content Restrictions",
          0.95,
        ),
      )
    }

    // Detect Age Gate
    const hasAgeGate = /date\s*of\s*birth|age|birthday|under\s*13|kids\s*app|spotify\s*kids/i.test(pageContent)
    if (hasAgeGate) {
      capabilities.push(
        this.capability(
          "age_gate",
          "Spotify requires date of birth at signup. Users under 13 cannot create accounts (directed to Spotify Kids app on family plans). Age determines content defaults.",
          "Account Creation / Spotify Kids App",
          0.85,
        ),
      )
    }

    // Fallback if no capabilities detected from page content
    if (capabilities.length === 0) {
      capabilities.push(
        this.capability(
          "content_filter",
          "Spotify explicit content toggle hides explicit songs and plays clean versions",
          "Settings > Explicit Content",
          0.7,
        ),
        this.capability(
          "age_gate",
          "Spotify age requirement at signup; Spotify Kids for under 13",
          "Account Creation / Spotify Kids",
          0.6,
        ),
      )
    }

    return {
      summary: "Spotify's parental controls are relatively limited compared to social media platforms. The primary control is the explicit content filter toggle, which hides explicit songs. Spotify Kids (separate app) provides a curated, ad-free experience for children on Family plans.",
      parentalControlsFound: capabilities.length > 0,
      settingsLocation: "Account Settings > Content Restrictions / Web Player > Preferences",
      capabilities,
      ageRestrictionOptions: ["Under 13 (no standard account; Spotify Kids on Family plan)", "13+ (standard account with age-based defaults)"],
      contentFilteringOptions: ["Explicit content toggle (on/off)", "Spotify Kids curated content", "Private session mode"],
      screenTimeLimits: false,
      purchaseControls: false,
      privacySettings: ["Private session", "Social sharing controls", "Listening activity visibility"],
      rawNotes: `Spotify research conducted at: ${page.url()}\nPage content length: ${pageContent.length} chars`,
    }
  }
}
