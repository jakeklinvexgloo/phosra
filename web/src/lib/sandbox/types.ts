// Provider Sandbox types

/** Netflix maturity tiers */
export type NetflixMaturityTier = "All" | "7+" | "10+" | "13+" | "16+" | "18+"

export const MATURITY_TIERS: NetflixMaturityTier[] = [
  "All",
  "7+",
  "10+",
  "13+",
  "16+",
  "18+",
]

export interface NetflixProfile {
  id: string
  name: string
  type: "adult" | "standard" | "kids"
  avatarColor: string // CSS gradient
  maturityRating: NetflixMaturityTier
  blockedTitles: string[]
  profileLock: { enabled: boolean; pin: string }
  autoplayNextEpisode: boolean
  autoplayPreviews: boolean
  viewingActivity: ViewingActivityEntry[]
  timeLimitManaged: boolean // Phosra-managed badge
}

export interface ViewingActivityEntry {
  title: string
  date: string
  rating: string
  duration: string
}

/** A sandbox rule the user can toggle */
export interface SandboxRule {
  category: string
  label: string
  description: string
  enabled: boolean
  config: Record<string, unknown>
  appliesToProvider: boolean // false = shown as "not applicable"
}

/** A single change applied during enforcement */
export interface ChangeDelta {
  profileId: string
  profileName: string
  field: string
  oldValue: unknown
  newValue: unknown
  description: string
}

/** Protection score for a single profile */
export interface ProtectionScore {
  value: number // 0-10 scale
  level: "at-risk" | "partial" | "protected"
  applicableCount: number // how many rules apply to this profile type
  enabledCount: number // how many applicable rules are enabled
  gapCount: number // applicableCount - enabledCount
}

/** Per-profile change summary (computed, not stored) */
export interface ProfileChangeSummary {
  profileId: string
  profileName: string
  profileType: "adult" | "standard" | "kids"
  changes: ChangeDelta[]
  changeCount: number
}

/** A completed enforcement snapshot for history */
export interface EnforcementSnapshot {
  id: string
  timestamp: Date
  profiles: NetflixProfile[]
  changes: ChangeDelta[]
  rulesApplied: number
  rulesSkipped: number
  phosraManaged: number
}

/** Top-level sandbox state */
export interface SandboxState {
  provider: "netflix"
  profiles: NetflixProfile[]
  rules: SandboxRule[]
  selectedProfileId: string

  // Per-profile rule configuration
  configProfileId: string // which profile we're configuring in the rules panel
  profileRuleOverrides: Record<string, Record<string, Record<string, unknown>>> // profileId -> category -> config

  // Preview/diff state
  previewMode: boolean
  previousProfiles: NetflixProfile[] | null // snapshot before preview
  previewChanges: ChangeDelta[] | null // computed changes in preview
  previewRulesApplied: number
  previewRulesSkipped: number
  previewPhosraManaged: number

  // History
  history: EnforcementSnapshot[]

  // Computing state (true during 800ms preview computation)
  isComputing: boolean
}

/** Reducer actions */
export type SandboxAction =
  | { type: "TOGGLE_RULE"; category: string }
  | { type: "UPDATE_RULE_CONFIG"; category: string; config: Record<string, unknown> }
  | { type: "UPDATE_PROFILE_RULE_CONFIG"; profileId: string; category: string; config: Record<string, unknown> }
  | { type: "SELECT_PROFILE"; profileId: string }
  | { type: "SELECT_CONFIG_PROFILE"; profileId: string }
  | { type: "RESET" }
  // Three-phase enforcement
  | { type: "PREVIEW_START" }
  | {
      type: "PREVIEW_COMPLETE"
      profiles: NetflixProfile[]
      changes: ChangeDelta[]
      rulesApplied: number
      rulesSkipped: number
      phosraManaged: number
    }
  | { type: "COMMIT" }
  | { type: "DISCARD" }

/** Props for the profile avatar badges shown next to each rule toggle */
export interface ProfileAvatarBadgeData {
  profileId: string
  profileName: string
  avatarColor: string // CSS gradient from NetflixProfile
  initial: string // first letter of name
  changeCount: number // 0 = unaffected, >0 = show badge
  isAffected: boolean // does this rule apply to this profile type?
}

/** Diff badge variant */
export type DiffBadgeVariant = "changed" | "new" | "unchanged"

/** Change Manifest export format */
export interface ManifestExport {
  timestamp: string // ISO 8601
  provider: "netflix"
  rulesApplied: number
  rulesSkipped: number
  phosraManaged: number
  profiles: {
    profileId: string
    profileName: string
    profileType: string
    changes: {
      field: string
      before: unknown
      after: unknown
      rule: string
      description: string
    }[]
  }[]
}

/** Provider capability mapping */
export interface ProviderCapability {
  category: string
  supported: boolean
  netflixSetting?: string
  providerSetting?: string
  targetProfiles: ("adult" | "standard" | "teen" | "kids")[]
  description: string
}
