/*
 * Adapter: Registry → Hub Page Data
 *
 * Transforms ParentalControlEntry[] for the /parental-controls hub page rendering.
 */

import { PARENTAL_CONTROLS_REGISTRY } from "../registry"
import type { ParentalControlEntry, SourceCategory, SupportLevel } from "../types"
import { SOURCE_CATEGORY_META } from "../types"

export interface HubCardData {
  id: string
  slug: string
  name: string
  description: string
  iconEmoji: string
  iconUrl?: string
  accentColor: string
  sourceCategory: SourceCategory
  sourceCategoryLabel: string
  pricingTier: string
  pricingDetails: string
  apiLabel: string
  apiColor: string
  deviceCount: number
  capabilityCount: number
  fullSupportCount: number
  featured: boolean
  tags: string[]
}

export interface CapabilityCoverageStats {
  category: string
  label: string
  fullCount: number
  partialCount: number
  totalApps: number
  coverage: number // percentage of apps with full or partial support
}

function countDevices(entry: ParentalControlEntry): number {
  const d = entry.devices
  return [d.iOS, d.android, d.windows, d.macOS, d.chromeos, d.fireos, d.router, d.browser_extension]
    .filter(Boolean).length
}

const API_DISPLAY: Record<string, { label: string; color: string }> = {
  public_api: { label: "Public API", color: "text-brand-green" },
  partner_api: { label: "Partner API", color: "text-sky-500" },
  no_api: { label: "No API", color: "text-muted-foreground" },
  undocumented: { label: "Undocumented", color: "text-amber-500" },
}

export const HUB_CARDS: HubCardData[] = PARENTAL_CONTROLS_REGISTRY.map((entry) => {
  const api = API_DISPLAY[entry.apiAvailability] ?? API_DISPLAY.no_api
  return {
    id: entry.id,
    slug: entry.slug,
    name: entry.name,
    description: entry.description,
    iconEmoji: entry.iconEmoji,
    iconUrl: entry.iconUrl,
    accentColor: entry.accentColor,
    sourceCategory: entry.sourceCategory,
    sourceCategoryLabel: SOURCE_CATEGORY_META[entry.sourceCategory].shortLabel,
    pricingTier: entry.pricingTier,
    pricingDetails: entry.pricingDetails,
    apiLabel: api.label,
    apiColor: api.color,
    deviceCount: countDevices(entry),
    capabilityCount: entry.capabilities.length,
    fullSupportCount: entry.capabilities.filter((c) => c.support === "full").length,
    featured: entry.featured,
    tags: entry.tags,
  }
})

/** Capability coverage: for each rule category, how many apps support it? */
export function getCapabilityCoverage(): CapabilityCoverageStats[] {
  const categoryMap = new Map<string, { label: string; full: number; partial: number }>()

  for (const entry of PARENTAL_CONTROLS_REGISTRY) {
    for (const cap of entry.capabilities) {
      if (!categoryMap.has(cap.category)) {
        categoryMap.set(cap.category, { label: cap.label, full: 0, partial: 0 })
      }
      const data = categoryMap.get(cap.category)!
      if (cap.support === "full") data.full++
      else if (cap.support === "partial") data.partial++
    }
  }

  const total = PARENTAL_CONTROLS_REGISTRY.length
  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      label: data.label,
      fullCount: data.full,
      partialCount: data.partial,
      totalApps: total,
      coverage: Math.round(((data.full + data.partial) / total) * 100),
    }))
    .sort((a, b) => b.coverage - a.coverage)
}

/** Group hub cards by source category */
export function getCardsByCategory(): Record<SourceCategory, HubCardData[]> {
  const result: Record<SourceCategory, HubCardData[]> = {
    parental_apps: [],
    builtin_controls: [],
    isp_carrier: [],
    school_institutional: [],
  }

  for (const card of HUB_CARDS) {
    result[card.sourceCategory].push(card)
  }

  return result
}
