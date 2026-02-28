import { Suspense } from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { PromptDetailClient } from "../../_components/PromptDetailClient"

// Build all prompt IDs at build time
export async function generateStaticParams() {
  const platforms = await loadAllChatbotResearch()
  const ids = new Set<string>()
  for (const p of platforms) {
    for (const r of p.chatbotData?.safetyTesting?.results ?? []) {
      ids.add(r.id)
    }
  }
  return Array.from(ids).map((id) => ({ promptId: id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ promptId: string }>
}): Promise<Metadata> {
  const { promptId } = await params
  const platforms = await loadAllChatbotResearch()

  // Find prompt text from any platform
  for (const p of platforms) {
    const r = (p.chatbotData?.safetyTesting?.results ?? []).find((r) => r.id === promptId)
    if (r) {
      const truncated = r.prompt.length > 60 ? r.prompt.substring(0, 60) + "..." : r.prompt
      return {
        title: `"${truncated}" — Prompt Analysis — Phosra AI Safety`,
        description: `Cross-platform safety analysis of the prompt: ${r.prompt}`,
      }
    }
  }

  return {
    title: "Prompt Analysis — Phosra AI Safety",
  }
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ promptId: string }>
}) {
  const { promptId } = await params
  const platforms = await loadAllChatbotResearch()

  // Collect full result data for this prompt across all platforms
  interface PlatformResult {
    platformId: string
    platformName: string
    score: number | null
    notes: string
    response: string
    redFlags: string[]
    expected: string
    severity: string
    isMultiTurn: boolean
    escalationTurn?: number
    conversationTurns?: { role: "user" | "assistant"; content: string }[]
  }

  let promptText = ""
  let category = ""
  let categoryLabel = ""
  let severity = ""
  let expected = ""
  const platformResults: PlatformResult[] = []

  for (const p of platforms) {
    const r = (p.chatbotData?.safetyTesting?.results ?? []).find((r) => r.id === promptId)
    if (r) {
      if (!promptText) {
        promptText = r.prompt
        category = r.category
        categoryLabel = r.categoryLabel
        severity = r.severity
        expected = r.expected
      }
      platformResults.push({
        platformId: p.platformId,
        platformName: p.platformName,
        score: r.score,
        notes: r.notes,
        response: r.response ?? "",
        redFlags: r.redFlags ?? [],
        expected: r.expected,
        severity: r.severity,
        isMultiTurn: r.isMultiTurn ?? false,
        escalationTurn: r.escalationTurn,
        conversationTurns: r.conversationTurns,
      })
    }
  }

  if (platformResults.length === 0) notFound()

  // Compute prev/next prompt IDs (sorted by all prompt IDs)
  const allPromptIds: string[] = []
  const seenIds = new Set<string>()
  for (const p of platforms) {
    for (const r of p.chatbotData?.safetyTesting?.results ?? []) {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id)
        allPromptIds.push(r.id)
      }
    }
  }
  const currentIndex = allPromptIds.indexOf(promptId)
  const prevPromptId = currentIndex > 0 ? allPromptIds[currentIndex - 1] : null
  const nextPromptId = currentIndex < allPromptIds.length - 1 ? allPromptIds[currentIndex + 1] : null

  // Find related prompts (same category, excluding current)
  const relatedPrompts: { id: string; prompt: string; scores: { platformId: string; platformName: string; score: number | null }[] }[] = []
  const relatedIds = new Set<string>()
  for (const p of platforms) {
    for (const r of p.chatbotData?.safetyTesting?.results ?? []) {
      if (r.category === category && r.id !== promptId && !relatedIds.has(r.id)) {
        relatedIds.add(r.id)
        const scores: { platformId: string; platformName: string; score: number | null }[] = []
        for (const pp of platforms) {
          const match = (pp.chatbotData?.safetyTesting?.results ?? []).find((rr) => rr.id === r.id)
          if (match) {
            scores.push({ platformId: pp.platformId, platformName: pp.platformName, score: match.score })
          }
        }
        relatedPrompts.push({ id: r.id, prompt: r.prompt, scores })
      }
    }
  }

  return (
    <Suspense>
      <PromptDetailClient
        promptId={promptId}
        promptText={promptText}
        category={category}
        categoryLabel={categoryLabel}
        severity={severity}
        expected={expected}
        platformResults={platformResults}
        prevPromptId={prevPromptId}
        nextPromptId={nextPromptId}
        currentIndex={currentIndex}
        totalPrompts={allPromptIds.length}
        relatedPrompts={relatedPrompts}
      />
    </Suspense>
  )
}
