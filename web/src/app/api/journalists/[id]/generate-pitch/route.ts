import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/stytch-auth"
import { queryOne } from "@/lib/journalists/db"
import type { Journalist } from "@/lib/journalists/types"
import Anthropic from "@anthropic-ai/sdk"

export const runtime = "nodejs"

interface RouteContext { params: { id: string } }

type Exclusivity = "none" | "exclusive" | "embargoed"
type AskType = "interview" | "briefing" | "embargo" | "contributed_article" | "expert_source"

interface GeneratePitchBody {
  angle: string
  exclusivity: Exclusivity
  ask_type: AskType
  additional_context?: string
}

function parseJsonb<T>(val: T | string): T {
  return typeof val === "string" ? JSON.parse(val) : val
}

const SYSTEM_PROMPT = `You are an expert PR strategist for Phosra, a child safety compliance infrastructure company. Phosra builds the "Plaid for child safety" — mapping 78+ child safety laws across federal and state jurisdictions to 45 compliance rule categories via the Phosra Child Safety Standard (PCSS).

Founded by Jake Klinvex, a serial entrepreneur with 3 exits (Fidelity, Mastercard, Gloo IPO 2025), parent of 5, based in Pittsburgh, PA.

Generate a personalized media pitch email for a journalist. The pitch should:
1. Reference the journalist's specific recent work to show genuine familiarity
2. Lead with a data point or news hook, not a product description
3. Be concise (under 200 words for the body)
4. Include a clear, specific ask
5. Sound like a founder writing personally, not a PR agency

Output format (use these exact headers):
SUBJECT: [subject line]
---
BODY:
[email body]
---
FOLLOW_UP_ANGLE: [suggested follow-up angle if no response after 3-5 days]`

function buildUserPrompt(journalist: Journalist, body: GeneratePitchBody): string {
  const parts: string[] = []

  parts.push(`JOURNALIST PROFILE:`)
  parts.push(`- Name: ${journalist.name}`)
  parts.push(`- Publication: ${journalist.publication}`)
  if (journalist.title) parts.push(`- Title: ${journalist.title}`)
  if (journalist.beat) parts.push(`- Beat: ${journalist.beat}`)
  if (journalist.sub_beats?.length) parts.push(`- Sub-beats: ${journalist.sub_beats.join(", ")}`)

  const articles = parseJsonb(journalist.recent_articles) || []
  if (articles.length > 0) {
    parts.push(`\nRECENT ARTICLES:`)
    for (const a of articles) {
      parts.push(`- "${a.title}"${a.url ? ` (${a.url})` : ""}${a.date ? ` — ${a.date}` : ""}${a.relevance_note ? ` — ${a.relevance_note}` : ""}`)
    }
  }

  const angles = parseJsonb(journalist.pitch_angles) || []
  if (angles.length > 0) {
    parts.push(`\nPITCH ANGLES ON FILE:`)
    for (const pa of angles) {
      parts.push(`- ${pa.angle}${pa.context ? `: ${pa.context}` : ""}`)
    }
  }

  parts.push(`\nSELECTED PITCH PARAMETERS:`)
  parts.push(`- Angle: ${body.angle}`)
  parts.push(`- Exclusivity: ${body.exclusivity}`)
  parts.push(`- Ask type: ${body.ask_type.replace(/_/g, " ")}`)

  if (body.additional_context) {
    parts.push(`\nADDITIONAL CONTEXT FROM USER:`)
    parts.push(body.additional_context)
  }

  return parts.join("\n")
}

function parseResponse(text: string): { subject_line: string; email_body: string; follow_up_angle: string } {
  const subjectMatch = text.match(/SUBJECT:\s*(.+?)(?:\n|---)/)
  const bodyMatch = text.match(/BODY:\s*\n([\s\S]+?)(?:\n---)/)
  const followUpMatch = text.match(/FOLLOW_UP_ANGLE:\s*([\s\S]+?)$/)

  return {
    subject_line: subjectMatch?.[1]?.trim() || "",
    email_body: bodyMatch?.[1]?.trim() || "",
    follow_up_angle: followUpMatch?.[1]?.trim() || "",
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: GeneratePitchBody = await req.json()

  if (!body.angle || !body.exclusivity || !body.ask_type) {
    return NextResponse.json({ error: "angle, exclusivity, and ask_type are required" }, { status: 400 })
  }

  const journalist = await queryOne<Journalist>(
    `SELECT * FROM admin_journalists WHERE id = $1`, [params.id]
  )
  if (!journalist) return NextResponse.json({ error: "Journalist not found" }, { status: 404 })

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildUserPrompt(journalist, body) },
    ],
  })

  const responseText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map(block => block.text)
    .join("\n")

  const parsed = parseResponse(responseText)

  return NextResponse.json(parsed)
}
