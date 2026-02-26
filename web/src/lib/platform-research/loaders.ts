import fs from "fs"
import path from "path"

import type {
  CapabilityEntry,
  CapabilitySummary,
  PlatformResearchData,
  RatingMappingData,
  ScreenshotAnalysisData,
  ScreenshotGroup,
  SectionData,
} from "./research-data-types"

// ── Constants ──────────────────────────────────────────────────────

const RESEARCH_ROOT = path.resolve(
  process.cwd(),
  "../research/providers/tier1_adapter_exists"
)

const SCREENSHOT_PUBLIC_ROOT = "/research-screenshots"

// ── Main Loader ────────────────────────────────────────────────────

export async function loadPlatformResearch(
  platformId: string
): Promise<PlatformResearchData | null> {
  const dir = path.join(RESEARCH_ROOT, platformId)

  if (!fs.existsSync(dir)) {
    return null
  }

  const platformName = getPlatformName(platformId)

  const [findings, adapterAssessment, integrationNotes, ratingMapping, sectionData, screenshotAnalysis] =
    await Promise.all([
      readMarkdownFile(path.join(dir, "findings.md")),
      readMarkdownFile(path.join(dir, "adapter_assessment.md")),
      readMarkdownFile(path.join(dir, "phosra_integration_notes.md")),
      readJsonFile<RawRatingMapping>(path.join(dir, "rating_mapping.json")),
      readJsonFile<SectionData>(path.join(dir, "section_data.json")),
      readJsonFile<ScreenshotAnalysisData>(path.join(dir, "screenshot_analysis.json")),
    ])

  const screenshotDir = path.join(dir, "screenshots")
  const screenshots = buildScreenshotGroups(platformId, screenshotDir)
  const screenshotCount = screenshots.reduce(
    (sum, g) => sum + g.screenshots.length,
    0
  )

  const parsedRatingMapping = ratingMapping
    ? transformRatingMapping(ratingMapping)
    : null

  const capabilities = getCapabilitySummary(platformId)

  return {
    platformId,
    platformName,
    findings,
    adapterAssessment,
    integrationNotes,
    ratingMapping: parsedRatingMapping,
    screenshots,
    screenshotCount,
    capabilities,
    sectionData,
    screenshotAnalysis,
  }
}

// ── File Readers ───────────────────────────────────────────────────

