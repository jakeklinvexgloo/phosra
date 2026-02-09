/**
 * Adapter: Converts LAW_REGISTRY entries to the LegislationEntry[] shape
 * used by the docs DocsContent.tsx legislation section.
 */
import { LAW_REGISTRY } from "../law-registry"
import type { LawEntry } from "../types"

export interface LegislationEntry {
  id: string
  law: string
  summary: string
  jurisdiction: string
  jurisdictionGroup: string
  introduced: string
  stage: string
  categories: string[]
  keyProvisions: string[]
  href: string
}

function toLegislation(entry: LawEntry): LegislationEntry {
  return {
    id: entry.id,
    law: `${entry.shortName} (${entry.fullName})`,
    summary: entry.summary,
    jurisdiction: entry.jurisdiction,
    jurisdictionGroup: entry.jurisdictionGroup,
    introduced: entry.introduced,
    stage: entry.statusLabel,
    categories: entry.ruleCategories,
    keyProvisions: entry.keyProvisions,
    href: `/compliance/${entry.id}`,
  }
}

export const LEGISLATION_REFERENCE: LegislationEntry[] = LAW_REGISTRY.map(toLegislation)
