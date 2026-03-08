import { chromium } from "playwright"
import fs from "fs"
import path from "path"

const DIR = "/tmp/phosra-production-test"
fs.mkdirSync(DIR, { recursive: true })

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  const errors = []
  const networkErrors = []
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()) })
  page.on("requestfailed", req => networkErrors.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`))
  page.on("response", res => {
    if (res.status() >= 400) {
      networkErrors.push(`[HTTP ${res.status()}] ${res.method()} ${res.url()}`)
    }
  })

  try {
    // Step 1: Login
    console.log("=== Step 1: Login as admin ===")
    await page.goto("https://www.phosra.com/login", { waitUntil: "networkidle" })
    await page.screenshot({ path: path.join(DIR, "01-login.png") })
    console.log("URL: " + page.url())

    await page.fill('input[type="email"]', "test-admin@phosra.com")
    await page.fill('input[type="password"]', "PhosraTestAdmin2026!")
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)
    await page.screenshot({ path: path.join(DIR, "02-after-login.png") })
    console.log("URL after login: " + page.url())

    // Step 2: Navigate to admin dashboard
    console.log("\n=== Step 2: Navigate to admin ===")
    await page.goto("https://www.phosra.com/dashboard/admin", { waitUntil: "networkidle" })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: path.join(DIR, "03-admin.png") })
    console.log("URL: " + page.url())

    // Step 3: Scroll sidebar to find Press Center
    console.log("\n=== Step 3: Find Press Center link ===")
    const sidebar = page.locator("aside")
    const sidebarCount = await sidebar.count()
    console.log("Sidebar elements: " + sidebarCount)

    // List all sidebar links
    const allLinks = page.locator("aside a")
    const linkCount = await allLinks.count()
    console.log("Total sidebar links: " + linkCount)
    for (let i = 0; i < linkCount; i++) {
      const text = await allLinks.nth(i).textContent()
      const href = await allLinks.nth(i).getAttribute("href")
      console.log(`  [${i}] ${text?.trim()} -> ${href}`)
    }

    // Step 4: Click Press Center
    console.log("\n=== Step 4: Click Press Center ===")
    const pressLink = page.locator('a[href="/dashboard/admin/press"]')
    const pressCount = await pressLink.count()
    console.log("Press Center link count: " + pressCount)

    if (pressCount > 0) {
      // Check if visible
      const isVisible = await pressLink.first().isVisible()
      console.log("Link visible: " + isVisible)

      if (!isVisible) {
        console.log("Scrolling sidebar to make it visible...")
        await pressLink.first().scrollIntoViewIfNeeded()
        await page.waitForTimeout(500)
      }

      // Clear tracking
      errors.length = 0
      networkErrors.length = 0

      await pressLink.first().click()
      console.log("Clicked! Waiting...")

      // Wait for navigation
      await page.waitForTimeout(5000)
      console.log("URL after click: " + page.url())
      await page.screenshot({ path: path.join(DIR, "04-after-press-click.png") })

      const h1 = await page.locator("h1").first().textContent().catch(() => "N/A")
      console.log("H1: " + h1)
      const bodyText = await page.textContent("body")
      const has404 = bodyText?.includes("404") || bodyText?.includes("not be found")
      const hasPress = bodyText?.includes("Press Center")
      console.log("Has 404: " + has404)
      console.log("Has Press Center: " + hasPress)
    }

    // Step 5: Try direct navigation
    console.log("\n=== Step 5: Direct navigation to /dashboard/admin/press ===")
    errors.length = 0
    networkErrors.length = 0
    await page.goto("https://www.phosra.com/dashboard/admin/press", { waitUntil: "networkidle", timeout: 15000 })
    await page.waitForTimeout(3000)
    console.log("URL: " + page.url())
    await page.screenshot({ path: path.join(DIR, "05-direct-press.png") })
    const h1Direct = await page.locator("h1").first().textContent().catch(() => "N/A")
    console.log("H1: " + h1Direct)

    // Step 6: Test other admin pages
    console.log("\n=== Step 6: Test other admin pages ===")
    const adminPages = [
      "/dashboard/admin/outreach",
      "/dashboard/admin/news",
      "/dashboard/admin/workers",
      "/dashboard/admin/fundraise",
    ]
    for (const pg of adminPages) {
      await page.goto("https://www.phosra.com" + pg, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {})
      await page.waitForTimeout(2000)
      const url = page.url()
      const h1 = await page.locator("h1").first().textContent().catch(() => "N/A")
      const worked = url.includes(pg)
      console.log(`  ${pg} -> ${worked ? "OK" : "FAIL"} (URL: ${url}, H1: ${h1?.trim()})`)
    }

    // Report errors
    console.log("\n=== Console Errors ===")
    if (errors.length === 0) console.log("  None")
    errors.forEach(e => console.log("  " + e))

    console.log("\n=== Network Errors ===")
    if (networkErrors.length === 0) console.log("  None")
    networkErrors.forEach(e => console.log("  " + e))

  } catch (err) {
    console.error("\nFATAL:", err.message)
    await page.screenshot({ path: path.join(DIR, "error.png") })
  } finally {
    await browser.close()
  }

  console.log("\nScreenshots: " + DIR)
}

run()
