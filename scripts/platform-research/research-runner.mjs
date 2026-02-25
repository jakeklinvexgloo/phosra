#!/usr/bin/env node

/**
 * Platform Research Runner
 *
 * Orchestrates Playwright browser sessions to research parental control settings
 * across kids' apps and streaming providers.
 *
 * Usage:
 *   node scripts/platform-research/research-runner.mjs                    # Research all platforms
 *   node scripts/platform-research/research-runner.mjs --platform netflix # Research one platform
 *   node scripts/platform-research/research-runner.mjs --category gaming  # Research a category
 *   node scripts/platform-research/research-runner.mjs --list             # List all platforms
 *
 * Prerequisites:
 *   1. Copy .env.platform-credentials.example → .env.platform-credentials
 *   2. Fill in credentials for the platforms you want to research
 *   3. npx playwright install chromium (if not already installed)
 */

import { chromium } from "playwright"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "../..")
const RESULTS_DIR = join(ROOT, "scripts/platform-research/results")
const SCREENSHOTS_DIR = join(ROOT, "scripts/platform-research/screenshots")

// ── Load credentials from .env.platform-credentials ─────────────

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

// ── Platform research modules ───────────────────────────────────
// Each module exports: { research(browser, creds) → PlatformResearchResult }

const PLATFORM_MODULES = {
  netflix: "./platforms/netflix.mjs",
  "disney-plus": "./platforms/disney-plus.mjs",
  youtube: "./platforms/youtube.mjs",
  roblox: "./platforms/roblox.mjs",
  tiktok: "./platforms/tiktok.mjs",
  instagram: "./platforms/instagram.mjs",
  // Add more as scripts are created
}

// ── Platform registry (inline minimal version) ──────────────────

const PLATFORMS = [
  { id: "netflix", name: "Netflix", category: "streaming", credentialKeys: { email: "NETFLIX_EMAIL", password: "NETFLIX_PASSWORD" } },
  { id: "disney-plus", name: "Disney+", category: "streaming", credentialKeys: { email: "DISNEY_PLUS_EMAIL", password: "DISNEY_PLUS_PASSWORD" } },
  { id: "amazon-prime-video", name: "Amazon Prime Video", category: "streaming", credentialKeys: { email: "AMAZON_PRIME_EMAIL", password: "AMAZON_PRIME_PASSWORD" } },
  { id: "youtube", name: "YouTube", category: "streaming", credentialKeys: { email: "YOUTUBE_EMAIL", password: "YOUTUBE_PASSWORD" } },
  { id: "apple-tv-plus", name: "Apple TV+", category: "streaming", credentialKeys: { email: "APPLE_TV_EMAIL", password: "APPLE_TV_PASSWORD" } },
  { id: "hulu", name: "Hulu", category: "streaming", credentialKeys: { email: "HULU_EMAIL", password: "HULU_PASSWORD" } },
  { id: "peacock", name: "Peacock", category: "streaming", credentialKeys: { email: "PEACOCK_EMAIL", password: "PEACOCK_PASSWORD" } },
  { id: "paramount-plus", name: "Paramount+", category: "streaming", credentialKeys: { email: "PARAMOUNT_PLUS_EMAIL", password: "PARAMOUNT_PLUS_PASSWORD" } },
  { id: "hbo-max", name: "Max (HBO)", category: "streaming", credentialKeys: { email: "HBO_MAX_EMAIL", password: "HBO_MAX_PASSWORD" } },
  { id: "roblox", name: "Roblox", category: "gaming", credentialKeys: { email: "ROBLOX_EMAIL", password: "ROBLOX_PASSWORD" } },
  { id: "minecraft", name: "Minecraft", category: "gaming", credentialKeys: { email: "MINECRAFT_EMAIL", password: "MINECRAFT_PASSWORD" } },
  { id: "fortnite", name: "Fortnite", category: "gaming", credentialKeys: { email: "FORTNITE_EMAIL", password: "FORTNITE_PASSWORD" } },
  { id: "tiktok", name: "TikTok", category: "social", credentialKeys: { email: "TIKTOK_EMAIL", password: "TIKTOK_PASSWORD" } },
  { id: "instagram", name: "Instagram", category: "social", credentialKeys: { email: "INSTAGRAM_EMAIL", password: "INSTAGRAM_PASSWORD" } },
  { id: "snapchat", name: "Snapchat", category: "social", credentialKeys: { email: "SNAPCHAT_EMAIL", password: "SNAPCHAT_PASSWORD" } },
  { id: "discord", name: "Discord", category: "social", credentialKeys: { email: "DISCORD_EMAIL", password: "DISCORD_PASSWORD" } },
  { id: "google-family-link", name: "Google Family Link", category: "device", credentialKeys: { email: "GOOGLE_FAMILY_LINK_EMAIL", password: "GOOGLE_FAMILY_LINK_PASSWORD" } },
  { id: "apple-screen-time", name: "Apple Screen Time", category: "device", credentialKeys: { email: "APPLE_SCREEN_TIME_EMAIL", password: "APPLE_SCREEN_TIME_PASSWORD" } },
  { id: "amazon-kids-plus", name: "Amazon Kids+", category: "device", credentialKeys: { email: "AMAZON_KIDS_PLUS_EMAIL", password: "AMAZON_KIDS_PLUS_PASSWORD" } },
]

