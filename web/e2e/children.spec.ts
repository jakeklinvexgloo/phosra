import { test, expect } from "./fixtures/auth.fixture"
import { createFamily, createChild } from "./helpers/api-helper"

test.describe("Children Management", () => {
  test("shows children list after seeding data", async ({ authedPage: page, tokens }) => {
    // Seed a family and children via API
    const family = await createFamily(tokens.access_token, "Kids Family")
    await createChild(tokens.access_token, family.id, "Emma", "2016-06-15")
    await createChild(tokens.access_token, family.id, "Liam", "2018-03-20")

    // Navigate to children page
    await page.goto("/dashboard/children")
    await page.waitForURL("**/dashboard/children**")

    // Both children should be visible
    await expect(page.getByText("Emma")).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText("Liam")).toBeVisible()
  })

  test("navigate to child detail page with tabs", async ({ authedPage: page, tokens }) => {
    const family = await createFamily(tokens.access_token, "Detail Family")
    const child = await createChild(tokens.access_token, family.id, "Sophie", "2015-09-10")

    await page.goto("/dashboard/children")
    await page.waitForURL("**/dashboard/children**")

    // Click on child card to navigate to detail
    await page.getByText("Sophie").click()
    await page.waitForURL(`**/dashboard/children/${child.id}**`)

    // Should show child name and tabs
    await expect(page.getByRole("heading", { name: "Sophie" })).toBeVisible({ timeout: 10_000 })

    // Verify tabs exist
    await expect(page.getByRole("button", { name: /policies/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /ratings/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /enforcement/i })).toBeVisible()
  })

  test("add child via form", async ({ authedPage: page, tokens }) => {
    const family = await createFamily(tokens.access_token, "Add Child Family")

    await page.goto("/dashboard/children")
    await page.waitForURL("**/dashboard/children**")

    // Click add child button
    await page.getByRole("button", { name: /Add Child/i }).click()

    // Fill in the form (labels aren't linked to inputs via for/id)
    // Use main content area to avoid matching the header search input
    await page.locator('main input[type="text"]').fill("Olivia")
    await page.locator('input[type="date"]').fill("2017-11-22")

    // Submit
    await page.getByRole("button", { name: "Add Child" }).last().click()

    // Olivia should appear in the children list
    await expect(page.getByText("Olivia")).toBeVisible({ timeout: 10_000 })
  })

  test("child detail shows age ratings tab", async ({ authedPage: page, tokens }) => {
    const family = await createFamily(tokens.access_token, "Ratings Family")
    const child = await createChild(tokens.access_token, family.id, "Noah", "2014-04-05")

    await page.goto(`/dashboard/children/${child.id}`)
    await page.waitForURL(`**/dashboard/children/${child.id}**`)

    // Wait for child to load
    await expect(page.getByRole("heading", { name: "Noah" })).toBeVisible({ timeout: 10_000 })

    // Click ratings tab
    await page.getByRole("button", { name: /ratings/i }).click()

    // Should show age rating content (might be empty but the tab should render)
    await expect(page.getByText(/rating|mpaa|tv|esrb|pegi|csm|content/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
