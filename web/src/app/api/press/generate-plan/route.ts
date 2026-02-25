import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { requireAdmin } from "@/lib/stytch-auth"
import { query, queryOne } from "@/lib/press/db"
import { PHASES, getPRMilestones } from "@/lib/fundraise/milestones"
import type { PressRelease } from "@/lib/press/types"

export const runtime = "nodejs"
export const maxDuration = 120

const PLAN_SYSTEM_PROMPT = `You are a startup PR strategist generating a press release plan for Phosra, a B2B child safety compliance infrastructure company raising a $950K pre-seed round.

Company context:
- Phosra = "Plaid for child safety compliance"
- Single API mapping 45 enforcement rule categories across 78+ child safety laws
- Founder: Jake Klinvex, serial entrepreneur with 3 exits
- COPPA 2.0 compliance deadline: April 22, 2026
- Raise target: $950K pre-seed, Feb-May 2026

Your job: Generate a press release plan that maps to fundraise milestones. Each entry should have a clear PR angle, suggested release type, and context for the AI drafter.

Output ONLY valid JSON — no markdown, no code fences, no commentary. The JSON should be an array of objects with these exact fields:
- "milestone_id": the milestone ID this maps to (e.g., "m27")
- "title": press release title (65-100 chars, present tense)
- "release_type": one of "product_launch" | "partnership" | "funding" | "regulatory" | "research" | "event" | "expansion" | "milestone" | "other"
- "publish_date": suggested date in YYYY-MM-DD format
- "key_message": 1-2 sentence key message for the AI drafter
- "audience": target audience
- "additional_context": extra context, data points, or angles for the AI drafter
- "notes": internal strategic notes (timing rationale, dependencies, etc.)

Generate 10-15 press releases that tell a coherent narrative arc across the fundraise timeline. Think about:
1. Pre-raise momentum builders (thought leadership, data reports)
2. Launch week items (main announcement + derivative content)
3. Mid-raise credibility builders (regulatory analysis, partnerships)
4. Close-phase items (case studies, raise announcement)

Each entry should have a distinct PR angle — avoid generic titles.`

export async function POST(req: NextRequest) {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" ? req.headers.get("x-sandbox-session") : null
  if (!sandbox) {
    const auth = await requireAdmin()
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.PLAYGROUND_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 })
  }

  // Check if plan already exists (don't regenerate if releases already have milestone_ids)
  const existing = await query<PressRelease>(
    `SELECT id FROM press_releases WHERE milestone_id IS NOT NULL AND status != 'archived' LIMIT 1`
  )
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "A press plan already exists. Archive existing milestone-linked releases first to regenerate." },
      { status: 409 }
    )
  }

  // Build milestone context for the AI
  const prMilestones = getPRMilestones()
  const milestoneContext = PHASES.map(p => ({
    phase: p.name,
    dates: p.dates,
    milestones: p.milestones
      .filter(m => prMilestones.some(pm => pm.id === m.id))
      .map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        dueDate: m.dueDate,
        owner: m.owner,
      })),
  })).filter(p => p.milestones.length > 0)

  const userPrompt = `Here are the PR-related fundraise milestones organized by phase:

${JSON.stringify(milestoneContext, null, 2)}

Generate a press release plan (10-15 entries) that maps to these milestones. Use 2026 dates. The fundraise runs Feb 21 - May 31, 2026.`

  let result
  try {
    const anthropic = createAnthropic({ apiKey })
    result = await generateText({
      model: anthropic("claude-sonnet-4-5-20250514"),
      system: PLAN_SYSTEM_PROMPT,
      prompt: userPrompt,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown AI error"
    return NextResponse.json({ error: `AI generation failed: ${message}` }, { status: 500 })
  }

  // Parse the AI response
  let planEntries: Array<{
    milestone_id: string
    title: string
    release_type: string
    publish_date: string
    key_message: string
    audience: string
    additional_context: string
    notes: string
  }>

  try {
    planEntries = JSON.parse(result.text)
    if (!Array.isArray(planEntries)) throw new Error("Not an array")
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: result.text },
      { status: 500 }
    )
  }

  // Bulk-create press releases from the plan
  const created: PressRelease[] = []
  for (const entry of planEntries) {
    const slug = entry.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const release = await queryOne<PressRelease>(
      `INSERT INTO press_releases (
        title, slug, release_type, milestone_id, publish_date,
        dateline_city, dateline_state, notes,
        draft_inputs, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, 'idea')
      RETURNING *`,
      [
        entry.title,
        slug,
        entry.release_type || "other",
        entry.milestone_id,
        entry.publish_date || null,
        "AUSTIN",
        "TX",
        entry.notes || "",
        JSON.stringify({
          key_message: entry.key_message,
          audience: entry.audience,
          additional_context: entry.additional_context,
          release_type: entry.release_type,
        }),
      ]
    )
    if (release) created.push(release)
  }

  return NextResponse.json({
    message: `Generated ${created.length} press releases from fundraise milestones`,
    count: created.length,
    releases: created,
  })
}
