"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Plug,
  RefreshCw,
  Plus,
  X,
  ExternalLink,
  Unplug,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronLeft,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { PARENTAL_CONTROLS_REGISTRY } from "@/lib/parental-controls/registry"
import type { Child, Source, AvailableSource } from "@/lib/types"

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

function getRegistryEntry(slug: string) {
  return PARENTAL_CONTROLS_REGISTRY.find(e => e.slug === slug)
}

export default function SourcesPage() {
  const params = useParams()
  const childId = params.childId as string

  const [child, setChild] = useState<Child | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [availableSources, setAvailableSources] = useState<AvailableSource[]>([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [connectingSlug, setConnectingSlug] = useState<string | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState("")
  const [syncing, setSyncing] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [childData, sourcesData] = await Promise.all([
          api.getChild(childId),
          api.listSourcesByChild("", childId),
        ])
        setChild(childData)
        setSources(sourcesData || [])
      } catch {
        // handle error silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [childId])

  const openAddPanel = async () => {
    setShowAddPanel(true)
    if (availableSources.length === 0) {
      setLoadingAvailable(true)
      try {
        const data = await api.listAvailableSources("")
        setAvailableSources(data || [])
      } catch {
        // fallback: build from registry
        const fallback: AvailableSource[] = PARENTAL_CONTROLS_REGISTRY
          .filter(e => e.apiAvailability === "public_api" || e.apiAvailability === "partner_api")
          .map(e => ({
            slug: e.slug,
            display_name: e.name,
            api_tier: e.apiAvailability === "public_api" ? "managed" as const : "guided" as const,
            auth_type: e.apiAvailability === "public_api" ? "api_key" : "manual",
            website: e.website,
            description: e.description,
          }))
        setAvailableSources(fallback)
      } finally {
        setLoadingAvailable(false)
      }
    }
  }

  const handleConnect = async (source: AvailableSource) => {
    if (source.api_tier === "managed" && connectingSlug !== source.slug) {
      setConnectingSlug(source.slug)
      setApiKeyInput("")
      return
    }

    try {
      const familyId = child?.family_id || ""
      const payload: { child_id: string; family_id: string; source: string; credentials?: Record<string, string>; auto_sync?: boolean } = {
        child_id: childId,
        family_id: familyId,
        source: source.slug,
        auto_sync: true,
      }
      if (source.api_tier === "managed" && apiKeyInput) {
        payload.credentials = { api_key: apiKeyInput }
      }
      const newSource = await api.connectSource("", payload)
      setSources(prev => [...prev, newSource])
      setShowAddPanel(false)
      setConnectingSlug(null)
      setApiKeyInput("")
      toast({ title: "Source connected", description: `${source.display_name} has been added.`, variant: "success" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect source"
      toast({ title: "Connection failed", description: msg, variant: "destructive" })
    }
  }

  const handleSync = async (sourceId: string) => {
    setSyncing(sourceId)
    try {
      await api.syncSource("", sourceId, "full")
      toast({ title: "Sync started", description: "Rules are being pushed to the source." })
      // Refresh sources to get updated status
      const updated = await api.listSourcesByChild("", childId)
      setSources(updated || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed"
      toast({ title: "Sync failed", description: msg, variant: "destructive" })
    } finally {
      setSyncing(null)
    }
  }

  const handleDisconnect = async (sourceId: string) => {
    if (confirmDisconnect !== sourceId) {
      setConfirmDisconnect(sourceId)
      return
    }
    setDisconnecting(sourceId)
    try {
      await api.disconnectSource("", sourceId)
      setSources(prev => prev.filter(s => s.id !== sourceId))
      toast({ title: "Source disconnected", description: "The source has been removed." })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Disconnect failed"
      toast({ title: "Disconnect failed", description: msg, variant: "destructive" })
    } finally {
      setDisconnecting(null)
      setConfirmDisconnect(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const connectedSlugs = new Set(sources.map(s => s.source_slug))

  return (
    <div>
      {/* Back link */}
      <Link
        href={`/dashboard/children/${childId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to {child?.name || "Child"}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-brand-green">
            <Plug className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-h2 text-foreground">Connected Sources</h2>
            <p className="text-muted-foreground text-sm">
              {child?.name ? `Parental control sources for ${child.name}` : "Manage parental control source connections"}
            </p>
          </div>
        </div>
        <button
          onClick={openAddPanel}
          className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
        >
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      </div>

      {/* Connected Sources List */}
      {sources.length === 0 ? (
        <div className="plaid-card text-center py-16">
          <Plug className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No sources connected yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Connect parental control apps like Bark, Qustodio, or Apple Screen Time to automatically push Phosra policies to your child's devices.
          </p>
          <button
            onClick={openAddPanel}
            className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
          >
            <Plus className="w-4 h-4" />
            Add Your First Source
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sources.map(source => {
            const registry = getRegistryEntry(source.source_slug)
            const status = statusConfig[source.status] || statusConfig.pending
            const tier = tierConfig[source.api_tier] || tierConfig.managed
            const capCount = source.capabilities?.length || 0
            const totalRules = 35 // approximate total rule categories

            return (
              <div key={source.id} className="plaid-card">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Source identity */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: registry?.accentColor ? `${registry.accentColor}20` : undefined }}
                    >
                      {registry?.iconEmoji || source.display_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground truncate">{source.display_name}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${status.text}`}>
                          <span className={`status-dot ${status.dot}`} />
                          {status.label}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tier.bg} ${tier.text}`}>
                          {tier.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last sync: {timeAgo(source.last_sync_at)}
                        </span>
                        <span>{capCount} of {totalRules} rules supported</span>
                        {source.error_message && (
                          <span className="flex items-center gap-1 text-destructive">
                            <AlertTriangle className="w-3 h-3" />
                            {source.error_message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleSync(source.id)}
                      disabled={syncing === source.id || source.status === "disconnected"}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-foreground text-foreground hover:bg-muted transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncing === source.id ? "animate-spin" : ""}`} />
                      Sync Now
                    </button>
                    <Link
                      href={`/dashboard/children/${childId}/sources/${source.id}`}
                      className="text-xs px-3 py-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
                    >
                      View Details
                    </Link>
                    {confirmDisconnect === source.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDisconnect(source.id)}
                          disabled={disconnecting === source.id}
                          className="text-xs px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition disabled:opacity-50"
                        >
                          {disconnecting === source.id ? "..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmDisconnect(null)}
                          className="text-xs px-2 py-1.5 text-muted-foreground hover:text-foreground transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDisconnect(source.id)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full text-destructive border border-destructive/30 hover:bg-destructive/10 transition"
                      >
                        <Unplug className="w-3 h-3" />
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Source Panel */}
      {showAddPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => { setShowAddPanel(false); setConnectingSlug(null) }}
          />

          {/* Modal */}
          <div className="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4">
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground">Add a Source</h3>
                <p className="text-sm text-muted-foreground">Connect a parental control app to push Phosra policies</p>
              </div>
              <button
                onClick={() => { setShowAddPanel(false); setConnectingSlug(null) }}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {loadingAvailable ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableSources.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No additional sources available to connect.
                </p>
              ) : (
                <div className="space-y-3">
                  {availableSources.map(source => {
                    const registry = getRegistryEntry(source.slug)
                    const tier = tierConfig[source.api_tier] || tierConfig.managed
                    const alreadyConnected = connectedSlugs.has(source.slug)
                    const isConnecting = connectingSlug === source.slug

                    return (
                      <div
                        key={source.slug}
                        className={`plaid-card ${alreadyConnected ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                            style={{ backgroundColor: registry?.accentColor ? `${registry.accentColor}20` : undefined }}
                          >
                            {registry?.iconEmoji || source.display_name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-foreground">{source.display_name}</h4>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tier.bg} ${tier.text}`}>
                                {tier.label}
                              </span>
                              {alreadyConnected && (
                                <span className="inline-flex items-center gap-1 text-xs text-success">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Connected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{source.description}</p>
                            {registry && (
                              <a
                                href={registry.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1 transition"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {registry.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                              </a>
                            )}

                            {/* Managed: API key input */}
                            {isConnecting && source.api_tier === "managed" && (
                              <div className="mt-3 flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Enter API key"
                                  value={apiKeyInput}
                                  onChange={e => setApiKeyInput(e.target.value)}
                                  className="rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-foreground flex-1"
                                />
                                <button
                                  onClick={() => handleConnect(source)}
                                  className="bg-foreground text-background px-4 py-1.5 rounded-full text-xs font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
                                >
                                  Connect
                                </button>
                                <button
                                  onClick={() => setConnectingSlug(null)}
                                  className="px-3 py-1.5 rounded-full border border-foreground text-foreground text-xs hover:bg-muted transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            {/* Guided: info message */}
                            {isConnecting && source.api_tier === "guided" && (
                              <div className="mt-3 p-3 bg-amber-500/10 rounded text-xs text-amber-700 dark:text-amber-400">
                                This source uses guided setup. After connecting, you will receive step-by-step instructions to manually configure each rule in the app.
                                <div className="mt-2">
                                  <button
                                    onClick={() => handleConnect(source)}
                                    className="bg-foreground text-background px-4 py-1.5 rounded-full text-xs font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition mr-2"
                                  >
                                    Connect Anyway
                                  </button>
                                  <button
                                    onClick={() => setConnectingSlug(null)}
                                    className="px-3 py-1.5 rounded-full border border-foreground text-foreground text-xs hover:bg-muted transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Connect button */}
                          {!alreadyConnected && !isConnecting && (
                            <button
                              onClick={() => {
                                if (source.api_tier === "guided") {
                                  setConnectingSlug(source.slug)
                                } else {
                                  handleConnect(source)
                                }
                              }}
                              className="flex-shrink-0 bg-foreground text-background px-4 py-1.5 rounded-full text-xs font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
