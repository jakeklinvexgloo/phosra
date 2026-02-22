"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import type { Child, ComplianceLink, EnforcementJob, EnforcementResult } from "@/lib/types"

const statusConfig: Record<string, { dot: string; text: string; label: string }> = {
  completed: { dot: "bg-success", text: "text-success", label: "Enforced" },
  failed: { dot: "bg-destructive", text: "text-destructive", label: "Failed" },
  partial: { dot: "bg-warning", text: "text-warning", label: "Partial" },
  running: { dot: "bg-foreground status-dot-pulse", text: "text-foreground", label: "Running" },
  pending: { dot: "bg-muted-foreground/50", text: "text-muted-foreground", label: "Pending" },
  unknown: { dot: "bg-muted-foreground/30", text: "text-muted-foreground", label: "Unknown" },
}

export default function EnforcementPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [links, setLinks] = useState<ComplianceLink[]>([])
  const [enforcementJobs, setEnforcementJobs] = useState<Record<string, EnforcementJob[]>>({})
  const [expandedCell, setExpandedCell] = useState<string | null>(null)
  const [cellResults, setCellResults] = useState<Record<string, EnforcementResult[]>>({})
  const [retrying, setRetrying] = useState<string | null>(null)

  useEffect(() => {
    api.listFamilies().then(async (families) => {
      if (!families || families.length === 0) return
      const familyId = families[0].id
      const [ch, co] = await Promise.all([
        api.listChildren(familyId),
        api.listComplianceLinks(familyId),
      ])
      setChildren(ch || [])
      setLinks(co || [])

      const jobs: Record<string, EnforcementJob[]> = {}
      for (const child of ch || []) {
        const childJobs = await api.listChildEnforcementJobs(child.id).catch(() => [])
        jobs[child.id] = childJobs || []
      }
      setEnforcementJobs(jobs)
    })
  }, [])

  const getStatus = (childId: string, platformId: string): string => {
    const jobs = enforcementJobs[childId]
    if (!jobs || jobs.length === 0) return "unknown"
    return jobs[0].status
  }

  return (
    <div>
      <h2 className="text-xl sm:text-h2 text-foreground mb-2">Enforcement Status</h2>
      <p className="text-sm text-muted-foreground mb-8">Policy enforcement status across all verified platforms and protected children.</p>

      {children.length === 0 || links.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Add children and verify platform compliance to see enforcement status.</p>
        </div>
      ) : (
        <div className="plaid-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Child</th>
                  {links.map(link => (
                    <th key={link.id} className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">{link.platform_id}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {children.map(child => (
                  <tr key={child.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{child.name}</td>
                    {links.map(link => {
                      const status = getStatus(child.id, link.platform_id)
                      const s = statusConfig[status] || statusConfig.unknown
                      const cellKey = `${child.id}-${link.platform_id}`
                      const isExpanded = expandedCell === cellKey
                      const results = cellResults[cellKey]
                      const latestJob = enforcementJobs[child.id]?.[0]
                      return (
                        <td key={link.id} className="px-6 py-4 text-center relative">
                          <button
                            onClick={async () => {
                              if (isExpanded) {
                                setExpandedCell(null)
                                return
                              }
                              setExpandedCell(cellKey)
                              if (!results && latestJob) {
                                try {
                                  const r = await api.getEnforcementJobResults(latestJob.id)
                                  setCellResults(prev => ({ ...prev, [cellKey]: r || [] }))
                                } catch { /* empty */ }
                              }
                            }}
                            className="flex items-center justify-center gap-2 w-full"
                          >
                            <span className={`status-dot ${s.dot}`} />
                            <span className={`text-xs ${s.text}`}>{s.label}</span>
                          </button>
                          {isExpanded && (
                            <div className="absolute z-10 left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-1 bg-background rounded shadow-plaid-card p-3 text-left w-48 sm:w-56">
                              {results ? (
                                results.filter(r => r.platform_id === link.platform_id).length > 0 ? (
                                  results.filter(r => r.platform_id === link.platform_id).map(result => (
                                    <div key={result.id} className="text-xs space-y-1">
                                      <p className="text-foreground font-medium">Applied: {result.rules_applied} | Skipped: {result.rules_skipped} | Failed: {result.rules_failed}</p>
                                      {result.error_message && (
                                        <p className="text-destructive">{result.error_message}</p>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-muted-foreground">No results for this platform.</p>
                                )
                              ) : (
                                <p className="text-xs text-muted-foreground">Loading...</p>
                              )}
                              {status === "failed" && latestJob && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    setRetrying(cellKey)
                                    try {
                                      await api.retryEnforcementJob(latestJob.id)
                                      const jobs = await api.listChildEnforcementJobs(child.id).catch(() => [])
                                      setEnforcementJobs(prev => ({ ...prev, [child.id]: jobs || [] }))
                                    } catch { /* empty */ }
                                    setRetrying(null)
                                  }}
                                  disabled={retrying === cellKey}
                                  className="mt-2 flex items-center gap-1 text-xs text-foreground hover:underline disabled:opacity-50"
                                >
                                  <RefreshCw className={`w-3 h-3 ${retrying === cellKey ? "animate-spin" : ""}`} />
                                  Retry
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries(statusConfig).filter(([k]) => k !== "unknown").map(([key, s]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`status-dot ${s.dot.replace(" status-dot-pulse", "")}`} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  )
}
