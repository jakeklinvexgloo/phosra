"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Users, Globe, Activity, ChevronRight, ArrowRight } from "lucide-react"

// Mock demo data
const MOCK_STATS = [
  { label: "Children", value: "3", icon: Users, color: "text-brand-green" },
  { label: "Platforms", value: "5", icon: Globe, color: "text-accent-teal" },
  { label: "Policies", value: "12", icon: Shield, color: "text-accent-purple" },
  { label: "Enforced", value: "48", icon: Activity, color: "text-success" },
]

const MOCK_CHILDREN = [
  {
    id: "demo-1",
    name: "Emma",
    age: 12,
    platforms: ["NextDNS", "YouTube", "Netflix"],
    policiesActive: 4,
    lastSync: "2 min ago",
  },
  {
    id: "demo-2",
    name: "Liam",
    age: 8,
    platforms: ["CleanBrowsing", "Disney+", "Roblox"],
    policiesActive: 6,
    lastSync: "5 min ago",
  },
  {
    id: "demo-3",
    name: "Sophia",
    age: 15,
    platforms: ["NextDNS", "Instagram", "Spotify"],
    policiesActive: 3,
    lastSync: "12 min ago",
  },
]

const MOCK_POLICIES = [
  { category: "Web Filtering", rule: "Block adult content", status: "enforced", children: ["Emma", "Liam", "Sophia"] },
  { category: "Time Limits", rule: "2hr daily limit on social media", status: "enforced", children: ["Sophia"] },
  { category: "Content Rating", rule: "Max PG-13 for streaming", status: "enforced", children: ["Liam"] },
  { category: "Safe Search", rule: "Force safe search on all engines", status: "enforced", children: ["Emma", "Liam"] },
  { category: "App Control", rule: "Block Roblox marketplace", status: "pending", children: ["Liam"] },
  { category: "Purchase Control", rule: "Require approval for in-app purchases", status: "enforced", children: ["Emma", "Liam"] },
]

const statusStyles: Record<string, { bg: string; text: string }> = {
  enforced: { bg: "bg-success/10", text: "text-success" },
  pending: { bg: "bg-warning/10", text: "text-warning" },
}

export default function DemoPage() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null)

  return (
    <div>
      {/* Dashboard header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Welcome back, Demo User</h1>
        <p className="text-muted-foreground text-sm">
          This is a preview of the Phosra dashboard with sample data.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {MOCK_STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="plaid-card">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-3xl font-semibold text-foreground tabular-nums">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Children list */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Children</h2>
        <div className="space-y-3">
          {MOCK_CHILDREN.map((child) => (
            <div
              key={child.id}
              className={`plaid-card cursor-pointer transition-all ${
                selectedChild === child.id ? "ring-2 ring-brand-green" : ""
              }`}
              onClick={() => setSelectedChild(selectedChild === child.id ? null : child.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-brand-green text-sm font-semibold">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{child.name}</p>
                    <p className="text-xs text-muted-foreground">Age {child.age} &middot; {child.policiesActive} active policies</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5">
                    {child.platforms.map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-muted text-xs text-muted-foreground rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    {child.lastSync}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                    selectedChild === child.id ? "rotate-90" : ""
                  }`} />
                </div>
              </div>

              {/* Expanded view */}
              {selectedChild === child.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Connected Platforms</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {child.platforms.map((p) => (
                      <span key={p} className="px-3 py-1.5 bg-accent/10 text-brand-green text-xs font-medium rounded-full">
                        {p}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In the real dashboard, you can manage policies, view enforcement status, and configure platform-specific rules for each child.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active policies */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Policies</h2>
        <div className="plaid-card !p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rule</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Applies To</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_POLICIES.map((policy, i) => {
                const style = statusStyles[policy.status]
                return (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{policy.category}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{policy.rule}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {policy.children.join(", ")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-8 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-2">Ready to protect your family?</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Create a free account to set up real policies and connect your platforms.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-brand-green text-foreground px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)]"
        >
          Create Free Account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
