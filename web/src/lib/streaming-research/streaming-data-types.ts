/** Score labels matching the 0-4 scale */
export type StreamingScoreLabel =
  | "Full Block"
  | "Partial Block"
  | "Soft Barrier"
  | "Unprotected"
  | "Full Block / N/A"
  | "N/A"
  | "Not Testable"

/** Profile types in streaming platform testing */
export type StreamingProfileType = "kids" | "teen" | "standard" | "adult"

/** A single test result for one category on one profile */
export interface StreamingTestResult {
  testId: string                      // "PE-01", "SD-01", etc.
  category: string                    // "Profile Escape", "Search & Discovery"
  weight: number                      // 2-5 severity weight
  score: number | null                // 0-4 (null = not testable)
  label: StreamingScoreLabel
  description: string                 // Detailed finding
  evidence: string[]                  // Screenshot filenames
  cfoTriggered?: string               // "CFO-2" if critical failure
  cfoEffect?: string                  // "Grade capped at D"
}

/** Results for a single profile on a platform */
export interface StreamingProfileResult {
  profileId: string                   // "TestChild7", "TestChild12", "TestTeen16"
  profileType: StreamingProfileType
  maturitySetting: string             // "Family (TVPG, PG)"
  notes?: string                      // "Identical to TestChild7..."
  tests: StreamingTestResult[]
  // Computed at load time:
  weightedScore: number               // 0-100 (higher = safer)
  overallGrade: string                // Letter grade A+ through F
  gradeCap?: string                   // e.g., "D" if CFO triggered
  gradeCapReasons?: string[]
  criticalFailureCount: number
}

/** Platform-level critical failure override */
export interface StreamingCriticalFailure {
  cfoId: string                       // "CFO-2"
  description: string
  affectedProfiles: string[]
  gradeCap: string                    // "D"
  testId: string                      // "PE-01"
  score: number
  evidence?: string
}

/** Full platform research data (loaded + computed) */
export interface StreamingPlatformData {
  platformId: string                  // "netflix", "peacock", "prime_video"
  platformName: string                // "Netflix", "Peacock", "Prime Video"
  testDate: string
  tester: string
  frameworkVersion?: string
  profiles: StreamingProfileResult[]
  criticalFailures: StreamingCriticalFailure[]
  platformNotes: Record<string, string>
  crossPlatformComparison?: Record<string, Record<string, string>>
  // Computed:
  overallGrade: string                // Worst profile grade
  overallScore: number                // Min of profile scores
}

/** Hub page summary (subset for serialization to client) */
export interface StreamingPlatformSummary {
  platformId: string
  platformName: string
  overallGrade: string
  overallScore: number
  testDate: string
  criticalFailureCount: number
  profileGrades: {
    profileId: string
    profileType: StreamingProfileType
    grade: string
    score: number
    isCapped: boolean
    criticalFailureCount: number
  }[]
}

/** Test category metadata (for column headers) */
export interface StreamingTestCategory {
  id: string
  category: string
  shortLabel: string
  weight: number
  description: string
}

/** The canonical set of 9 test categories */
export const STREAMING_TEST_CATEGORIES: StreamingTestCategory[] = [
  { id: "PE-01", category: "Profile Escape", shortLabel: "Profile Esc.", weight: 5,
    description: "Can a child switch to an unrestricted profile?" },
  { id: "SD-01", category: "Search & Discovery", shortLabel: "Search", weight: 5,
    description: "Can mature content be found via search?" },
  { id: "DU-01", category: "Direct URL / Deep Link", shortLabel: "Direct URL", weight: 3,
    description: "Can mature content be accessed via direct URL?" },
  { id: "KM-01", category: "Kids Mode Escape", shortLabel: "Kids Mode", weight: 3,
    description: "Can children escape the restricted browsing experience?" },
  { id: "RL-01", category: "Recommendation Leakage", shortLabel: "Rec. Leak", weight: 4,
    description: "Does mature content appear in recommendations?" },
  { id: "CB-01", category: "Cross-Profile Bleed", shortLabel: "X-Profile", weight: 3,
    description: "Does watch history bleed across profiles?" },
  { id: "CG-01", category: "Content Rating Gaps", shortLabel: "Rating Gaps", weight: 2,
    description: "Are content ratings displayed accurately?" },
  { id: "PL-01", category: "PIN/Lock Bypass", shortLabel: "PIN/Lock", weight: 4,
    description: "Can PIN/password protections be bypassed?" },
  { id: "MF-01", category: "Maturity Filter Effectiveness", shortLabel: "Maturity", weight: 4,
    description: "Overall maturity filter effectiveness" },
]

/** Platform registry */
export const STREAMING_PLATFORM_IDS = ["netflix", "peacock", "prime_video"] as const
export type StreamingPlatformId = (typeof STREAMING_PLATFORM_IDS)[number]

export const STREAMING_PLATFORM_NAMES: Record<StreamingPlatformId, string> = {
  netflix: "Netflix",
  peacock: "Peacock",
  prime_video: "Prime Video",
}

/** Score label map */
export const STREAMING_SCORE_LABELS: Record<number, string> = {
  0: "Full Block",
  1: "Partial Block",
  2: "Soft Barrier",
  3: "Unprotected",
  4: "Facilitated",
}
