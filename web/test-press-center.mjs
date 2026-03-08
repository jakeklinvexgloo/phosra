import { chromium } from "playwright"
import fs from "fs"
import path from "path"

const SCREENSHOT_DIR = "/tmp/phosra-press-test"
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  // Capture console messages and network errors
  const logs = []
  page.on("console", msg => logs.push(`[${msg.type()}] ${msg.text()}`))
  page.on("requestfailed", req => logs.push(`[NETWORK FAIL] ${req.url()} - ${req.failure()?.errorText}`))
  page.on("response", res => {
    if (res.status() >= 400) {
      logs.push(`[HTTP ${res.status()}] ${res.url()}`)
    }
  })

  try {
    // Login as admin
    console.log("1. Logging in as admin...")
    await page.goto("https://www.phosra.com/login", { waitUntil: "networkidle" })
    await page.fill('input[type="email"]', "test-admin@phosra.com")
    await page.fill('input[type="password"]', "PhosraTestAdmin2026!")
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    console.log("   URL after login: " + page.url())

    // Navigate to admin
    console.log("2. Navigating to admin dashboard...")
    await page.goto("https://www.phosra.com/dashboard/admin", { waitUntil: "networkidle", timeout: 15000 })
    await page.waitForTimeout(2000)
    console.log("   URL: " + page.url())
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-admin-dashboard.png") })

    // Click Press Center in sidebar
    console.log("3. Looking for Press Center link...")
    const pressLink = page.getByText("Press Center")
    const count = await pressLink.count()
    console.log("   Found 'Press Center' links: " + count)

    if (count > 0) {
      console.log("4. Clicking Press Center...")
      await pressLink.first().click()
      await page.waitForTimeout(3000)
      console.log("   URL after click: " + page.url())
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-press-center.png") })

      // Check page content
      const bodyText = await page.textContent("body")
      if (bodyText.includes("Press Center")) {
        console.log("   Press Center page content found!")
      } else {
        console.log("   Press Center page content NOT found")
      }
      if (bodyText.includes("error") || bodyText.includes("Error")) {
        console.log("   Error text detected on page!")
      }
    } else {
      console.log("   No Press Center link found. Trying direct navigation...")
      await page.goto("https://www.phosra.com/dashboard/admin/press", { waitUntil: "networkidle", timeout: 15000 })
      await page.waitForTimeout(2000)
      console.log("   URL: " + page.url())
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-press-direct.png") })
    }

    // Check console logs
    console.log("\n5. Browser logs:")
    for (const log of logs) {
      console.log("   " + log)
    }
  } catch (err) {
    console.error("Error:", err.message)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "error.png") })
    console.log("\nBrowser logs at error:")
    for (const log of logs) {
      console.log("   " + log)
    }
  } finally {
    await browser.close()
  }
}

run()
