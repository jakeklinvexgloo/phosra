import { test, expect } from "./fixtures/auth.fixture"
import { createFamily } from "./helpers/api-helper"

test.describe("Settings", () => {
  test("shows user account information", async ({ authedPage: page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForURL("**/dashboard/settings**")

    await expect(page.getByRole("heading", { name: /Settings/i })).toBeVisible({ timeout: 10_000 })

    // Account section should show user info
    await expect(page.getByRole("heading", { name: "Account" })).toBeVisible()
    // User email containing "test-" or name containing "Test User"
    await expect(page.getByText(/Test User/i).first()).toBeVisible()
  })

  test("shows webhook creation form", async ({ authedPage: page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForURL("**/dashboard/settings**")

    // Webhooks section
    await expect(page.getByText("Webhooks")).toBeVisible({ timeout: 10_000 })
    await expect(page.getByPlaceholder(/your-server/i)).toBeVisible()
    await expect(page.locator('input[type="text"]').last()).toBeVisible()
    await expect(page.getByRole("button", { name: /Add Webhook/i })).toBeVisible()
  })

  test("create webhook with family", async ({ authedPage: page, tokens }) => {
    // Need a family for webhook creation
    await createFamily(tokens.access_token, "Webhook Family")

    await page.goto("/dashboard/settings")
    await page.waitForURL("**/dashboard/settings**")

    // Fill webhook form
    await page.getByPlaceholder(/your-server/i).fill("https://example.com/webhook")

    // Handle the alert that appears on webhook creation
    page.on("dialog", (dialog) => dialog.accept())

    // Submit
    await page.getByRole("button", { name: /Add Webhook/i }).click()

    // The page uses alert() for confirmation, wait for it
    await page.waitForTimeout(2_000)
  })

  test("shows API info section", async ({ authedPage: page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForURL("**/dashboard/settings**")

    // API section
    await expect(page.getByRole("heading", { name: "API" })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/api\.phosra\.com/)).toBeVisible()
    await expect(page.getByRole("link", { name: /View PCSS/i })).toBeVisible()
  })
})
