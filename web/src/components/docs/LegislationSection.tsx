"use client"

import { useState } from "react"
import Link from "next/link"
import { LEGISLATION_REFERENCE } from "@/lib/docs/legislation"
import type { LegislationEntry } from "@/lib/compliance/adapters/to-legislation"
import { CATEGORY_REFERENCE } from "@/lib/docs/categories"

/** Ordered jurisdiction groups with display labels */
const JURISDICTION_GROUPS: { key: string; label: string; description: string }[] = [
  { key: "us-federal", label: "United States (Federal)", description: "Federal child safety legislation" },
  { key: "us-state", label: "United States (State)", description: "State-level child safety laws" },
  { key: "eu", label: "European Union", description: "EU-wide digital safety regulation" },
  { key: "uk", label: "United Kingdom", description: "UK online safety framework" },
  { key: "asia-pacific", label: "Asia-Pacific", description: "APAC child safety regulation" },
]

function stageColor(stage: string): string {
  if (stage.startsWith("In force") || stage.startsWith("Enacted") || stage.startsWith("Signed"))
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  if (stage.startsWith("Passed"))
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  if (stage.includes("paused") || stage.includes("injunction"))
    return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
  return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
}

export function LegislationSection() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(JURISDICTION_GROUPS.map(g => g.key))
  )
  const [expandedLegislation, setExpandedLegislation] = useState<Set<string>>(new Set())

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleLegislation = (id: string) => {
    setExpandedLegislation(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAllGroups = () => setExpandedGroups(new Set(JURISDICTION_GROUPS.map(g => g.key)))
  const collapseAllGroups = () => setExpandedGroups(new Set())

  // Group entries by jurisdictionGroup
  const grouped = new Map<string, LegislationEntry[]>()
  for (const entry of LEGISLATION_REFERENCE) {
    const list = grouped.get(entry.jurisdictionGroup) || []
    list.push(entry)
    grouped.set(entry.jurisdictionGroup, list)
  }

  return (
    <section id="legislation">
      <h2 className="text-xl font-bold text-foreground mb-4">11. Legislative Compliance Matrix</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The following legislation maps to PCSS policy categories. Platforms operating in jurisdictions
        covered by these laws <strong className="text-brand-green font-bold">MUST</strong> implement the corresponding categories.
        Click any law to see key provisions, jurisdiction details, and legislative status.
      </p>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={expandAllGroups}
          className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 border border-border rounded hover:bg-muted transition-colors"
        >
          Expand All
        </button>
        <button
          onClick={collapseAllGroups}
          className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 border border-border rounded hover:bg-muted transition-colors"
        >
          Collapse All
        </button>
        <span className="text-xs text-muted-foreground ml-auto">
          {LEGISLATION_REFERENCE.length} laws across {JURISDICTION_GROUPS.filter(g => grouped.has(g.key)).length} regions
        </span>
      </div>

      {/* Jurisdiction Groups */}
      <div className="space-y-4">
        {JURISDICTION_GROUPS.map(group => {
          const entries = grouped.get(group.key)
          if (!entries || entries.length === 0) return null

          const isGroupExpanded = expandedGroups.has(group.key)

          return (
            <div key={group.key} className="bg-card rounded border border-border overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.key)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                <svg
                  className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isGroupExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <h3 className="text-sm font-bold text-foreground">{group.label}</h3>
                <span className="text-xs text-muted-foreground">{group.description}</span>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                  {entries.length} {entries.length === 1 ? "law" : "laws"}
                </span>
              </button>

              {/* Group Body */}
              {isGroupExpanded && (
                <div className="border-t border-border">
                  <div className="divide-y divide-border">
                    {entries.map(leg => {
                      const isExpanded = expandedLegislation.has(leg.id)

                      return (
                        <div key={leg.id} className="overflow-hidden">
                          {/* Law Row */}
                          <button
                            onClick={() => toggleLegislation(leg.id)}
                            className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Link
                                    href={leg.href}
                                    onClick={e => e.stopPropagation()}
                                    className="text-sm font-semibold text-foreground hover:text-brand-green transition-colors"
                                  >
                                    {leg.law}
                                  </Link>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${stageColor(leg.stage)} whitespace-nowrap`}>
                                    {leg.stage.split(";")[0]}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">{leg.jurisdiction}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{leg.summary}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                                <div className="hidden sm:flex flex-wrap gap-1 justify-end">
                                  {leg.categories.map(cat => (
                                    <code key={cat} className="text-[10px] bg-accent/5 text-brand-green px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                                      {cat}
                                    </code>
                                  ))}
                                </div>
                                <svg
                                  className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </button>

                          {/* Expanded Detail Panel */}
                          {isExpanded && (
                            <div className="border-t border-border px-4 py-5 space-y-4 bg-muted/10">
                              {/* Link to full compliance page */}
                              <div className="flex items-center gap-2">
                                <Link
                                  href={leg.href}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-green hover:underline transition-colors"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  View full compliance details
                                </Link>
                              </div>

                              {/* Metadata Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-muted/30 rounded p-3">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Jurisdiction</p>
                                  <p className="text-sm text-foreground">{leg.jurisdiction}</p>
                                </div>
                                <div className="bg-muted/30 rounded p-3">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Introduced</p>
                                  <p className="text-sm text-foreground">{leg.introduced}</p>
                                </div>
                                <div className="bg-muted/30 rounded p-3">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Status</p>
                                  <p className="text-sm text-foreground">{leg.stage}</p>
                                </div>
                              </div>

                              {/* Key Provisions */}
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Key Provisions</h4>
                                <ul className="space-y-1.5">
                                  {leg.keyProvisions.map((provision, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                      <span className="text-brand-green mt-0.5 flex-shrink-0">&#8226;</span>
                                      <span className="leading-relaxed">{provision}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Required PCSS Categories */}
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Required PCSS Categories</h4>
                                <div className="flex flex-wrap gap-2">
                                  {leg.categories.map(catId => {
                                    const cat = CATEGORY_REFERENCE.find(c => c.id === catId)
                                    return (
                                      <Link
                                        key={catId}
                                        href="#rule-categories"
                                        className="flex items-center gap-1.5 bg-accent/5 border border-accent/20 rounded px-2.5 py-1.5 hover:bg-accent/10 transition-colors"
                                      >
                                        <code className="text-xs font-mono text-brand-green">{catId}</code>
                                        {cat && <span className="text-[10px] text-muted-foreground">{cat.name}</span>}
                                      </Link>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
