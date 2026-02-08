import { test as base, expect, type Page } from "@playwright/test"
import { testUser } from "../helpers/test-user"
import { registerUser, type AuthTokens } from "../helpers/api-helper"

interface AuthFixtures {
  authedPage: Page
  tokens: AuthTokens
}

export const test = base.extend<AuthFixtures>({
  tokens: async ({}, use) => {
    const user = testUser()
    const result = await registerUser(user.email, user.password, user.name)
    await use(result.tokens)
  },

  authedPage: async ({ page, tokens }, use) => {
    // Inject tokens into localStorage before navigating
    await page.addInitScript(
      ({ accessToken, refreshToken }) => {
        window.localStorage.setItem("access_token", accessToken)
        window.localStorage.setItem("refresh_token", refreshToken)
      },
      { accessToken: tokens.access_token, refreshToken: tokens.refresh_token }
    )

    // Navigate to dashboard and wait for it to load
    await page.goto("/dashboard")
    await page.waitForURL("**/dashboard**")
    // Wait for any content to load — the header user name
    await page.locator("header").locator(".font-medium").waitFor({ timeout: 15_000 })

    await use(page)
  },
})

export { expect }
