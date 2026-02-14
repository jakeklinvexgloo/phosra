/* ── Parental Controls Types ──────────────────────────────────── */

export type SupportLevel = "full" | "partial" | "none" | "unknown"

export type PricingTier = "free" | "freemium" | "paid" | "bundled"

export type ApiAvailability = "public_api" | "partner_api" | "no_api" | "undocumented"

export type SourceCategory = "parental_apps" | "builtin_controls" | "isp_carrier" | "school_institutional"

export interface DeviceSupport {
  iOS: boolean
  android: boolean
  windows: boolean
  macOS: boolean
  chromeos: boolean
  fireos: boolean
  router: boolean
  browser_extension: boolean
}

export interface CapabilityEntry {
  /** Maps to a Phosra RuleCategory */
  category: string
  label: string
  support: SupportLevel
}

export interface ParentalControlEntry {
  id: string
  slug: string
  name: string
  description: string
  longDescription: string
  website: string
  iconEmoji: string
  iconUrl?: string
  accentColor: string

  /** Which source category this app falls into */
  sourceCategory: SourceCategory

  /** Pricing */
  pricingTier: PricingTier
  pricingDetails: string

  /** API availability for Phosra integration */
  apiAvailability: ApiAvailability
  apiDetails?: string

  /** Device support matrix */
  devices: DeviceSupport

  /** Capability matrix — maps to our rule categories */
  capabilities: CapabilityEntry[]

  /** Age range */
  minAge?: number
  maxAge?: number

  /** Tags for filtering */
  tags: string[]

  /** Featured on hub page */
  featured: boolean

  /** Cross-reference to platform registry if exists */
  platformRegistryId?: string
}

export const SOURCE_CATEGORY_META: Record<SourceCategory, { label: string; shortLabel: string; description: string }> = {
  parental_apps: {
    label: "Parental Control Apps",
    shortLabel: "Parental Apps",
    description: "Dedicated parental control applications that monitor and manage children's device usage.",
  },
  builtin_controls: {
    label: "Built-in Platform Controls",
    shortLabel: "Built-in Controls",
    description: "Native parental controls built into operating systems and platforms.",
  },
  isp_carrier: {
    label: "ISP & Carrier Tools",
    shortLabel: "ISP & Carrier",
    description: "Network-level controls provided by internet service providers and mobile carriers.",
  },
  school_institutional: {
    label: "School & Institutional",
    shortLabel: "School",
    description: "Device management and filtering solutions for schools and institutions.",
  },
}

export const PRICING_LABELS: Record<PricingTier, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  bundled: "Bundled",
}

export const API_LABELS: Record<ApiAvailability, { label: string; color: string }> = {
  public_api: { label: "Public API", color: "text-brand-green" },
  partner_api: { label: "Partner API", color: "text-sky-500" },
  no_api: { label: "No API", color: "text-muted-foreground" },
  undocumented: { label: "Undocumented", color: "text-amber-500" },
}
