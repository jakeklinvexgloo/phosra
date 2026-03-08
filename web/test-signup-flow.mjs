import { chromium } from "playwright"
import fs from "fs"
import path from "path"

const SCREENSHOT_DIR = "/tmp/phosra-signup-test"
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

const email = "test-newuser-" + Date.now() + "@phosra.com"
const password = "PhosraSignup2026!"

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  try {
    // Step 1: Go to login page
    console.log("1. Navigating to login page...")
    await page.goto("https://www.phosra.com/login", { waitUntil: "networkidle" })
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-login-page.png"), fullPage: true })
    console.log("   Screenshot: 01-login-page.png")

    // Step 2: Switch to sign up mode
    console.log("2. Switching to sign up mode...")
    const signUpLink = page.getByText("Don't have an account? Create one")
    await signUpLink.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-signup-mode.png"), fullPage: true })
    console.log("   Screenshot: 02-signup-mode.png")

    // Step 3: Fill in email and password
    console.log("3. Filling in credentials...")
    console.log("   Email: " + email)
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-filled-form.png"), fullPage: true })
    console.log("   Screenshot: 03-filled-form.png")

    // Step 4: Submit
    console.log("4. Submitting sign up...")
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-after-submit.png"), fullPage: true })
    console.log("   Screenshot: 04-after-submit.png")
    console.log("   Current URL: " + page.url())

    // Step 5: Wait for dashboard or any redirect
    console.log("5. Waiting for navigation...")
    try {
      await page.waitForURL("**/dashboard**", { timeout: 10000 })
      console.log("   Redirected to dashboard!")
    } catch {
      console.log("   Did not redirect to dashboard within 10s. Current URL: " + page.url())
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-dashboard.png"), fullPage: true })
    console.log("   Screenshot: 05-dashboard.png")

    // Step 6: Check for org/developer setup
    console.log("6. Checking dashboard content...")
    const pageContent = await page.textContent("body")

    // Look for organization-related UI
    if (pageContent.includes("Organization") || pageContent.includes("organization")) {
      console.log("   Found organization references on page")
    }
    if (pageContent.includes("Developer") || pageContent.includes("developer") || pageContent.includes("API")) {
      console.log("   Found developer/API references on page")
    }

    // Step 7: Try navigating to developer section if it exists
    console.log("7. Checking developer portal access...")
    await page.goto("https://www.phosra.com/dashboard/developer", { waitUntil: "networkidle", timeout: 10000 }).catch(() => {})
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-developer-portal.png"), fullPage: true })
    console.log("   Screenshot: 06-developer-portal.png")
    console.log("   URL: " + page.url())

    // Step 8: Check admin access (should be denied for regular user)
    console.log("8. Checking admin access (should be denied)...")
    await page.goto("https://www.phosra.com/dashboard/admin", { waitUntil: "networkidle", timeout: 10000 }).catch(() => {})
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-admin-access.png"), fullPage: true })
    console.log("   Screenshot: 07-admin-access.png")
    console.log("   URL: " + page.url())

    console.log("\nDone! Email used: " + email)
    console.log("Screenshots saved to: " + SCREENSHOT_DIR)

  } catch (err) {
    console.error("Error:", err.message)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "error.png"), fullPage: true })
  } finally {
    await browser.close()
  }
}

run()
