"use client"

import type { Components } from "react-markdown"
import Link from "next/link"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { SafetyGradeBadge, isGradeValue } from "./widgets/SafetyGradeBadge"
import { ScoreDistributionBar, parseScoreDistribution } from "./widgets/ScoreDistributionBar"
import { PlatformRankingList, parseRankingList } from "./widgets/PlatformRankingList"
import { StatCallout, parseStat } from "./widgets/StatCallout"
import { isCriticalContent } from "./widgets/CriticalFailureAlert"

// ── Helpers ──────────────────────────────────────────────────────────

function isCheckMark(text: string): boolean {
  return /^[✓✔]$/.test(text.trim())
}

function isCrossMark(text: string): boolean {
  return /^[✗✘✕]$/.test(text.trim())
}

function isScoreValue(text: string): boolean {
  return /^\d{1,3}\/100$/.test(text.trim())
}

// ── Chat Markdown Components ─────────────────────────────────────────

export const chatMdComponents: Components = {
  // Links: internal → Next.js Link, external → new tab
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("/ai-safety")) {
      return (
        <Link href={href} className="text-brand-green hover:underline">
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  },

  // Tables: glass-styled with horizontal scroll
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-white/[0.08]">
      <table className="w-full text-sm bg-white/[0.03]">{children}</table>
    </div>
  ),

  // Table headers: dark gradient, uppercase
  thead: ({ children }) => (
    <thead className="bg-white/[0.08]">{children}</thead>
  ),

  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/70 border-b border-white/[0.06]">
      {children}
    </th>
  ),

  // Table cells: auto-detect grades, checks, scores
  td: ({ children }) => {
    const text = typeof children === "string" ? children : ""
    const childArray = Array.isArray(children) ? children : [children]

    // Extract text from children recursively
    const extractText = (node: React.ReactNode): string => {
      if (typeof node === "string") return node
      if (typeof node === "number") return String(node)
      if (Array.isArray(node)) return node.map(extractText).join("")
      if (node && typeof node === "object" && "props" in node) {
        return extractText((node as React.ReactElement).props.children)
      }
      return ""
    }

    const cellText = text || extractText(childArray)
    const trimmed = cellText.trim()

    // Check/cross icons
    if (isCheckMark(trimmed)) {
      return (
        <td className="px-3 py-2 border-b border-white/[0.04]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </td>
      )
    }
    if (isCrossMark(trimmed)) {
      return (
        <td className="px-3 py-2 border-b border-white/[0.04]">
          <XCircle className="w-4 h-4 text-red-400" />
        </td>
      )
    }

    // Grade badge
    if (isGradeValue(trimmed)) {
      return (
        <td className="px-3 py-2 border-b border-white/[0.04]">
          <SafetyGradeBadge grade={trimmed} />
        </td>
      )
    }

    // Score value
    if (isScoreValue(trimmed)) {
      return (
        <td className="px-3 py-2 border-b border-white/[0.04]">
          <span className="font-mono text-brand-green font-semibold">{trimmed}</span>
        </td>
      )
    }

    return (
      <td className="px-3 py-2 border-b border-white/[0.04] text-white/70">
        {children}
      </td>
    )
  },

  tr: ({ children }) => (
    <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>
  ),

  // Bold: detect "Platform: Grade (Score/100)" pattern
  strong: ({ children }) => {
    const text = typeof children === "string" ? children : ""

    // Match "PlatformName: Grade (Score/100)"
    const gradeMatch = text.match(/^(.+?):\s*([A-F][+-]?)\s*(?:\((\d+)\/100\))?\s*$/)
    if (gradeMatch) {
      const [, platform, grade, score] = gradeMatch
      return (
        <span className="inline-flex items-center gap-1.5 font-semibold text-white/90">
          {platform}:
          <SafetyGradeBadge
            grade={grade}
            score={score ? parseInt(score) : undefined}
          />
        </span>
      )
    }

    return <strong className="text-white/90 font-semibold">{children}</strong>
  },

  // H2: green left accent bar
  h2: ({ children }) => (
    <h2 className="relative text-sm font-semibold text-white/90 uppercase tracking-wider mt-4 mb-2 pl-2.5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-brand-green before:rounded-full">
      {children}
    </h2>
  ),

  // H3: slightly smaller, no accent
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-white/85 mt-3 mb-1.5">
      {children}
    </h3>
  ),

  // Horizontal rule: gradient divider
  hr: () => (
    <hr className="my-3 border-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  ),

  // Blockquote: amber by default, red for critical content
  blockquote: ({ children }) => {
    const extractText = (node: React.ReactNode): string => {
      if (typeof node === "string") return node
      if (typeof node === "number") return String(node)
      if (Array.isArray(node)) return node.map(extractText).join("")
      if (node && typeof node === "object" && "props" in node) {
        return extractText((node as React.ReactElement).props.children)
      }
      return ""
    }

    const text = extractText(children)
    const critical = isCriticalContent(text)

    if (critical) {
      return (
        <blockquote className="my-2 rounded-lg border-l-2 border-red-500 bg-red-500/5 px-3 py-2 flex gap-2 [&_p]:my-0.5">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-white/80">{children}</div>
        </blockquote>
      )
    }

    return (
      <blockquote className="my-2 rounded-lg border-l-2 border-amber-500 bg-amber-500/5 px-3 py-2 [&_p]:my-0.5 text-white/80">
        {children}
      </blockquote>
    )
  },

  // Code blocks: detect special languages for widgets
  pre: ({ children }) => {
    return (
      <div className="my-2">
        {children}
      </div>
    )
  },

  code: ({ className, children, ...props }) => {
    const language = className?.replace("language-", "")
    const text = typeof children === "string" ? children : String(children ?? "")

    // Score distribution widget
    if (language === "score-dist") {
      const data = parseScoreDistribution(text)
      if (data) return <ScoreDistributionBar {...data} />
    }

    // Platform ranking widget
    if (language === "platform-ranking") {
      const platforms = parseRankingList(text)
      if (platforms.length > 0) return <PlatformRankingList platforms={platforms} />
    }

    // Stat callout widget
    if (language === "stat") {
      const stat = parseStat(text)
      if (stat) return <StatCallout {...stat} />
    }

    // Regular code block (has language class = block)
    if (className) {
      return (
        <code
          className="block text-xs font-mono bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 overflow-x-auto text-white/70"
          {...props}
        >
          {children}
        </code>
      )
    }

    // Inline code
    return (
      <code
        className="text-brand-green/80 bg-white/[0.06] px-1 rounded text-xs"
        {...props}
      >
        {children}
      </code>
    )
  },

  // Lists
  ul: ({ children }) => (
    <ul className="my-1.5 ml-4 space-y-0.5 list-disc marker:text-white/20">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="my-1.5 ml-4 space-y-0.5 list-decimal marker:text-white/40">
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="text-white/70 pl-0.5">{children}</li>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="my-1.5 text-white/80 leading-relaxed">{children}</p>
  ),
}
