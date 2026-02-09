"use client"

import { LegalTableOfContents } from "./LegalTableOfContents"
import { LegalSection } from "./LegalSection"

interface LegalPageShellProps {
  title: string
  lastUpdated: string
  sections: { id: string; title: string; content: string }[]
}

export function LegalPageShell({
  title,
  lastUpdated,
  sections,
}: LegalPageShellProps) {
  const tocSections = sections.map(({ id, title }) => ({ id, title }))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      {/* Page header */}
      <div className="mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-4">
          {title}
        </h1>
        <span className="inline-block text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Last updated {lastUpdated}
        </span>
      </div>

      {/* TOC + content layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <LegalTableOfContents sections={tocSections} />

        <div className="flex-1 max-w-3xl space-y-10">
          {sections.map((section, i) => (
            <LegalSection
              key={section.id}
              id={section.id}
              number={i + 1}
              title={section.title}
              content={section.content}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
