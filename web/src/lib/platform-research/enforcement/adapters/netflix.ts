import { randomUUID } from "crypto"
import * as path from "path"
import type {
  BrowserEnforcementAdapter,
  EnforcementContext,
  PolicyRule,
  RuleEnforcementResult,
  RuleVerificationResult,
  PlaywrightPage,
  ResearchScreenshot,
} from "../types"
import { EnforcementError, resolveRating } from "../types"

// Netflix maturity levels in order from most to least restrictive
const MATURITY_LEVELS = [
  "Little Kids",
  "Older Kids",
  "Teens",
  "All Maturity Ratings",
] as const

type MaturityLevel = (typeof MATURITY_LEVELS)[number]

interface NetflixProfileConfig {
  name: string
  maturityLevel: MaturityLevel
  profileId?: string
}

interface NetflixCurrentConfig {
  profiles: NetflixProfileConfig[]
  pinEnabled: boolean
}

/**
 * Netflix browser enforcement adapter.
 *
 * Logs into Netflix via Playwright and enforces parental control rules
 * (content maturity rating, profile PIN) on child profiles.
 */
export class NetflixEnforcementAdapter implements BrowserEnforcementAdapter {
  platformId = "netflix"
  platformName = "Netflix"

  supportedRuleCategories(): string[] {
    return ["content_rating", "purchase_control"]
  }

  // ── Login ────────────────────────────────────────────────────────

