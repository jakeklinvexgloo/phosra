import path from "path"
import { promises as fs } from "fs"
import {
  STREAMING_PLATFORM_IDS,
  STREAMING_PLATFORM_NAMES,
  STREAMING_TEST_CATEGORIES,
  type StreamingPlatformId,
  type StreamingPlatformData,
  type StreamingProfileResult,
  type StreamingProfileType,
  type StreamingTestResult,
  type StreamingCriticalFailure,
  type StreamingScoreLabel,
} from "./streaming-data-types"
import { computeProfileGrade, computePlatformGrade } from "./scoring"

const RESULTS_DIR = path.resolve(process.cwd(), "../research/content_safety/results")

// Lookup table for category metadata by test ID prefix (e.g. "PE" -> PE-01 category)
const CATEGORY_BY_ID = new Map(
  STREAMING_TEST_CATEGORIES.map(c => [c.id, c])
)

/** Find category metadata for a test ID. Handles exact match and prefix match (e.g. SD-02 -> SD-01 metadata) */
function getCategoryMeta(testId: string) {
  // Exact match first
  const exact = CATEGORY_BY_ID.get(testId)
  if (exact) return exact
  // Prefix match: "SD-02" -> "SD-01" by matching the prefix letters
  const prefix = testId.replace(/-\d+$/, "")
  for (const [id, cat] of Array.from(CATEGORY_BY_ID)) {
    if (id.startsWith(prefix)) return cat
  }
  return null
}

// ---- Netflix format (flat testResults array) ----

interface NetflixJson {
  platform: string
  testDate: string
  tester: string
  frameworkVersion?: string
  profilesUsed: Record<string, { type: string; maturity: string; pinEnabled: boolean }>
  testResults: NetflixTestEntry[]
  criticalFindings: NetflixCriticalFinding[]
  scoreSummary?: Record<string, unknown>
  platformArchitecture?: Record<string, unknown>
  platformNotes?: Record<string, string>
  crossPlatformComparison?: Record<string, Record<string, string>>
}

interface NetflixTestEntry {
  testId: string
  category: string
  categoryLabel: string
  categoryWeight: number
  profile: string // may be comma-separated like "TestTeen16, TestChild12, TestChild7"
  score: number | null
  scoreLabel: string
  finding: string
  description?: string
  screenshots: string[]
  severity?: string
  platformSpecificNotes?: string
}

interface NetflixCriticalFinding {
  id: string
  title: string
  severity: string
  affectedProfiles: string[]
  notAffected?: string[]
  description: string
  reproducibility?: string
  impactedRuleCategories?: string[]
  recommendedMitigation?: string
}

// ---- Peacock / Prime Video format (nested profiles) ----

interface NestedJson {
  platform: string
  testDate: string
  tester: string
  frameworkVersion?: string
  profiles: Record<string, NestedProfile>
  criticalFailures: NestedCriticalFailure[]
  platformNotes?: Record<string, string>
  crossPlatformComparison?: Record<string, Record<string, string>>
}

interface NestedProfile {
  profileType: StreamingProfileType
  maturitySetting: string
  notes?: string
  results: Record<string, NestedTestResult>
}

interface NestedTestResult {
  category?: string
  weight?: number
  score: number | null
  label: string
  description: string
  evidence?: string[]
  cfoTriggered?: string
  cfoEffect?: string
}

interface NestedCriticalFailure {
  cfoId: string
  description: string
  affectedProfiles: string[]
  gradeCap: string
  testId: string
  score: number
  evidence?: string
}

// ---- Normalization ----

function normalizeLabel(label: string): StreamingScoreLabel {
  const map: Record<string, StreamingScoreLabel> = {
    "Full Block": "Full Block",
    "Partial Block": "Partial Block",
    "Soft Barrier": "Soft Barrier",
    "Unprotected": "Unprotected",
    "Full Block / N/A": "Full Block / N/A",
    "N/A": "N/A",
    "Not Testable": "Not Testable",
  }
  return map[label] ?? "N/A"
}

