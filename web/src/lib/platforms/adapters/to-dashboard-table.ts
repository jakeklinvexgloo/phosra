/*
 * Adapter: Registry → Dashboard Table Data
 *
 * Transforms the platform registry into a flat array for the
 * /dashboard/platforms "Platform Coverage Explorer" table.
 */

import { CATEGORY_META, PLATFORM_REGISTRY } from "../registry"
import type { IntegrationTier, PlatformCategorySlug, PlatformSide } from "../types"
import { TIER_LABELS, TIER_ORDER } from "./to-platform-page"

export interface DashboardPlatformEntry {
  id: string
  name: string
  category: PlatformCategorySlug
  categoryLabel: string
  side: PlatformSide
  tier: IntegrationTier
  tierLabel: string
  hex: string | null
  iconKey: string | null
  description?: string
  capabilities: string[]
  dbPlatformId?: string
  authType?: string
  marquee: boolean
  accentHex: string
}

/* ── Capability inference by category ───────────────────────────── */

const CATEGORY_CAPABILITIES: Record<PlatformCategorySlug, string[]> = {
  streaming: ["content_rating"],
  social_media: ["content_rating", "social_control", "app_control"],
  gaming: ["content_rating", "time_limit", "purchase_control"],
  devices_os: ["content_rating", "time_limit", "web_filtering", "app_control", "purchase_control"],
  network_dns: ["web_filtering", "safe_search", "custom_blocklist", "custom_allowlist"],
  messaging: ["social_control"],
  ai_chatbots: ["content_rating"],
  smart_tv: ["content_rating"],
  music_audio: ["content_rating"],
  browsers_search: ["web_filtering", "safe_search"],
  education: ["content_rating"],
  shopping_payments: ["purchase_control"],
  smart_home: ["content_rating"],
  vpn_age_restricted: ["content_rating"],
  parental_apps: ["content_rating", "time_limit", "web_filtering", "social_control", "purchase_control"],
  builtin_controls: ["content_rating", "time_limit", "web_filtering", "social_control", "purchase_control"],
  isp_carrier: ["web_filtering", "safe_search"],
  school_institutional: ["web_filtering", "content_rating", "app_control"],
}

function getInferredCapabilities(category: PlatformCategorySlug, explicit?: string[]): string[] {
  if (explicit && explicit.length > 0) return explicit
  return CATEGORY_CAPABILITIES[category] ?? []
}

/* ── Build entries ──────────────────────────────────────────────── */

export const DASHBOARD_PLATFORM_ENTRIES: DashboardPlatformEntry[] = PLATFORM_REGISTRY
  .map((p) => {
    const meta = CATEGORY_META.find((c) => c.slug === p.category)!
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      categoryLabel: meta.shortLabel,
      side: p.side,
      tier: p.tier,
      tierLabel: TIER_LABELS[p.tier],
      hex: p.hex,
      iconKey: p.iconKey,
      description: p.description,
      capabilities: getInferredCapabilities(p.category, p.capabilities),
      dbPlatformId: p.dbPlatformId,
      authType: p.authType,
      marquee: p.marquee ?? false,
      accentHex: meta.accentHex,
    }
  })
  .sort((a, b) => {
    const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
    if (tierDiff !== 0) return tierDiff
    if (a.marquee !== b.marquee) return a.marquee ? -1 : 1
    return a.name.localeCompare(b.name)
  })
