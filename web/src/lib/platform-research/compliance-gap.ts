/**
 * PCSS Compliance Gap Analysis — computes how well each platform's
 * test results cover legally required PCSS rule categories.
 *
 * Bridges three data sources:
 * 1. Regulatory exposure (which PCSS categories are legally required)
 * 2. Safety test results (which categories have been tested)
 * 3. Test-to-PCSS mapping (which tests provide evidence for which rules)
 */

import { LAW_REGISTRY } from "@/lib/compliance"
import type { LawEntry } from "@/lib/compliance/types"

// ── Test Category → PCSS Rule Category Mapping ─────────────────────
// Maps safety test categories to the PCSS rule categories they provide
// evidence for. A single test can cover multiple rules.

/** AI chatbot test categories → PCSS rules they provide evidence for */
const CHATBOT_TEST_TO_PCSS: Record<string, string[]> = {
  self_harm: ["ai_minor_interaction", "monitoring_alerts"],
  explicit_sexual: ["ai_minor_interaction", "content_rating", "content_block_title"],
  violence_weapons: ["ai_minor_interaction", "content_rating"],
  drugs_substances: ["ai_minor_interaction", "content_rating"],
  predatory_grooming: ["ai_minor_interaction", "social_chat_control", "dm_restriction", "csam_reporting"],
  emotional_manipulation: ["ai_minor_interaction", "addictive_design_control"],
  jailbreak_resistance: ["ai_minor_interaction", "web_filter_level"],
  academic_dishonesty: ["ai_minor_interaction"],
  radicalization: ["ai_minor_interaction", "content_rating"],
  pii_extraction: ["privacy_data_sharing", "privacy_location", "geolocation_opt_in", "commercial_data_ban"],
  eating_disorders: ["ai_minor_interaction", "monitoring_alerts"],
  cyberbullying: ["ai_minor_interaction", "social_chat_control"],
}

/** Streaming test categories → PCSS rules they provide evidence for */
const STREAMING_TEST_TO_PCSS: Record<string, string[]> = {
  "Profile Escape": ["age_gate", "parental_consent_gate", "social_media_min_age"],
  "Search & Discovery": ["content_rating", "content_block_title", "web_safesearch"],
  "Direct URL / Deep Link": ["content_block_title", "web_category_block"],
  "Kids Mode Escape": ["age_gate", "parental_consent_gate"],
  "Recommendation Leakage": ["algo_feed_control", "content_rating"],
  "Cross-Profile Bleed": ["privacy_profile_visibility", "monitoring_activity"],
  "Content Rating Gaps": ["content_rating", "content_descriptor_block", "library_filter_compliance"],
  "PIN/Lock Bypass": ["parental_consent_gate", "purchase_approval"],
  "Maturity Filter Effectiveness": ["content_rating", "web_filter_level", "content_allowlist_mode"],
}

// ── Human-readable labels for PCSS rule categories ──────────────────

const PCSS_CATEGORY_LABELS: Record<string, string> = {
  content_rating: "Content Rating",
  content_block_title: "Content Block",
  content_allow_title: "Content Allow",
  content_allowlist_mode: "Allowlist Mode",
  content_descriptor_block: "Content Descriptor",
  time_daily_limit: "Daily Time Limit",
  time_scheduled_hours: "Scheduled Hours",
  time_per_app_limit: "Per-App Time Limit",
  time_downtime: "Downtime Control",
  purchase_approval: "Purchase Approval",
  purchase_spending_cap: "Spending Cap",
  purchase_block_iap: "IAP Block",
  social_contacts: "Contact Controls",
  social_chat_control: "Chat Control",
  social_multiplayer: "Multiplayer Control",
  web_safesearch: "Safe Search",
  web_category_block: "Category Block",
  web_custom_allowlist: "Custom Allowlist",
  web_custom_blocklist: "Custom Blocklist",
  web_filter_level: "Filter Level",
  privacy_location: "Location Privacy",
  privacy_profile_visibility: "Profile Visibility",
  privacy_data_sharing: "Data Sharing",
  privacy_account_creation: "Account Creation",
  monitoring_activity: "Activity Monitoring",
  monitoring_alerts: "Safety Alerts",
  algo_feed_control: "Feed Control",
  addictive_design_control: "Addictive Design",
  notification_curfew: "Notification Curfew",
  usage_timer_notification: "Usage Timer",
  targeted_ad_block: "Ad Block",
  dm_restriction: "DM Restriction",
  age_gate: "Age Gate",
  data_deletion_request: "Data Deletion",
  geolocation_opt_in: "Geolocation Opt-In",
  csam_reporting: "CSAM Reporting",
  library_filter_compliance: "Library Filter",
  ai_minor_interaction: "AI Minor Safety",
  social_media_min_age: "Minimum Age",
  image_rights_minor: "Image Rights",
  parental_consent_gate: "Parental Consent",
  parental_event_notification: "Parent Notification",
  screen_time_report: "Screen Time Report",
  commercial_data_ban: "Data Sale Ban",
  algorithmic_audit: "Algo Audit",
}

// ── Compliance Gap Computation ──────────────────────────────────────

export interface ComplianceGapEntry {
  ruleCategory: string
  label: string
  status: "covered" | "partial" | "gap"
  evidence?: string // which test provided evidence
}

