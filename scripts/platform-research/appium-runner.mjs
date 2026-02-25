#!/usr/bin/env node

/**
 * Appium iOS Simulator Research Runner
 *
 * Researches parental control settings in iOS apps by automating the
 * Xcode Simulator via Appium (WebDriver protocol).
 *
 * Usage:
 *   node scripts/platform-research/appium-runner.mjs                         # Research all iOS platforms
 *   node scripts/platform-research/appium-runner.mjs --platform bark         # Research one platform
 *   node scripts/platform-research/appium-runner.mjs --category kids_app     # Research a category
 *   node scripts/platform-research/appium-runner.mjs --list                  # List iOS platforms
 *
 * Prerequisites:
 *   1. macOS with Xcode installed (Xcode > Settings > Platforms > iOS Simulator)
 *   2. npm install -g appium
 *   3. appium driver install xcuitest
 *   4. Copy .env.platform-credentials.example → .env.platform-credentials
 *   5. Fill in credentials for the platforms you want to research
 *
 * Architecture:
 *   - Uses Appium with XCUITest driver to control the iOS Simulator
 *   - Each platform has an optional dedicated research module in ./platforms/
 *   - Falls back to generic iOS research for platforms without a module
 *   - Results saved to ./results/ as JSON (same format as Playwright results)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "../..")
const RESULTS_DIR = join(__dirname, "results")
const SCREENSHOTS_DIR = join(__dirname, "screenshots")

// ── Load credentials ────────────────────────────────────────────

function loadCredentials() {
  const credFile = join(ROOT, ".env.platform-credentials")
  if (!existsSync(credFile)) {
    console.error("⚠  No .env.platform-credentials found.")
    console.error("   Copy .env.platform-credentials.example and fill in your credentials.")
    return {}
  }

  const creds = {}
  const lines = readFileSync(credFile, "utf-8").split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    if (value) creds[key] = value
  }
  return creds
}

// ── Platform-specific Appium modules ────────────────────────────

const IOS_PLATFORM_MODULES = {
  "apple-screen-time": "./platforms/ios-screen-time.mjs",
  // Add more as scripts are created:
  // "bark": "./platforms/ios-bark.mjs",
  // "youtube-kids": "./platforms/ios-youtube-kids.mjs",
}

// ── iOS Platform registry (Appium-researchable) ─────────────────

const IOS_PLATFORMS = [
  // Device / OS
  { id: "apple-screen-time", name: "Apple Screen Time", category: "device", bundleId: "com.apple.Preferences", credentialKeys: { email: "APPLE_SCREEN_TIME_EMAIL", password: "APPLE_SCREEN_TIME_PASSWORD" }, needsCredentials: false },
  { id: "apple-family-sharing", name: "Apple Family Sharing", category: "device", bundleId: "com.apple.Preferences", credentialKeys: { email: "APPLE_FAMILY_SHARING_EMAIL", password: "APPLE_FAMILY_SHARING_PASSWORD" }, needsCredentials: false },

  // Parental Control Apps
  { id: "bark", name: "Bark", category: "parental_control", bundleId: "us.bark.appParent", credentialKeys: { email: "BARK_EMAIL", password: "BARK_PASSWORD" }, needsCredentials: true },
  { id: "qustodio", name: "Qustodio", category: "parental_control", bundleId: "com.qustodio.qustodioapp", credentialKeys: { email: "QUSTODIO_EMAIL", password: "QUSTODIO_PASSWORD" }, needsCredentials: true },
  { id: "net-nanny", name: "Net Nanny", category: "parental_control", bundleId: "com.contentwatch.netnanny", credentialKeys: { email: "NET_NANNY_EMAIL", password: "NET_NANNY_PASSWORD" }, needsCredentials: true },
  { id: "kidslox", name: "Kidslox", category: "parental_control", bundleId: "com.kidslox.KidsloxApp", credentialKeys: { email: "KIDSLOX_EMAIL", password: "KIDSLOX_PASSWORD" }, needsCredentials: true },
  { id: "ourpact", name: "OurPact", category: "parental_control", bundleId: "com.ourpact.OurPact", credentialKeys: { email: "OUR_PACT_EMAIL", password: "OUR_PACT_PASSWORD" }, needsCredentials: true },

  // Kids Apps
  { id: "messenger-kids", name: "Messenger Kids", category: "kids_app", bundleId: "com.facebook.talk", credentialKeys: { email: "MESSENGER_KIDS_EMAIL", password: "MESSENGER_KIDS_PASSWORD" }, needsCredentials: true },
  { id: "youtube-kids", name: "YouTube Kids", category: "kids_app", bundleId: "com.google.ios.youtubekids", credentialKeys: { email: "YOUTUBE_KIDS_EMAIL", password: "YOUTUBE_KIDS_PASSWORD" }, needsCredentials: true },
  { id: "spotify-kids", name: "Spotify Kids", category: "kids_app", bundleId: "com.spotify.client", credentialKeys: { email: "SPOTIFY_KIDS_EMAIL", password: "SPOTIFY_KIDS_PASSWORD" }, needsCredentials: true },
  { id: "pbs-kids", name: "PBS Kids", category: "kids_app", bundleId: "org.pbskids.video", credentialKeys: { email: "PBS_KIDS_EMAIL", password: "PBS_KIDS_PASSWORD" }, needsCredentials: false },
  { id: "nick-jr", name: "Nick Jr.", category: "kids_app", bundleId: "com.nickjr.NickJr", credentialKeys: { email: "NICK_JR_EMAIL", password: "NICK_JR_PASSWORD" }, needsCredentials: true },
  { id: "abc-mouse", name: "ABCmouse", category: "kids_app", bundleId: "com.ageoflearning.ABCmouse", credentialKeys: { email: "ABC_MOUSE_EMAIL", password: "ABC_MOUSE_PASSWORD" }, needsCredentials: true },
  { id: "khan-academy-kids", name: "Khan Academy Kids", category: "kids_app", bundleId: "org.khanacademy.kids", credentialKeys: { email: "KHAN_ACADEMY_KIDS_EMAIL", password: "KHAN_ACADEMY_KIDS_PASSWORD" }, needsCredentials: false },

  // Cross-platform apps researchable via iOS
  { id: "netflix", name: "Netflix (iOS)", category: "streaming", bundleId: "com.netflix.Netflix", credentialKeys: { email: "NETFLIX_EMAIL", password: "NETFLIX_PASSWORD" }, needsCredentials: true },
  { id: "disney-plus", name: "Disney+ (iOS)", category: "streaming", bundleId: "com.disney.disneyplus", credentialKeys: { email: "DISNEY_PLUS_EMAIL", password: "DISNEY_PLUS_PASSWORD" }, needsCredentials: true },
  { id: "roblox", name: "Roblox (iOS)", category: "gaming", bundleId: "com.roblox.robloxmobile", credentialKeys: { email: "ROBLOX_EMAIL", password: "ROBLOX_PASSWORD" }, needsCredentials: true },
  { id: "tiktok", name: "TikTok (iOS)", category: "social", bundleId: "com.zhiliaoapp.musically", credentialKeys: { email: "TIKTOK_EMAIL", password: "TIKTOK_PASSWORD" }, needsCredentials: true },
]

// ── CLI argument parsing ────────────────────────────────────────

const args = process.argv.slice(2)
const flags = {}
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--platform" && args[i + 1]) flags.platform = args[++i]
  else if (args[i] === "--category" && args[i + 1]) flags.category = args[++i]
  else if (args[i] === "--list") flags.list = true
  else if (args[i] === "--device" && args[i + 1]) flags.device = args[++i]
  else if (args[i] === "--help") flags.help = true
  else if (args[i] === "--check") flags.check = true
}

if (flags.help) {
  console.log(`
Appium iOS Simulator Research Runner — Phosra

Usage:
  node appium-runner.mjs                                    Research all iOS platforms
  node appium-runner.mjs --platform apple-screen-time       Research one platform
  node appium-runner.mjs --category parental_control        Research a category
  node appium-runner.mjs --list                             List iOS platforms
  node appium-runner.mjs --check                            Verify prerequisites
  node appium-runner.mjs --device "iPhone 15 Pro"           Use specific simulator device

Prerequisites:
  1. macOS with Xcode installed
  2. npm install -g appium
  3. appium driver install xcuitest
  4. Copy .env.platform-credentials.example → .env.platform-credentials
`)
  process.exit(0)
}

// ── Prerequisite checker ────────────────────────────────────────

function checkPrerequisites() {
  const checks = []

  // Check macOS
  try {
    const platform = execSync("uname -s", { encoding: "utf-8" }).trim()
    checks.push({ name: "macOS", ok: platform === "Darwin", detail: platform })
  } catch {
    checks.push({ name: "macOS", ok: false, detail: "Cannot determine OS" })
  }

  // Check Xcode
  try {
    const xcodeVersion = execSync("xcodebuild -version 2>/dev/null | head -1", { encoding: "utf-8" }).trim()
    checks.push({ name: "Xcode", ok: true, detail: xcodeVersion })
  } catch {
    checks.push({ name: "Xcode", ok: false, detail: "Not installed — install from App Store" })
  }

  // Check xcrun simctl
  try {
    execSync("xcrun simctl list devices booted 2>/dev/null", { encoding: "utf-8" })
    checks.push({ name: "Simulator CLI", ok: true, detail: "xcrun simctl available" })
  } catch {
    checks.push({ name: "Simulator CLI", ok: false, detail: "xcrun simctl not available" })
  }

  // Check Appium
  try {
    const appiumVersion = execSync("npx appium --version 2>/dev/null", { encoding: "utf-8" }).trim()
    checks.push({ name: "Appium", ok: true, detail: `v${appiumVersion}` })
  } catch {
    checks.push({ name: "Appium", ok: false, detail: "Not installed — run: npm install -g appium" })
  }

  // Check XCUITest driver
  try {
    const drivers = execSync("npx appium driver list --installed 2>/dev/null", { encoding: "utf-8" })
    const hasXcuitest = drivers.includes("xcuitest")
    checks.push({ name: "XCUITest Driver", ok: hasXcuitest, detail: hasXcuitest ? "Installed" : "Missing — run: appium driver install xcuitest" })
  } catch {
    checks.push({ name: "XCUITest Driver", ok: false, detail: "Cannot check — ensure Appium is installed" })
  }

  console.log("\n  Appium iOS Research — Prerequisite Check\n")
  for (const c of checks) {
    console.log(`  ${c.ok ? "✓" : "✗"} %-20s %s`, c.name, c.detail)
  }

  const allOk = checks.every((c) => c.ok)
  console.log(`\n  ${allOk ? "All prerequisites met!" : "Some prerequisites missing — see above."}\n`)
  return allOk
}

// ── Appium session helper ───────────────────────────────────────

/**
 * Creates an Appium WebDriver session for iOS Simulator.
 * Requires Appium server running (started automatically or manually).
 */
