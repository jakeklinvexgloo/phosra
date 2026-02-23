"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Gavel, Plug, Clock, ChevronRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import type { Child, ChildPolicy, Rating, Source } from "@/lib/types"

export default function ChildDetailPage() {
  const params = useParams()
  const childId = params.childId as string
  const [child, setChild] = useState<Child | null>(null)
  const [policies, setPolicies] = useState<ChildPolicy[]>([])
  const [ageRatings, setAgeRatings] = useState<Record<string, Rating> | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [tab, setTab] = useState<"policies" | "ratings" | "enforcement" | "sources">("policies")
  const [newPolicyName, setNewPolicyName] = useState("")

  useEffect(() => {
    api.getChild(childId).then(setChild)
    api.listPolicies(childId).then(p => setPolicies(p || []))
    api.getAgeRatings(childId).then(data => setAgeRatings(data?.ratings || null)).catch(() => {})
    api.listSourcesByChild("", childId).then(s => setSources(s || [])).catch(() => {})
  }, [childId])

  const createPolicy = async () => {
    if (!newPolicyName) return
    const policy = await api.createPolicy(childId, newPolicyName)
    setPolicies([...policies, policy])
    setNewPolicyName("")
  }

  const generateFromAge = async (policyId: string) => {
    await api.generateFromAge(policyId)
    const updated = await api.listPolicies(childId)
    setPolicies(updated || [])
  }

  const activatePolicy = async (policyId: string) => {
    await api.activatePolicy(policyId)
    const updated = await api.listPolicies(childId)
    setPolicies(updated || [])
  }

  const triggerEnforcement = async () => {
    await api.triggerChildEnforcement(childId)
    toast({ title: "Enforcement triggered", description: "Rules are being pushed to all connected platforms.", variant: "success" })
  }

  if (!child) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const getAge = (bd: string) => {
    const b = new Date(bd); const n = new Date()
    let a = n.getFullYear() - b.getFullYear()
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--
    return a
  }

  const tabs = ["policies", "ratings", "enforcement", "sources"] as const

  const connectedSources = sources.filter(s => s.status === "connected" || s.status === "syncing")
  const lastSourceSync = sources
    .filter(s => s.last_sync_at)
    .sort((a, b) => new Date(b.last_sync_at!).getTime() - new Date(a.last_sync_at!).getTime())[0]?.last_sync_at || null

  const timeAgo = (dateStr: string | null): string => {
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-brand-green text-xl font-bold">
            {child.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-h2 text-foreground">{child.name}</h2>
            <p className="text-muted-foreground">Age {getAge(child.birth_date)}</p>
          </div>
        </div>
        <button onClick={triggerEnforcement} className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition">
          <Gavel className="w-4 h-4" />
          Enforce All Platforms
        </button>
      </div>

      {/* Tabs */}
      <div className="relative flex border-b border-border mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`relative px-4 py-3 text-sm font-medium transition-colors ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {tab === "policies" && (
            <div>
              <div className="flex gap-3 mb-6">
                <input type="text" placeholder="New policy name" value={newPolicyName} onChange={(e) => setNewPolicyName(e.target.value)} className="rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground" />
                <button onClick={createPolicy} className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition">Create Policy</button>
              </div>
              <div className="space-y-4">
                {policies.map(policy => {
                  const statusMap: Record<string, { dot: string; text: string }> = {
                    active: { dot: "bg-success", text: "text-success" },
                    paused: { dot: "bg-warning", text: "text-warning" },
                    draft: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
                  }
                  const s = statusMap[policy.status] || statusMap.draft
                  return (
                    <div key={policy.id} className="plaid-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{policy.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`status-dot ${s.dot}`} />
                            <span className={`text-xs font-medium ${s.text}`}>{policy.status}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => generateFromAge(policy.id)} className="text-xs px-3 py-1.5 rounded-full border border-foreground text-foreground hover:bg-muted transition">Generate from Age</button>
                          {policy.status !== "active" && <button onClick={() => activatePolicy(policy.id)} className="text-xs px-3 py-1.5 rounded-full bg-success text-success-foreground hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition">Activate</button>}
                          <Link href={`/dashboard/children/${childId}/policies/${policy.id}`} className="text-xs px-3 py-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition">Edit Rules</Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === "ratings" && ageRatings && (
            <div className="plaid-card">
              <h3 className="font-medium text-foreground mb-4">Recommended Ratings for Age {getAge(child.birth_date)}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(ageRatings).map(([system, rating]) => (
                  <div key={system} className="plaid-card text-center">
                    <p className="text-xs text-muted-foreground uppercase">{system}</p>
                    <p className="text-xl font-bold text-brand-green mt-1">{rating.code}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rating.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "enforcement" && (
            <div className="plaid-card">
              <h3 className="font-medium text-foreground mb-4">Enforcement History</h3>
              <p className="text-sm text-muted-foreground">Enforcement history will appear here after triggering enforcement.</p>
            </div>
          )}

          {tab === "sources" && (
            <div>
              <div className="plaid-card mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center text-brand-green">
                      <Plug className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {connectedSources.length} source{connectedSources.length !== 1 ? "s" : ""} connected
                      </h3>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{sources.length} total configured</span>
                        {lastSourceSync && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last sync {timeAgo(lastSourceSync)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/children/${childId}/sources`}
                    className="flex items-center gap-1.5 bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
                  >
                    Manage Sources
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {sources.length === 0 ? (
                <div className="plaid-card text-center py-10">
                  <Plug className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No parental control sources connected yet. Connect apps like Bark or Qustodio to push policies automatically.
                  </p>
                  <Link
                    href={`/dashboard/children/${childId}/sources`}
                    className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
                  >
                    Add Sources
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {sources.map(source => {
                    const sStatusMap: Record<string, { dot: string; text: string; label: string }> = {
                      connected: { dot: "bg-success", text: "text-success", label: "Connected" },
                      syncing: { dot: "bg-sky-500 status-dot-pulse", text: "text-sky-500", label: "Syncing" },
                      error: { dot: "bg-destructive", text: "text-destructive", label: "Error" },
                      pending: { dot: "bg-warning", text: "text-warning", label: "Pending" },
                      disconnected: { dot: "bg-muted-foreground/50", text: "text-muted-foreground", label: "Disconnected" },
                    }
                    const ss = sStatusMap[source.status] || sStatusMap.pending
                    return (
                      <Link
                        key={source.id}
                        href={`/dashboard/children/${childId}/sources/${source.id}`}
                        className="plaid-card block hover:bg-muted/30 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                              {source.display_name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground text-sm">{source.display_name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`inline-flex items-center gap-1 text-xs ${ss.text}`}>
                                  <span className={`status-dot ${ss.dot}`} />
                                  {ss.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {source.capabilities?.length || 0} rules
                                </span>
                                {source.last_sync_at && (
                                  <span className="text-xs text-muted-foreground">
                                    synced {timeAgo(source.last_sync_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