async function readMarkdownFile(filePath: string): Promise<string | null> {
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch {
    return null
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

// ── Rating Mapping Transform ───────────────────────────────────────

interface RawRatingMapping {
  // Support both legacy "netflix_tiers" and new "platform_tiers" keys
  netflix_tiers?: Record<
    string,
    {
      phosra_tier: string
      mpaa_ratings: string[]
      tv_ratings: string[]
      age_range: string
      is_kids_profile: boolean
    }
  >
  platform_tiers?: Record<
    string,
    {
      phosra_tier: string
      mpaa_ratings: string[]
      tv_ratings: string[]
      age_range: string
      is_kids_profile: boolean
    }
  >
  rating_systems_coverage: Record<
    string,
    {
      supported: boolean | string
      ratings?: string[]
      notes: string
    }
  >
}

function transformRatingMapping(raw: RawRatingMapping): RatingMappingData {
  const rawTiers = raw.platform_tiers ?? raw.netflix_tiers ?? {}
  const platformTiers: RatingMappingData["platformTiers"] = {}
  for (const [key, val] of Object.entries(rawTiers)) {
    platformTiers[key] = {
      phosraTier: val.phosra_tier,
      mpaaRatings: val.mpaa_ratings,
      tvRatings: val.tv_ratings,
      ageRange: val.age_range,
      isKidsProfile: val.is_kids_profile,
    }
  }

  const ratingSystems: RatingMappingData["ratingSystems"] = {}
  for (const [key, val] of Object.entries(raw.rating_systems_coverage)) {
    ratingSystems[key] = {
      supported: val.supported,
      ratings: val.ratings,
      notes: val.notes,
    }
  }

  return { platformTiers, ratingSystems }
}

// ── Screenshot Grouping ────────────────────────────────────────────

interface ScreenshotRule {
  id: string
  label: string
  match: (filename: string) => boolean
}

function getNumberPrefix(filename: string): number | null {
  const m = filename.match(/^(\d+)-/)
  return m ? parseInt(m[1], 10) : null
}

function inRange(n: number, ranges: [number, number][]): boolean {
  return ranges.some(([lo, hi]) => n >= lo && n <= hi)
}

const SCREENSHOT_RULES: ScreenshotRule[] = [
  {
    id: "login-flow",
    label: "Login Flow",
    match: (f) => {
      const n = getNumberPrefix(f)
      return n !== null && inRange(n, [[1, 3]])
    },
  },
  {
    id: "profile-management",
    label: "Profile Management",
    match: (f) => {
      const n = getNumberPrefix(f)
      return n !== null && inRange(n, [[4, 5], [25, 39], [52, 53]])
    },
  },
  {
    id: "account-overview",
    label: "Account Overview",
    match: (f) => {
      const n = getNumberPrefix(f)
      return n !== null && inRange(n, [[6, 9], [23, 24], [54, 54]])
    },
  },
  {
    id: "parental-controls",
    label: "Parental Controls",
    match: (f) => {
      const n = getNumberPrefix(f)
      if (n !== null && inRange(n, [[10, 16]])) return true
      return f.startsWith("deep-") && f.includes("parental")
    },
  },
  {
    id: "maturity-restrictions",
    label: "Maturity & Restrictions",
    match: (f) => {
      const n = getNumberPrefix(f)
      if (n !== null && inRange(n, [[17, 18], [49, 49]])) return true
      return f.startsWith("mfa-direct-maturity")
    },
  },
  {
    id: "pin-profile-lock",
    label: "PIN / Profile Lock",
    match: (f) => {
      const n = getNumberPrefix(f)
      if (n !== null && inRange(n, [[19, 20], [50, 50]])) return true
      return f.startsWith("deep-") && f.includes("profile-lock")
    },
  },
  {
    id: "viewing-activity",
    label: "Viewing Activity",
    match: (f) => {
      const n = getNumberPrefix(f)
      if (n !== null && inRange(n, [[21, 22], [40, 42]])) return true
      return f.startsWith("deep-") && f.includes("viewing")
    },
  },
  {
    id: "kids-profile-ui",
    label: "Kids Profile UI",
    match: (f) => {
      const n = getNumberPrefix(f)
      return n !== null && inRange(n, [[45, 48]])
    },
  },
  {
    id: "privacy-playback",
    label: "Privacy & Playback",
    match: (f) => {
      const n = getNumberPrefix(f)
      if (n !== null && inRange(n, [[51, 51]])) return true
      return (
        f.startsWith("deep-") &&
        (f.includes("privacy") || f.includes("playback"))
      )
    },
  },
  {
    id: "mfa-verification",
    label: "MFA Verification",
    match: (f) => f.startsWith("mfa-"),
  },
  {
    id: "account-security",
    label: "Account Security",
    match: (f) =>
      f.startsWith("deep-account-security") ||
      f.startsWith("deep-manage-devices") ||
      f.startsWith("deep-transfer"),
  },
]

function humanizeFilename(filename: string): string {
  const base = filename.replace(/\.\w+$/, "")
  return base
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim()
}

function buildScreenshotGroups(
  platformId: string,
  screenshotDir: string
): ScreenshotGroup[] {
  if (!fs.existsSync(screenshotDir)) return []

  const files = fs
    .readdirSync(screenshotDir)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort()

  const grouped = new Map<string, ScreenshotGroup>()
  const assigned = new Set<string>()

  // Initialize groups
  for (const rule of SCREENSHOT_RULES) {
    grouped.set(rule.id, { id: rule.id, label: rule.label, screenshots: [] })
  }

  // Assign files to groups (first match wins)
  for (const file of files) {
    for (const rule of SCREENSHOT_RULES) {
      if (rule.match(file)) {
        grouped.get(rule.id)!.screenshots.push({
          filename: file,
          label: humanizeFilename(file),
          path: `${SCREENSHOT_PUBLIC_ROOT}/${platformId}/${file}`,
        })
        assigned.add(file)
        break
      }
    }
  }

  // Create an "Other" group for unmatched screenshots
  const unmatched = files.filter((f) => !assigned.has(f))
  if (unmatched.length > 0) {
    grouped.set("other", {
      id: "other",
      label: "Other",
      screenshots: unmatched.map((file) => ({
        filename: file,
        label: humanizeFilename(file),
        path: `${SCREENSHOT_PUBLIC_ROOT}/${platformId}/${file}`,
      })),
    })
  }

  // Return only non-empty groups
  return Array.from(grouped.values()).filter((g) => g.screenshots.length > 0)
}

// ── Platform Name Helper ───────────────────────────────────────────

function getPlatformName(platformId: string): string {
  const names: Record<string, string> = {
    netflix: "Netflix",
    peacock: "Peacock",
    disney_plus: "Disney+",
    hulu: "Hulu",
    max: "Max",
    prime_video: "Prime Video",
    youtube: "YouTube",
  }
  return names[platformId] ?? platformId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── Capability Summary (hardcoded per platform for now) ────────────

function getCapabilitySummary(platformId: string): CapabilitySummary {
  if (platformId === "netflix") {
    return getNetflixCapabilities()
  }
  if (platformId === "peacock") {
    return getPeacockCapabilities()
  }
  return { fullyEnforceable: [], partiallyEnforceable: [], notApplicable: [] }
}

function getNetflixCapabilities(): CapabilitySummary {
  const fullyEnforceable: CapabilityEntry[] = [
    {
      ruleCategory: "content_rating_filter",
      label: "Content Rating Filter",
      platformFeature: "Maturity rating tiers (Little Kids / Older Kids / Teens / All)",
      enforcementMethod: "Falcor API — POST maturity level to profile endpoint",
      confidence: 0.95,
    },
    {
      ruleCategory: "title_restriction",
      label: "Title Restriction",
      platformFeature: "Block specific titles from a profile",
      enforcementMethod: "Falcor API — POST title restriction list per profile",
      confidence: 0.9,
    },
    {
      ruleCategory: "profile_lock",
      label: "Profile Lock (PIN)",
      platformFeature: "4-digit PIN required to enter profile",
      enforcementMethod: "Falcor API — PUT profile lock PIN",
      confidence: 0.95,
    },
    {
      ruleCategory: "parental_consent_gate",
      label: "Parental Consent Gate",
      platformFeature: "Account password required to change parental controls",
      enforcementMethod: "Built-in — Netflix requires account password for control changes",
      confidence: 0.9,
    },
    {
      ruleCategory: "age_gate",
      label: "Age Gate",
      platformFeature: "Kids profile enforces age-appropriate content only",
      enforcementMethod: "Profile type flag (isKids) locks UI and content catalog",
      confidence: 0.9,
    },
    {
      ruleCategory: "viewing_history_access",
      label: "Viewing History Access",
      platformFeature: "Per-profile viewing activity log",
      enforcementMethod: "Falcor API — GET viewing activity endpoint",
      confidence: 0.85,
    },
    {
      ruleCategory: "autoplay_control",
      label: "Autoplay Control",
      platformFeature: "Toggle autoplay next episode and autoplay previews",
      enforcementMethod: "Falcor API — PUT autoplay settings per profile",
      confidence: 0.9,
    },
  ]

  const partiallyEnforceable: CapabilityEntry[] = [
    {
      ruleCategory: "screen_time_limit",
      label: "Screen Time Limit",
      platformFeature: "No native screen time limits",
      enforcementMethod: "Not directly available via Netflix",
      confidence: 0.3,
      gap: "Netflix has no built-in screen time limit feature",
      workaround: "Enforce via OS-level controls (Screen Time, Family Link) or DNS-based blocking",
    },
    {
      ruleCategory: "screen_time_report",
      label: "Screen Time Report",
      platformFeature: "Viewing activity log (titles + timestamps)",
      enforcementMethod: "Derive watch duration from viewing activity API data",
      confidence: 0.5,
      gap: "No native duration tracking — only title-level activity",
      workaround: "Aggregate viewing activity timestamps to estimate session duration",
    },
    {
      ruleCategory: "bedtime_schedule",
      label: "Bedtime Schedule",
      platformFeature: "No native bedtime/scheduling feature",
      enforcementMethod: "Not directly available via Netflix",
      confidence: 0.2,
      gap: "Netflix has no time-of-day restrictions",
      workaround: "Enforce via DNS blocking or OS-level scheduling",
    },
    {
      ruleCategory: "parental_event_notification",
      label: "Parental Event Notification",
      platformFeature: "No native notifications to parents",
      enforcementMethod: "Poll viewing activity API for new entries",
      confidence: 0.4,
      gap: "No push notifications — requires polling",
      workaround: "Phosra worker polls viewing activity and sends notifications",
    },
  ]

  const notApplicable: CapabilityEntry[] = [
    {
      ruleCategory: "purchase_control",
      label: "Purchase Control",
      platformFeature: "No in-app purchases on Netflix",
      enforcementMethod: "N/A — subscription-only model",
      confidence: 1.0,
    },
    {
      ruleCategory: "social_control",
      label: "Social Control",
      platformFeature: "No social features on Netflix",
      enforcementMethod: "N/A — no social/messaging features",
      confidence: 1.0,
    },
    {
      ruleCategory: "location_tracking",
      label: "Location Tracking",
      platformFeature: "No location features",
      enforcementMethod: "N/A",
      confidence: 1.0,
    },
    {
      ruleCategory: "web_filtering",
      label: "Web Filtering",
      platformFeature: "Closed content platform — no web browsing",
      enforcementMethod: "N/A",
      confidence: 1.0,
    },
    {
      ruleCategory: "safe_search",
      label: "Safe Search",
      platformFeature: "No search engine — internal content search only",
      enforcementMethod: "N/A — content search respects maturity tier",
      confidence: 1.0,
    },
    {
      ruleCategory: "app_control",
      label: "App Control",
      platformFeature: "Single-purpose app — no app installation",
      enforcementMethod: "N/A",
      confidence: 1.0,
    },
  ]

  return { fullyEnforceable, partiallyEnforceable, notApplicable }
}

function getPeacockCapabilities(): CapabilitySummary {
  const fullyEnforceable: CapabilityEntry[] = [
    {
      ruleCategory: "content_rating_filter",
      label: "Content Rating Filter",
      platformFeature: "5 maturity tiers (Little Kids / Older Kids / Family / Teen / Adult)",
      enforcementMethod: "Playwright — set account-wide maturity level via web parental controls",
      confidence: 0.9,
    },
    {
      ruleCategory: "profile_lock",
      label: "Profile Lock (PIN)",
      platformFeature: "4-digit PIN required to switch from Kids profile",
      enforcementMethod: "Playwright — set/change PIN via web settings",
      confidence: 0.9,
    },
    {
      ruleCategory: "parental_consent_gate",
      label: "Parental Consent Gate",
      platformFeature: "PIN required to change parental control settings",
      enforcementMethod: "Built-in — Peacock requires PIN to modify controls",
      confidence: 0.85,
    },
    {
      ruleCategory: "age_gate",
      label: "Age Gate",
      platformFeature: "Kids profile enforces age-appropriate content (TV-PG/PG and below)",
      enforcementMethod: "Profile type flag restricts content catalog and UI",
      confidence: 0.9,
    },
    {
      ruleCategory: "viewing_history_access",
      label: "Viewing History Access",
      platformFeature: "Per-profile Continue Watching and viewing history",
      enforcementMethod: "GraphQL API — query viewing history per profile",
      confidence: 0.8,
    },
    {
      ruleCategory: "autoplay_control",
      label: "Autoplay Control",
      platformFeature: "Autoplay next episode toggle",
      enforcementMethod: "Playwright — toggle autoplay setting per profile",
      confidence: 0.85,
    },
  ]

  const partiallyEnforceable: CapabilityEntry[] = [
    {
      ruleCategory: "screen_time_limit",
      label: "Screen Time Limit",
      platformFeature: "No native screen time limits",
      enforcementMethod: "Not directly available via Peacock",
      confidence: 0.3,
      gap: "Peacock has no built-in screen time limit feature",
      workaround: "Enforce via OS-level controls (Screen Time, Family Link) or DNS-based blocking",
    },
    {
      ruleCategory: "screen_time_report",
      label: "Screen Time Report",
      platformFeature: "Continue Watching list (titles only)",
      enforcementMethod: "Derive watch activity from Continue Watching API data",
      confidence: 0.4,
      gap: "No native duration tracking — only title-level Continue Watching",
      workaround: "Aggregate Continue Watching data to estimate session activity",
    },
    {
      ruleCategory: "bedtime_schedule",
      label: "Bedtime Schedule",
      platformFeature: "No native bedtime/scheduling feature",
      enforcementMethod: "Not directly available via Peacock",
      confidence: 0.2,
      gap: "Peacock has no time-of-day restrictions",
      workaround: "Enforce via DNS blocking or OS-level scheduling",
    },
    {
      ruleCategory: "parental_event_notification",
      label: "Parental Event Notification",
      platformFeature: "No native notifications to parents",
      enforcementMethod: "Poll viewing history for new entries",
      confidence: 0.35,
      gap: "No push notifications — requires polling",
      workaround: "Phosra worker polls viewing data and sends notifications",
    },
  ]

  const notApplicable: CapabilityEntry[] = [
    {
      ruleCategory: "title_restriction",
      label: "Title Restriction",
      platformFeature: "Peacock does not support per-title blocking",
      enforcementMethod: "N/A — only tier-based filtering available",
      confidence: 1.0,
    },
    {
      ruleCategory: "purchase_control",
      label: "Purchase Control",
      platformFeature: "No in-app purchases on Peacock",
      enforcementMethod: "N/A — subscription-only model",
      confidence: 1.0,
    },
    {
      ruleCategory: "social_control",
      label: "Social Control",
      platformFeature: "No social features on Peacock",
      enforcementMethod: "N/A — no social/messaging features",
      confidence: 1.0,
    },
    {
      ruleCategory: "location_tracking",
      label: "Location Tracking",
      platformFeature: "No location features",
      enforcementMethod: "N/A",
      confidence: 1.0,
    },
    {
      ruleCategory: "web_filtering",
      label: "Web Filtering",
      platformFeature: "Closed content platform — no web browsing",
      enforcementMethod: "N/A",
      confidence: 1.0,
    },
    {
      ruleCategory: "safe_search",
      label: "Safe Search",
      platformFeature: "No search engine — internal content search only",
      enforcementMethod: "N/A — content search respects maturity tier",
      confidence: 1.0,
    },
    {
      ruleCategory: "app_control",
      label: "App Control",
      platformFeature: "Single-purpose app — no app installation",
      enforcementMethod: "N/A",
      confidence: 1.0,
    },
  ]

  return { fullyEnforceable, partiallyEnforceable, notApplicable }
}
