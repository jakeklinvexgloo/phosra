"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CollapsibleSection } from "./widgets/CollapsibleSection"

interface CollapsibleMarkdownRendererProps {
  content: string
  components: object
}

interface MarkdownSection {
  title: string
  content: string
}

/** Strip markdown link syntax from section titles: [text](url) → text */
function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
}

/** Split markdown text at ## boundaries */
function splitAtH2(markdown: string): MarkdownSection[] {
  const sections: MarkdownSection[] = []
  // Split on lines starting with ##  (but not ### )
  const parts = markdown.split(/^(?=## (?!#))/m)

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    // Check if this part starts with ## header
    const headerMatch = trimmed.match(/^## (.+)/)
    if (headerMatch) {
      const title = stripMarkdownLinks(headerMatch[1].trim())
      // Content is everything after the first line
      const content = trimmed.replace(/^## .+\n?/, "").trim()
      sections.push({ title, content })
    } else {
      // Leading content before first ## header
      sections.push({ title: "", content: trimmed })
    }
  }

  return sections
}

export function CollapsibleMarkdownRenderer({ content, components }: CollapsibleMarkdownRendererProps) {
  const sections = splitAtH2(content)

  // If fewer than 3 H2 sections, render normally
  const h2Sections = sections.filter(s => s.title)
  if (h2Sections.length < 3) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components as any}>
        {content}
      </ReactMarkdown>
    )
  }

  return (
    <div className="space-y-0.5">
      {sections.map((section, i) => {
        if (!section.title) {
          // Preamble content (before first ##)
          return (
            <div key={i} className="mb-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={components as any}>
                {section.content}
              </ReactMarkdown>
            </div>
          )
        }

        return (
          <CollapsibleSection key={i} title={section.title} defaultOpen={i === 0 || (i === sections.length - 1 && sections.length > 1)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components as any}>
              {section.content}
            </ReactMarkdown>
          </CollapsibleSection>
        )
      })}
    </div>
  )
}
