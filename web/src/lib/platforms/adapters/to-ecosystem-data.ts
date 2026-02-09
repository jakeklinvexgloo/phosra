/*
 * Adapter: Registry → Ecosystem Marketing Data
 *
 * Generates the same types and exports that ecosystem-data.ts consumers expect:
 *   CONTROL_SOURCES, ENFORCEMENT_TARGETS, MARQUEE_SOURCES, MARQUEE_TARGETS,
 *   SOURCE_COUNT, TARGET_COUNT, TOTAL_COUNT, CATEGORY_COUNT
 */

import { CATEGORY_META, PLATFORM_REGISTRY } from "../registry"
import type { PlatformCategorySlug, PlatformSide } from "../types"

/* ── Types matching original ecosystem-data.ts ─────────────────── */

export interface PlatformEntry {
  name: string
  iconKey: string | null
  hex: string | null
}

export interface PlatformCategory {
  category: string
  shortLabel: string
  items: PlatformEntry[]
  accentClass: string
  accentHex: string
}

/* ── Build helpers ─────────────────────────────────────────────── */

function buildCategories(side: PlatformSide): PlatformCategory[] {
  const metas = CATEGORY_META.filter((c) => c.side === side)

  return metas
    .map((meta) => {
      const items = PLATFORM_REGISTRY
        .filter((p) => p.category === meta.slug)
        .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
        .map((p) => ({ name: p.name, iconKey: p.iconKey, hex: p.hex }))

      if (items.length === 0) return null

      return {
        category: meta.label,
        shortLabel: meta.shortLabel,
        items,
        accentClass: meta.accentClass,
        accentHex: meta.accentHex,
      }
    })
    .filter((c): c is PlatformCategory => c !== null)
}

/* ── Exported data (same shape as original ecosystem-data.ts) ── */

export const CONTROL_SOURCES: PlatformCategory[] = buildCategories("source")
export const ENFORCEMENT_TARGETS: PlatformCategory[] = buildCategories("target")

export const SOURCE_COUNT = CONTROL_SOURCES.reduce((sum, g) => sum + g.items.length, 0)
export const TARGET_COUNT = ENFORCEMENT_TARGETS.reduce((sum, g) => sum + g.items.length, 0)
export const TOTAL_COUNT = SOURCE_COUNT + TARGET_COUNT
export const CATEGORY_COUNT = CONTROL_SOURCES.length + ENFORCEMENT_TARGETS.length

/* ── Marquee subsets ───────────────────────────────────────────── */

function buildMarquee(side: PlatformSide): PlatformEntry[] {
  return PLATFORM_REGISTRY
    .filter((p) => p.side === side && p.marquee)
    .map((p) => ({ name: p.name, iconKey: p.iconKey, hex: p.hex }))
}

export const MARQUEE_SOURCES: PlatformEntry[] = buildMarquee("source")
export const MARQUEE_TARGETS: PlatformEntry[] = buildMarquee("target")
