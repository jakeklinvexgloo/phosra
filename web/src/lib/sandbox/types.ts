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

/** Logged enforcement event */
export interface EnforcementEvent {
  id: string
  timestamp: Date
  rulesApplied: number
  rulesSkipped: number
  changes: ChangeDelta[]
}

/** Top-level sandbox state */
export interface SandboxState {
  provider: "netflix"
  profiles: NetflixProfile[]
  rules: SandboxRule[]
  enforcementLog: EnforcementEvent[]
  pendingChanges: ChangeDelta[]
  isEnforcing: boolean
  selectedProfileId: string
}

/** Reducer actions */
export type SandboxAction =
  | { type: "TOGGLE_RULE"; category: string }
  | { type: "UPDATE_RULE_CONFIG"; category: string; config: Record<string, unknown> }
  | { type: "ENFORCE_START" }
  | { type: "ENFORCE_COMPLETE"; profiles: NetflixProfile[]; changes: ChangeDelta[]; rulesApplied: number; rulesSkipped: number }
  | { type: "SELECT_PROFILE"; profileId: string }
  | { type: "RESET" }

/** Provider capability mapping */
export interface ProviderCapability {
  category: string
  supported: boolean
  netflixSetting?: string
  targetProfiles: ("adult" | "standard" | "kids")[]
  description: string
}
