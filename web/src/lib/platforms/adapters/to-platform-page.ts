/*
 * Adapter: Registry → Platform Page Explorer Data
 *
 * Generates flat PlatformPageEntry[] for the /platforms explorer page.
 */

import { CATEGORY_META, PLATFORM_REGISTRY } from "../registry"
import type { IntegrationTier, PlatformCategorySlug, PlatformSide } from "../types"

export interface PlatformPageEntry {
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

export const PLATFORM_PAGE_ENTRIES: PlatformPageEntry[] = PLATFORM_REGISTRY
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
    // Sort by tier first (live first), then alphabetically
    const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
    if (tierDiff !== 0) return tierDiff
    return a.name.localeCompare(b.name)
  })

export { TIER_LABELS, TIER_ORDER }
