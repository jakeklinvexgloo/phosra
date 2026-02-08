import { test, expect } from "./fixtures/auth.fixture"
import { test as baseTest, expect as baseExpect } from "@playwright/test"

test.describe("Dashboard Docs", () => {
  test("navigate to docs via sidebar", async ({ authedPage: page }) => {
    // Click API Docs in sidebar
    await page.getByRole("link", { name: "API Docs" }).click()
    await page.waitForURL("**/dashboard/docs**")

    // Should render docs content in-app (look for "Specification" heading in sidebar)
    await expect(page.getByText("Specification").first()).toBeVisible({ timeout: 15_000 })

    // Dashboard sidebar should still be visible
    await expect(page.locator("aside").first()).toBeVisible()
  })

  test("docs sidebar shows section links", async ({ authedPage: page }) => {
    await page.goto("/dashboard/docs")
    await page.waitForURL("**/dashboard/docs**")

    // Wait for docs to load
    await expect(page.getByText("Specification").first()).toBeVisible({ timeout: 15_000 })

    // Look for section navigation items
    await expect(page.getByText("Preamble")).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText("1. Platform Authentication").first()).toBeVisible()
  })

  test("endpoint cards render with method badges", async ({ authedPage: page }) => {
    await page.goto("/dashboard/docs")
    await page.waitForURL("**/dashboard/docs**")

    // Wait for docs content to load
    await expect(page.getByText("Specification").first()).toBeVisible({ timeout: 15_000 })

    // Look for HTTP method badges (POST, GET, etc.)
    await expect(page.getByText("POST").first()).toBeVisible({ timeout: 10_000 })

    // Look for code panels (pre elements with curl examples)
    await expect(page.locator("pre").first()).toBeVisible()
  })

  test("switch to Recipes tab", async ({ authedPage: page }) => {
    await page.goto("/dashboard/docs")
    await page.waitForURL("**/dashboard/docs**")

    await expect(page.getByText("Specification").first()).toBeVisible({ timeout: 15_000 })

    // Click Recipes tab (the tab bar button, not the sidebar link)
    // The tab bar buttons have py-3 class vs sidebar buttons with py-1.5
    await page.locator("main").getByRole("button", { name: /Recipes/i }).last().click()
    await page.waitForTimeout(2_000)

    // Recipes tab content should be showing
    await expect(page.getByText(/recipe/i).first()).toBeVisible()
  })
})

baseTest.describe("Public Docs", () => {
  baseTest("public docs page is accessible without auth", async ({ page }) => {
    // Navigate directly to public docs (no auth needed)
    await page.goto("/docs")
    await page.waitForURL("**/docs**")

    // Should show docs content
    await expect(page.getByText("Specification").first()).toBeVisible({ timeout: 15_000 })

    // Should NOT show the dashboard sidebar with Home link
    await expect(page.getByRole("link", { name: "Home", exact: true })).not.toBeVisible()
  })
})
