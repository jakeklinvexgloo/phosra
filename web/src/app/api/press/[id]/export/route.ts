import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { queryOne } from "@/lib/press/db"
import type { PressRelease, PressReleaseQuote } from "@/lib/press/types"

export const runtime = "nodejs"

// GET /api/press/[id]/export — plain text export
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const release = await queryOne<PressRelease>(
    `SELECT * FROM press_releases WHERE id = $1`, [params.id]
  )
  if (!release) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // If body already contains a full formatted release, return it directly
  if (release.body) {
    return new NextResponse(release.body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${release.slug || "press-release"}.txt"`,
      },
    })
  }

  // Otherwise build from structured fields
  const quotes: PressReleaseQuote[] = typeof release.quotes === "string" ? JSON.parse(release.quotes) : (release.quotes || [])

  const parts: string[] = []

  // Release designation
  if (release.embargo_date) {
    const embargo = new Date(release.embargo_date)
    parts.push(`EMBARGOED UNTIL: ${embargo.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`)
  } else {
    parts.push("FOR IMMEDIATE RELEASE")
  }
  parts.push("")

  // Headline
  if (release.headline) parts.push(release.headline.toUpperCase())
  else if (release.title) parts.push(release.title.toUpperCase())
  parts.push("")

  // Subtitle
  if (release.subtitle) {
    parts.push(release.subtitle)
    parts.push("")
  }

  // Dateline + body placeholder
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  const city = release.dateline_city || "AUSTIN"
  const state = release.dateline_state || "TX"
  parts.push(`${city}, ${state}, ${dateStr} --`)
  parts.push("")

  // Quotes
  for (const q of quotes) {
    parts.push(`"${q.text}" said ${q.attribution}.`)
    parts.push("")
  }

  // Boilerplate
  if (release.boilerplate) {
    parts.push("About Phosra")
    parts.push(release.boilerplate)
    parts.push("")
  }

  // Contact
  if (release.contact_name || release.contact_email) {
    parts.push("Media Contact:")
    if (release.contact_name) parts.push(release.contact_name)
    if (release.contact_email) parts.push(release.contact_email)
    if (release.contact_phone) parts.push(release.contact_phone)
    parts.push("")
  }

  parts.push("###")

  const text = parts.join("\n")

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${release.slug || "press-release"}.txt"`,
    },
  })
}