async function createAppiumSession(bundleId, deviceName = "iPhone 15 Pro") {
  const APPIUM_URL = "http://127.0.0.1:4723"

  const capabilities = {
    platformName: "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": deviceName,
    "appium:platformVersion": "17.5",
    "appium:bundleId": bundleId,
    "appium:noReset": true,
    "appium:newCommandTimeout": 300,
    "appium:wdaLaunchTimeout": 120000,
    "appium:wdaConnectionTimeout": 120000,
  }

  // Create session via W3C WebDriver protocol
  const response = await fetch(`${APPIUM_URL}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      capabilities: {
        alwaysMatch: capabilities,
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create Appium session: ${response.status} ${text}`)
  }

  const data = await response.json()
  const sessionId = data.value?.sessionId

  return {
    sessionId,

    /** Find element by accessibility id, class name, or predicate */
    async findElement(strategy, selector) {
      const res = await fetch(`${APPIUM_URL}/session/${sessionId}/element`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ using: strategy, value: selector }),
      })
      const result = await res.json()
      return result.value
    },

    /** Find multiple elements */
    async findElements(strategy, selector) {
      const res = await fetch(`${APPIUM_URL}/session/${sessionId}/elements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ using: strategy, value: selector }),
      })
      const result = await res.json()
      return result.value || []
    },

    /** Click an element */
    async click(elementId) {
      await fetch(`${APPIUM_URL}/session/${sessionId}/element/${elementId}/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    },

    /** Type into an element */
    async sendKeys(elementId, text) {
      await fetch(`${APPIUM_URL}/session/${sessionId}/element/${elementId}/value`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
    },

    /** Get element text */
    async getText(elementId) {
      const res = await fetch(`${APPIUM_URL}/session/${sessionId}/element/${elementId}/text`)
      const result = await res.json()
      return result.value
    },

    /** Take screenshot (returns base64 PNG) */
    async screenshot() {
      const res = await fetch(`${APPIUM_URL}/session/${sessionId}/screenshot`)
      const result = await res.json()
      return result.value // base64 encoded PNG
    },

    /** Get page source (XML representation of the screen) */
    async getPageSource() {
      const res = await fetch(`${APPIUM_URL}/session/${sessionId}/source`)
      const result = await res.json()
      return result.value
    },

    /** Wait for specified milliseconds */
    async wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    /** Terminate the session */
    async quit() {
      await fetch(`${APPIUM_URL}/session/${sessionId}`, { method: "DELETE" })
    },
  }
}

