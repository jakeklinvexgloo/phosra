import type { ResearchResult, RegistryDiff, DiscoveredCapability } from "../types"
import { PLATFORM_REGISTRY } from "../../platforms/registry"
import type { PlatformRegistryEntry } from "../../platforms/types"

// ── Diff Generation ─────────────────────────────────────────────

/**
 * Compare research findings against the current platform registry.
 * Returns a diff showing new, removed, and changed capabilities,
 * or null if the platform is not in the registry or the result has no notes.
 */
export function generateRegistryDiff(result: ResearchResult): RegistryDiff | null {
  if (result.status !== "completed" || !result.notes) {
    return null
  }

  // Look up the platform in the registry
  const registryEntry = PLATFORM_REGISTRY.find(
    (p: PlatformRegistryEntry) => p.id === result.platformId
  )
  if (!registryEntry) {
    return null
  }

  // Current capabilities from the registry (rule category strings)
  const currentCapabilities = new Set(registryEntry.capabilities ?? [])

  // Discovered capabilities from research
  const discoveredMap = new Map<string, DiscoveredCapability>()
  for (const cap of result.notes.capabilities) {
    discoveredMap.set(cap.ruleCategory, cap)
  }
  const discoveredCategoryList = Array.from(discoveredMap.keys())
  const discoveredCategories = new Set(discoveredCategoryList)
  const currentCapabilityList = Array.from(currentCapabilities)

  // New: in research but NOT in registry
  const newCapabilities: DiscoveredCapability[] = []
  for (const category of discoveredCategoryList) {
    if (!currentCapabilities.has(category)) {
      newCapabilities.push(discoveredMap.get(category)!)
    }
  }

  // Removed: in registry but NOT in research
  const removedCapabilities: string[] = []
  for (const category of currentCapabilityList) {
    if (!discoveredCategories.has(category)) {
      removedCapabilities.push(category)
    }
  }

  // Changed and Unchanged: in both — compare descriptions
  const changedCapabilities: RegistryDiff["changedCapabilities"] = []
  const unchanged: string[] = []

  for (const category of currentCapabilityList) {
    if (discoveredCategories.has(category)) {
      // We treat a capability as "changed" if the research found a meaningfully
      // different description. Since the registry only stores category strings
      // (no descriptions), any discovered description is supplementary info.
      // For now, all overlapping capabilities are considered unchanged unless
      // we later add descriptions to the registry.
      unchanged.push(category)
    }
  }

  return {
    platformId: result.platformId,
    platformName: result.platformName,
    newCapabilities,
    removedCapabilities,
    changedCapabilities,
    unchanged,
  }
}

/**
 * Generate diffs for multiple research results.
 * Filters to completed results with notes, then generates diffs.
 * Skips results that return null (no registry entry or no notes).
 */
export function generateBulkDiff(results: ResearchResult[]): RegistryDiff[] {
  return results
    .filter((r) => r.status === "completed" && r.notes !== null)
    .map((r) => generateRegistryDiff(r))
    .filter((diff): diff is RegistryDiff => diff !== null)
}

/**
 * Summarize a diff for display.
 * Returns a human-readable summary string like "+3 new, -1 removed, ~2 changed".
 * Returns "no changes" if the diff is empty.
 */
export function summarizeDiff(diff: RegistryDiff): string {
  const parts: string[] = []

  if (diff.newCapabilities.length > 0) {
    parts.push(`+${diff.newCapabilities.length} new`)
  }
  if (diff.removedCapabilities.length > 0) {
    parts.push(`-${diff.removedCapabilities.length} removed`)
  }
  if (diff.changedCapabilities.length > 0) {
    parts.push(`~${diff.changedCapabilities.length} changed`)
  }

  if (parts.length === 0) {
    const unchangedCount = diff.unchanged.length
    return unchangedCount > 0 ? `no changes (${unchangedCount} confirmed)` : "no changes"
  }

  const unchangedSuffix =
    diff.unchanged.length > 0 ? `, ${diff.unchanged.length} unchanged` : ""

  return parts.join(", ") + unchangedSuffix
}

/**
 * Check if a diff has any meaningful changes.
 */
export function hasDiffChanges(diff: RegistryDiff): boolean {
  return (
    diff.newCapabilities.length > 0 ||
    diff.removedCapabilities.length > 0 ||
    diff.changedCapabilities.length > 0
  )
}

/**
 * Get a detailed breakdown of a diff for logging or reports.
 */
export function formatDiffReport(diff: RegistryDiff): string {
  const lines: string[] = [
    `Platform: ${diff.platformName} (${diff.platformId})`,
    `Summary: ${summarizeDiff(diff)}`,
  ]

  if (diff.newCapabilities.length > 0) {
    lines.push("", "New capabilities found:")
    for (const cap of diff.newCapabilities) {
      const conf = Math.round(cap.confidence * 100)
      lines.push(`  + ${cap.ruleCategory} — ${cap.description} (${conf}% confidence)`)
    }
  }

  if (diff.removedCapabilities.length > 0) {
    lines.push("", "Capabilities no longer found:")
    for (const category of diff.removedCapabilities) {
      lines.push(`  - ${category}`)
    }
  }

  if (diff.changedCapabilities.length > 0) {
    lines.push("", "Changed capabilities:")
    for (const change of diff.changedCapabilities) {
      lines.push(`  ~ ${change.ruleCategory}`)
      lines.push(`    was: ${change.currentDescription}`)
      lines.push(`    now: ${change.researchDescription}`)
    }
  }

  if (diff.unchanged.length > 0) {
    lines.push("", `Unchanged: ${diff.unchanged.join(", ")}`)
  }

  return lines.join("\n")
}
