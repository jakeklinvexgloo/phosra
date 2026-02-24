"use client"

import { useState } from "react"
import { CATEGORY_REFERENCE, CATEGORY_GROUPS } from "@/lib/docs/categories"
import type { PlatformSupport } from "@/lib/docs/types"

function SupportBadge({ support }: { support: PlatformSupport }) {
  if (support === "full") return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Full</span>
  if (support === "partial") return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Partial</span>
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20">None</span>
}

function PlatformSupportIcon({ support }: { support: PlatformSupport }) {
  if (support === "full") return <span className="text-emerald-500" title="Full support">&#10003;</span>
  if (support === "partial") return <span className="text-amber-500" title="Partial support">&#9681;</span>
  return <span className="text-zinc-400" title="No support">&mdash;</span>
}

export function CategoryBrowser() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState("")

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const expandAll = () => setExpandedCategories(new Set(CATEGORY_REFERENCE.map(c => c.id)))
  const collapseAll = () => setExpandedCategories(new Set())

  const filteredReference = categoryFilter
    ? CATEGORY_REFERENCE.filter(c =>
        c.id.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        c.name.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        c.description.toLowerCase().includes(categoryFilter.toLowerCase())
      )
    : CATEGORY_REFERENCE

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">45 Mandatory Policy Categories</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Complete API reference for all 45 policy categories. Each entry includes the JSON configuration schema,
        field constraints, age-based defaults, platform support, and usage examples.
      </p>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="flex-1 bg-muted/50 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/50"
        />
        <div className="flex gap-2">
          <button onClick={expandAll} className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 border border-border rounded hover:bg-muted transition-colors">
            Expand All
          </button>
          <button onClick={collapseAll} className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 border border-border rounded hover:bg-muted transition-colors">
            Collapse All
          </button>
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-8">
        {CATEGORY_GROUPS.map(group => {
          const groupCats = filteredReference.filter(c => c.group === group.key)
          if (groupCats.length === 0) return null
          return (
            <div key={group.key} id={`cat-group-${group.key}`}>
              {/* Group Header */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                <h3 className="text-lg font-bold text-foreground">{group.label}</h3>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">{group.categories.length} categories</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">{group.description}</span>
              </div>

              {/* Category Cards */}
              <div className="space-y-2">
                {groupCats.map(cat => {
                  const globalIndex = CATEGORY_REFERENCE.findIndex(c => c.id === cat.id) + 1
                  const isExpanded = expandedCategories.has(cat.id)
                  return (
                    <div key={cat.id} className="bg-card rounded border border-border overflow-hidden">
                      {/* Collapsed Row */}
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-xs font-mono text-muted-foreground w-7 flex-shrink-0">#{globalIndex}</span>
                        <code className="text-xs sm:text-sm font-mono text-brand-green font-medium flex-shrink-0">{cat.id}</code>
                        <span className="text-xs sm:text-sm text-foreground font-medium">{cat.name}</span>
                        <span className="text-xs text-muted-foreground truncate flex-1 hidden md:inline">{cat.description.slice(0, 80)}...</span>
                        {cat.laws.length > 0 && (
                          <div className="hidden sm:flex gap-1 flex-shrink-0">
                            {cat.laws.slice(0, 2).map(law => (
                              <span key={law} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20 whitespace-nowrap">{law}</span>
                            ))}
                            {cat.laws.length > 2 && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20">+{cat.laws.length - 2}</span>}
                          </div>
                        )}
                        <svg className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ml-auto ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>

                      {/* Expanded Detail Panel */}
                      {isExpanded && (
                        <div className="border-t border-border px-4 py-5 space-y-5 bg-muted/10">
                          {/* Why This Exists */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Why This Exists</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{cat.rationale}</p>
                            {cat.laws.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {cat.laws.map(law => (
                                  <span key={law} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20">{law}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Configuration Schema */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Configuration Schema</h4>
                            <div className="bg-card rounded border border-border overflow-x-auto">
                              <table className="w-full text-xs min-w-[500px]">
                                <thead><tr className="bg-muted/50"><th className="px-3 py-2 text-left text-muted-foreground">Field</th><th className="px-3 py-2 text-left text-muted-foreground">Type</th><th className="px-3 py-2 text-center text-muted-foreground">Required</th><th className="px-3 py-2 text-left text-muted-foreground">Default</th><th className="px-3 py-2 text-left text-muted-foreground">Constraints</th></tr></thead>
                                <tbody className="divide-y divide-border">
                                  {cat.fields.map(f => (
                                    <tr key={f.name} className="hover:bg-muted/30">
                                      <td className="px-3 py-2 font-mono text-brand-green">{f.name}</td>
                                      <td className="px-3 py-2 font-mono text-foreground">{f.type}</td>
                                      <td className="px-3 py-2 text-center">{f.required ? <span className="text-emerald-500">Yes</span> : <span className="text-muted-foreground">No</span>}</td>
                                      <td className="px-3 py-2 text-muted-foreground">{f.default}</td>
                                      <td className="px-3 py-2 text-muted-foreground">{f.constraints}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Example Configuration */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Example Configuration</h4>
                            <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs overflow-x-auto">{cat.exampleConfig}</pre>
                          </div>

                          {/* Age-Based Defaults */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Age-Based Defaults</h4>
                            <div className="bg-card rounded border border-border overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead><tr className="bg-muted/50"><th className="px-3 py-2 text-left text-muted-foreground">Age Range</th><th className="px-3 py-2 text-center text-muted-foreground">Enabled</th><th className="px-3 py-2 text-left text-muted-foreground">Default Settings</th></tr></thead>
                                <tbody className="divide-y divide-border">
                                  {cat.ageDefaults.map(ad => (
                                    <tr key={ad.range} className="hover:bg-muted/30">
                                      <td className="px-3 py-2 font-medium text-foreground">{ad.range}</td>
                                      <td className="px-3 py-2 text-center">{ad.enabled ? <span className="text-emerald-500">Yes</span> : <span className="text-muted-foreground">No</span>}</td>
                                      <td className="px-3 py-2 text-muted-foreground">{ad.summary}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Platform Support */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Platform Support</h4>
                            <div className="flex flex-wrap gap-2">
                              {cat.platforms.map(p => (
                                <div key={p.name} className="flex items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground">{p.name}:</span>
                                  <SupportBadge support={p.support} />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* API Usage */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">API Usage</h4>
                            <pre className="bg-zinc-900 text-blue-400 rounded p-3 text-xs overflow-x-auto">{`PUT /policies/{policyID}/rules/bulk
Content-Type: application/json

{
  "rules": [
    {
      "category": "${cat.id}",
      "enabled": true,
      "config": ${cat.exampleConfig.split('\n').map((l, i) => i === 0 ? l : '      ' + l).join('\n')}
    }
  ]
}`}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
