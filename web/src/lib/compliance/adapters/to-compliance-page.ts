/**
 * Adapter: Converts a LawEntry with detailedPage into the CompliancePageData shape
 * used by the compliance detail page components.
 */
import { LAW_REGISTRY, getLawById } from "../index"
import type { LawEntry } from "../types"

export interface CompliancePageData {
  hero: {
    lawName: string
    shortName: string
    jurisdiction: string
    stage: string
    stageColor: "enacted" | "passed" | "pending"
    description: string
  }
  provisions: { title: string; description: string }[]
  phosraFeatures: {
    regulation: string
    phosraFeature: string
    ruleCategory?: string
    description: string
  }[]
  checklist: { requirement: string; covered: boolean; feature: string }[]
  relatedLaws: { id: string; name: string; href: string }[]
}

function mapStageColor(
  status: LawEntry["status"]
): "enacted" | "passed" | "pending" {
  if (status === "enacted") return "enacted"
  if (status === "passed") return "passed"
  return "pending"
}

export function toCompliancePage(law: LawEntry): CompliancePageData | null {
  if (!law.detailedPage) return null

  return {
    hero: {
      lawName: law.fullName,
      shortName: law.shortName,
      jurisdiction: law.jurisdiction,
      stage: law.statusLabel,
      stageColor: mapStageColor(law.status),
      description: law.summary,
    },
    provisions: law.detailedPage.provisions,
    phosraFeatures: law.detailedPage.phosraFeatures,
    checklist: law.detailedPage.checklist,
    relatedLaws: law.relatedLawIds
      .map((id) => {
        const related = getLawById(id)
        if (!related) return null
        return { id: related.id, name: related.shortName, href: `/compliance/${related.id}` }
      })
      .filter((l): l is { id: string; name: string; href: string } => l != null),
  }
}

/** Get all laws that have detailed page data, keyed by ID */
export function getCompliancePages(): Record<string, CompliancePageData> {
  const pages: Record<string, CompliancePageData> = {}
  for (const law of LAW_REGISTRY) {
    const page = toCompliancePage(law)
    if (page) pages[law.id] = page
  }
  return pages
}
