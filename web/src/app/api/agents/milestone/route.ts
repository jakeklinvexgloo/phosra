import { NextRequest, NextResponse } from "next/server"
import { streamText, type UIMessage, convertToModelMessages } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { requireAdmin } from "@/lib/stytch-auth"

export const runtime = "nodejs"
export const maxDuration = 120

async function checkAdmin(
  req: NextRequest,
): Promise<
  { authorized: true } | { authorized: false; response: NextResponse }
> {
  const sandbox = req.headers.get("x-sandbox-session")
  if (sandbox) return { authorized: true }

  const auth = await requireAdmin()
  if (auth.authorized) return { authorized: true }

  return {
    authorized: false,
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  }
}

type MilestoneContext = {
  id: string
  title: string
  description: string
  owner: string
  status: string
  dueDate: string
  agentId: string
}

type AgentContext = {
  id: string
  name: string
  role: string
  description: string
  tasks: string[]
  tools: string[]
  cadence: string
  color: string
  bgColor: string
}

type PhaseContext = {
  name: string
  dates: string
}

function buildSystemPrompt(
  milestone: MilestoneContext,
  agent: AgentContext,
  phase: PhaseContext,
): string {
  return `You are Phosra's ${agent.name} Agent — ${agent.role}.

## Agent Identity
- **Name:** ${agent.name}
- **Role:** ${agent.role}
- **Description:** ${agent.description}
- **Core Tasks:** ${agent.tasks.map((t) => `\n  - ${t}`).join("")}
- **Tools:** ${agent.tools.join(", ")}
- **Cadence:** ${agent.cadence}

## Current Milestone Assignment
- **Title:** ${milestone.title}
- **Description:** ${milestone.description}
- **Due Date:** ${milestone.dueDate}
- **Status:** ${milestone.status}
- **Owner Type:** ${milestone.owner}

## Phase Context
- **Phase:** ${phase.name}
- **Dates:** ${phase.dates}

## Phosra Company Context
- **Company:** Phosra (formerly GuardianGate) — "Plaid for child safety compliance"
- **Product:** Single API mapping 45 enforcement rule categories across 78+ child safety laws to 15+ provider adapters
- **Raise:** $950K pre-seed, post-money SAFE, $6M cap, May 31 2026 deadline
- **Regulatory tailwind:** COPPA 2.0 enforcement April 22, 2026
- **Key metrics:** 78 laws tracked, 45 rule categories, 220+ platforms, 31 standards
- **Founder:** Serial entrepreneur with 3 exits, Mastercard infrastructure background, 5 kids dog-fooding

## Behavioral Instructions
1. **Assess first:** Start by assessing the current state of this milestone — what's already been done and what remains.
2. **Ask if needed:** If critical information is missing, ask 1-2 clarifying questions before proceeding.
3. **Produce deliverables:** Generate concrete, actionable output — drafts, analyses, plans, or recommendations.
4. **Clear next steps:** End every response with specific, prioritized next steps the founder can act on.

Always be specific, data-driven, and actionable. Format responses with clear headings and bullet points.`
}

export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth.authorized) return auth.response

  const apiKey =
    process.env.PLAYGROUND_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    )
  }

  const body = await req.json()
  const uiMessages: UIMessage[] = body.messages ?? []
  const milestone: MilestoneContext | undefined = body.milestone
  const agent: AgentContext | undefined = body.agent
  const phase: PhaseContext | undefined = body.phase

  if (!milestone || !agent || !phase) {
    return NextResponse.json(
      { error: "Missing milestone, agent, or phase context" },
      { status: 400 },
    )
  }

  const anthropic = createAnthropic({ apiKey })
  const modelMessages = await convertToModelMessages(uiMessages)

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250514"),
    system: buildSystemPrompt(milestone, agent, phase),
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
