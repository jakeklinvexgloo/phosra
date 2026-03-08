import { chromium } from "playwright"
import fs from "fs"
import path from "path"

const SCREENSHOT_DIR = "/tmp/phosra-admin-test"
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

async function testUser(name, email, password, shouldHaveAdmin) {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const prefix = name.toLowerCase().replace(/\s+/g, "-")

  try {
    // Login
    console.log(`\n=== Testing: ${name} (${email}) ===`)
    console.log("1. Logging in...")
    await page.goto("https://www.phosra.com/login", { waitUntil: "networkidle" })
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}-01-after-login.png`) })
    console.log("   URL after login: " + page.url())

    // Navigate to dashboard
    console.log("2. Navigating to dashboard...")
    await page.goto("https://www.phosra.com/dashboard", { waitUntil: "networkidle", timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}-02-dashboard.png`) })
    console.log("   Dashboard URL: " + page.url())
    const dashboardOk = page.url().includes("/dashboard")
    console.log("   Dashboard accessible: " + dashboardOk)

    // Try admin
    console.log("3. Navigating to admin...")
    await page.goto("https://www.phosra.com/dashboard/admin", { waitUntil: "networkidle", timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}-03-admin.png`) })
    console.log("   Admin URL: " + page.url())
    const adminAccessible = page.url().includes("/admin")
    console.log("   Admin accessible: " + adminAccessible)

    if (shouldHaveAdmin && !adminAccessible) {
      console.log("   ❌ FAIL: Admin should be accessible but isn't!")
    } else if (!shouldHaveAdmin && adminAccessible) {
      console.log("   ❌ FAIL: Admin should NOT be accessible but is!")
    } else {
      console.log("   ✅ PASS: Admin access is correct")
    }

    // Try sandbox bypass
    console.log("4. Testing sandbox bypass (should fail)...")
    await page.evaluate(() => localStorage.setItem("sandbox-session", "default"))
    await page.goto("https://www.phosra.com/dashboard/admin", { waitUntil: "networkidle", timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}-04-sandbox-bypass.png`) })
    const bypassWorked = page.url().includes("/admin")
    console.log("   After sandbox bypass URL: " + page.url())
    if (bypassWorked && !shouldHaveAdmin) {
      console.log("   ❌ FAIL: Sandbox bypass STILL WORKS! Security vulnerability!")
    } else if (!bypassWorked && !shouldHaveAdmin) {
      console.log("   ✅ PASS: Sandbox bypass correctly blocked!")
    }

  } catch (err) {
    console.error("Error:", err.message)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}-error.png`) })
  } finally {
    await browser.close()
  }
}

async function run() {
  // Test regular user (should NOT have admin access)
  await testUser(
    "Regular User",
    "test-user@phosra.com",
    "PhosraTestUser2026!",
    false
  )

  // Test admin user (should have admin access)
  await testUser(
    "Admin User",
    "test-admin@phosra.com",
    "PhosraTestAdmin2026!",
    true
  )

  console.log("\n=== All tests complete ===")
  console.log("Screenshots: " + SCREENSHOT_DIR)
}

run()
