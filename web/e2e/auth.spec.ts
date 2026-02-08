import { test, expect } from "@playwright/test"
import { testUser } from "./helpers/test-user"
import { registerUser } from "./helpers/api-helper"

test.describe("Authentication", () => {
  test("sign in with valid credentials", async ({ page }) => {
    // First, register a user via API
    const user = testUser()
    await registerUser(user.email, user.password, user.name)

    // Navigate to login page
    await page.goto("/")
    await expect(page.getByText("Welcome back")).toBeVisible()

    // Fill form and submit (inputs follow labels inside div wrappers)
    await page.locator('input[type="email"]').fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole("button", { name: "Sign In" }).click()

    // Should redirect to dashboard
    await page.waitForURL("**/dashboard**", { timeout: 15_000 })
    await expect(page.locator("header").getByText(user.name)).toBeVisible({
      timeout: 15_000,
    })
  })

  test("sign in with invalid credentials shows error", async ({ page }) => {
    await page.goto("/")
    await page.locator('input[type="email"]').fill("nonexistent@example.com")
    await page.locator('input[type="password"]').fill("wrongpassword1")
    await page.getByRole("button", { name: "Sign In" }).click()

    // Should show error message
    await expect(page.locator('[class*="destructive"]')).toBeVisible({
      timeout: 10_000,
    })
  })

  test("register new account", async ({ page }) => {
    const user = testUser()

    await page.goto("/")

    // Click "Get started" to begin registration
    await page.getByRole("button", { name: "Get started" }).click()
    await expect(page.getByText("Welcome! How can we help")).toBeVisible()

    // Select "Parent or guardian" role
    await page.getByText("Parent or guardian").click()
    await page.getByRole("button", { name: "Continue" }).click()

    // Fill registration form
    await expect(page.getByText("Create your account")).toBeVisible()
    await page.locator('input[type="text"]').fill(user.name)
    await page.locator('input[type="email"]').fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole("button", { name: "Create Account" }).click()

    // Should redirect to dashboard
    await page.waitForURL("**/dashboard**", { timeout: 15_000 })
    await expect(page.locator("header").getByText(user.name)).toBeVisible({
      timeout: 15_000,
    })
  })

  test("sign out redirects to login", async ({ page }) => {
    // Sign in first
    const user = testUser()
    await registerUser(user.email, user.password, user.name)

    await page.goto("/")
    await page.locator('input[type="email"]').fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole("button", { name: "Sign In" }).click()
    await page.waitForURL("**/dashboard**", { timeout: 15_000 })
    await page.locator("header").getByText(user.name).waitFor({ timeout: 15_000 })

    // Click sign out
    await page.getByRole("button", { name: /sign out/i }).click()

    // Should redirect to login page
    await page.waitForURL("/", { timeout: 10_000 })
    await expect(page.getByText("Welcome back")).toBeVisible({ timeout: 10_000 })
  })

  test("auth guard redirects unauthenticated users to login", async ({ page }) => {
    // Clear any existing tokens
    await page.goto("/")
    await page.evaluate(() => {
      window.localStorage.removeItem("access_token")
      window.localStorage.removeItem("refresh_token")
    })

    // Try to navigate to dashboard
    await page.goto("/dashboard")

    // Should redirect back to login page
    await page.waitForURL("/", { timeout: 10_000 })
    await expect(page.getByText("Welcome back")).toBeVisible()
  })
})
