import { test, expect } from "@playwright/test"

test.describe("MCP Playground", () => {
  test.beforeEach(async ({ page }) => {
    // Inject sandbox session (same as "Continue as Dev User" button)
    await page.addInitScript(() => {
      window.localStorage.setItem("sandbox-session", "default")
    })
  })

  test("playground page loads with empty state", async ({ page }) => {
    await page.goto("/dashboard/playground")

    // Chat panel header
    await expect(page.getByText("MCP Playground")).toBeVisible()

    // Empty state welcome
    await expect(page.getByText("Try Phosra with AI")).toBeVisible()

    // Scenario cards should be visible
    await expect(page.getByText("Protect my 8-year-old")).toBeVisible()
    await expect(page.getByText("Which platforms to connect?")).toBeVisible()
    await expect(page.getByText("Tune specific rules")).toBeVisible()

    // Chat input should be present
    await expect(
      page.getByPlaceholder(/parental controls/i)
    ).toBeVisible()

    // Inspector panel — empty state
    await expect(page.getByText("Timeline")).toBeVisible()
    await expect(page.getByText("No tool calls yet")).toBeVisible()
  })

  test("sends message and receives AI response with tool calls", async ({ page }) => {
    await page.goto("/dashboard/playground")
    await page.waitForSelector("text=Try Phosra with AI")

    // Type a simple message and send
    const input = page.getByPlaceholder(/parental controls/i)
    await input.fill("List all available platforms")
    await input.press("Enter")

    // Should show loading spinner ("Thinking...")
    await expect(page.getByText("Thinking...")).toBeVisible({ timeout: 10_000 })

    // Wait for assistant response to stream in (up to 120s for Anthropic API)
    // The assistant message appears in a div with role "assistant" content
    await page.waitForFunction(
      () => {
        const msgs = document.querySelectorAll(".space-y-4 > div")
        // At least 2 divs: user message + assistant message
        return msgs.length >= 2
      },
      { timeout: 120_000 }
    )

    // Tool calls should appear in inspector panel (the "No tool calls yet" should be gone)
    await expect(page.getByText("No tool calls yet")).not.toBeVisible({ timeout: 5_000 })

    // Should show at least one tool call count
    await expect(page.getByText(/\d+ calls?/)).toBeVisible({ timeout: 5_000 })

    // Reset button should now be visible (messages exist)
    await expect(page.getByText("Reset")).toBeVisible()
  })

  test("scenario card sends pre-built prompt", async ({ page }) => {
    await page.goto("/dashboard/playground")
    await page.waitForSelector("text=Try Phosra with AI")

    // Click the first scenario card
    await page.getByText("Protect my 8-year-old").click()

    // Should trigger loading state
    await expect(page.getByText("Thinking...")).toBeVisible({ timeout: 10_000 })

    // Scenario cards should disappear (messages area replaced)
    await expect(page.getByText("Try Phosra with AI")).not.toBeVisible({ timeout: 5_000 })
  })

  test("reset clears messages and tool calls", async ({ page }) => {
    await page.goto("/dashboard/playground")

    // Send a message first
    const input = page.getByPlaceholder(/parental controls/i)
    await input.fill("List all available platforms")
    await input.press("Enter")

    // Wait for response to finish (Reset button appears after messages exist)
    await expect(page.getByText("Reset")).toBeVisible({ timeout: 120_000 })

    // Wait a moment for the response to fully stream
    await page.waitForTimeout(2_000)

    // Click reset
    await page.getByText("Reset").click()

    // Should return to empty state
    await expect(page.getByText("Try Phosra with AI")).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText("No tool calls yet")).toBeVisible({ timeout: 5_000 })
  })
})
