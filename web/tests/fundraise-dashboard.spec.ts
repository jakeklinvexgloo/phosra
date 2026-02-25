import { test, expect } from "@playwright/test"

const EMAIL = process.env.TEST_EMAIL || "test@phosra.com"
const PASSWORD = process.env.TEST_PASSWORD || ""

test.describe("Fundraise Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the fundraise dashboard (will redirect to Stytch login)
    await page.goto("https://www.phosra.com/dashboard/admin/fundraise")

    // Wait for Stytch login page
    await page.waitForURL(/login|stytch/, { timeout: 15000 })

    // Fill in email and continue
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    await emailInput.waitFor({ timeout: 10000 })
    await emailInput.fill(EMAIL)
    await page.locator('button[type="submit"], button:has-text("Continue")').first().click()

    // Fill in password and submit
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.waitFor({ timeout: 10000 })
    await passwordInput.fill(PASSWORD)
    await page.locator('button[type="submit"], button:has-text("Continue")').first().click()

    // Wait for redirect back to the dashboard
    await page.waitForURL("**/dashboard/admin/fundraise**", { timeout: 30000 })
    // Let the page fully render
    await page.waitForLoadState("networkidle")
  })

  test("super connectors show website links and contact notes", async ({ page }) => {
    // Click on Warm Intros tab if needed
    const warmIntrosTab = page.locator('button:has-text("Warm Intros"), [role="tab"]:has-text("Warm Intros")')
    if (await warmIntrosTab.isVisible()) {
      await warmIntrosTab.click()
      await page.waitForTimeout(500)
    }

    // Scroll to super connectors section
    const superConnectors = page.locator('h3:has-text("Super Connectors")')
    await superConnectors.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)

    // Check for website links
    const fosiLink = page.locator('a[href="https://www.fosi.org"]')
    await expect(fosiLink).toBeVisible()

    const iappLink = page.locator('a[href="https://iapp.org"]')
    await expect(iappLink).toBeVisible()

    // Check for contact notes (italic text)
    await expect(page.locator('text=Apply for membership')).toBeVisible()

    // Screenshot the super connectors section
    await page.screenshot({ path: "tests/screenshots/super-connectors.png", fullPage: false })
  })

  test("quick-filter chips appear and work", async ({ page }) => {
    const warmIntrosTab = page.locator('button:has-text("Warm Intros"), [role="tab"]:has-text("Warm Intros")')
    if (await warmIntrosTab.isVisible()) {
      await warmIntrosTab.click()
      await page.waitForTimeout(500)
    }

    // Check quick-filter chips exist
    const gatekeeperChip = page.locator('button:has-text("Faith & Family Gatekeepers")')
    await expect(gatekeeperChip).toBeVisible()

    const tier1Chip = page.locator('button:has-text("Tier 1 Investors")')
    await expect(tier1Chip).toBeVisible()

    const perfectChip = page.locator('button:has-text("Perfect Thesis")')
    await expect(perfectChip).toBeVisible()

    // Click Faith & Family Gatekeepers chip
    await gatekeeperChip.click()
    await page.waitForTimeout(300)

    // Clear Filters should appear
    await expect(page.locator('button:has-text("Clear Filters")')).toBeVisible()

    // Screenshot the filtered view
    await page.screenshot({ path: "tests/screenshots/gatekeeper-filter.png", fullPage: false })

    // Clear filters
    await page.locator('button:has-text("Clear Filters")').click()
    await page.waitForTimeout(300)
  })

  test("star ratings render and persist", async ({ page }) => {
    const warmIntrosTab = page.locator('button:has-text("Warm Intros"), [role="tab"]:has-text("Warm Intros")')
    if (await warmIntrosTab.isVisible()) {
      await warmIntrosTab.click()
      await page.waitForTimeout(500)
    }

    // Check Rating column header exists
    await expect(page.locator('th:has-text("Rating")')).toBeVisible()

    // Find star buttons in the first investor row
    const firstRow = page.locator("tbody tr").first()
    const stars = firstRow.locator('button svg.lucide-star')
    await expect(stars.first()).toBeVisible()

    // Click the 4th star on the first investor
    await stars.nth(3).click()
    await page.waitForTimeout(300)

    // Screenshot the rating
    await page.screenshot({ path: "tests/screenshots/star-ratings.png", fullPage: false })

    // Reload page to verify persistence
    await page.reload()
    await page.waitForLoadState("networkidle")

    // Navigate back to warm intros if needed
    const tab = page.locator('button:has-text("Warm Intros"), [role="tab"]:has-text("Warm Intros")')
    if (await tab.isVisible()) {
      await tab.click()
      await page.waitForTimeout(500)
    }

    // The 4th star should still be filled (amber)
    const firstRowAfterReload = page.locator("tbody tr").first()
    const filledStars = firstRowAfterReload.locator('svg.lucide-star.text-amber-400')
    const count = await filledStars.count()
    expect(count).toBe(4)
  })

  test("full dashboard screenshot", async ({ page }) => {
    const warmIntrosTab = page.locator('button:has-text("Warm Intros"), [role="tab"]:has-text("Warm Intros")')
    if (await warmIntrosTab.isVisible()) {
      await warmIntrosTab.click()
      await page.waitForTimeout(500)
    }

    await page.screenshot({ path: "tests/screenshots/fundraise-full.png", fullPage: true })
  })
})
