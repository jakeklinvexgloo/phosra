"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  Plug,
  ExternalLink,
  BookOpen,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { PARENTAL_CONTROLS_REGISTRY } from "@/lib/parental-controls/registry"
import type {
  Source,
  SourceSyncJob,
  SourceSyncResult,
  GuidedStep,
  RuleCategory,
} from "@/lib/types"
import { RULE_GROUPS } from "@/lib/types"

const statusConfig: Record<string, { dot: string; text: string; label: string }> = {
  connected: { dot: "bg-success", text: "text-success", label: "Connected" },
  syncing: { dot: "bg-sky-500 status-dot-pulse", text: "text-sky-500", label: "Syncing" },
  error: { dot: "bg-destructive", text: "text-destructive", label: "Error" },
  pending: { dot: "bg-warning", text: "text-warning", label: "Pending" },
  disconnected: { dot: "bg-muted-foreground/50", text: "text-muted-foreground", label: "Disconnected" },
}

const tierConfig: Record<string, { bg: string; text: string; label: string }> = {
  managed: { bg: "bg-sky-500/10", text: "text-sky-500", label: "Managed API" },
  guided: { bg: "bg-amber-500/10", text: "text-amber-500", label: "Guided Setup" },
}

const jobStatusConfig: Record<string, { dot: string; text: string; label: string }> = {
  completed: { dot: "bg-success", text: "text-success", label: "Completed" },
  failed: { dot: "bg-destructive", text: "text-destructive", label: "Failed" },
  partial: { dot: "bg-warning", text: "text-warning", label: "Partial" },
  running: { dot: "bg-sky-500 status-dot-pulse", text: "text-sky-500", label: "Running" },
  pending: { dot: "bg-muted-foreground/50", text: "text-muted-foreground", label: "Pending" },
}

const resultStatusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  pushed: { icon: CheckCircle2, color: "text-success", label: "Pushed" },
  skipped: { icon: ChevronRight, color: "text-muted-foreground", label: "Skipped" },
  failed: { icon: XCircle, color: "text-destructive", label: "Failed" },
  unsupported: { icon: XCircle, color: "text-muted-foreground/50", label: "Unsupported" },
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleString()
}

function getRegistryEntry(slug: string) {
  return PARENTAL_CONTROLS_REGISTRY.find(e => e.slug === slug)
}

