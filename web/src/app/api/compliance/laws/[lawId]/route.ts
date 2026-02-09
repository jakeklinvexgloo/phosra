import { NextResponse } from "next/server"
import { getLawById, getRelatedLaws } from "@/lib/compliance"

export const runtime = "nodejs"

/** GET /api/compliance/laws/:lawId — Single law detail */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lawId: string }> }
) {
  const { lawId } = await params
  const law = getLawById(lawId)

  if (!law) {
    return NextResponse.json(
      { error: `Law "${lawId}" not found` },
      { status: 404 }
    )
  }

  const relatedLaws = getRelatedLaws(lawId).map((l) => ({
    id: l.id,
    shortName: l.shortName,
    fullName: l.fullName,
    jurisdiction: l.jurisdiction,
    status: l.status,
  }))

  return NextResponse.json({
    ...law,
    relatedLaws,
  })
}
