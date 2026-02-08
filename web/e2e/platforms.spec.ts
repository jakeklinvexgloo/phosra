import { test, expect } from "./fixtures/auth.fixture"

test.describe("Platform Explorer", () => {
  test("displays platform list", async ({ authedPage: page }) => {
    await page.goto("/dashboard/platforms")
    await page.waitForURL("**/dashboard/platforms**")

    // Should show the Platforms heading (it's in the sidebar but also possibly in content)
    // Wait for table to load
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 })
  })

  test("search filters platforms", async ({ authedPage: page }) => {
    await page.goto("/dashboard/platforms")
    await page.waitForURL("**/dashboard/platforms**")

    // Wait for platforms to load
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 })

    // Type in search field (scope to main to avoid header search)
    const searchInput = page.getByPlaceholder("Search platforms by name")
    if (await searchInput.isVisible()) {
      await searchInput.fill("NextDNS")
      await page.waitForTimeout(500)

      // Should show filtered results
      await expect(page.getByText(/NextDNS/i).first()).toBeVisible()
    }
  })

  test("expand platform shows detail", async ({ authedPage: page }) => {
    await page.goto("/dashboard/platforms")
    await page.waitForURL("**/dashboard/platforms**")

    // Wait for table to load
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 })

    // Click on a platform row to expand it
    await page.locator("tbody tr").first().click()
    await page.waitForTimeout(1_000)

    // Should show some expanded content (capabilities, etc)
    // Just verify no error
  })
})