export default function SourceDetailPage() {
  const params = useParams()
  const childId = params.childId as string
  const sourceId = params.sourceId as string

  const [source, setSource] = useState<Source | null>(null)
  const [jobs, setJobs] = useState<SourceSyncJob[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [jobResults, setJobResults] = useState<Record<string, SourceSyncResult[]>>({})
  const [retrying, setRetrying] = useState<string | null>(null)
  const [guidedSteps, setGuidedSteps] = useState<Record<string, GuidedStep[]>>({})
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [sourceData, jobsData] = await Promise.all([
          api.getSource("", sourceId),
          api.listSourceSyncJobs("", sourceId, 20),
        ])
        setSource(sourceData)
        setJobs(jobsData || [])
      } catch {
        // handle silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sourceId])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await api.syncSource("", sourceId, "full")
      toast({ title: "Sync started", description: "Full sync triggered. Rules are being pushed." })
      // Refresh
      const [updatedSource, updatedJobs] = await Promise.all([
        api.getSource("", sourceId),
        api.listSourceSyncJobs("", sourceId, 20),
      ])
      setSource(updatedSource)
      setJobs(updatedJobs || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed"
      toast({ title: "Sync failed", description: msg, variant: "destructive" })
    } finally {
      setSyncing(false)
    }
  }

  const handleRetry = async (jobId: string) => {
    setRetrying(jobId)
    try {
      await api.retrySourceSync("", sourceId, jobId)
      toast({ title: "Retry started", description: "The sync job is being retried." })
      const updatedJobs = await api.listSourceSyncJobs("", sourceId, 20)
      setJobs(updatedJobs || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Retry failed"
      toast({ title: "Retry failed", description: msg, variant: "destructive" })
    } finally {
      setRetrying(null)
    }
  }

  const loadJobResults = async (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
      return
    }
    setExpandedJobId(jobId)
    if (!jobResults[jobId]) {
      try {
        const results = await api.getSourceSyncResults("", sourceId, jobId)
        setJobResults(prev => ({ ...prev, [jobId]: results || [] }))
      } catch {
        // handle silently
      }
    }
  }

  const loadGuidedSteps = async (category: string) => {
    if (expandedGuide === category) {
      setExpandedGuide(null)
      return
    }
    setExpandedGuide(category)
    if (!guidedSteps[category]) {
      try {
        const steps = await api.getSourceGuidedSteps("", sourceId, category)
        setGuidedSteps(prev => ({ ...prev, [category]: steps || [] }))
      } catch {
        // handle silently
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!source) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Source not found.</p>
        <Link href={`/dashboard/children/${childId}/sources`} className="text-sm text-foreground hover:underline mt-2 inline-block">
          Back to Sources
        </Link>
      </div>
    )
  }

  const registry = getRegistryEntry(source.source_slug)
  const status = statusConfig[source.status] || statusConfig.pending
  const tier = tierConfig[source.api_tier] || tierConfig.managed

  // Build capability lookup from the source
  const capabilityMap = new Map(
    (source.capabilities || []).map(c => [c.category, c])
  )

  return (
    <div>
      {/* Back link */}
      <Link
        href={`/dashboard/children/${childId}/sources`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Sources
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: registry?.accentColor ? `${registry.accentColor}20` : undefined }}
          >
            {registry?.iconEmoji || source.display_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-h2 text-foreground">{source.display_name}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${status.text}`}>
                <span className={`status-dot ${status.dot}`} />
                {status.label}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tier.bg} ${tier.text}`}>
                {tier.label}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Last sync: {timeAgo(source.last_sync_at)}
              </span>
              <span>Version: {source.sync_version}</span>
              {registry && (
                <a
                  href={registry.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Website
                </a>
              )}
            </div>
            {source.error_message && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                {source.error_message}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing || source.status === "disconnected"}
          className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          Sync All Rules
        </button>
      </div>

      {/* Capabilities Grid */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Rule Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(RULE_GROUPS).map(([groupKey, group]) => (
            <div key={groupKey} className="plaid-card">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">{group.label}</h4>
              <div className="space-y-2">
                {group.categories.map(cat => {
                  const cap = capabilityMap.get(cat.value)
                  const isGuided = source.api_tier === "guided"
                  const isExpandedGuide = expandedGuide === cat.value

                  let supportIcon
                  let supportColor
                  let supportLabel

                  if (!cap || cap.support_level === "none") {
                    supportIcon = <XCircle className="w-4 h-4 text-muted-foreground/40" />
                    supportColor = "text-muted-foreground/40"
                    supportLabel = "Not supported"
                  } else if (cap.support_level === "full") {
                    supportIcon = <CheckCircle2 className="w-4 h-4 text-success" />
                    supportColor = "text-success"
                    supportLabel = "Full"
                  } else {
                    supportIcon = <AlertTriangle className="w-4 h-4 text-warning" />
                    supportColor = "text-warning"
                    supportLabel = "Partial"
                  }

                  return (
                    <div key={cat.value}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {supportIcon}
                          <span className="text-sm text-foreground">{cat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${supportColor}`}>{supportLabel}</span>
                          {cap && cap.support_level !== "none" && cap.read_write && (
                            <span className="text-xs text-muted-foreground">
                              {cap.read_write === "push_only" ? "Push" : cap.read_write === "pull_only" ? "Pull" : "Bi-dir"}
                            </span>
                          )}
                          {isGuided && cap && cap.support_level !== "none" && (
                            <button
                              onClick={() => loadGuidedSteps(cat.value)}
                              className="text-xs text-sky-500 hover:text-sky-400 transition"
                              title="View guided steps"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Guided steps expansion */}
                      {isGuided && isExpandedGuide && guidedSteps[cat.value] && (
                        <div className="ml-6 mt-2 mb-2 space-y-2">
                          {guidedSteps[cat.value].map(step => (
                            <div key={step.step_number} className="flex gap-2 text-xs">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                                {step.step_number}
                              </span>
                              <div>
                                <p className="font-medium text-foreground">{step.title}</p>
                                <p className="text-muted-foreground">{step.description}</p>
                                {step.deep_link && (
                                  <a
                                    href={step.deep_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sky-500 hover:text-sky-400 mt-0.5 transition"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Open in app
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {cap?.notes && (
                        <p className="ml-6 text-xs text-muted-foreground">{cap.notes}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Jobs */}
      <div>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Recent Sync Jobs</h3>

        {jobs.length === 0 ? (
          <div className="plaid-card text-center py-10">
            <RefreshCw className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No sync jobs yet. Click "Sync All Rules" to start.</p>
          </div>
        ) : (
          <div className="plaid-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mode</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trigger</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pushed</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Skipped</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Failed</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map(job => {
                    const jobStatus = jobStatusConfig[job.status] || jobStatusConfig.pending
                    const isExpanded = expandedJobId === job.id
                    const results = jobResults[job.id]

                    return (
                      <>
                        <tr
                          key={job.id}
                          className={`cursor-pointer transition ${isExpanded ? "bg-muted/30" : "hover:bg-muted/50"}`}
                          onClick={() => loadJobResults(job.id)}
                        >
                          <td className="px-4 py-3 text-sm text-foreground">
                            <div className="flex items-center gap-1.5">
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                              {formatDate(job.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{job.sync_mode.replace(/_/g, " ")}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{job.trigger_type.replace(/_/g, " ")}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${jobStatus.text}`}>
                              <span className={`status-dot ${jobStatus.dot}`} />
                              {jobStatus.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-success font-medium">{job.rules_pushed}</td>
                          <td className="px-4 py-3 text-center text-sm text-muted-foreground">{job.rules_skipped}</td>
                          <td className="px-4 py-3 text-center text-sm text-destructive font-medium">{job.rules_failed}</td>
                          <td className="px-4 py-3 text-right">
                            {(job.status === "failed" || job.status === "partial") && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRetry(job.id) }}
                                disabled={retrying === job.id}
                                className="inline-flex items-center gap-1 text-xs text-foreground hover:underline disabled:opacity-50"
                              >
                                <RefreshCw className={`w-3 h-3 ${retrying === job.id ? "animate-spin" : ""}`} />
                                Retry
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Expanded job results */}
                        {isExpanded && (
                          <tr key={`${job.id}-detail`}>
                            <td colSpan={8} className="bg-muted/20 px-6 py-4">
                              {job.error_message && (
                                <div className="flex items-center gap-2 mb-3 text-sm text-destructive">
                                  <AlertTriangle className="w-4 h-4" />
                                  {job.error_message}
                                </div>
                              )}

                              <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                                {job.started_at && <span>Started: {formatDate(job.started_at)}</span>}
                                {job.completed_at && <span>Completed: {formatDate(job.completed_at)}</span>}
                              </div>

                              {results ? (
                                results.length > 0 ? (
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Per-Rule Results</p>
                                    {results.map(result => {
                                      const rs = resultStatusConfig[result.status] || resultStatusConfig.skipped
                                      const Icon = rs.icon
                                      // Find the human-readable label
                                      const ruleLabel = Object.values(RULE_GROUPS)
                                        .flatMap(g => g.categories)
                                        .find(c => c.value === result.rule_category)?.label || result.rule_category

                                      return (
                                        <div key={result.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                                          <div className="flex items-center gap-2">
                                            <Icon className={`w-4 h-4 ${rs.color}`} />
                                            <span className="text-sm text-foreground">{ruleLabel}</span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className={`text-xs font-medium ${rs.color}`}>{rs.label}</span>
                                            {result.error_message && (
                                              <span className="text-xs text-destructive max-w-xs truncate">{result.error_message}</span>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">No per-rule results recorded.</p>
                                )
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                                  Loading results...
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
