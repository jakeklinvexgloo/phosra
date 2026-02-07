"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Gavel } from "lucide-react"
import { api } from "@/lib/api"
import type { Child, ChildPolicy, Rating } from "@/lib/types"

export default function ChildDetailPage() {
  const params = useParams()
  const childId = params.childId as string
  const [child, setChild] = useState<Child | null>(null)
  const [policies, setPolicies] = useState<ChildPolicy[]>([])
  const [ageRatings, setAgeRatings] = useState<Record<string, Rating> | null>(null)
  const [tab, setTab] = useState<"policies" | "ratings" | "enforcement">("policies")
  const [newPolicyName, setNewPolicyName] = useState("")

  useEffect(() => {
    api.getChild(childId).then(setChild)
    api.listPolicies(childId).then(p => setPolicies(p || []))
    api.getAgeRatings(childId).then(data => setAgeRatings(data?.ratings || null)).catch(() => {})
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
    alert("Enforcement triggered!")
  }

  if (!child) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const getAge = (bd: string) => {
    const b = new Date(bd); const n = new Date()
    let a = n.getFullYear() - b.getFullYear()
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--
    return a
  }

  const tabs = ["policies", "ratings", "enforcement"] as const

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {child.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{child.name}</h2>
            <p className="text-muted-foreground">Age {getAge(child.birth_date)}</p>
          </div>
        </div>
        <button onClick={triggerEnforcement} className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/25">
          <Gavel className="w-4 h-4" />
          Enforce All Platforms
        </button>
      </div>

      {/* Tabs with sliding pill indicator */}
      <div className="relative flex border-b border-border mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`relative px-4 py-3 text-sm font-medium transition-colors ${tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <motion.div
          className="absolute bottom-0 h-0.5 bg-primary rounded-full"
          layoutId="child-tab-indicator"
          animate={{
            left: `${tabs.indexOf(tab) * (100 / tabs.length)}%`,
            width: `${100 / tabs.length}%`,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {tab === "policies" && (
            <div>
              <div className="flex gap-3 mb-6">
                <input type="text" placeholder="New policy name" value={newPolicyName} onChange={(e) => setNewPolicyName(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground" />
                <button onClick={createPolicy} className="gradient-primary text-white px-4 py-2 rounded-lg text-sm">Create Policy</button>
              </div>
              <div className="space-y-4">
                {policies.map(policy => {
                  const statusMap: Record<string, { dot: string; text: string; bg: string }> = {
                    active: { dot: "bg-success", text: "text-success", bg: "bg-success/10" },
                    paused: { dot: "bg-warning", text: "text-warning", bg: "bg-warning/10" },
                    draft: { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted" },
                  }
                  const s = statusMap[policy.status] || statusMap.draft
                  return (
                    <motion.div
                      key={policy.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-xl shadow-sm border border-border/50 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{policy.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`status-dot ${s.dot}`} />
                            <span className={`text-xs font-medium ${s.text}`}>{policy.status}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => generateFromAge(policy.id)} className="text-xs px-3 py-1.5 rounded border border-border text-foreground hover:bg-muted/50 transition">Generate from Age</button>
                          {policy.status !== "active" && <button onClick={() => activatePolicy(policy.id)} className="text-xs px-3 py-1.5 rounded bg-success text-success-foreground hover:opacity-90 transition">Activate</button>}
                          <Link href={`/dashboard/children/${childId}/policies/${policy.id}`} className="text-xs px-3 py-1.5 rounded gradient-primary text-white">Edit Rules</Link>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === "ratings" && ageRatings && (
            <div className="bg-card rounded-xl shadow-sm border border-border/50 p-6">
              <h3 className="font-medium text-foreground mb-4">Recommended Ratings for Age {getAge(child.birth_date)}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(ageRatings).map(([system, rating]) => (
                  <div key={system} className="border border-border rounded-lg p-4 text-center bg-muted/30">
                    <p className="text-xs text-muted-foreground uppercase">{system}</p>
                    <p className="text-xl font-bold text-primary mt-1">{rating.code}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rating.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "enforcement" && (
            <div className="bg-card rounded-xl shadow-sm border border-border/50 p-6">
              <h3 className="font-medium text-foreground mb-4">Enforcement History</h3>
              <p className="text-sm text-muted-foreground">Enforcement history will appear here after triggering enforcement.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
