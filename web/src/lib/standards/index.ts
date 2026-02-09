/*
 * Community Standards — Barrel exports & query helpers
 */

export * from "./types"
export { STANDARDS_REGISTRY } from "./registry"

import { STANDARDS_REGISTRY } from "./registry"
import type { StandardEntry, StandardStatus } from "./types"

/* ── Query helpers ──────────────────────────────────────────────── */

export function getStandardById(id: string): StandardEntry | undefined {
  return STANDARDS_REGISTRY.find((s) => s.id === id)
}

export function getStandardBySlug(slug: string): StandardEntry | undefined {
  return STANDARDS_REGISTRY.find((s) => s.slug === slug)
}

export function getStandardsByTag(tag: string): StandardEntry[] {
  return STANDARDS_REGISTRY.filter((s) => s.tags.includes(tag))
}

export function getStandardsByStatus(status: StandardStatus): StandardEntry[] {
  return STANDARDS_REGISTRY.filter((s) => s.status === status)
}

export function getActiveStandards(): StandardEntry[] {
  return STANDARDS_REGISTRY.filter((s) => s.status === "active")
}

export function searchStandards(query: string): StandardEntry[] {
  const q = query.toLowerCase()
  return STANDARDS_REGISTRY.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.organization.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.includes(q)),
  )
}

export function getStandardsStats() {
  const total = STANDARDS_REGISTRY.length
  const active = STANDARDS_REGISTRY.filter((s) => s.status === "active").length
  const totalAdoptions = STANDARDS_REGISTRY.reduce((sum, s) => sum + s.adoptionCount, 0)
  const totalSchools = STANDARDS_REGISTRY.reduce((sum, s) => sum + s.schoolCount, 0)
  return { total, active, totalAdoptions, totalSchools }
}
