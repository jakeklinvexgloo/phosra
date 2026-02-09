/*
 * Platform Registry — Barrel exports & query helpers
 */

export * from "./types"
export { CATEGORY_META, PLATFORM_REGISTRY } from "./registry"
export { PLATFORM_STATS } from "./stats"

import { CATEGORY_META, PLATFORM_REGISTRY } from "./registry"
import type { IntegrationTier, PlatformCategorySlug, PlatformRegistryEntry, PlatformSide } from "./types"

/* ── Query helpers ──────────────────────────────────────────────── */

export function getPlatformById(id: string): PlatformRegistryEntry | undefined {
  return PLATFORM_REGISTRY.find((p) => p.id === id)
}

export function getPlatformByName(name: string): PlatformRegistryEntry | undefined {
  const lower = name.toLowerCase()
  return PLATFORM_REGISTRY.find((p) => p.name.toLowerCase() === lower)
}

export function getPlatformsByCategory(slug: PlatformCategorySlug): PlatformRegistryEntry[] {
  return PLATFORM_REGISTRY.filter((p) => p.category === slug)
}

export function getPlatformsBySide(side: PlatformSide): PlatformRegistryEntry[] {
  return PLATFORM_REGISTRY.filter((p) => p.side === side)
}

export function getPlatformsByTier(tier: IntegrationTier): PlatformRegistryEntry[] {
  return PLATFORM_REGISTRY.filter((p) => p.tier === tier)
}

export function searchPlatforms(query: string): PlatformRegistryEntry[] {
  const q = query.toLowerCase()
  return PLATFORM_REGISTRY.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.id.includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)),
  )
}

export function getCategoryMeta(slug: PlatformCategorySlug) {
  return CATEGORY_META.find((c) => c.slug === slug)
}
