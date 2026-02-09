import { NextResponse } from "next/server"
import { LAW_REGISTRY } from "@/lib/compliance"

export const runtime = "nodejs"

/** GET /api/compliance/map — Rule category → law mapping */
export async function GET() {
  const categoryMap: Record<
    string,
    { lawId: string; shortName: string; jurisdiction: string; status: string }[]
  > = {}

  for (const law of LAW_REGISTRY) {
    for (const cat of law.ruleCategories) {
      if (!categoryMap[cat]) {
        categoryMap[cat] = []
      }
      categoryMap[cat].push({
        lawId: law.id,
        shortName: law.shortName,
        jurisdiction: law.jurisdiction,
        status: law.status,
      })
    }
  }

  // Sort categories alphabetically and count
  const sortedEntries = Object.entries(categoryMap).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  return NextResponse.json({
    totalCategories: sortedEntries.length,
    totalMappings: sortedEntries.reduce((sum, [, laws]) => sum + laws.length, 0),
    map: Object.fromEntries(sortedEntries),
  })
}
