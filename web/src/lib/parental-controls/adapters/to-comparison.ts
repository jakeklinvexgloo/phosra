/*
 * Adapter: Registry → Side-by-Side Comparison Data
 *
 * Generates comparison data for comparing parental control apps.
 */

import { PARENTAL_CONTROLS_REGISTRY } from "../registry"
import type { ParentalControlEntry, SupportLevel } from "../types"

export interface ComparisonRow {
  category: string
  label: string
  values: Record<string, SupportLevel>
}

export interface ComparisonData {
  entries: Pick<ParentalControlEntry, "id" | "name" | "iconEmoji" | "iconUrl" | "accentColor" | "pricingTier" | "apiAvailability">[]
  rows: ComparisonRow[]
  deviceRows: { device: string; label: string; values: Record<string, boolean> }[]
}

const DEVICE_KEYS: { key: keyof ParentalControlEntry["devices"]; label: string }[] = [
  { key: "iOS", label: "iOS" },
  { key: "android", label: "Android" },
  { key: "windows", label: "Windows" },
  { key: "macOS", label: "macOS" },
  { key: "chromeos", label: "ChromeOS" },
  { key: "fireos", label: "Fire OS" },
  { key: "router", label: "Router" },
  { key: "browser_extension", label: "Browser Extension" },
]

export function buildComparison(ids: string[]): ComparisonData {
  const entries = ids
    .map((id) => PARENTAL_CONTROLS_REGISTRY.find((p) => p.id === id))
    .filter((p): p is ParentalControlEntry => !!p)

  // Collect all capability categories across selected entries
  const allCategories = new Map<string, string>()
  for (const entry of entries) {
    for (const cap of entry.capabilities) {
      if (!allCategories.has(cap.category)) {
        allCategories.set(cap.category, cap.label)
      }
    }
  }

  // Build capability rows
  const rows: ComparisonRow[] = Array.from(allCategories.entries()).map(([category, label]) => {
    const values: Record<string, SupportLevel> = {}
    for (const entry of entries) {
      const cap = entry.capabilities.find((c) => c.category === category)
      values[entry.id] = cap?.support ?? "none"
    }
    return { category, label, values }
  })

  // Build device rows
  const deviceRows = DEVICE_KEYS.map(({ key, label }) => {
    const values: Record<string, boolean> = {}
    for (const entry of entries) {
      values[entry.id] = entry.devices[key]
    }
    return { device: key, label, values }
  })

  return {
    entries: entries.map((e) => ({
      id: e.id,
      name: e.name,
      iconEmoji: e.iconEmoji,
      iconUrl: e.iconUrl,
      accentColor: e.accentColor,
      pricingTier: e.pricingTier,
      apiAvailability: e.apiAvailability,
    })),
    rows,
    deviceRows,
  }
}