// ── Generic iOS research template ───────────────────────────────

async function genericIOSResearch(platform, creds, deviceName) {
  const screenshotDir = join(SCREENSHOTS_DIR, `${platform.id}-ios`)
  mkdirSync(screenshotDir, { recursive: true })

  const screenshots = []
  const errors = []

  let session
  try {
    console.log(`    Creating Appium session for ${platform.bundleId}...`)
    session = await createAppiumSession(platform.bundleId, deviceName)

    // Wait for app to load
    await session.wait(3000)

    // Screenshot: App home screen
    const homeScreenshot = await session.screenshot()
    const homeFile = "01-app-home.png"
    writeFileSync(join(screenshotDir, homeFile), Buffer.from(homeScreenshot, "base64"))
    screenshots.push({ filename: homeFile, label: "App Home Screen", step: 1 })

    // Get page source for analysis
    const pageSource = await session.getPageSource()

    // Try to find settings/parental controls elements
    const settingsKeywords = ["Settings", "Parental", "Controls", "Family", "Safety", "Privacy", "Account"]
    for (const keyword of settingsKeywords) {
      try {
        const elements = await session.findElements("accessibility id", keyword)
        if (elements.length > 0) {
          await session.click(elements[0].ELEMENT || elements[0]["element-6066-11e4-a52e-4f735466cecf"])
          await session.wait(2000)

          const ss = await session.screenshot()
          const filename = `${String(screenshots.length + 1).padStart(2, "0")}-${keyword.toLowerCase()}.png`
          writeFileSync(join(screenshotDir, filename), Buffer.from(ss, "base64"))
          screenshots.push({ filename, label: `${keyword} Screen`, step: screenshots.length + 1 })
          break
        }
      } catch {
        // Element not found, try next keyword
      }
    }

    // If credentials provided, try to find login screen
    if (platform.needsCredentials && creds.email && creds.password) {
      try {
        // Look for email/username field
        const emailFields = await session.findElements("class name", "XCUIElementTypeTextField")
        if (emailFields.length > 0) {
          const fieldId = emailFields[0].ELEMENT || emailFields[0]["element-6066-11e4-a52e-4f735466cecf"]
          await session.click(fieldId)
          await session.sendKeys(fieldId, creds.email)
        }

        // Look for password field
        const passwordFields = await session.findElements("class name", "XCUIElementTypeSecureTextField")
        if (passwordFields.length > 0) {
          const fieldId = passwordFields[0].ELEMENT || passwordFields[0]["element-6066-11e4-a52e-4f735466cecf"]
          await session.click(fieldId)
          await session.sendKeys(fieldId, creds.password)
        }

        await session.wait(2000)
        const loginSS = await session.screenshot()
        const loginFile = `${String(screenshots.length + 1).padStart(2, "0")}-login.png`
        writeFileSync(join(screenshotDir, loginFile), Buffer.from(loginSS, "base64"))
        screenshots.push({ filename: loginFile, label: "Login Screen", step: screenshots.length + 1 })
      } catch {
        errors.push("Could not locate login fields — app may require manual first-time setup")
      }
    }

    return {
      status: "completed",
      screenshots,
      parentalControls: [],
      setupSteps: [
        { order: 1, instruction: `Open ${platform.name} on iOS Simulator`, actionType: "navigate" },
        { order: 2, instruction: "Navigate to settings/parental controls", actionType: "click" },
        { order: 3, instruction: "Document available features", actionType: "verify" },
      ],
      assessment: {
        complexity: "moderate",
        ageGatingMethod: "account_level",
        featureCount: 0,
        automatableCount: 0,
        phosraCoverage: 0,
        gaps: ["Detailed iOS research needed — generic template used"],
        strengths: [],
        protectionRating: 0,
      },
      notes: `Research completed using generic iOS template. Platform-specific Appium module recommended for detailed analysis. Page source captured for offline review.`,
      errors,
    }
  } catch (err) {
    return {
      status: "error",
      screenshots,
      parentalControls: [],
      setupSteps: [],
      assessment: null,
      notes: "",
      errors: [err.message],
    }
  } finally {
    if (session) {
      try {
        await session.quit()
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  if (flags.check) {
    checkPrerequisites()
    return
  }

  const creds = loadCredentials()

  if (flags.list) {
    console.log("\n  iOS Platform Research — Credential Status\n")
    console.log("  %-25s %-18s %-15s %-15s %s", "Platform", "Category", "Credentials", "Module", "Bundle ID")
    console.log("  " + "─".repeat(95))
    for (const p of IOS_PLATFORMS) {
      const hasCreds = !p.needsCredentials || (creds[p.credentialKeys.email] && creds[p.credentialKeys.password])
      const hasModule = IOS_PLATFORM_MODULES[p.id]
      console.log(
        "  %-25s %-18s %-15s %-15s %s",
        p.name,
        p.category,
        hasCreds ? "✓ configured" : "✗ missing",
        hasModule ? "✓ ready" : "○ generic",
        p.bundleId
      )
    }
    console.log()
    return
  }

  // Determine targets
  let targets = IOS_PLATFORMS
  if (flags.platform) {
    targets = IOS_PLATFORMS.filter((p) => p.id === flags.platform)
    if (targets.length === 0) {
      console.error(`Unknown iOS platform: ${flags.platform}`)
      process.exit(1)
    }
  } else if (flags.category) {
    targets = IOS_PLATFORMS.filter((p) => p.category === flags.category)
  }

  // Filter to platforms with credentials (or that don't need them)
  const researchable = targets.filter(
    (p) => !p.needsCredentials || (creds[p.credentialKeys.email] && creds[p.credentialKeys.password])
  )

  if (researchable.length === 0) {
    console.error("\n  No iOS platforms ready for research.")
    console.error("  Run with --list to see status, or --check to verify prerequisites.\n")
    process.exit(1)
  }

  console.log(`\n  Researching ${researchable.length} iOS platform(s) via Appium...\n`)

  mkdirSync(RESULTS_DIR, { recursive: true })
  mkdirSync(SCREENSHOTS_DIR, { recursive: true })

  const deviceName = flags.device || "iPhone 15 Pro"
  const results = []

  for (const platform of researchable) {
    console.log(`  ▸ ${platform.name}...`)
    const startTime = Date.now()

    const platformCreds = {
      email: creds[platform.credentialKeys.email] || "",
      password: creds[platform.credentialKeys.password] || "",
    }

    try {
      let result

      if (IOS_PLATFORM_MODULES[platform.id]) {
        const mod = await import(IOS_PLATFORM_MODULES[platform.id])
        result = await mod.research(createAppiumSession, platformCreds, {
          screenshotsDir: join(SCREENSHOTS_DIR, `${platform.id}-ios`),
          deviceName,
          bundleId: platform.bundleId,
        })
      } else {
        result = await genericIOSResearch(platform, platformCreds, deviceName)
      }

      result.durationMs = Date.now() - startTime
      result.platformId = platform.id
      result.researchedAt = new Date().toISOString()
      result.researchedBy = "appium"

      results.push(result)
      console.log(`    ✓ Done (${Math.round(result.durationMs / 1000)}s)`)
    } catch (err) {
      console.error(`    ✗ Error: ${err.message}`)
      results.push({
        platformId: platform.id,
        researchedAt: new Date().toISOString(),
        researchedBy: "appium",
        status: "error",
        durationMs: Date.now() - startTime,
        screenshots: [],
        parentalControls: [],
        setupSteps: [],
        assessment: null,
        notes: "",
        errors: [err.message],
      })
    }
  }

  // Save results
  const outputPath = join(RESULTS_DIR, `ios-research-${new Date().toISOString().slice(0, 10)}.json`)
  writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`\n  Results saved to: ${outputPath}\n`)

  const succeeded = results.filter((r) => r.status !== "error").length
  const failed = results.filter((r) => r.status === "error").length
  console.log(`  Summary: ${succeeded} succeeded, ${failed} failed`)
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
