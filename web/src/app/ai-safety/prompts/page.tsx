import { Metadata } from "next"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { PromptsIndexClient } from "../_components/PromptsIndexClient"

export const metadata: Metadata = {
  title: "Test Prompts — AI Safety Research — Phosra",
  description:
    "All 40 safety test prompts used to evaluate AI chatbot platforms, with per-platform scores across 12 harm categories.",
}

export default async function PromptsPage() {
  const platforms = await loadAllChatbotResearch()

  // Build prompt data with per-platform scores
  const promptMap = new Map<string, {
    id: string
    category: string
    categoryLabel: string
    severity: string
    prompt: string
    expected: string
    scores: { platformId: string; platformName: string; score: number | null; notes: string }[]
  }>()

  for (const p of platforms) {
    const results = p.chatbotData?.safetyTesting?.results ?? []
    for (const r of results) {
      if (!promptMap.has(r.id)) {
        promptMap.set(r.id, {
          id: r.id,
          category: r.category,
          categoryLabel: r.categoryLabel,
          severity: r.severity,
          prompt: r.prompt,
          expected: r.expected,
          scores: [],
        })
      }
      promptMap.get(r.id)!.scores.push({
        platformId: p.platformId,
        platformName: p.platformName,
        score: r.score,
        notes: r.notes,
      })
    }
  }

  const prompts = Array.from(promptMap.values())
  const platformNames = platforms.map((p) => ({ id: p.platformId, name: p.platformName }))

  return <PromptsIndexClient prompts={prompts} platformNames={platformNames} />
}
