// ── Platform Research Data Types ──────────────────────────────────
// Types for loaded research data from the filesystem research directories.

export interface PlatformResearchData {
  platformId: string
  platformName: string
  findings: string | null
  adapterAssessment: string | null
  integrationNotes: string | null
  ratingMapping: RatingMappingData | null
  screenshots: ScreenshotGroup[]
  screenshotCount: number
  capabilities: CapabilitySummary
}

export interface ScreenshotGroup {
  id: string
  label: string
  screenshots: { filename: string; label: string; path: string }[]
}

export interface RatingMappingData {
  netflixTiers: Record<
    string,
    {
      phosraTier: string
      mpaaRatings: string[]
      tvRatings: string[]
      ageRange: string
      isKidsProfile: boolean
    }
  >
  ratingSystems: Record<
    string,
    {
      supported: boolean | string
      ratings?: string[]
      notes: string
    }
  >
}

export interface CapabilitySummary {
  fullyEnforceable: CapabilityEntry[]
  partiallyEnforceable: CapabilityEntry[]
  notApplicable: CapabilityEntry[]
}

export interface CapabilityEntry {
  ruleCategory: string
  label: string
  platformFeature: string
  enforcementMethod: string
  confidence: number
  gap?: string
  workaround?: string
}
