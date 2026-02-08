import { test, expect } from "./fixtures/auth.fixture"
import { quickSetup } from "./helpers/api-helper"

test.describe("Enforcement Status", () => {
  test("shows empty state without children or links", async ({ authedPage: page }) => {
    await page.goto("/dashboard/enforcement")
    await page.waitForURL("**/dashboard/enforcement**")

    await expect(page.getByRole("heading", { name: /Enforcement Status/i })).toBeVisible({ timeout: 10_000 })

    // Should show empty state message
    await expect(
      page.getByText(/add children|verify platform|see enforcement/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test("shows page content with seeded data", async ({ authedPage: page, tokens }) => {
    // Seed data via quick setup
    await quickSetup(tokens.access_token, {
      child_name: "Test Child",
      birth_date: "2015-01-01",
      strictness: "recommended",
    })

    await page.goto("/dashboard/enforcement")
    await page.waitForURL("**/dashboard/enforcement**")

    await expect(page.getByRole("heading", { name: /Enforcement Status/i })).toBeVisible({ timeout: 10_000 })

    // Page should load without errors (may still show empty state if no compliance links)
    await page.waitForTimeout(3_000)
  })
})
