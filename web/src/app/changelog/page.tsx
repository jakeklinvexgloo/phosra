"use client"

import { useState } from "react"
import { CHANGELOG, CATEGORY_CONFIG } from "@/lib/changelog"

type FilterCategory = "all" | "feature" | "improvement" | "fix" | "breaking"

export default function ChangelogPage() {
  const [filter, setFilter] = useState<FilterCategory>("all")

  const filtered = filter === "all"
    ? CHANGELOG
    : CHANGELOG.filter((e) => e.category === filter)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-display text-foreground mb-4">Changelog</h1>
        <p className="text-lg text-muted-foreground">
          New features, improvements, and fixes for Phosra.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1">
        {(["all", "feature", "improvement", "fix", "breaking"] as const).map((cat) => {
          const config = cat === "all"
            ? { label: "All", bg: "", text: "" }
            : CATEGORY_CONFIG[cat]
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                filter === cat
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {config.label}
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-12">
          {filtered.map((entry) => {
            const cat = CATEGORY_CONFIG[entry.category]
            return (
              <div key={entry.version} className="relative pl-8">
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-background ${
                  entry.category === "feature" ? "bg-brand-green" :
                  entry.category === "improvement" ? "bg-accent-teal" :
                  entry.category === "fix" ? "bg-accent-purple" :
                  "bg-destructive"
                }`} />

                {/* Date + version */}
                <div className="flex items-center gap-3 mb-2">
                  <time className="text-xs text-muted-foreground font-mono">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    v{entry.version}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cat.bg} ${cat.text}`}>
                    {cat.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{entry.title}</h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {entry.description}
                </p>

                {/* Highlights */}
                {entry.highlights && entry.highlights.length > 0 && (
                  <ul className="space-y-1.5">
                    {entry.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-brand-green mt-1 flex-shrink-0">&bull;</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No entries match this filter.
        </p>
      )}
    </div>
  )
}
