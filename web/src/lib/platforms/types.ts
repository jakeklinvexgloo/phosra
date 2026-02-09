/* ── Platform Registry Types ─────────────────────────────────────── */

export type IntegrationTier = "live" | "partial" | "stub" | "planned"
export type PlatformSide = "source" | "target"

export type PlatformCategorySlug =
  // Sources
  | "parental_apps"
  | "builtin_controls"
  | "isp_carrier"
  | "school_institutional"
  // Targets
  | "streaming"
  | "social_media"
  | "gaming"
  | "devices_os"
  | "smart_tv"
  | "music_audio"
  | "messaging"
  | "ai_chatbots"
  | "network_dns"
  | "browsers_search"
  | "education"
  | "shopping_payments"
  | "smart_home"
  | "vpn_age_restricted"

export interface CategoryMeta {
  slug: PlatformCategorySlug
  label: string
  shortLabel: string
  side: PlatformSide
  accentClass: string
  accentHex: string
  /** Backend DB category if applicable (dns, streaming, gaming, device, browser) */
  dbCategory?: string
}

export interface PlatformRegistryEntry {
  id: string
  name: string
  category: PlatformCategorySlug
  side: PlatformSide
  tier: IntegrationTier
  iconKey: string | null
  hex: string | null
  description?: string
  dbPlatformId?: string
  authType?: "api_key" | "oauth2" | "manual"
  capabilities?: string[]
  marquee?: boolean
  sortOrder?: number
}