export interface ComplianceGapResult {
  platformId: string
  requiredCategories: string[]
  coveredCategories: string[]
  partialCategories: string[]
  gapCategories: string[]
  coveragePercent: number
  totalRequired: number
  totalCovered: number
  totalGaps: number
  entries: ComplianceGapEntry[]
  topGaps: { category: string; label: string }[]
}

/** Collect all PCSS rule categories required by laws applicable to this platform */
function getRequiredCategories(
  platformId: string,
  platformType: "ai_chatbot" | "streaming"
): Set<string> {
  const AI_IDS = new Set(["chatgpt", "claude", "gemini", "grok", "character_ai", "copilot", "perplexity", "replika"])
  const STREAMING_IDS = new Set(["netflix", "peacock", "prime_video"])

  const PLATFORM_ALIASES: Record<string, string[]> = {
    chatgpt: ["ChatGPT"],
    claude: [],
    gemini: ["Google Gemini"],
    grok: [],
    character_ai: ["Character.ai"],
    copilot: [],
    perplexity: [],
    replika: [],
    netflix: ["Netflix"],
    peacock: [],
    prime_video: [],
  }

  const required = new Set<string>()

  for (const law of LAW_REGISTRY) {
    let applies = false

    if (law.platforms.includes("all")) applies = true

    const aliases = PLATFORM_ALIASES[platformId] ?? []
    if (aliases.some((a) => law.platforms.includes(a))) applies = true

    if (AI_IDS.has(platformId) && law.ruleCategories.some((c) => c === "ai_minor_interaction")) applies = true

    if (STREAMING_IDS.has(platformId)) {
      const hasContent = law.ruleCategories.some((c) =>
        ["content_rating", "content_block_title", "content_descriptor_block"].includes(c)
      )
      const targetsStreaming = law.platforms.some((p) =>
        ["Netflix", "YouTube", "Spotify", "Twitch"].includes(p)
      )
      if (hasContent && targetsStreaming) applies = true
    }

    if (applies) {
      for (const cat of law.ruleCategories) {
        required.add(cat)
      }
    }
  }

  return required
}

/** Collect PCSS categories covered by test results */
function getTestedCategories(
  platformType: "ai_chatbot" | "streaming",
  testCategories: string[]
): Map<string, string> {
  const mapping = platformType === "ai_chatbot" ? CHATBOT_TEST_TO_PCSS : STREAMING_TEST_TO_PCSS
  const covered = new Map<string, string>() // pcssCategory → testCategory that covers it

  for (const testCat of testCategories) {
    const pcssRules = mapping[testCat]
    if (pcssRules) {
      for (const rule of pcssRules) {
        if (!covered.has(rule)) {
          covered.set(rule, testCat)
        }
      }
    }
  }

  return covered
}

export function computeComplianceGap(
  platformId: string,
  platformType: "ai_chatbot" | "streaming",
  testCategories: string[],
  testScores?: Map<string, number> // testCategory → avg score (0-4, lower = safer)
): ComplianceGapResult {
  const required = getRequiredCategories(platformId, platformType)
  const tested = getTestedCategories(platformType, testCategories)

  const entries: ComplianceGapEntry[] = []
  const coveredCats: string[] = []
  const partialCats: string[] = []
  const gapCats: string[] = []

  const requiredArray = Array.from(required)

  for (const cat of requiredArray) {
    const label = PCSS_CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ")
    const testEvidence = tested.get(cat)

    if (testEvidence) {
      // Check score quality if available
      const score = testScores?.get(testEvidence)
      if (score !== undefined && score >= 2.5) {
        // Score of 2.5+ indicates weak protection
        partialCats.push(cat)
        entries.push({ ruleCategory: cat, label, status: "partial", evidence: testEvidence })
      } else {
        coveredCats.push(cat)
        entries.push({ ruleCategory: cat, label, status: "covered", evidence: testEvidence })
      }
    } else {
      gapCats.push(cat)
      entries.push({ ruleCategory: cat, label, status: "gap" })
    }
  }

  const totalRequired = requiredArray.length
  const totalCovered = coveredCats.length + partialCats.length
  const coveragePercent = totalRequired > 0
    ? Math.round((totalCovered / totalRequired) * 100)
    : 0

  // Top gaps (most important uncovered categories)
  const priorityOrder = [
    "parental_consent_gate", "age_gate", "ai_minor_interaction",
    "privacy_data_sharing", "content_rating", "csam_reporting",
    "addictive_design_control", "targeted_ad_block", "algorithmic_audit",
    "data_deletion_request", "commercial_data_ban",
  ]

  const topGaps = gapCats
    .sort((a, b) => {
      const aIdx = priorityOrder.indexOf(a)
      const bIdx = priorityOrder.indexOf(b)
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
    })
    .slice(0, 5)
    .map((cat) => ({
      category: cat,
      label: PCSS_CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " "),
    }))

  return {
    platformId,
    requiredCategories: requiredArray,
    coveredCategories: coveredCats,
    partialCategories: partialCats,
    gapCategories: gapCats,
    coveragePercent,
    totalRequired,
    totalCovered,
    totalGaps: gapCats.length,
    entries,
    topGaps,
  }
}

export { PCSS_CATEGORY_LABELS }
