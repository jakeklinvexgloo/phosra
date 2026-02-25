"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Users, ShieldCheck, Activity, Plus, ArrowRight, Zap, Globe, BookOpen } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import { UsageChart } from "@/components/dashboard/UsageChart"
import type { Family, FamilyOverview } from "@/lib/types"

export default function DashboardHome() {
  const { getToken } = useApi()
  const [families, setFamilies] = useState<Family[]>([])
  const [overview, setOverview] = useState<FamilyOverview | null>(null)
  const [newFamilyName, setNewFamilyName] = useState("")
  const [showCreate, setShowCreate] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const data = await api.listFamilies(token)
      setFamilies(data || [])
      if (data && data.length > 0) {
        api.familyOverview(data[0].id, token).then(setOverview).catch(() => {})
      }
    } catch {
      // API not available — show empty state
      setFamilies([])
    }
  }, [getToken])

  useEffect(() => {
    loadData()
  }, [loadData])

  const createFamily = async () => {
    if (!newFamilyName) return
    const token = (await getToken()) ?? undefined
    const family = await api.createFamily(newFamilyName, token)
    setFamilies([...families, family])
    setNewFamilyName("")
    setShowCreate(false)
  }

  const healthStatus = {
    healthy: { label: "Healthy", dotClass: "bg-success", textClass: "text-success" },
    warning: { label: "Warning", dotClass: "bg-warning", textClass: "text-warning" },
    error: { label: "Error", dotClass: "bg-destructive", textClass: "text-destructive" },
  }

  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-h1 text-foreground">Welcome to Phosra</h1>
        <p className="text-lg text-muted-foreground mt-3 max-w-xl">
          Define parental controls once, push them everywhere. Protect your children across every platform and device.
        </p>
      </div>

      {families.length === 0 ? (
        <>
          {/* Quick-start cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Link href="/dashboard/setup" className="plaid-card block group">
              <Zap className="w-6 h-6 text-brand-green mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Quick Setup</h3>
              <p className="text-sm text-muted-foreground mb-4">Set up age-appropriate protection in under a minute.</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:gap-2 transition-all">
                Get started <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link href="/dashboard/platforms" className="plaid-card block group">
              <Globe className="w-6 h-6 text-brand-green mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Platforms</h3>
              <p className="text-sm text-muted-foreground mb-4">View regulated platforms and verify compliance status.</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:gap-2 transition-all">
                View platforms <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link href="/developers" className="plaid-card block group">
              <BookOpen className="w-6 h-6 text-brand-green mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">API Reference</h3>
              <p className="text-sm text-muted-foreground mb-4">Read the PCSS v1.0 specification and integration guide.</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:gap-2 transition-all">
                Read docs <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
          >
            <Plus className="w-4 h-4" />
            Create Family
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-h3 text-foreground">Overview</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
            >
              <Plus className="w-4 h-4" />
              New Family
            </button>
          </div>

          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="plaid-card">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-brand-green" />
                  <p className="text-sm text-muted-foreground">Children</p>
                </div>
                <p className="text-3xl font-bold tabular-nums text-foreground">{overview.children?.length || 0}</p>
              </div>

              <div className="plaid-card">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <p className="text-sm text-muted-foreground">Compliant Platforms</p>
                </div>
                <p className="text-3xl font-bold tabular-nums text-foreground">{overview.total_platforms}</p>
              </div>

              <div className="plaid-card">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-5 h-5 text-warning" />
                  <p className="text-sm text-muted-foreground">Enforcement Health</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`status-dot ${healthStatus[overview.enforcement_health]?.dotClass}`} />
                  <span className={`text-sm font-medium ${healthStatus[overview.enforcement_health]?.textClass}`}>
                    {healthStatus[overview.enforcement_health]?.label || overview.enforcement_health}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* API Usage Chart */}
          <div className="mb-8">
            <UsageChart />
          </div>

          <div className="mb-6 flex justify-end">
            <Link
              href="/dashboard/setup"
              className="flex items-center gap-2 text-sm text-foreground hover:opacity-80 font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Quick Setup Another Child
            </Link>
          </div>

          {overview?.children && overview.children.length > 0 && (
            <div className="plaid-card !p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Children</h3>
              </div>
              <div className="divide-y divide-border">
                {overview.children.map((c) => {
                  const statusMap: Record<string, { dot: string; text: string }> = {
                    completed: { dot: "bg-success", text: "text-success" },
                    failed: { dot: "bg-destructive", text: "text-destructive" },
                    partial: { dot: "bg-warning", text: "text-warning" },
                  }
                  const s = statusMap[c.enforcement_status] || { dot: "bg-muted-foreground", text: "text-muted-foreground" }
                  return (
                    <Link key={c.child.id} href={`/dashboard/children/${c.child.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition">
                      <div>
                        <p className="font-medium text-foreground">{c.child.name}</p>
                        <p className="text-sm text-muted-foreground">{c.active_policies} active {c.active_policies === 1 ? "policy" : "policies"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`status-dot ${s.dot}`} />
                        <span className={`text-xs font-medium ${s.text}`}>{c.enforcement_status}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="plaid-card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Create Family</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Family name"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                className="plaid-input"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={createFamily} className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition">Create</button>
              <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 rounded-full text-sm border border-foreground text-foreground hover:bg-muted transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