function inferProfileType(profileId: string, rawType?: string): StreamingProfileType {
  if (rawType === "kids" || rawType === "teen" || rawType === "standard" || rawType === "adult") {
    return rawType
  }
  if (profileId.toLowerCase().includes("child")) return "kids"
  if (profileId.toLowerCase().includes("teen")) return "teen"
  if (profileId.toLowerCase().includes("adult")) return "adult"
  return "standard"
}

/** Parse Netflix flat format into profiles */
function normalizeNetflix(raw: NetflixJson): {
  profiles: StreamingProfileResult[]
  criticalFailures: StreamingCriticalFailure[]
  platformNotes: Record<string, string>
  crossPlatformComparison?: Record<string, Record<string, string>>
} {
  // Group test results by profile
  const profileMap = new Map<string, StreamingTestResult[]>()

  for (const entry of raw.testResults) {
    // Handle multi-profile entries like "TestTeen16, TestChild12, TestChild7"
    const profileNames = entry.profile.split(",").map(s => s.trim())

    for (const profileName of profileNames) {
      if (!profileMap.has(profileName)) {
        profileMap.set(profileName, [])
      }
      const catMeta = getCategoryMeta(entry.testId)

      profileMap.get(profileName)!.push({
        testId: entry.testId,
        category: entry.categoryLabel || catMeta?.category || entry.category,
        weight: entry.categoryWeight || catMeta?.weight || 3,
        score: entry.score,
        label: normalizeLabel(entry.scoreLabel),
        description: entry.finding || entry.description || "",
        evidence: entry.screenshots || [],
      })
    }
  }

  // Build profile results
  const profiles: StreamingProfileResult[] = []
  for (const [profileId, tests] of Array.from(profileMap)) {
    // Only keep recognized test profiles (skip "TestAdult", "All profiles", etc.)
    const validProfiles = new Set(["TestChild7", "TestChild12", "TestTeen16"])
    if (!validProfiles.has(profileId)) continue

    const profileMeta = raw.profilesUsed[profileId]
    const profileType = inferProfileType(profileId, profileMeta?.type)

    // Deduplicate tests by testId (keep first occurrence for each category prefix)
    // Netflix has separate SD-01/SD-02/SD-03 for different profiles but they may appear
    // multiple times if the test covered multiple profiles
    const uniqueTests = deduplicateTests(tests)

    const gradeResult = computeProfileGrade(uniqueTests)

    profiles.push({
      profileId,
      profileType,
      maturitySetting: profileMeta?.maturity || "Unknown",
      tests: uniqueTests,
      weightedScore: gradeResult.score,
      overallGrade: gradeResult.grade,
      gradeCap: gradeResult.gradeCap,
      gradeCapReasons: gradeResult.gradeCapReasons,
      criticalFailureCount: uniqueTests.filter(t => t.cfoTriggered).length,
    })
  }

  // Netflix uses "criticalFindings" key
  const criticalFailures: StreamingCriticalFailure[] = (raw.criticalFindings || []).map(cf => ({
    cfoId: cf.id,
    description: cf.description,
    affectedProfiles: cf.affectedProfiles,
    gradeCap: "D", // Netflix critical findings don't have an explicit cap, default to D
    testId: cf.id.replace("CF-", ""),
    score: 3,
    evidence: undefined,
  }))

  return {
    profiles: sortProfiles(profiles),
    criticalFailures,
    platformNotes: raw.platformNotes || {},
    crossPlatformComparison: raw.crossPlatformComparison,
  }
}

