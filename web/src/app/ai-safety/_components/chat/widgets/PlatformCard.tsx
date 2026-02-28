"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { gradeTextColor, gradeBgColor, gradeBorderColor } from "../grade-colors"

interface PlatformCardData {
  name: string
  grade: string
  score: number
  description: string
  slug: string
}

interface PlatformCardsProps {
  platforms: PlatformCardData[]
}

const PLATFORM_SLUGS: Record<string, string> = {
  "claude": "claude",
  "chatgpt": "chatgpt",
  "gemini": "gemini",
  "grok": "grok",
  "character.ai": "character_ai",
  "copilot": "copilot",
  "perplexity": "perplexity",
  "replika": "replika",
}

export function PlatformCards({ platforms }: PlatformCardsProps) {
  return (
    <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
      {platforms.map((p, i) => (
        <PlatformCardItem key={p.name} platform={p} index={i} />
      ))}
    </div>
  )
}

function PlatformCardItem({ platform, index }: { platform: PlatformCardData; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const { name, grade, score, description, slug } = platform

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={`rounded-lg border ${gradeBorderColor(grade)} ${gradeBgColor(grade)} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        {/* Grade circle */}
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold border ${gradeTextColor(grade)} ${gradeBgColor(grade)} ${gradeBorderColor(grade)}`}
        >
          {grade}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white/90 truncate">{name}</div>
          <div className="text-[10px] font-mono text-white/50">{score}/100</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/30 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0">
              <p className="text-xs text-white/60 leading-relaxed">{description}</p>
              <Link
                href={`/ai-safety/${slug}`}
                className="inline-flex items-center mt-2 text-xs text-brand-green hover:underline"
              >
                View full report →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/** Parse platform-cards code fence */
export function parsePlatformCards(text: string): PlatformCardData[] | null {
  const blocks = text.trim().split(/\n---\n/).map(b => b.trim()).filter(Boolean)
  if (blocks.length === 0) return null

  const cards: PlatformCardData[] = []
  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean)
    if (lines.length < 1) continue

    // First line: "PlatformName: Grade (Score/100)"
    const headerMatch = lines[0].match(/^(.+?):\s*([A-F][+-]?)\s*\((\d+)\/100\)/)
    if (!headerMatch) continue

    const [, name, grade, scoreStr] = headerMatch
    const score = parseInt(scoreStr)
    const description = lines.slice(1).join(" ")
    const slug = PLATFORM_SLUGS[name.toLowerCase()] ?? name.toLowerCase().replace(/[^a-z0-9]/g, "_")

    cards.push({ name, grade, score, description, slug })
  }

  return cards.length > 0 ? cards : null
}
