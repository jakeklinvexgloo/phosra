"use client"

import { useState } from "react"
import { LEGISLATION_REFERENCE } from "@/lib/compliance/adapters/to-legislation"
import { CATEGORY_REFERENCE } from "@/lib/docs/categories"

function Keyword({ children }: { children: string }) {
  return <strong className="text-brand-green font-bold">{children}</strong>
}

export function LegislationBrowser() {
  const [expandedLegislation, setExpandedLegislation] = useState<Set<string>>(new Set())

  const toggleLegislation = (id: string) => {
    setExpandedLegislation(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setExpandedLegislation(new Set(LEGISLATION_REFERENCE.map(l => l.id)))
  const collapseAll = () => setExpandedLegislation(new Set())

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Legislative Compliance Matrix</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The following legislation maps to PCSS policy categories. Platforms operating in jurisdictions
        covered by these laws <Keyword>MUST</Keyword> implement the corresponding categories.
        Click any entry to see key provisions, jurisdiction details, and legislative status.
      </p>

      <div className="flex gap-2 mb-4">
        <button onClick={expandAll} className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 border border-border rounded hover:bg-muted transition-colors">Expand All</button>
        <button onClick={collapseAll} className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 border border-border rounded hover:bg-muted transition-colors">Collapse All</button>
      </div>

      <div className="space-y-2">
        {LEGISLATION_REFERENCE.map(leg => {
          const isExpanded = expandedLegislation.has(leg.id)
          const stageColor = leg.stage.startsWith("In force") || leg.stage.startsWith("Enacted") || leg.stage.startsWith("Signed")
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : leg.stage.startsWith("Passed")
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
            : leg.stage.includes("paused") || leg.stage.includes("injunction")
            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"

          return (
            <div key={leg.id} className="bg-card rounded border border-border overflow-hidden">
              {/* Collapsed Row */}
              <button
                onClick={() => toggleLegislation(leg.id)}
                className="w-full text-left px-3 sm:px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{leg.law}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${stageColor} whitespace-nowrap`}>
                        {leg.stage.split(";")[0]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{leg.jurisdiction}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{leg.summary}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                    <div className="hidden sm:flex flex-wrap gap-1 justify-end">
                      {leg.categories.map(cat => (
                        <code key={cat} className="text-[10px] bg-accent/5 text-brand-green px-1.5 py-0.5 rounded font-mono whitespace-nowrap">{cat}</code>
                      ))}
                    </div>
                    <svg className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </button>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="border-t border-border px-4 py-5 space-y-4 bg-muted/10">
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
                          <span key={catId} className="flex items-center gap-1.5 bg-accent/5 border border-accent/20 rounded px-2.5 py-1.5">
                            <code className="text-xs font-mono text-brand-green">{catId}</code>
                            {cat && <span className="text-[10px] text-muted-foreground">{cat.name}</span>}
                          </span>
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
  )
}
