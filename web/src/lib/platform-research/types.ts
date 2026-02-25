// ── Platform Research Types ──────────────────────────────────────

export type PlatformCategory = "streaming" | "gaming" | "social" | "device" | "education" | "parental_control" | "kids_app"
export type ResearchStatus = "not_started" | "in_progress" | "completed" | "needs_update" | "error"
export type ParentalControlComplexity = "simple" | "moderate" | "complex"
export type AgeGatingMethod = "profile_based" | "account_level" | "content_rating" | "time_based" | "none"

/** How this platform is researched */
export type ResearchMethod = "playwright" | "appium" | "both"

/** A platform that Phosra can potentially enforce parental controls on */
export interface Platform {
  id: string
  name: string
  category: PlatformCategory
  iconUrl?: string
  website: string
  /** The URL where parental controls are configured (web portal) */
  parentalControlsUrl?: string
  /** Whether the platform has a public API for parental controls */
  hasApi: boolean
  /** Whether the platform supports OAuth / programmatic access */
  hasOAuth: boolean
  /** Environment variable keys for credentials */
  credentialKeys: { email: string; password: string }
  /** Approximate monthly active users (kids) — for prioritization */
  estimatedKidUsers?: string
  /** Quick description of the platform's audience */
  audience: string
  tags: string[]
  /** How this platform is researched: web browser or iOS simulator */
  researchMethod: ResearchMethod
  /** iOS bundle ID for Appium-based research (e.g., "com.netflix.Netflix") */
  iosBundleId?: string
}

/** Result of a research session for one platform */
export interface PlatformResearchResult {
  platformId: string
  researchedAt: string // ISO 8601
  researchedBy: "playwright" | "appium" | "mcp_browser" | "manual"
  status: ResearchStatus
  /** How long the research session took (ms) */
  durationMs?: number
  /** Screenshots captured during research */
  screenshots: ResearchScreenshot[]
  /** Discovered parental control features */
  parentalControls: ParentalControlFeature[]
  /** Step-by-step instructions to configure parental controls */
  setupSteps: SetupStep[]
  /** Overall assessment */
  assessment: PlatformAssessment
  /** Raw notes / observations from the research session */
  notes: string
  /** Errors encountered during research */
  errors: string[]
}

export interface ResearchScreenshot {
  filename: string
  label: string
  step: number
  /** Base64 data URL or path — stored locally, not committed */
  url?: string
}

export interface ParentalControlFeature {
  name: string
  description: string
  /** Which Phosra rule category this maps to */
  phosraRuleCategory?: string
  /** Can this be set programmatically? */
  automatable: boolean
  /** How: API, Playwright (web), Appium (iOS), or manual only */
  automationMethod?: "api" | "playwright" | "appium" | "manual_only"
  /** Current default setting */
  defaultValue?: string
  /** Available options/values */
  options?: string[]
}

export interface SetupStep {
  order: number
  instruction: string
  /** CSS selector or description of the UI element to interact with */
  uiTarget?: string
  /** Screenshot index that shows this step */
  screenshotIndex?: number
  /** Action type for potential Playwright automation */
  actionType: "navigate" | "click" | "type" | "select" | "toggle" | "verify" | "wait"
}

export interface PlatformAssessment {
  /** How complex is the parental control setup? */
  complexity: ParentalControlComplexity
  /** Age gating approach used */
  ageGatingMethod: AgeGatingMethod
  /** How many parental control features exist? */
  featureCount: number
  /** How many can Phosra automate? */
  automatableCount: number
  /** Coverage percentage */
  phosraCoverage: number // 0-100
  /** Key gaps — parental controls that are missing */
  gaps: string[]
  /** Key strengths of the platform's parental controls */
  strengths: string[]
  /** Overall rating 1-10 of how well the platform protects kids */
  protectionRating: number
}

/** Aggregated research data for the admin dashboard */
export interface PlatformResearchSummary {
  totalPlatforms: number
  researched: number
  notStarted: number
  needsUpdate: number
  avgProtectionRating: number
  avgPhosraCoverage: number
  byCategory: Record<PlatformCategory, {
    total: number
    researched: number
    avgRating: number
  }>
}