  async login(ctx: EnforcementContext, page: PlaywrightPage): Promise<void> {
    const loginUrl = ctx.credentials.loginUrl ?? "https://www.netflix.com/login"

    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 })
    await page.waitForTimeout(3000)

    // Netflix may show a "Sign In" landing before the actual form
    await this.tryClick(page, 'a[href*="/login"]')
    await page.waitForTimeout(1500)

    // Fill email / phone
    const emailFilled =
      (await this.tryFill(page, 'input[name="userLoginId"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, 'input[id="id_userLoginId"]', ctx.credentials.username ?? "")) ||
      (await this.tryFill(page, 'input[data-uia="login-field"]', ctx.credentials.username ?? ""))

    if (!emailFilled) {
      throw new EnforcementError(
        "Netflix: could not locate email/phone input on login page",
        "selector_not_found",
        false,
      )
    }

    // Fill password
    const passwordFilled =
      (await this.tryFill(page, 'input[name="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[id="id_password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[data-uia="password-field"]', ctx.credentials.password ?? ""))

    if (!passwordFilled) {
      throw new EnforcementError(
        "Netflix: could not locate password input on login page",
        "selector_not_found",
        false,
      )
    }

    // Click Sign In
    const signedIn =
      (await this.tryClick(page, 'button[data-uia="login-submit-button"]')) ||
      (await this.tryClick(page, 'button[type="submit"]')) ||
      (await this.tryClick(page, 'button:has-text("Sign In")'))

    if (!signedIn) {
      throw new EnforcementError(
        "Netflix: could not locate Sign In button",
        "selector_not_found",
        false,
      )
    }

    await page.waitForTimeout(5000)

    // Handle profile picker -- select the main/admin profile
    const profileClicked =
      (await this.tryClick(page, '.profile-link:first-child')) ||
      (await this.tryClick(page, '[data-profile-guid]:first-child')) ||
      (await this.tryClick(page, '.choose-profile .profile:first-child'))

    if (profileClicked) {
      await page.waitForTimeout(3000)
    }
  }

  // ── Get Current Config ─────────────────────────────────────────

  async getCurrentConfig(
    ctx: EnforcementContext,
    page: PlaywrightPage,
  ): Promise<Record<string, unknown>> {
    await this.navigateToParentalControls(ctx, page)

    const config: NetflixCurrentConfig = {
      profiles: [],
      pinEnabled: false,
    }

    // Try to read profile maturity info from the parental controls page.
    // Netflix shows each profile as an expandable section with its maturity level.
    try {
      const profileData = await page.evaluate<{ profiles: { name: string; maturityLevel: string }[]; pinEnabled: boolean }>(`
        (() => {
          const profiles = [];
          // Netflix parental controls page lists profiles with their maturity level
          const profileSections = document.querySelectorAll(
            '.profile-section, [data-uia="profile-section"], .parental-controls-profile'
          );
          profileSections.forEach(section => {
            const nameEl = section.querySelector('.profile-name, [data-uia="profile-name"], h3, h4');
            const levelEl = section.querySelector(
              '.maturity-level, [data-uia="maturity-level"], .viewing-restriction-label, .maturity-selection .selected'
            );
            if (nameEl) {
              profiles.push({
                name: nameEl.textContent?.trim() || "Unknown",
                maturityLevel: levelEl?.textContent?.trim() || "Unknown",
              });
            }
          });

          // Check if PIN / Profile Lock is mentioned
          const pinEnabled = !!document.querySelector(
            '[data-uia="profile-lock"], .profile-lock-toggle, button:has-text("Profile Lock")'
          );

          return { profiles, pinEnabled };
        })()
      `)

      config.profiles = profileData.profiles.map((p) => ({
        name: p.name,
        maturityLevel: normalizeMaturityLevel(p.maturityLevel),
      }))
      config.pinEnabled = profileData.pinEnabled
    } catch {
      // If evaluation fails, return empty config rather than crashing
    }

    return config as unknown as Record<string, unknown>
  }

  // ── Enforce Rule ───────────────────────────────────────────────

  async enforceRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    switch (rule.category) {
      case "content_rating":
        return this.enforceContentRating(ctx, page, rule)
      case "purchase_control":
        return this.enforcePurchaseControl(ctx, page, rule)
      default:
        return {
          ruleCategory: rule.category,
          status: "unsupported",
          reason: `Netflix adapter does not support rule category: ${rule.category}`,
        }
    }
  }

  // ── Verify Rule ────────────────────────────────────────────────

  async verifyRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    switch (rule.category) {
      case "content_rating":
        return this.verifyContentRating(ctx, page, rule)
      case "purchase_control":
        return this.verifyPurchaseControl(ctx, page, rule)
      default:
        return {
          ruleCategory: rule.category,
          verified: false,
          expectedValue: JSON.stringify(rule.config),
          currentValue: "unsupported",
        }
    }
  }

  // ── Revoke Rule ────────────────────────────────────────────────

  async revokeRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    switch (rule.category) {
      case "content_rating":
        // Reset to the least restrictive level
        return this.enforceContentRating(ctx, page, {
          ...rule,
          config: {
            ...rule.config,
            maxRating: "All Maturity Ratings",
          },
        })
      case "purchase_control":
        return this.revokePurchaseControl(ctx, page, rule)
      default:
        return {
          ruleCategory: rule.category,
          status: "unsupported",
          reason: `Netflix adapter does not support revoking rule category: ${rule.category}`,
        }
    }
  }

  // ── Content Rating Enforcement ─────────────────────────────────

  private async enforceContentRating(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    const targetRating = (rule.config.maxRating as string) ?? resolveRating("netflix", ctx.childAge)
    const profileName = (rule.config.profileName as string) ?? ctx.childName

    // Navigate to parental controls
    await this.navigateToParentalControls(ctx, page)

    // Take before screenshot
    const beforeScreenshot = await this.takeScreenshot(page, ctx.screenshotDir, "content-rating-before")

    // Find and click the target profile to expand its settings
    const profileFound = await this.selectProfile(page, profileName)
    if (!profileFound) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: `Could not find profile "${profileName}" on parental controls page`,
        screenshot: beforeScreenshot,
      }
    }

    await page.waitForTimeout(2000)

    // Read the current maturity level before changing
    const previousLevel = await this.readCurrentMaturityLevel(page)

    // Set the maturity level
    const levelSet = await this.setMaturityLevel(page, targetRating)
    if (!levelSet) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: `Could not set maturity level to "${targetRating}"`,
        screenshot: beforeScreenshot,
      }
    }

    // Save the settings
    const saved = await this.clickSave(page)
    if (!saved) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: "Could not find or click Save button after changing maturity level",
        screenshot: beforeScreenshot,
      }
    }

    await page.waitForTimeout(3000)

    // Take after screenshot
    const afterScreenshot = await this.takeScreenshot(page, ctx.screenshotDir, "content-rating-after")

    return {
      ruleCategory: rule.category,
      status: "applied",
      previousValue: previousLevel ?? "unknown",
      newValue: targetRating,
      screenshot: afterScreenshot,
    }
  }

  private async verifyContentRating(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    const expectedRating = (rule.config.maxRating as string) ?? resolveRating("netflix", ctx.childAge)
    const profileName = (rule.config.profileName as string) ?? ctx.childName

    await this.navigateToParentalControls(ctx, page)
    await this.selectProfile(page, profileName)
    await page.waitForTimeout(2000)

    const currentLevel = await this.readCurrentMaturityLevel(page)
    const screenshot = await this.takeScreenshot(page, ctx.screenshotDir, "content-rating-verify")

    const normalizedExpected = normalizeMaturityLevel(expectedRating)
    const normalizedCurrent = normalizeMaturityLevel(currentLevel ?? "unknown")

    return {
      ruleCategory: rule.category,
      verified: normalizedCurrent === normalizedExpected,
      currentValue: currentLevel ?? "unknown",
      expectedValue: expectedRating,
      screenshot,
    }
  }

  // ── Purchase Control (PIN) Enforcement ─────────────────────────

  private async enforcePurchaseControl(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    const pin = (rule.config.pin as string) ?? ""
    const profileName = (rule.config.profileName as string) ?? ctx.childName

    if (!pin || pin.length !== 4) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: "PIN must be exactly 4 digits",
      }
    }

    await this.navigateToParentalControls(ctx, page)

    const beforeScreenshot = await this.takeScreenshot(page, ctx.screenshotDir, "pin-before")

    // Find and expand the target profile
    const profileFound = await this.selectProfile(page, profileName)
    if (!profileFound) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: `Could not find profile "${profileName}" on parental controls page`,
        screenshot: beforeScreenshot,
      }
    }

    await page.waitForTimeout(2000)

    // Navigate to Profile Lock / PIN settings
    const lockClicked =
      (await this.tryClick(page, '[data-uia="profile-lock"]')) ||
      (await this.tryClick(page, 'a[href*="pin"]')) ||
      (await this.tryClick(page, 'button:has-text("Profile Lock")')) ||
      (await this.tryClick(page, '.profile-lock-link')) ||
      (await this.tryClick(page, 'a:has-text("Change")'))

    if (!lockClicked) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: "Could not find Profile Lock / PIN settings link",
        screenshot: beforeScreenshot,
      }
    }

    await page.waitForTimeout(2000)

    // Enable the lock toggle if it exists and is off
    await this.tryClick(page, 'input[type="checkbox"]:not(:checked)')
    await this.tryClick(page, '[data-uia="toggle-lock"]:not(.active)')

    // Fill in PIN digits
    const pinFilled =
      (await this.tryFill(page, 'input[data-uia="pin-input"]', pin)) ||
      (await this.tryFill(page, 'input[name="pin"]', pin)) ||
      (await this.fillPinDigits(page, pin))

    if (!pinFilled) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: "Could not fill PIN input field",
        screenshot: beforeScreenshot,
      }
    }

    // Save
    const saved = await this.clickSave(page)
    if (!saved) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: "Could not save PIN settings",
        screenshot: beforeScreenshot,
      }
    }

    await page.waitForTimeout(3000)

    const afterScreenshot = await this.takeScreenshot(page, ctx.screenshotDir, "pin-after")

    return {
      ruleCategory: rule.category,
      status: "applied",
      previousValue: "unknown",
      newValue: "PIN set",
      screenshot: afterScreenshot,
    }
  }

  private async verifyPurchaseControl(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleVerificationResult> {
    const profileName = (rule.config.profileName as string) ?? ctx.childName

    await this.navigateToParentalControls(ctx, page)
    await this.selectProfile(page, profileName)
    await page.waitForTimeout(2000)

    // Check if lock is enabled for this profile
    const lockEnabled = await page.evaluate<boolean>(`
      (() => {
        const lockEl = document.querySelector(
          '[data-uia="profile-lock"].active, .profile-lock-toggle.enabled, ' +
          'input[type="checkbox"][data-uia="toggle-lock"]:checked, ' +
          '.lock-status:has-text("On"), .profile-lock-on'
        );
        return !!lockEl;
      })()
    `)

    const screenshot = await this.takeScreenshot(page, ctx.screenshotDir, "pin-verify")

    return {
      ruleCategory: rule.category,
      verified: lockEnabled,
      currentValue: lockEnabled ? "PIN enabled" : "PIN disabled",
      expectedValue: "PIN enabled",
      screenshot,
    }
  }

  private async revokePurchaseControl(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule,
  ): Promise<RuleEnforcementResult> {
    const profileName = (rule.config.profileName as string) ?? ctx.childName

    await this.navigateToParentalControls(ctx, page)

    const beforeScreenshot = await this.takeScreenshot(page, ctx.screenshotDir, "pin-revoke-before")

    const profileFound = await this.selectProfile(page, profileName)
    if (!profileFound) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: `Could not find profile "${profileName}"`,
        screenshot: beforeScreenshot,
      }
    }

    await page.waitForTimeout(2000)

    // Navigate to Profile Lock
    const lockClicked =
      (await this.tryClick(page, '[data-uia="profile-lock"]')) ||
      (await this.tryClick(page, 'a[href*="pin"]')) ||
      (await this.tryClick(page, 'button:has-text("Profile Lock")')) ||
      (await this.tryClick(page, '.profile-lock-link'))

    if (!lockClicked) {
      return {
        ruleCategory: rule.category,
        status: "failed",
        reason: "Could not find Profile Lock settings",
        screenshot: beforeScreenshot,
      }
    }

    await page.waitForTimeout(2000)

    // Disable the lock toggle
    const toggled =
      (await this.tryClick(page, 'input[type="checkbox"]:checked')) ||
      (await this.tryClick(page, '[data-uia="toggle-lock"].active'))

    if (!toggled) {
      return {
        ruleCategory: rule.category,
        status: "skipped",
        reason: "Profile Lock may already be disabled",
        screenshot: beforeScreenshot,
      }
    }

    const saved = await this.clickSave(page)
    if (saved) {
      await page.waitForTimeout(3000)
    }

    const afterScreenshot = await this.takeScreenshot(page, ctx.screenshotDir, "pin-revoke-after")

    return {
      ruleCategory: rule.category,
      status: "applied",
      previousValue: "PIN enabled",
      newValue: "PIN disabled",
      screenshot: afterScreenshot,
    }
  }

  // ── Internal Helpers ───────────────────────────────────────────

  /** Navigate to parental controls and handle the password gate */
  private async navigateToParentalControls(
    ctx: EnforcementContext,
    page: PlaywrightPage,
  ): Promise<void> {
    const controlsUrl =
      ctx.credentials.parentalControlsUrl ??
      "https://www.netflix.com/settings/parental-controls"

    await page.goto(controlsUrl, { waitUntil: "networkidle", timeout: 30000 })
    await page.waitForTimeout(3000)

    // Netflix requires re-entering password to access parental controls
    const passwordGate =
      (await this.tryFill(page, 'input[id="id_password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[name="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[type="password"]', ctx.credentials.password ?? "")) ||
      (await this.tryFill(page, 'input[data-uia="password-input"]', ctx.credentials.password ?? ""))

    if (passwordGate) {
      const confirmClicked =
        (await this.tryClick(page, 'button[type="submit"]')) ||
        (await this.tryClick(page, 'button:has-text("Continue")')) ||
        (await this.tryClick(page, 'button[data-uia="btn-continue"]'))

      if (confirmClicked) {
        await page.waitForTimeout(3000)
      }
    }
  }

  /** Find and click/expand a specific profile by name */
  private async selectProfile(page: PlaywrightPage, profileName: string): Promise<boolean> {
    // Try clicking a profile link/header matching the child name
    const clicked =
      (await this.tryClick(page, `[data-uia="profile-section"]:has-text("${profileName}")`)) ||
      (await this.tryClick(page, `.profile-header:has-text("${profileName}")`)) ||
      (await this.tryClick(page, `a:has-text("${profileName}")`)) ||
      (await this.tryClick(page, `.profile-name:has-text("${profileName}")`))

    if (clicked) return true

    // Fallback: try to find the profile by evaluating the page
    try {
      const found = await page.evaluate<boolean>(`
        (() => {
          const links = document.querySelectorAll('a, button, .profile-header, [data-uia*="profile"]');
          for (const el of links) {
            if (el.textContent?.includes("${profileName}")) {
              el.click();
              return true;
            }
          }
          return false;
        })()
      `)
      return found
    } catch {
      return false
    }
  }

  /** Read the currently selected maturity level from the page */
  private async readCurrentMaturityLevel(page: PlaywrightPage): Promise<string | null> {
    try {
      return await page.evaluate<string | null>(`
        (() => {
          // Look for selected/active maturity level indicators
          const selectors = [
            '.maturity-level.selected',
            '[data-uia="maturity-level"].selected',
            '.maturity-selection .active',
            '.maturity-rating-selector .selected',
            'input[name="maturity"]:checked + label',
            '.slider-label.active',
            '.viewing-restriction-label',
          ];
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el?.textContent?.trim()) return el.textContent.trim();
          }

          // Fallback: look for any element that contains known maturity level text
          const levels = ["Little Kids", "Older Kids", "Teens", "All Maturity"];
          const allText = document.body.innerText;
          for (const level of levels) {
            // Find if a level label appears near a "selected" or "checked" indicator
            const pattern = new RegExp(level + '.*?selected|selected.*?' + level, 'i');
            if (pattern.test(allText)) return level;
          }

          return null;
        })()
      `)
    } catch {
      return null
    }
  }

  /** Set the maturity level on the current profile's parental controls page */
  private async setMaturityLevel(page: PlaywrightPage, level: string): Promise<boolean> {
    const normalized = normalizeMaturityLevel(level)

    // Try radio button / checkbox approach
    const radioClicked =
      (await this.tryClick(page, `input[value="${normalized}"]`)) ||
      (await this.tryClick(page, `label:has-text("${normalized}")`)) ||
      (await this.tryClick(page, `[data-uia="maturity-level"]:has-text("${normalized}")`)) ||
      (await this.tryClick(page, `.maturity-level:has-text("${normalized}")`))

    if (radioClicked) return true

    // Try slider approach -- Netflix sometimes uses a slider for maturity
    const levelIndex = MATURITY_LEVELS.findIndex(
      (l) => normalizeMaturityLevel(l) === normalized,
    )
    if (levelIndex >= 0) {
      try {
        const sliderMoved = await page.evaluate<boolean>(`
          (() => {
            const slider = document.querySelector('input[type="range"], .maturity-slider, [role="slider"]');
            if (!slider) return false;
            if (slider.tagName === 'INPUT') {
              slider.value = "${levelIndex}";
              slider.dispatchEvent(new Event('input', { bubbles: true }));
              slider.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
            return false;
          })()
        `)
        if (sliderMoved) return true
      } catch {
        // Slider approach failed, continue to fallback
      }
    }

    // Fallback: click any element containing the maturity level text
    try {
      return await page.evaluate<boolean>(`
        (() => {
          const elements = document.querySelectorAll('div, span, label, button, li, a');
          for (const el of elements) {
            const text = el.textContent?.trim() || "";
            if (text === "${normalized}" || text.startsWith("${normalized}")) {
              el.click();
              return true;
            }
          }
          return false;
        })()
      `)
    } catch {
      return false
    }
  }

  /** Click the Save button */
  private async clickSave(page: PlaywrightPage): Promise<boolean> {
    return (
      (await this.tryClick(page, 'button[data-uia="save-button"]')) ||
      (await this.tryClick(page, 'button[type="submit"]')) ||
      (await this.tryClick(page, 'button:has-text("Save")')) ||
      (await this.tryClick(page, 'button:has-text("Done")')) ||
      (await this.tryClick(page, '.btn-save')) ||
      (await this.tryClick(page, '[data-uia="btn-save"]'))
    )
  }

  /** Fill PIN digits into individual digit inputs (Netflix sometimes has 4 separate inputs) */
  private async fillPinDigits(page: PlaywrightPage, pin: string): Promise<boolean> {
    try {
      const digitInputs = await page.$$('input[type="tel"], input[type="number"], input.pin-digit')
      if (digitInputs.length >= 4) {
        for (let i = 0; i < 4; i++) {
          const input = digitInputs[i] as unknown as { fill(value: string): Promise<void> }
          await input.fill(pin[i])
        }
        return true
      }
      return false
    } catch {
      return false
    }
  }

  /** Take a screenshot and return metadata */
  private async takeScreenshot(
    page: PlaywrightPage,
    dir: string,
    label: string,
  ): Promise<ResearchScreenshot> {
    const filename = `${label}-${Date.now()}.png`
    const filepath = path.join(dir, filename)
    await page.screenshot({ path: filepath, fullPage: false })
    return {
      id: randomUUID(),
      label,
      path: filepath,
      url: page.url(),
      timestamp: new Date().toISOString(),
      width: 1280,
      height: 720,
    }
  }

  /** Try to fill a form field, returns true if successful */
  private async tryFill(page: PlaywrightPage, selector: string, value: string): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: 3000, state: "visible" })
      await page.fill(selector, value)
      return true
    } catch {
      return false
    }
  }

  /** Try to click an element, returns true if successful */
  private async tryClick(page: PlaywrightPage, selector: string): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: 3000, state: "visible" })
      await page.click(selector)
      return true
    } catch {
      return false
    }
  }
}

/** Normalize maturity level strings for comparison */
function normalizeMaturityLevel(level: string): MaturityLevel {
  const lower = level.toLowerCase().trim()
  if (lower.includes("little") || lower === "g" || lower === "tv-y") return "Little Kids"
  if (lower.includes("older") || lower === "pg" || lower === "tv-y7") return "Older Kids"
  if (lower.includes("teen") || lower === "pg-13" || lower === "tv-14") return "Teens"
  if (lower.includes("all") || lower === "r" || lower === "nc-17" || lower === "tv-ma") return "All Maturity Ratings"
  return level as MaturityLevel
}
