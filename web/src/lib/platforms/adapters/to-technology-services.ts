/*
 * Adapter: Registry → Technology Services Page Data
 *
 * Filters to target-side platforms only for the /technology-services hub.
 */

import { CATEGORY_META, PLATFORM_REGISTRY } from "../registry"
import type { IntegrationTier, PlatformCategorySlug, PlatformSide } from "../types"

export interface TechServiceEntry {
  id: string
  name: string
  category: PlatformCategorySlug
  categoryLabel: string
  categoryShortLabel: string
  side: PlatformSide
  tier: IntegrationTier
  tierLabel: string
  iconKey: string | null
  hex: string | null
  accentClass: string
  accentHex: string
  description?: string
  dbPlatformId?: string
  marquee: boolean
}

const TIER_LABELS: Record<IntegrationTier, string> = {
  live: "API",
  partial: "Hybrid",
  stub: "Guide",
  planned: "Roadmap",
}

const TIER_ORDER: Record<IntegrationTier, number> = {
  live: 0,
  partial: 1,
  stub: 2,
  planned: 3,
}

const TARGET_CATEGORIES = CATEGORY_META.filter((c) => c.side === "target")

export const TECH_SERVICE_ENTRIES: TechServiceEntry[] = PLATFORM_REGISTRY
  .filter((p) => p.side === "target")
  .map((p) => {
    const meta = CATEGORY_META.find((c) => c.slug === p.category)!
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      categoryLabel: meta.label,
      categoryShortLabel: meta.shortLabel,
      side: p.side,
      tier: p.tier,
      tierLabel: TIER_LABELS[p.tier],
      iconKey: p.iconKey,
      hex: p.hex,
      accentClass: meta.accentClass,
      accentHex: meta.accentHex,
      description: p.description,
      dbPlatformId: p.dbPlatformId,
      marquee: p.marquee ?? false,
    }
  })
  .sort((a, b) => {
    const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
    if (tierDiff !== 0) return tierDiff
    return a.name.localeCompare(b.name)
  })

export const TECH_SERVICE_CATEGORIES = TARGET_CATEGORIES

export const TECH_SERVICE_STATS = {
  total: TECH_SERVICE_ENTRIES.length,
  categoryCount: TARGET_CATEGORIES.length,
  integratedCount: TECH_SERVICE_ENTRIES.filter((p) => p.tier === "live" || p.tier === "partial").length,
  plannedCount: TECH_SERVICE_ENTRIES.filter((p) => p.tier === "planned" || p.tier === "stub").length,
  featuredCount: TECH_SERVICE_ENTRIES.filter((p) => p.marquee).length,
}

export { TIER_LABELS, TIER_ORDER }
