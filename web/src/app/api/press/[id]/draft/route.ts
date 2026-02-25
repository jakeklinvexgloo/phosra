import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { requireAdmin } from "@/lib/stytch-auth"
import { queryOne } from "@/lib/press/db"
import type { PressRelease, RevisionEntry } from "@/lib/press/types"

export const runtime = "nodejs"
export const maxDuration = 120

const SYSTEM_PROMPT = `You are Phosra's Press Release Writer — an expert at crafting wire-service-ready press releases for a B2B child safety compliance infrastructure company.

Company: Phosra — "Plaid for child safety compliance"
Product: Single API mapping 45 enforcement rule categories across 78+ child safety laws to 15+ provider adapters
Founder: Jake Klinvex, serial entrepreneur with 3 exits

Follow AP Stylebook and standard wire service format:
- FOR IMMEDIATE RELEASE (or EMBARGOED UNTIL [date])
- Headline: 65-100 characters, present tense, no period
- Subheadline: max 20 words, italicized context
- Dateline: CITY, STATE, Month Day, Year --
- Lead paragraph: 5 Ws in 1-2 sentences
- Body: 300-500 words total, inverted pyramid structure
- Include 1-2 direct quotes with attribution
- Boilerplate paragraph about Phosra (50-100 words)
- Contact information
- End with ###

Style Rules:
- Third person, factual tone
- No exclamation marks
- Numbers: spell out one through nine, use numerals for 10+
- Dates: Month Day, Year format
- Always include a quote from Jake Klinvex, Founder & CEO

Output the press release as plain text. Do NOT use markdown formatting.`

// POST /api/press/[id]/draft
// Body: { inputs?: Record<string, unknown>, feedback?: string }
// If feedback is present -> redraft; otherwise -> generate
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const apiKey = process.env.PLAYGROUND_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 })
    }

    // Get current release
    const release = await queryOne<PressRelease>(
      `SELECT * FROM press_releases WHERE id = $1`, [params.id]
    )
    if (!release) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await req.json()
    const { inputs, feedback } = body as { inputs?: Record<string, unknown>; feedback?: string }

    // Determine action from what's present in the body
    const action: "generate" | "redraft" = feedback ? "redraft" : "generate"

    // Parse JSONB fields
    const dbDraftInputs = typeof release.draft_inputs === "string" ? JSON.parse(release.draft_inputs) : (release.draft_inputs || {})
    // Use inputs from request body, falling back to DB draft_inputs for backwards compat
    const draftInputs = inputs || dbDraftInputs
    const revisionHistory: RevisionEntry[] = typeof release.revision_history === "string" ? JSON.parse(release.revision_history) : (release.revision_history || [])

    let userPrompt: string

    if (action === "generate") {
      userPrompt = `Write a press release with the following details:
- Title/Topic: ${release.title}
- Release Type: ${draftInputs.release_type || release.release_type || "product_launch"}
- Key Message: ${draftInputs.key_message || release.title}
- Product/Feature: ${draftInputs.product_name || "Phosra compliance API"}
- Target Audience: ${draftInputs.audience || "Technology and compliance media"}
- Quote Attribution: ${draftInputs.quote_attribution || "Jake Klinvex, Founder & CEO of Phosra"}
- Dateline: ${release.dateline_city || "PITTSBURGH"}, ${release.dateline_state || "PA"}
${draftInputs.additional_context ? `- Additional Context: ${draftInputs.additional_context}` : ""}`
    } else {
      userPrompt = `Here is the current press release draft:

---
${release.body}
---

Please redraft this press release with the following feedback:
${feedback || "Improve the overall quality and clarity."}`
    }

    const anthropic = createAnthropic({ apiKey })
    const result = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    })

    const generatedText = result.text

    // Extract headline (first non-empty line after FOR IMMEDIATE RELEASE)
    const lines = generatedText.split("\n").filter(l => l.trim())
    let headline = release.headline
    for (const line of lines) {
      if (line.trim() === "FOR IMMEDIATE RELEASE" || line.trim().startsWith("EMBARGOED")) continue
      if (line.trim().startsWith("###")) continue
      headline = line.trim()
      break
    }

    // Save snapshot to revision history
    const newVersion: RevisionEntry = {
      version: revisionHistory.length + 1,
      timestamp: new Date().toISOString(),
      action: action === "generate" ? "ai_draft" : "feedback_redraft",
      feedback: feedback || undefined,
      snapshot: {
        headline: release.headline || headline,
        body: release.body || "",
        quotes: typeof release.quotes === "string" ? JSON.parse(release.quotes) : (release.quotes || []),
      },
    }
    const updatedHistory = [...revisionHistory, newVersion]

    // Calculate word count
    const wordCount = generatedText.trim().split(/\s+/).filter(Boolean).length

    // Update DB (also persist draft_inputs so they're available for future redrafts)
    const updated = await queryOne<PressRelease>(
      `UPDATE press_releases
       SET body = $1, headline = $2, word_count = $3,
           revision_history = $4::jsonb,
           draft_inputs = $5::jsonb,
           status = CASE WHEN status = 'idea' THEN 'draft' ELSE status END,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [generatedText, headline, wordCount, JSON.stringify(updatedHistory), JSON.stringify(draftInputs), params.id]
    )

    return NextResponse.json({
      ...updated,
      quotes: typeof updated!.quotes === "string" ? JSON.parse(updated!.quotes as string) : updated!.quotes,
      draft_inputs: typeof updated!.draft_inputs === "string" ? JSON.parse(updated!.draft_inputs as string) : updated!.draft_inputs,
      revision_history: typeof updated!.revision_history === "string" ? JSON.parse(updated!.revision_history as string) : updated!.revision_history,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    const stack = err instanceof Error ? err.stack : undefined
    console.error("Draft generation error:", message, stack)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
