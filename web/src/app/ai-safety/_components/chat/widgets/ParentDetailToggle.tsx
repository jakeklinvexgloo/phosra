"use client"

import { useState } from "react"

interface ParentDetailToggleProps {
  markdown: string
  threshold?: number
  children: (content: string) => React.ReactNode
}

/** Extract summary from long markdown: first paragraph + last ## section */
function extractSummary(markdown: string): string {
  const lines = markdown.split("\n")

  // Get first paragraph (non-empty lines before first blank line or header)
  const firstParagraphLines: string[] = []
  for (const line of lines) {
    if (line.trim() === "" && firstParagraphLines.length > 0) break
    if (line.startsWith("## ") && firstParagraphLines.length > 0) break
    if (line.trim()) firstParagraphLines.push(line)
  }

  // Find last ## section
  let lastSectionStart = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].match(/^## (?!#)/)) {
      lastSectionStart = i
      break
    }
  }

  const firstParagraph = firstParagraphLines.join("\n")

  if (lastSectionStart > 0) {
    const lastSection = lines.slice(lastSectionStart).join("\n")
    return firstParagraph + "\n\n---\n\n" + lastSection
  }

  return firstParagraph
}

export function ParentDetailToggle({ markdown, threshold = 3000, children }: ParentDetailToggleProps) {
  const [showFull, setShowFull] = useState(false)

  // Only show toggle for long content
  if (markdown.length <= threshold) {
    return <>{children(markdown)}</>
  }

  const summary = extractSummary(markdown)

  return (
    <div>
      {/* Toggle pills */}
      <div className="flex items-center gap-1 mb-3 p-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] w-fit">
        <button
          onClick={() => setShowFull(false)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            !showFull
              ? "bg-brand-green/20 text-brand-green"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setShowFull(true)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            showFull
              ? "bg-brand-green/20 text-brand-green"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Full Details
        </button>
      </div>
      {children(showFull ? markdown : summary)}
    </div>
  )
}
