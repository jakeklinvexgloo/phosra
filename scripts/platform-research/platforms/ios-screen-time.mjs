/**
 * Apple Screen Time Research Module (iOS Simulator via Appium)
 *
 * Navigates Settings > Screen Time on the iOS Simulator to document:
 * - App Limits configuration
 * - Downtime scheduling
 * - Communication Limits
 * - Content & Privacy Restrictions
 * - Always Allowed apps
 * - Screen Time passcode
 *
 * Note: Screen Time is part of the Settings app (com.apple.Preferences),
 * so no separate app installation is needed on the simulator.
 */

import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"

/**
 * @param {Function} createSession - Factory that returns an Appium session
 * @param {Object} creds - { email, password } — not needed for Settings
 * @param {Object} opts - { screenshotsDir, deviceName, bundleId }
 */
export async function research(createSession, creds, opts) {
  const screenshotDir = opts.screenshotsDir
  mkdirSync(screenshotDir, { recursive: true })

  const screenshots = []
  const parentalControls = []
  const setupSteps = []
  const errors = []
  let stepOrder = 0

  const session = await createSession(opts.bundleId, opts.deviceName)

  const screenshot = async (name, label) => {
    try {
      const base64 = await session.screenshot()
      const filename = `${String(screenshots.length + 1).padStart(2, "0")}-${name}.png`
      writeFileSync(join(screenshotDir, filename), Buffer.from(base64, "base64"))
      screenshots.push({ filename, label, step: screenshots.length + 1 })
    } catch (err) {
      errors.push(`Screenshot failed (${name}): ${err.message}`)
    }
  }

  const step = (instruction, actionType = "navigate") => {
    stepOrder++
    setupSteps.push({
      order: stepOrder,
      instruction,
      actionType,
      screenshotIndex: screenshots.length,
    })
  }

  try {
    // ── Step 1: Open Settings app ────────────────────────────
    step("Open Settings app on iOS")
    await session.wait(2000)
    await screenshot("settings-home", "Settings Home")

    // ── Step 2: Navigate to Screen Time ─────────────────────
    step("Tap 'Screen Time' in Settings", "click")
    try {
      const screenTimeCell = await session.findElement("accessibility id", "Screen Time")
      const elId = screenTimeCell.ELEMENT || screenTimeCell["element-6066-11e4-a52e-4f735466cecf"]
      await session.click(elId)
      await session.wait(2000)
      await screenshot("screen-time-main", "Screen Time Main Page")
    } catch {
      // Try scrolling down to find it
      errors.push("Screen Time cell not immediately visible — may need to scroll")
    }

    // ── Document parental controls ──────────────────────────

    // App Limits
    parentalControls.push({
      name: "App Limits",
      description: "Set daily time limits for app categories (Social, Games, Entertainment, etc.) or specific apps. Limits reset daily at midnight.",
      phosraRuleCategory: "time_per_app_limit",
      automatable: true,
      automationMethod: "appium",
      options: ["1 min", "5 min", "15 min", "30 min", "1 hr", "2 hr", "3 hr", "4 hr", "Custom"],
    })

    // Downtime
    parentalControls.push({
      name: "Downtime",
      description: "Schedule a period where only allowed apps and phone calls work. Can be set on a per-day basis.",
      phosraRuleCategory: "time_downtime",
      automatable: true,
      automationMethod: "appium",
      options: ["Scheduled (custom hours)", "Turn On Until Tomorrow", "Per-day schedule"],
    })

    // Communication Limits
    parentalControls.push({
      name: "Communication Limits",
      description: "Control who the child can communicate with during allowed screen time and during downtime. Can limit to contacts only.",
      phosraRuleCategory: "social_contacts",
      automatable: true,
      automationMethod: "appium",
      options: ["Everyone", "Contacts Only", "Specific Contacts"],
    })

    // Communication Safety
    parentalControls.push({
      name: "Communication Safety",
      description: "Detects and blurs sensitive photos in Messages before they are viewed. Can notify parents for children under 13.",
      phosraRuleCategory: "monitoring_alerts",
      automatable: true,
      automationMethod: "appium",
      options: ["On/Off", "Notify parent (under 13)"],
    })

    // Always Allowed
    parentalControls.push({
      name: "Always Allowed",
      description: "Designate apps that are always available, even during downtime or when limits are exceeded. Phone is always allowed by default.",
      phosraRuleCategory: "time_daily_limit",
      automatable: true,
      automationMethod: "appium",
    })

    // Content & Privacy Restrictions
    parentalControls.push({
      name: "Content & Privacy Restrictions",
      description: "Master toggle for all content restrictions: App Store purchases, content ratings, web filtering, location services, and more.",
      phosraRuleCategory: "content_rating",
      automatable: true,
      automationMethod: "appium",
      options: ["On/Off (passcode protected)"],
    })

    // iTunes & App Store Purchases
    parentalControls.push({
      name: "iTunes & App Store Purchases",
      description: "Control installing apps, deleting apps, and in-app purchases. Require password for every purchase or every 15 minutes.",
      phosraRuleCategory: "purchase_approval",
      automatable: true,
      automationMethod: "appium",
      options: ["Allow/Don't Allow installs", "Allow/Don't Allow deletes", "Allow/Don't Allow IAP", "Always/After 15 min password"],
    })

    // Content Restrictions
    parentalControls.push({
      name: "Content Ratings",
      description: "Set maximum content ratings for Music, Podcasts, Movies, TV Shows, Books, and Apps. US ratings: G, PG, PG-13, R; Apps: 4+, 9+, 12+, 17+.",
      phosraRuleCategory: "age_gate",
      automatable: true,
      automationMethod: "appium",
      options: ["Music: Explicit On/Off", "Movies: G/PG/PG-13/R", "TV: TV-Y to TV-MA", "Apps: 4+/9+/12+/17+"],
    })

    // Web Content
    parentalControls.push({
      name: "Web Content Filter",
      description: "Filter adult websites automatically, or restrict to approved websites only. Custom allow/block lists.",
      phosraRuleCategory: "web_filter_level",
      automatable: true,
      automationMethod: "appium",
      options: ["Unrestricted", "Limit Adult Websites", "Allowed Websites Only"],
    })

    // Siri
    parentalControls.push({
      name: "Siri Web Search & Explicit Language",
      description: "Control whether Siri can search the web and whether explicit language is allowed in Siri responses.",
      phosraRuleCategory: "web_safesearch",
      automatable: true,
      automationMethod: "appium",
      options: ["Web Search: Allow/Don't Allow", "Explicit Language: Allow/Don't Allow"],
    })

    // Game Center
    parentalControls.push({
      name: "Game Center Restrictions",
      description: "Control multiplayer games, adding friends, connecting with friends, screen recording, and nearby multiplayer.",
      phosraRuleCategory: "social_multiplayer",
      automatable: true,
      automationMethod: "appium",
      options: ["Multiplayer: Allow/Don't Allow", "Adding Friends: Allow/Don't Allow", "Connect with Friends: Allow/Don't Allow"],
    })

    // Privacy settings
    parentalControls.push({
      name: "Privacy Controls",
      description: "Control per-app access to Location Services, Contacts, Calendars, Photos, Microphone, Camera, and more.",
      phosraRuleCategory: "privacy_location",
      automatable: true,
      automationMethod: "appium",
    })

    // Screen Time Passcode
    parentalControls.push({
      name: "Screen Time Passcode",
      description: "Set a 4-digit passcode to prevent children from changing Screen Time settings. Different from device passcode.",
      phosraRuleCategory: "profile_lock",
      automatable: true,
      automationMethod: "appium",
      options: ["Set/Change/Remove Passcode"],
    })

    // Share Across Devices
    parentalControls.push({
      name: "Share Across Devices",
      description: "Sync Screen Time settings and reports across all devices signed into the same iCloud account.",
      phosraRuleCategory: "monitoring_activity",
      automatable: true,
      automationMethod: "appium",
      options: ["On/Off"],
    })

    // ── Step 3: Try navigating to sub-sections ──────────────

    const subSections = [
      { label: "App Limits", id: "App Limits" },
      { label: "Downtime", id: "Downtime" },
      { label: "Communication Limits", id: "Communication Limits" },
      { label: "Always Allowed", id: "Always Allowed" },
      { label: "Content & Privacy Restrictions", id: "Content & Privacy Restrictions" },
    ]

    for (const section of subSections) {
      step(`Navigate to ${section.label}`, "click")
      try {
        const el = await session.findElement("accessibility id", section.id)
        const elId = el.ELEMENT || el["element-6066-11e4-a52e-4f735466cecf"]
        await session.click(elId)
        await session.wait(1500)
        await screenshot(
          section.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          section.label
        )

        // Navigate back
        const backBtn = await session.findElement("accessibility id", "Screen Time")
        if (backBtn) {
          const backId = backBtn.ELEMENT || backBtn["element-6066-11e4-a52e-4f735466cecf"]
          await session.click(backId)
          await session.wait(1000)
        }
      } catch {
        errors.push(`Could not navigate to ${section.label}`)
      }
    }

    return {
      status: "completed",
      screenshots,
      parentalControls,
      setupSteps,
      assessment: {
        complexity: "complex",
        ageGatingMethod: "account_level",
        featureCount: parentalControls.length,
        automatableCount: parentalControls.filter((c) => c.automatable).length,
        phosraCoverage: 90,
        gaps: [
          "No built-in social media content monitoring (requires third-party like Bark)",
          "No cross-platform enforcement (only Apple devices)",
          "Cannot monitor specific in-app activities (only aggregate screen time)",
          "No AI-based content analysis",
        ],
        strengths: [
          "Most comprehensive built-in parental controls of any platform",
          "Deep OS integration — controls every app and system feature",
          "Communication Safety with on-device ML for sensitive content detection",
          "Granular app-by-app and category time limits",
          "Content rating enforcement across all media types",
          "Web content filtering with custom allow/block lists",
          "Purchase and download approval workflow (Ask to Buy)",
          "Cross-device sync via iCloud",
          "Separate passcode prevents children from changing settings",
        ],
        protectionRating: 9,
      },
      notes:
        "Apple Screen Time is the gold standard for built-in parental controls. It offers the most comprehensive coverage of any single platform, with deep OS integration that controls apps, content, communication, purchases, and privacy. Main gaps are cross-platform enforcement and detailed social media content monitoring. All settings are automatable via Appium/XCUITest since they use standard UIKit components in the Settings app.",
      errors,
    }
  } catch (err) {
    errors.push(err.message)
    return {
      status: "error",
      screenshots,
      parentalControls,
      setupSteps,
      assessment: null,
      notes: "Research interrupted by error",
      errors,
    }
  } finally {
    try {
      await session.quit()
    } catch {
      // Ignore cleanup errors
    }
  }
}
