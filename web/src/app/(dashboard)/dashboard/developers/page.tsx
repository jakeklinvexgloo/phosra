"use client"

import Link from "next/link"
import { Code2, Key, BarChart3, ArrowRight, BookOpen, Play } from "lucide-react"
import { useDevOrg } from "@/contexts/dev-org-context"

export default function DeveloperPortalPage() {
  const { org, keys } = useDevOrg()

  const activeKeys = keys.filter((k) => !k.revoked_at)
  const tierLabel = org?.tier ? org.tier.charAt(0).toUpperCase() + org.tier.slice(1) : ""

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Developer Portal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your API keys, monitor usage, and explore the documentation
        </p>
      </div>

      {/* Org details + stats (only when loaded) */}
      {org && (
        <>
          <div className="plaid-card">
            <div className="flex items-start justify-between mb-4">
              <h3 className="section-header">Organization</h3>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-foreground">
                {tierLabel}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-0.5">Name</label>
                <p className="text-sm font-medium text-foreground">{org.name}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-0.5">Slug</label>
                <p className="text-sm font-mono text-foreground">{org.slug}</p>
              </div>
              {org.description && (
                <div className="sm:col-span-2">
                  <label className="block text-xs text-muted-foreground mb-0.5">Description</label>
                  <p className="text-sm text-foreground">{org.description}</p>
                </div>
              )}
              <div>
                <label className="block text-xs text-muted-foreground mb-0.5">Rate Limit</label>
                <p className="text-sm text-foreground">{org.rate_limit_rpm.toLocaleString()} requests/min</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-0.5">Created</label>
                <p className="text-sm text-foreground">
                  {new Date(org.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="plaid-card">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Total Keys</span>
              </div>
              <div className="text-2xl font-semibold tabular-nums">{keys.length}</div>
            </div>
            <div className="plaid-card">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-md bg-brand-green/10">
                  <Key className="w-3.5 h-3.5 text-brand-green" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Active Keys</span>
              </div>
              <div className="text-2xl font-semibold tabular-nums">{activeKeys.length}</div>
            </div>
            <div className="plaid-card">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Requests Today</span>
              </div>
              <div className="text-2xl font-semibold tabular-nums">--</div>
              <div className="text-xs text-muted-foreground mt-0.5">View usage for details</div>
            </div>
          </div>
        </>
      )}

      {/* Quick actions — always visible */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/dashboard/developers/keys"
            className="plaid-card flex items-center gap-3 hover:border-foreground/20 transition-colors group"
          >
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
              <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Manage API Keys</div>
              <div className="text-xs text-muted-foreground">Create, view, and revoke keys</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </Link>
          <Link
            href="/dashboard/developers/usage"
            className="plaid-card flex items-center gap-3 hover:border-foreground/20 transition-colors group"
          >
            <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">View Usage</div>
              <div className="text-xs text-muted-foreground">Monitor API requests and analytics</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </Link>
        </div>
      </div>

      {/* Developer resources — always visible */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Developer Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/developers"
            className="plaid-card flex items-center gap-3 hover:border-foreground/20 transition-colors group"
          >
            <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">API Docs</div>
              <div className="text-xs text-muted-foreground">Guides, reference, and recipes</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </Link>
          <Link
            href="/developers/playground"
            className="plaid-card flex items-center gap-3 hover:border-foreground/20 transition-colors group"
          >
            <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30">
              <Play className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Playground</div>
              <div className="text-xs text-muted-foreground">Interactive MCP sandbox</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </Link>
          <Link
            href="/developers/quickstart"
            className="plaid-card flex items-center gap-3 hover:border-foreground/20 transition-colors group"
          >
            <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900/30">
              <Code2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Quickstart</div>
              <div className="text-xs text-muted-foreground">Get up and running in minutes</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}
