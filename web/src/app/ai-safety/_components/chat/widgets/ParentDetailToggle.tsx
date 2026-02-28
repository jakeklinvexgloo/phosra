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
      {/* Segmented toggle */}
      <div className="relative flex items-center mb-3 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] w-fit overflow-hidden">
        {/* Sliding indicator */}
        <div
          className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md bg-brand-green/15 border border-brand-green/25 transition-transform duration-200 ease-out ${
            showFull ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
          }`}
        />
        <button
          onClick={() => setShowFull(false)}
          className={`relative z-10 px-3.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            !showFull
              ? "text-brand-green"
              : "text-white/35 hover:text-white/50"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setShowFull(true)}
          className={`relative z-10 px-3.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            showFull
              ? "text-brand-green"
              : "text-white/35 hover:text-white/50"
          }`}
        >
          Full Details
        </button>
      </div>
      {children(showFull ? markdown : summary)}
    </div>
  )
}
