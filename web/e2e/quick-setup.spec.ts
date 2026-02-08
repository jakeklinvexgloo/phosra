import { test, expect } from "./fixtures/auth.fixture"

test.describe("Quick Setup Wizard", () => {
  test("complete quick setup flow", async ({ authedPage: page }) => {
    // Navigate to Quick Setup
    await page.getByRole("link", { name: "Quick Setup", exact: true }).click()
    await page.waitForURL("**/dashboard/setup**")

    // Step 1: Fill child info (labels not linked via for/id)
    await page.getByPlaceholder("e.g., Emma").fill("Emma")
    await page.locator('input[type="date"]').fill("2016-06-15")

    // Click Continue to submit step 1
    await page.getByRole("button", { name: /Continue/i }).click()

    // Step 2: Should show policy review with generated rules
    await expect(
      page.getByText(/rules active/i).first()
    ).toBeVisible({ timeout: 15_000 })

    // Click "Connect Platforms" to proceed to step 3
    await page.getByRole("button", { name: /Connect Platforms/i }).click()

    // Step 3: Platform connections
    await expect(
      page.getByText(/Verified Platforms/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test("shows validation error for empty fields", async ({ authedPage: page }) => {
    await page.goto("/dashboard/setup")
    await page.waitForURL("**/dashboard/setup**")

    // The Continue button should be disabled when fields are empty
    const continueBtn = page.getByRole("button", { name: /Continue/i })
    await expect(continueBtn).toBeDisabled()
  })
})
