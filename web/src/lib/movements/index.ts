/*
 * Community Movements — Barrel exports & query helpers
 */

export * from "./types"
export { MOVEMENTS_REGISTRY } from "./registry"

import { MOVEMENTS_REGISTRY } from "./registry"
import type { MovementEntry, MovementStatus } from "./types"

/* ── Query helpers ──────────────────────────────────────────────── */

export function getMovementById(id: string): MovementEntry | undefined {
  return MOVEMENTS_REGISTRY.find((s) => s.id === id)
}

export function getMovementBySlug(slug: string): MovementEntry | undefined {
  return MOVEMENTS_REGISTRY.find((s) => s.slug === slug)
}

export function getMovementsByTag(tag: string): MovementEntry[] {
  return MOVEMENTS_REGISTRY.filter((s) => s.tags.includes(tag))
}

export function getMovementsByStatus(status: MovementStatus): MovementEntry[] {
  return MOVEMENTS_REGISTRY.filter((s) => s.status === status)
}

export function getActiveMovements(): MovementEntry[] {
  return MOVEMENTS_REGISTRY.filter((s) => s.status === "active")
}

export function searchMovements(query: string): MovementEntry[] {
  const q = query.toLowerCase()
  return MOVEMENTS_REGISTRY.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.organization.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.includes(q)),
  )
}

export function getMovementsStats() {
  const total = MOVEMENTS_REGISTRY.length
  const active = MOVEMENTS_REGISTRY.filter((s) => s.status === "active").length
  const totalAdoptions = MOVEMENTS_REGISTRY.reduce((sum, s) => sum + s.adoptionCount, 0)
  const totalSchools = MOVEMENTS_REGISTRY.reduce((sum, s) => sum + s.schoolCount, 0)
  return { total, active, totalAdoptions, totalSchools }
}
