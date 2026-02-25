/*
 * Computed platform statistics — replaces all hardcoded "188+" values.
 * Import PLATFORM_STATS wherever you need a platform count.
 */

import { CATEGORY_META, PLATFORM_REGISTRY } from "./registry"

const sources = PLATFORM_REGISTRY.filter((p) => p.side === "source")
const targets = PLATFORM_REGISTRY.filter((p) => p.side === "target")
const live = PLATFORM_REGISTRY.filter((p) => p.tier === "live")
const partial = PLATFORM_REGISTRY.filter((p) => p.tier === "partial")
const stub = PLATFORM_REGISTRY.filter((p) => p.tier === "stub")
const planned = PLATFORM_REGISTRY.filter((p) => p.tier === "planned")
const total = PLATFORM_REGISTRY.length

export const PLATFORM_STATS = {
  total,
  sourceCount: sources.length,
  targetCount: targets.length,
  categoryCount: CATEGORY_META.length,
  liveCount: live.length,
  partialCount: partial.length,
  stubCount: stub.length,
  plannedCount: planned.length,
  integratedCount: live.length + partial.length + stub.length,
  /** Marketing-friendly rounded total, e.g. "320+" — describes platforms in the kids' ecosystem, not integrations */
  marketingTotal: `${Math.floor(total / 10) * 10}+`,
  /** Count of platforms with live or partial integrations */
  liveTotal: `${live.length + partial.length}`,
} as const
