"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Users, ShieldCheck, Activity, Plus } from "lucide-react"
import { api } from "@/lib/api"
import type { Family, FamilyOverview } from "@/lib/types"

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const cardItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export default function DashboardHome() {
  const [families, setFamilies] = useState<Family[]>([])
  const [overview, setOverview] = useState<FamilyOverview | null>(null)
  const [newFamilyName, setNewFamilyName] = useState("")
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    api.listFamilies().then((data) => {
      setFamilies(data || [])
      if (data && data.length > 0) {
        api.familyOverview(data[0].id).then(setOverview).catch(() => {})
      }
    })
  }, [])

  const createFamily = async () => {
    if (!newFamilyName) return
    const family = await api.createFamily(newFamilyName)
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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          New Family
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-sm border border-border/50 p-6 mb-6"
        >
          <h3 className="text-lg font-medium text-foreground mb-4">Create Family</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Family name"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
            <button onClick={createFamily} className="gradient-primary text-white px-4 py-2 rounded-lg text-sm">Create</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm border border-border text-foreground hover:bg-muted/50">Cancel</button>
          </div>
        </motion.div>
      )}

      {families.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-card rounded-xl shadow-sm border border-border/50 p-10 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Set Up Your First Child</h3>
            <p className="text-muted-foreground mb-6">
              Protect your child across every platform in under a minute. Our guided setup creates age-appropriate rules automatically.
            </p>
            <Link
              href="/dashboard/setup"
              className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4" />
              Quick Setup
            </Link>
          </div>
        </div>
      ) : (
        <>
          {overview && (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <motion.div variants={cardItem} className="bg-card rounded-xl shadow-sm border border-border/50 p-6 gradient-card-children card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">Children</p>
                </div>
                <p className="text-4xl font-bold tabular-nums text-foreground">{overview.children?.length || 0}</p>
              </motion.div>

              <motion.div variants={cardItem} className="bg-card rounded-xl shadow-sm border border-border/50 p-6 gradient-card-providers card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">Compliant Platforms</p>
                </div>
                <p className="text-4xl font-bold tabular-nums text-foreground">{overview.total_platforms}</p>
              </motion.div>

              <motion.div variants={cardItem} className="bg-card rounded-xl shadow-sm border border-border/50 p-6 gradient-card-health card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">Enforcement Health</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`status-dot ${healthStatus[overview.enforcement_health]?.dotClass}`} />
                  <span className={`text-sm font-medium ${healthStatus[overview.enforcement_health]?.textClass}`}>
                    {healthStatus[overview.enforcement_health]?.label || overview.enforcement_health}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}

          <div className="mb-6 flex justify-end">
            <Link
              href="/dashboard/setup"
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Quick Setup Another Child
            </Link>
          </div>

          {overview?.children && overview.children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl shadow-sm border border-border/50"
            >
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-medium text-foreground">Children</h3>
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
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
