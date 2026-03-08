import { chromium } from "playwright"
import fs from "fs"
import path from "path"

const DIR = "/tmp/phosra-jake-test"
fs.mkdirSync(DIR, { recursive: true })

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  const networkLog = []
  page.on("response", res => {
    const url = res.url()
    if (url.includes("/auth/me") || url.includes("/api/press") || url.includes("phosra-api")) {
      networkLog.push(`[${res.status()}] ${res.url()}`)
    }
  })
  page.on("console", msg => {
    if (msg.type() === "error") networkLog.push(`[CONSOLE ERROR] ${msg.text()}`)
  })

  try {
    // Login as Jake
    console.log("1. Logging in as jake.k.klinvex@phosra.com...")
    await page.goto("https://www.phosra.com/login", { waitUntil: "networkidle" })
    await page.fill('input[type="email"]', "jake.k.klinvex@phosra.com")
    // We don't know the password, let's try to find it
    console.log("   Need password - checking if this account uses magic link or password...")
    await page.screenshot({ path: path.join(DIR, "01-login.png") })

    // Check what login options are available
    const passwordField = page.locator('input[type="password"]')
    const hasPassword = await passwordField.count() > 0
    console.log("   Has password field: " + hasPassword)

    if (hasPassword) {
      console.log("   ERROR: Don't know the password for jake.k.klinvex@phosra.com")
      console.log("   Let me check the database for this user instead...")
    }

  } catch (err) {
    console.error("Error:", err.message)
  } finally {
    await browser.close()
  }
}

run()
