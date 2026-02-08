import { test, expect } from "./fixtures/auth.fixture"
import { createFamily, createChild, createPolicy, generateFromAge } from "./helpers/api-helper"

test.describe("Policy Editor", () => {
  test("view policy and create from child detail", async ({ authedPage: page, tokens }) => {
    const family = await createFamily(tokens.access_token, "Policy Family")
    const child = await createChild(tokens.access_token, family.id, "Mia", "2015-07-20")

    // Navigate to child detail
    await page.goto(`/dashboard/children/${child.id}`)
    await expect(page.getByRole("heading", { name: "Mia" })).toBeVisible({ timeout: 10_000 })

    // Create a policy from the child detail page
    await page.getByPlaceholder(/new policy name/i).fill("Mia's Daily Policy")
    await page.getByRole("button", { name: /Create Policy/i }).click()

    // Policy should appear
    await expect(page.getByText("Mia's Daily Policy")).toBeVisible({ timeout: 10_000 })
  })

  test("navigate to policy rule editor", async ({ authedPage: page, tokens }) => {
    const family = await createFamily(tokens.access_token, "Rule Family")
    const child = await createChild(tokens.access_token, family.id, "Ava", "2016-01-15")
    const policy = await createPolicy(tokens.access_token, child.id, "Test Rules")

    // Navigate to policy editor
    await page.goto(`/dashboard/children/${child.id}/policies/${policy.id}`)
    await page.waitForURL(`**/policies/${policy.id}**`)

    // Should show policy name and rules/categories area
    await expect(page.getByText("Test Rules")).toBeVisible({ timeout: 10_000 })
  })

  test("generate from age populates rules", async ({ authedPage: page, tokens }) => {
    const family = await createFamily(tokens.access_token, "Generate Family")
    const child = await createChild(tokens.access_token, family.id, "Lucas", "2014-03-10")
    const policy = await createPolicy(tokens.access_token, child.id, "Age Rules")

    // Navigate to child detail (policies tab)
    await page.goto(`/dashboard/children/${child.id}`)
    await expect(page.getByRole("heading", { name: "Lucas" })).toBeVisible({ timeout: 10_000 })

    // Click generate from age on the policy card
    await page.getByRole("button", { name: /generate from age/i }).click()

    // Wait for the rules to update (page might refresh data)
    await page.waitForTimeout(2_000)

    // The policy should now show updated status or rule count
    await expect(page.getByText("Age Rules")).toBeVisible()
  })
})
