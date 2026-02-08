import { test, expect } from "./fixtures/auth.fixture"
import { quickSetup } from "./helpers/api-helper"

test.describe("Dashboard Home", () => {
  test("shows welcome and quick-start cards for new user", async ({ authedPage: page }) => {
    await expect(page.getByRole("heading", { name: /Welcome to Phosra/i })).toBeVisible()

    // Quick-start cards should be visible (use heading role to avoid sidebar duplicates)
    await expect(page.getByRole("heading", { name: "Quick Setup" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Platforms" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "API Reference" })).toBeVisible()
  })

  test("create family flow", async ({ authedPage: page }) => {
    // Click the "Create Family" button (exact text from the code)
    await page.getByRole("button", { name: "Create Family" }).click()

    // Fill in family name in the modal
    await page.getByPlaceholder("Family name").fill("Test Family")
    await page.getByRole("button", { name: "Create", exact: true }).click()

    // After family is created, dashboard switches to overview mode
    await expect(page.getByText("Overview")).toBeVisible({ timeout: 10_000 })
  })

  test("sidebar navigation works", async ({ authedPage: page }) => {
    // Navigate to each main section via sidebar
    const navItems = [
      { name: "Quick Setup", url: "/dashboard/setup" },
      { name: "API Docs", url: "/dashboard/docs" },
      { name: "Platforms", url: "/dashboard/platforms" },
      { name: "Enforcement", url: "/dashboard/enforcement" },
      { name: "Children", url: "/dashboard/children" },
      { name: "Settings", url: "/dashboard/settings" },
      { name: "Home", url: "/dashboard" },
    ]

    for (const item of navItems) {
      await page.getByRole("link", { name: item.name, exact: true }).click()
      await page.waitForURL(`**${item.url}**`, { timeout: 10_000 })
    }
  })

  test("shows overview stats when family has data", async ({ authedPage: page, tokens }) => {
    // Seed data via API — quickSetup creates family + child + policy
    await quickSetup(tokens.access_token, {
      child_name: "Emma",
      birth_date: "2016-06-15",
      strictness: "recommended",
    })

    // Reload dashboard
    await page.goto("/dashboard")
    await page.waitForURL("**/dashboard**")

    // Dashboard should now show Overview mode with stats
    await expect(page.getByText("Overview")).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText("Emma")).toBeVisible({ timeout: 10_000 })
  })
})