// ── CLI argument parsing ────────────────────────────────────────

const args = process.argv.slice(2)
const flags = {}
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--platform" && args[i + 1]) flags.platform = args[++i]
  else if (args[i] === "--category" && args[i + 1]) flags.category = args[++i]
  else if (args[i] === "--list") flags.list = true
  else if (args[i] === "--headless") flags.headless = true
  else if (args[i] === "--help") flags.help = true
}

if (flags.help) {
  console.log(`
Platform Research Runner — Phosra

Usage:
  node research-runner.mjs                          Research all platforms with credentials
  node research-runner.mjs --platform netflix       Research a specific platform
  node research-runner.mjs --category gaming        Research all platforms in a category
  node research-runner.mjs --list                   List all platforms and credential status
  node research-runner.mjs --headless               Run in headless mode (no visible browser)

Prerequisites:
  1. cp .env.platform-credentials.example .env.platform-credentials
  2. Fill in credentials for target platforms
  3. npx playwright install chromium
`)
  process.exit(0)
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const creds = loadCredentials()

  if (flags.list) {
    console.log("\n  Platform Research — Credential Status\n")
    console.log("  %-25s %-12s %-15s %s", "Platform", "Category", "Credentials", "Research Module")
    console.log("  " + "─".repeat(75))
    for (const p of PLATFORMS) {
      const hasCreds = creds[p.credentialKeys.email] && creds[p.credentialKeys.password]
      const hasModule = PLATFORM_MODULES[p.id]
      console.log(
        "  %-25s %-12s %-15s %s",
        p.name,
        p.category,
        hasCreds ? "✓ configured" : "✗ missing",
        hasModule ? "✓ ready" : "○ template"
      )
    }
    console.log()
    return
  }

  // Determine which platforms to research
  let targets = PLATFORMS
  if (flags.platform) {
    targets = PLATFORMS.filter((p) => p.id === flags.platform)
    if (targets.length === 0) {
      console.error(`Unknown platform: ${flags.platform}`)
      process.exit(1)
    }
  } else if (flags.category) {
    targets = PLATFORMS.filter((p) => p.category === flags.category)
    if (targets.length === 0) {
      console.error(`No platforms in category: ${flags.category}`)
      process.exit(1)
    }
  }

  // Filter to platforms with credentials
  const researchable = targets.filter(
    (p) => creds[p.credentialKeys.email] && creds[p.credentialKeys.password]
  )

  if (researchable.length === 0) {
    console.error("\n  No platforms have credentials configured.")
    console.error("  Run with --list to see credential status.\n")
    process.exit(1)
  }

  console.log(`\n  Researching ${researchable.length} platform(s)...\n`)

  // Ensure output directories exist
  mkdirSync(RESULTS_DIR, { recursive: true })
  mkdirSync(SCREENSHOTS_DIR, { recursive: true })

  // Launch browser
  const browser = await chromium.launch({
    headless: flags.headless !== undefined ? flags.headless : false,
    slowMo: 500, // slow down for visibility and to avoid bot detection
  })

  const results = []

  for (const platform of researchable) {
    console.log(`  ▸ ${platform.name}...`)
    const startTime = Date.now()

    const platformCreds = {
      email: creds[platform.credentialKeys.email],
      password: creds[platform.credentialKeys.password],
    }

    try {
      let result

      if (PLATFORM_MODULES[platform.id]) {
        // Use platform-specific research module
        const mod = await import(PLATFORM_MODULES[platform.id])
        result = await mod.research(browser, platformCreds, {
          screenshotsDir: join(SCREENSHOTS_DIR, platform.id),
        })
      } else {
        // Use generic research template
        result = await genericResearch(browser, platform, platformCreds)
      }

      result.durationMs = Date.now() - startTime
      result.platformId = platform.id
      result.researchedAt = new Date().toISOString()
      result.researchedBy = "playwright"

      results.push(result)
      console.log(`    ✓ Done (${Math.round(result.durationMs / 1000)}s)`)
    } catch (err) {
      console.error(`    ✗ Error: ${err.message}`)
      results.push({
        platformId: platform.id,
        researchedAt: new Date().toISOString(),
        researchedBy: "playwright",
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

  await browser.close()

  // Save results
  const outputPath = join(RESULTS_DIR, `research-${new Date().toISOString().slice(0, 10)}.json`)
  writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`\n  Results saved to: ${outputPath}\n`)

  // Summary
  const succeeded = results.filter((r) => r.status !== "error").length
  const failed = results.filter((r) => r.status === "error").length
  console.log(`  Summary: ${succeeded} succeeded, ${failed} failed`)
}

// ── Generic research template ───────────────────────────────────
// For platforms without a dedicated module, this does basic exploration

async function genericResearch(browser, platform, creds) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  })
  const page = await context.newPage()

  const screenshotDir = join(SCREENSHOTS_DIR, platform.id)
  mkdirSync(screenshotDir, { recursive: true })

  const screenshots = []

  try {
    // Step 1: Navigate to the platform
    await page.goto(platform.website || `https://www.${platform.id}.com`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    })
    await page.waitForTimeout(2000)
    screenshots.push({
      filename: await captureScreenshot(page, screenshotDir, "01-homepage"),
      label: "Homepage",
      step: 1,
    })

    // Step 2: Look for sign-in / login
    const loginSelectors = [
      'a[href*="login"]',
      'a[href*="signin"]',
      'a[href*="sign-in"]',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'a:has-text("Sign In")',
      'a:has-text("Log In")',
    ]

    for (const sel of loginSelectors) {
      const el = await page.$(sel)
      if (el) {
        await el.click()
        await page.waitForTimeout(3000)
        break
      }
    }

    screenshots.push({
      filename: await captureScreenshot(page, screenshotDir, "02-login-page"),
      label: "Login Page",
      step: 2,
    })

    // Step 3: Attempt login
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[id="email"]',
      'input[id="username"]',
      'input[autocomplete="username"]',
    ]
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[id="password"]',
    ]

    for (const sel of emailSelectors) {
      const el = await page.$(sel)
      if (el) {
        await el.fill(creds.email)
        break
      }
    }

    for (const sel of passwordSelectors) {
      const el = await page.$(sel)
      if (el) {
        await el.fill(creds.password)
        break
      }
    }

    // Look for submit button
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'button:has-text("Next")',
      'input[type="submit"]',
    ]

    for (const sel of submitSelectors) {
      const el = await page.$(sel)
      if (el) {
        await el.click()
        await page.waitForTimeout(5000)
        break
      }
    }

    screenshots.push({
      filename: await captureScreenshot(page, screenshotDir, "03-after-login"),
      label: "After Login",
      step: 3,
    })

    // Step 4: Navigate to parental controls if URL is known
    if (platform.parentalControlsUrl) {
      await page.goto(platform.parentalControlsUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      })
      await page.waitForTimeout(3000)
      screenshots.push({
        filename: await captureScreenshot(page, screenshotDir, "04-parental-controls"),
        label: "Parental Controls Page",
        step: 4,
      })
    }

    // Step 5: Look for settings / account pages
    const settingsSelectors = [
      'a[href*="settings"]',
      'a[href*="account"]',
      'a[href*="parental"]',
      'a[href*="family"]',
      'a:has-text("Settings")',
      'a:has-text("Account")',
    ]

    for (const sel of settingsSelectors) {
      const el = await page.$(sel)
      if (el) {
        await el.click()
        await page.waitForTimeout(3000)
        screenshots.push({
          filename: await captureScreenshot(page, screenshotDir, "05-settings"),
          label: "Settings Page",
          step: 5,
        })
        break
      }
    }

    return {
      status: "completed",
      screenshots,
      parentalControls: [],
      setupSteps: [
        { order: 1, instruction: "Navigate to " + (platform.website || platform.id), actionType: "navigate" },
        { order: 2, instruction: "Sign in with credentials", actionType: "type" },
        { order: 3, instruction: "Navigate to parental controls", actionType: "navigate" },
        { order: 4, instruction: "Document available settings", actionType: "verify" },
      ],
      assessment: {
        complexity: "moderate",
        ageGatingMethod: "profile_based",
        featureCount: 0,
        automatableCount: 0,
        phosraCoverage: 0,
        gaps: ["Manual research needed — generic template used"],
        strengths: [],
        protectionRating: 0,
      },
      notes: "Research completed using generic template. Platform-specific module recommended for detailed analysis.",
      errors: [],
    }
  } finally {
    await context.close()
  }
}

async function captureScreenshot(page, dir, name) {
  const filename = `${name}.png`
  await page.screenshot({ path: join(dir, filename), fullPage: false })
  return filename
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
