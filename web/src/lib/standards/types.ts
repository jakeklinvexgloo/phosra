/* ── Community Standards Types ──────────────────────────────────── */

export type StandardStatus = "active" | "coming_soon" | "beta"

export interface StandardRule {
  /** Maps to a Phosra RuleCategory (e.g. "social_media_min_age", "time_daily_limit") */
  category: string
  label: string
  value: string
  /** Max child age this rule applies to (optional) */
  maxAge?: number
}

export interface StandardEntry {
  id: string
  slug: string
  name: string
  organization: string
  organizationUrl?: string
  status: StandardStatus
  description: string
  longDescription: string
  iconEmoji: string
  /** Optional path to a downloaded favicon/logo image (falls back to iconEmoji) */
  iconUrl?: string
  accentColor: string
  rules: StandardRule[]
  /** Tags for filtering */
  tags: string[]
  /** Age range this standard is designed for */
  minAge?: number
  maxAge?: number
  /** Simulated adoption stats (Phase 1 — hardcoded) */
  adoptionCount: number
  schoolCount: number
}

export const STATUS_META: Record<StandardStatus, { label: string; bgColor: string; textColor: string }> = {
  active: { label: "Active", bgColor: "bg-brand-green/10", textColor: "text-brand-green" },
  coming_soon: { label: "Coming Soon", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
  beta: { label: "Beta", bgColor: "bg-sky-500/10", textColor: "text-sky-500" },
}
