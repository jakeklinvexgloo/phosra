import { randomUUID } from "crypto"
import type {
  PlatformResearchAdapter,
  ResearchContext,
  ResearchScreenshot,
  ResearchNotes,
  DiscoveredCapability,
  PlaywrightPage,
} from "./types"

/**
 * Abstract base class for platform research adapters.
 * Provides common helpers for login, screenshots, and navigation.
 */
export abstract class BaseResearchAdapter implements PlatformResearchAdapter {
  abstract platformId: string
  abstract platformName: string

  abstract login(ctx: ResearchContext, page: PlaywrightPage): Promise<void>
  abstract navigateToParentalControls(ctx: ResearchContext, page: PlaywrightPage): Promise<void>
  abstract captureScreenshots(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchScreenshot[]>
  abstract extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes>

  // ── Helpers ──────────────────────────────────────────────────

  /** Take a labeled screenshot and return the metadata */
  protected async takeScreenshot(
    page: PlaywrightPage,
    ctx: ResearchContext,
    label: string,
  ): Promise<ResearchScreenshot> {
    const id = randomUUID()
    const filename = `${ctx.platformId}_${label.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.png`
    const path = `${ctx.screenshotDir}/${filename}`

    await page.screenshot({ path, fullPage: true })

    return {
      id,
      label,
      path: filename,
      url: page.url(),
      timestamp: new Date().toISOString(),
      width: 1280,
      height: 720,
    }
  }

  /** Wait for page to settle after navigation */
  protected async waitForPageLoad(page: PlaywrightPage, timeout = 5000): Promise<void> {
    await page.waitForTimeout(timeout)
  }

  /** Try to fill a form field, returns true if successful */
  protected async tryFill(page: PlaywrightPage, selector: string, value: string): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: 5000, state: "visible" })
      await page.fill(selector, value)
      return true
    } catch {
      return false
    }
  }

  /** Try to click an element, returns true if successful */
  protected async tryClick(page: PlaywrightPage, selector: string): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: 5000, state: "visible" })
      await page.click(selector)
      return true
    } catch {
      return false
    }
  }

  /** Login via standard email/password form */
  protected async emailPasswordLogin(
    page: PlaywrightPage,
    ctx: ResearchContext,
    loginUrl: string,
    emailSelector: string,
    passwordSelector: string,
    submitSelector: string,
  ): Promise<void> {
    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await this.waitForPageLoad(page, 2000)

    if (ctx.credentials.username) {
      await page.fill(emailSelector, ctx.credentials.username)
    }
    if (ctx.credentials.password) {
      await page.fill(passwordSelector, ctx.credentials.password)
    }
    await page.click(submitSelector)
    await this.waitForPageLoad(page, 5000)
  }

  /** Create an empty research notes object */
  protected emptyNotes(summary = "Research not yet completed"): ResearchNotes {
    return {
      summary,
      parentalControlsFound: false,
      settingsLocation: "",
      capabilities: [],
      ageRestrictionOptions: [],
      contentFilteringOptions: [],
      screenTimeLimits: false,
      purchaseControls: false,
      privacySettings: [],
      rawNotes: "",
    }
  }

  /** Create a discovered capability entry */
  protected capability(
    ruleCategory: string,
    description: string,
    location: string,
    confidence: number,
    screenshotIds: string[] = [],
  ): DiscoveredCapability {
    return { ruleCategory, description, location, confidence, screenshotIds }
  }
}
