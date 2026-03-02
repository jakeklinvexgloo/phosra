"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  GLOSSARY_CATEGORIES,
  getSortedGlossary,
  getAvailableLetters,
  groupByLetter,
} from "@/lib/glossary"
import type { GlossaryCategory, GlossaryEntry } from "@/lib/glossary"

const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  all: "All",
  legislation: "Legislation",
  technology: "Technology",
  policy: "Policy",
  compliance: "Compliance",
}

const CATEGORY_COLORS: Record<string, string> = {
  legislation: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  technology: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  policy: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  compliance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
}

export function GlossaryClient() {
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory>("all")

  const allSorted = useMemo(() => getSortedGlossary(), [])

  const filtered = useMemo(() => {
    if (activeCategory === "all") return allSorted
    return allSorted.filter((e) => e.category === activeCategory)
  }, [allSorted, activeCategory])

  const letters = useMemo(() => getAvailableLetters(filtered), [filtered])
  const grouped = useMemo(() => groupByLetter(filtered), [filtered])

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {GLOSSARY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-brand-green text-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Letter navigation */}
      <nav className="flex flex-wrap gap-1.5 mb-10" aria-label="Alphabetical navigation">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium text-muted-foreground hover:text-brand-green hover:bg-brand-green/10 transition-colors"
          >
            {letter}
          </a>
        ))}
      </nav>

      {/* Terms grouped by letter */}
      <div className="space-y-12">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-display text-foreground border-b border-border pb-2 mb-6">
              {letter}
            </h2>
            <div className="space-y-6">
              {grouped[letter].map((entry) => (
                <GlossaryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No terms found for this category.
          </p>
        </div>
      )}
    </>
  )
}

function GlossaryCard({ entry }: { entry: GlossaryEntry }) {
  const colorClass = CATEGORY_COLORS[entry.category] || ""

  return (
    <div id={entry.id} className="scroll-mt-24">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-foreground">
            {entry.term}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${colorClass}`}
          >
            {entry.category}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {entry.definition}
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          {entry.relatedTerms.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground/60 font-medium">Related:</span>
              {entry.relatedTerms.map((termId, i) => (
                <span key={termId}>
                  <a
                    href={`#${termId}`}
                    className="text-brand-green hover:underline"
                  >
                    {termId}
                  </a>
                  {i < entry.relatedTerms.length - 1 && (
                    <span className="text-muted-foreground/40">, </span>
                  )}
                </span>
              ))}
            </div>
          )}
          {entry.relatedLawIds.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground/60 font-medium">Laws:</span>
              {entry.relatedLawIds.map((lawId, i) => (
                <span key={lawId}>
                  <Link
                    href={`/compliance/${lawId}`}
                    className="text-brand-green hover:underline"
                  >
                    {lawId}
                  </Link>
                  {i < entry.relatedLawIds.length - 1 && (
                    <span className="text-muted-foreground/40">, </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