/** Parse Peacock/PV nested format into profiles */
function normalizeNested(raw: NestedJson): {
  profiles: StreamingProfileResult[]
  criticalFailures: StreamingCriticalFailure[]
  platformNotes: Record<string, string>
  crossPlatformComparison?: Record<string, Record<string, string>>
} {
  const profiles: StreamingProfileResult[] = []

  for (const [profileId, profileData] of Object.entries(raw.profiles)) {
    const tests: StreamingTestResult[] = []

    for (const [testId, result] of Object.entries(profileData.results)) {
      const catMeta = getCategoryMeta(testId)

      tests.push({
        testId,
        category: result.category || catMeta?.category || testId,
        weight: result.weight || catMeta?.weight || 3,
        score: result.score,
        label: normalizeLabel(result.label),
        description: result.description,
        evidence: result.evidence || [],
        cfoTriggered: result.cfoTriggered,
        cfoEffect: result.cfoEffect,
      })
    }

    const gradeResult = computeProfileGrade(tests)

    profiles.push({
      profileId,
      profileType: profileData.profileType,
      maturitySetting: profileData.maturitySetting,
      notes: profileData.notes,
      tests,
      weightedScore: gradeResult.score,
      overallGrade: gradeResult.grade,
      gradeCap: gradeResult.gradeCap,
      gradeCapReasons: gradeResult.gradeCapReasons,
      criticalFailureCount: tests.filter(t => t.cfoTriggered).length,
    })
  }

  const criticalFailures: StreamingCriticalFailure[] = (raw.criticalFailures || []).map(cf => ({
    cfoId: cf.cfoId,
    description: cf.description,
    affectedProfiles: cf.affectedProfiles,
    gradeCap: cf.gradeCap,
    testId: cf.testId,
    score: cf.score,
    evidence: cf.evidence,
  }))

  return {
    profiles: sortProfiles(profiles),
    criticalFailures,
    platformNotes: raw.platformNotes || {},
    crossPlatformComparison: raw.crossPlatformComparison,
  }
}

/** Deduplicate tests — keep the worst score per category prefix (e.g. DU-01 and DU-02 both map to "DU") */
function deduplicateTests(tests: StreamingTestResult[]): StreamingTestResult[] {
  const seen = new Map<string, StreamingTestResult>()
  for (const t of tests) {
    const prefix = t.testId.replace(/-\d+$/, "")
    const existing = seen.get(prefix)
    if (!existing || (t.score !== null && (existing.score === null || t.score > existing.score))) {
      seen.set(prefix, t)
    }
  }
  return Array.from(seen.values())
}

/** Sort profiles in canonical order: TestChild7, TestChild12, TestTeen16 */
function sortProfiles(profiles: StreamingProfileResult[]): StreamingProfileResult[] {
  const order: Record<string, number> = {
    TestChild7: 0,
    TestChild12: 1,
    TestTeen16: 2,
  }
  return profiles.sort((a, b) => (order[a.profileId] ?? 99) - (order[b.profileId] ?? 99))
}

/** Detect JSON format and normalize */
function normalizeJsonData(raw: Record<string, unknown>): {
  profiles: StreamingProfileResult[]
  criticalFailures: StreamingCriticalFailure[]
  platformNotes: Record<string, string>
  crossPlatformComparison?: Record<string, Record<string, string>>
} {
  // Netflix format has flat testResults array
  if ("testResults" in raw && Array.isArray(raw.testResults)) {
    return normalizeNetflix(raw as unknown as NetflixJson)
  }
  // Peacock/PV format has nested profiles with results
  if ("profiles" in raw && typeof raw.profiles === "object") {
    return normalizeNested(raw as unknown as NestedJson)
  }
  throw new Error(`Unknown JSON format: missing both testResults and profiles keys`)
}

/** Load and normalize a single streaming platform's data */
export async function loadStreamingPlatform(platformId: StreamingPlatformId): Promise<StreamingPlatformData> {
  const jsonPath = path.join(RESULTS_DIR, platformId, "content_safety_results.json")
  const content = await fs.readFile(jsonPath, "utf-8")
  const raw = JSON.parse(content) as Record<string, unknown>

  const { profiles, criticalFailures, platformNotes, crossPlatformComparison } =
    normalizeJsonData(raw)

  const { overallGrade, overallScore } = computePlatformGrade(profiles)

  return {
    platformId,
    platformName: STREAMING_PLATFORM_NAMES[platformId],
    testDate: (raw.testDate as string) || "Unknown",
    tester: (raw.tester as string) || "Unknown",
    frameworkVersion: raw.frameworkVersion as string | undefined,
    profiles,
    criticalFailures,
    platformNotes,
    crossPlatformComparison,
    overallGrade,
    overallScore,
  }
}

/** Load all streaming platforms */
export async function loadAllStreamingPlatforms(): Promise<StreamingPlatformData[]> {
  const results = await Promise.all(
    STREAMING_PLATFORM_IDS.map(id => loadStreamingPlatform(id))
  )
  return results
}
