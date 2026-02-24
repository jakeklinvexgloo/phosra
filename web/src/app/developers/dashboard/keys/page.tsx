"use client"

import { useCallback, useEffect, useState } from "react"
import { Key, Plus, Copy, Check, AlertTriangle, Trash2, Shield } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { DeveloperOrg, DeveloperAPIKey, DeveloperAPIKeyWithSecret } from "@/lib/types"
import { API_SCOPES } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

const SCOPE_GROUPS: { label: string; scopes: typeof API_SCOPES[number][] }[] = [
  {
    label: "Read",
    scopes: ["read:families", "read:policies", "read:enforcement", "read:ratings", "read:platforms"],
  },
  {
    label: "Write",
    scopes: ["write:families", "write:policies", "write:enforcement", "write:compliance"],
  },
  {
    label: "Manage",
    scopes: ["device:manage", "webhook:manage"],
  },
]

export default function ApiKeysPage() {
  const { getToken } = useApi()
  const [org, setOrg] = useState<DeveloperOrg | null>(null)
  const [keys, setKeys] = useState<DeveloperAPIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create key form
  const [showCreate, setShowCreate] = useState(false)
  const [keyName, setKeyName] = useState("")
  const [keyEnv, setKeyEnv] = useState<"live" | "test">("test")
  const [keyScopes, setKeyScopes] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)

  // Newly created key (shown once)
  const [newKey, setNewKey] = useState<DeveloperAPIKeyWithSecret | null>(null)
  const [keyCopied, setKeyCopied] = useState(false)

  // Revoke confirmation
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      if (!token) return
      const orgs = await api.listDeveloperOrgs(token)
      if (orgs && orgs.length > 0) {
        setOrg(orgs[0])
        const orgKeys = await api.listDeveloperKeys(token, orgs[0].id)
        setKeys(orgKeys || [])
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load keys"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleScope = (scope: string) => {
    const next = new Set(keyScopes)
    if (next.has(scope)) {
      next.delete(scope)
    } else {
      next.add(scope)
    }
    setKeyScopes(next)
  }

  const toggleGroupScopes = (scopes: string[]) => {
    const allSelected = scopes.every((s) => keyScopes.has(s))
    const next = new Set(keyScopes)
    if (allSelected) {
      scopes.forEach((s) => next.delete(s))
    } else {
      scopes.forEach((s) => next.add(s))
    }
    setKeyScopes(next)
  }

  const handleCreateKey = async () => {
    if (!org || !keyName.trim() || keyScopes.size === 0) return
    setCreating(true)
    try {
      const token = (await getToken()) ?? undefined
      if (!token) return
      const created = await api.createDeveloperKey(token, org.id, {
        name: keyName.trim(),
        environment: keyEnv,
        scopes: Array.from(keyScopes),
      })
      setNewKey(created)
      setKeys((prev) => [created, ...prev])
      setShowCreate(false)
      setKeyName("")
      setKeyEnv("test")
      setKeyScopes(new Set())
      toast({ title: "API key created", variant: "success" })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create key"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const handleCopyKey = () => {
    if (!newKey) return
    navigator.clipboard.writeText(newKey.key)
    setKeyCopied(true)
    toast({ title: "API key copied", variant: "success" })
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!org) return
    try {
      const token = (await getToken()) ?? undefined
      if (!token) return
      await api.revokeDeveloperKey(token, org.id, keyId)
      setKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, revoked_at: new Date().toISOString() } : k))
      )
      setRevokeTarget(null)
      toast({ title: "API key revoked", variant: "success" })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to revoke key"
      toast({ title: "Error", description: message, variant: "destructive" })
    }
  }

  const activeKeys = keys.filter((k) => !k.revoked_at)
  const revokedKeys = keys.filter((k) => k.revoked_at)

  const formatDate = (d: string | null) => {
    if (!d) return "--"
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const formatRelative = (d: string | null) => {
    if (!d) return "Never"
    const diff = Date.now() - new Date(d).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">Loading API keys...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); fetchData() }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-muted-foreground">
          You need to create a developer organization first.
        </p>
        <a
          href="/developers/dashboard"
          className="text-sm text-foreground underline hover:no-underline"
        >
          Go to Developer Portal
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage API keys for {org.name}
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
          >
            <Plus className="w-4 h-4" />
            Create Key
          </button>
        )}
      </div>

      {/* Newly created key banner */}
      {newKey && (
        <div className="plaid-card border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Save your API key</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                This key will only be shown once. Copy it now and store it securely.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3">
            <code className="flex-1 text-sm font-mono text-foreground break-all">
              {newKey.key}
            </code>
            <button
              onClick={handleCopyKey}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Copy"
            >
              {keyCopied ? (
                <Check className="w-4 h-4 text-brand-green" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setNewKey(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create key form */}
      {showCreate && (
        <div className="plaid-card">
          <h3 className="text-base font-medium text-foreground mb-4">Create API Key</h3>
          <div className="space-y-5">
            {/* Key name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Key Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. Production Backend"
                className="plaid-input"
              />
            </div>

            {/* Environment toggle */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Environment</label>
              <div className="flex items-center gap-1 bg-muted rounded-full p-0.5 w-fit">
                <button
                  onClick={() => setKeyEnv("live")}
                  className={`text-xs px-4 py-1.5 rounded-full font-medium transition-colors ${
                    keyEnv === "live"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Live
                </button>
                <button
                  onClick={() => setKeyEnv("test")}
                  className={`text-xs px-4 py-1.5 rounded-full font-medium transition-colors ${
                    keyEnv === "test"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Test
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {keyEnv === "live"
                  ? "Live keys have access to production data."
                  : "Test keys work with sandbox data only."}
              </p>
            </div>

            {/* Scopes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Scopes <span className="text-destructive">*</span>
              </label>
              <div className="space-y-4">
                {SCOPE_GROUPS.map((group) => {
                  const allSelected = group.scopes.every((s) => keyScopes.has(s))
                  return (
                    <div key={group.label}>
                      <button
                        type="button"
                        onClick={() => toggleGroupScopes(group.scopes)}
                        className="flex items-center gap-2 mb-1.5"
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center ${
                            allSelected
                              ? "bg-foreground border-foreground"
                              : "border-border"
                          }`}
                        >
                          {allSelected && <Check className="w-2.5 h-2.5 text-background" />}
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {group.label}
                        </span>
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-5">
                        {group.scopes.map((scope) => (
                          <label
                            key={scope}
                            className="flex items-center gap-2 cursor-pointer group/scope"
                          >
                            <div
                              onClick={() => toggleScope(scope)}
                              className={`w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center cursor-pointer ${
                                keyScopes.has(scope)
                                  ? "bg-foreground border-foreground"
                                  : "border-border group-hover/scope:border-foreground/40"
                              }`}
                            >
                              {keyScopes.has(scope) && (
                                <Check className="w-2.5 h-2.5 text-background" />
                              )}
                            </div>
                            <span className="text-sm text-foreground font-mono">{scope}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreateKey}
              disabled={!keyName.trim() || keyScopes.size === 0 || creating}
              className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create Key"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setKeyName(""); setKeyEnv("test"); setKeyScopes(new Set()) }}
              className="px-5 py-2.5 rounded-full text-sm border border-foreground text-foreground hover:bg-muted transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active keys */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Active Keys ({activeKeys.length})
        </h2>
        {activeKeys.length === 0 ? (
          <div className="plaid-card text-center py-8">
            <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active API keys</p>
            <p className="text-xs text-muted-foreground mt-1">Create a key to start using the API</p>
          </div>
        ) : (
          <div className="plaid-card p-0 divide-y divide-border">
            {activeKeys.map((k) => (
              <div
                key={k.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-shrink-0">
                  <Key className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{k.name}</span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        k.environment === "live"
                          ? "bg-brand-green/10 text-brand-green"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {k.environment}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <code className="text-xs font-mono text-muted-foreground">
                      {k.key_prefix}...
                    </code>
                    <span className="text-xs text-muted-foreground">
                      {k.scopes.length} scope{k.scopes.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-muted-foreground">
                    Last used: {formatRelative(k.last_used_at)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(k.created_at)}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {revokeTarget === k.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="text-xs text-destructive font-medium hover:underline"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setRevokeTarget(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRevokeTarget(k.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      title="Revoke key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Revoked Keys ({revokedKeys.length})
          </h2>
          <div className="plaid-card p-0 divide-y divide-border opacity-60">
            {revokedKeys.map((k) => (
              <div key={k.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-shrink-0">
                  <Key className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground line-through">
                      {k.name}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      revoked
                    </span>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground mt-0.5 block">
                    {k.key_prefix}...
                  </code>
                </div>
                <div className="text-right text-xs text-muted-foreground hidden sm:block">
                  Revoked: {formatDate(k.revoked_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
