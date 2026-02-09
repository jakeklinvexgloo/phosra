export { LAW_REGISTRY } from "./law-registry"
export type {
  LawEntry,
  Jurisdiction,
  LawStatus,
  DetailedPageData,
} from "./types"
export {
  JURISDICTION_META,
  STATUS_META,
} from "./types"
export { generateMcpSnippet } from "./snippet-generator"

import { LAW_REGISTRY } from "./law-registry"
import type { LawEntry, Jurisdiction, LawStatus } from "./types"

/** Get a single law by its slug ID */
export function getLawById(id: string): LawEntry | undefined {
  return LAW_REGISTRY.find((l) => l.id === id)
}

/** Get all laws in a jurisdiction group */
export function getLawsByJurisdiction(group: Jurisdiction): LawEntry[] {
  return LAW_REGISTRY.filter((l) => l.jurisdictionGroup === group)
}

/** Get all laws that map to a specific rule category */
export function getLawsByCategory(categoryId: string): LawEntry[] {
  return LAW_REGISTRY.filter((l) => l.ruleCategories.includes(categoryId))
}

/** Get all laws by country code */
export function getLawsByCountry(countryCode: string): LawEntry[] {
  return LAW_REGISTRY.filter((l) => l.country === countryCode)
}

/** Get all laws with a specific status */
export function getLawsByStatus(status: LawStatus): LawEntry[] {
  return LAW_REGISTRY.filter((l) => l.status === status)
}

/** Get all enacted laws */
export function getEnactedLaws(): LawEntry[] {
  return LAW_REGISTRY.filter((l) => l.status === "enacted")
}

/** Get laws that have full detailed page data */
export function getLawsWithDetailedPages(): LawEntry[] {
  return LAW_REGISTRY.filter((l) => l.detailedPage != null)
}

/** Get related laws for a given law ID */
export function getRelatedLaws(lawId: string): LawEntry[] {
  const law = getLawById(lawId)
  if (!law) return []
  return law.relatedLawIds
    .map((id) => getLawById(id))
    .filter((l): l is LawEntry => l != null)
}

/** Full-text search across law names, summaries, provisions, and tags */
export function searchLaws(query: string): LawEntry[] {
  const q = query.toLowerCase().trim()
  if (!q) return LAW_REGISTRY
  return LAW_REGISTRY.filter((law) => {
    const searchable = [
      law.shortName,
      law.fullName,
      law.summary,
      law.jurisdiction,
      ...law.keyProvisions,
      ...law.tags,
      ...law.ruleCategories,
    ]
      .join(" ")
      .toLowerCase()
    return searchable.includes(q)
  })
}

/** Get unique jurisdiction groups that have at least one law */
export function getActiveJurisdictions(): Jurisdiction[] {
  const groups = new Set(LAW_REGISTRY.map((l) => l.jurisdictionGroup))
  return Array.from(groups) as Jurisdiction[]
}

/** Get sorted unique US state names from state-level laws */
export function getUSStates(): string[] {
  const states = new Set(
    LAW_REGISTRY
      .filter((l) => l.jurisdictionGroup === "us-state" && l.stateOrRegion)
      .map((l) => l.stateOrRegion!)
  )
  return Array.from(states).sort()
}

/** Get total counts for the hub stats */
export function getRegistryStats() {
  const jurisdictions = new Set(LAW_REGISTRY.map((l) => l.jurisdiction))
  const countries = new Set(LAW_REGISTRY.map((l) => l.country))
  const categories = new Set(LAW_REGISTRY.flatMap((l) => l.ruleCategories))
  return {
    totalLaws: LAW_REGISTRY.length,
    totalJurisdictions: jurisdictions.size,
    totalCountries: countries.size,
    totalCategories: categories.size,
    enacted: LAW_REGISTRY.filter((l) => l.status === "enacted").length,
    passed: LAW_REGISTRY.filter((l) => l.status === "passed").length,
    pending: LAW_REGISTRY.filter(
      (l) => l.status === "pending" || l.status === "proposed"
    ).length,
  }
}
