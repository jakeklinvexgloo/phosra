"use client"

import Link from "next/link"
import { SafetyGradeBadge } from "./SafetyGradeBadge"

interface RankedPlatform {
  name: string
  grade: string
  score?: number
}

interface PlatformRankingListProps {
  platforms: RankedPlatform[]
}

const PLATFORM_URLS: Record<string, string> = {
  "chatgpt": "/research/ai-chatbots/chatgpt",
  "claude": "/research/ai-chatbots/claude",
  "gemini": "/research/ai-chatbots/gemini",
  "grok": "/research/ai-chatbots/grok",
  "character.ai": "/research/ai-chatbots/character_ai",
  "characterai": "/research/ai-chatbots/character_ai",
  "copilot": "/research/ai-chatbots/copilot",
  "perplexity": "/research/ai-chatbots/perplexity",
  "replika": "/research/ai-chatbots/replika",
}

function getPlatformUrl(name: string): string | null {
  return PLATFORM_URLS[name.toLowerCase()] ?? null
}

export function PlatformRankingList({ platforms }: PlatformRankingListProps) {
  return (
    <div className="my-2 space-y-1">
      {platforms.map((p, i) => {
        const url = getPlatformUrl(p.name)
        const nameEl = url ? (
          <Link href={url} className="text-brand-green hover:underline text-sm font-medium">
            {p.name}
          </Link>
        ) : (
          <span className="text-sm font-medium text-white/80">{p.name}</span>
        )

        return (
          <div
            key={p.name}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
          >
            <span className="text-xs font-mono text-white/40 w-5 text-right">
              {i + 1}.
            </span>
            <div className="flex-1">{nameEl}</div>
            <SafetyGradeBadge grade={p.grade} />
            {p.score !== undefined && (
              <span className="text-xs font-mono text-white/50">{p.score}/100</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Parse ranking text lines like "Claude: A+ (97/100)" */
export function parseRankingList(text: string): RankedPlatform[] {
  const platforms: RankedPlatform[] = []
  const lines = text.trim().split("\n")

  for (const line of lines) {
    const trimmed = line.replace(/^\d+\.\s*/, "").trim()
    if (!trimmed) continue

    // Match "PlatformName: Grade (Score/100)" or "PlatformName — Grade (Score/100)" or just "PlatformName: Grade"
    const match = trimmed.match(/^(.+?)(?::|—|–|-)\s*([A-F][+-]?)\s*(?:\((\d+)\/100\))?$/i)
    if (match) {
      platforms.push({
        name: match[1].trim(),
        grade: match[2].toUpperCase(),
        score: match[3] ? parseInt(match[3]) : undefined,
      })
    }
  }

  return platforms
}
