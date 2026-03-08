import { chromium } from "playwright"
import fs from "fs"
import path from "path"

const DIR = "/tmp/phosra-press-click"
fs.mkdirSync(DIR, { recursive: true })

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  const errors = []
  const requests = []
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()) })
  page.on("response", res => {
    if (res.url().includes("api") || res.status() >= 400) {
      requests.push(`[${res.status()}] ${res.url().substring(0, 120)}`)
    }
  })

  // Login
  console.log("Logging in as admin...")
  await page.goto("https://www.phosra.com/login", { waitUntil: "networkidle" })
  await page.fill('input[type="email"]', "test-admin@phosra.com")
  await page.fill('input[type="password"]', "PhosraTestAdmin2026!")
  await page.click('button[type="submit"]')
  await page.waitForTimeout(4000)

  // Go to admin
  console.log("Going to admin...")
  await page.goto("https://www.phosra.com/dashboard/admin", { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(DIR, "01-admin.png") })

  // Click Press Center
  console.log("Clicking Press Center sidebar link...")
  errors.length = 0
  requests.length = 0

  const link = page.locator('a[href="/dashboard/admin/press"]')
  const linkCount = await link.count()
  console.log("  Link elements found: " + linkCount)

  if (linkCount > 0) {
    const box = await link.first().boundingBox()
    console.log("  Link bounding box:", JSON.stringify(box))

    await link.first().click()
    console.log("  Clicked! Waiting 5s...")
    await page.waitForTimeout(5000)
    console.log("  URL now: " + page.url())
    await page.screenshot({ path: path.join(DIR, "02-after-click.png") })

    // Check for content
    const h1 = await page.locator("h1").textContent().catch(() => "N/A")
    console.log("  H1 text: " + h1)
  }

  console.log("\nNetwork responses:")
  requests.forEach(r => console.log("  " + r))
  console.log("\nConsole errors:")
  errors.forEach(e => console.log("  " + e))

  await browser.close()
}

run()
