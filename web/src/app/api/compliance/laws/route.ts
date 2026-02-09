import { NextResponse } from "next/server"
import { LAW_REGISTRY } from "@/lib/compliance"

export const runtime = "nodejs"

/** GET /api/compliance/laws — Full law registry as JSON */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const jurisdiction = searchParams.get("jurisdiction")
  const status = searchParams.get("status")
  const q = searchParams.get("q")

  let laws = LAW_REGISTRY

  if (jurisdiction) {
    laws = laws.filter((l) => l.jurisdictionGroup === jurisdiction)
  }
  if (status) {
    laws = laws.filter((l) => l.status === status)
  }
  if (q) {
    const query = q.toLowerCase()
    laws = laws.filter((l) => {
      const searchable = [
        l.shortName,
        l.fullName,
        l.summary,
        l.jurisdiction,
        ...l.keyProvisions,
        ...l.tags,
      ]
        .join(" ")
        .toLowerCase()
      return searchable.includes(query)
    })
  }

  return NextResponse.json({
    total: laws.length,
    laws: laws.map((l) => ({
      id: l.id,
      shortName: l.shortName,
      fullName: l.fullName,
      jurisdiction: l.jurisdiction,
      jurisdictionGroup: l.jurisdictionGroup,
      country: l.country,
      status: l.status,
      statusLabel: l.statusLabel,
      summary: l.summary,
      ruleCategories: l.ruleCategories,
      ageThreshold: l.ageThreshold,
      penaltyRange: l.penaltyRange,
      hasDetailedPage: l.detailedPage != null,
    })),
  })
}
