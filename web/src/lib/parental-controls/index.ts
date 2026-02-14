/*
 * Parental Controls — Barrel exports & query helpers
 */

export * from "./types"
export { PARENTAL_CONTROLS_REGISTRY } from "./registry"

import { PARENTAL_CONTROLS_REGISTRY } from "./registry"
import type { ParentalControlEntry, SourceCategory, PricingTier, ApiAvailability } from "./types"

/* ── Query helpers ──────────────────────────────────────────────── */

export function getParentalControlById(id: string): ParentalControlEntry | undefined {
  return PARENTAL_CONTROLS_REGISTRY.find((p) => p.id === id)
}

export function getParentalControlBySlug(slug: string): ParentalControlEntry | undefined {
  return PARENTAL_CONTROLS_REGISTRY.find((p) => p.slug === slug)
}

export function getParentalControlsByCategory(category: SourceCategory): ParentalControlEntry[] {
  return PARENTAL_CONTROLS_REGISTRY.filter((p) => p.sourceCategory === category)
}

export function getParentalControlsByPricing(tier: PricingTier): ParentalControlEntry[] {
  return PARENTAL_CONTROLS_REGISTRY.filter((p) => p.pricingTier === tier)
}

export function getParentalControlsByApi(api: ApiAvailability): ParentalControlEntry[] {
  return PARENTAL_CONTROLS_REGISTRY.filter((p) => p.apiAvailability === api)
}

export function getFeaturedParentalControls(): ParentalControlEntry[] {
  return PARENTAL_CONTROLS_REGISTRY.filter((p) => p.featured)
}

export function searchParentalControls(query: string): ParentalControlEntry[] {
  const q = query.toLowerCase()
  return PARENTAL_CONTROLS_REGISTRY.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)),
  )
}

export function getParentalControlsStats() {
  const total = PARENTAL_CONTROLS_REGISTRY.length
  const apps = PARENTAL_CONTROLS_REGISTRY.filter((p) => p.sourceCategory === "parental_apps").length
  const builtin = PARENTAL_CONTROLS_REGISTRY.filter((p) => p.sourceCategory === "builtin_controls").length
  const withApi = PARENTAL_CONTROLS_REGISTRY.filter(
    (p) => p.apiAvailability === "public_api" || p.apiAvailability === "partner_api"
  ).length
  const featured = PARENTAL_CONTROLS_REGISTRY.filter((p) => p.featured).length
  return { total, apps, builtin, withApi, featured }
}
