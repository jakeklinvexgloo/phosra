"use client"

import { useCallback, useEffect, useState } from "react"
import { Search, Users, RefreshCw, Download, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { GoogleConnectionStatus, GoogleContact, ContactSyncPreview, ContactSyncResult } from "@/lib/admin/types"

export default function ContactSyncPage() {
  const { getToken } = useApi()
  const [status, setStatus] = useState<GoogleConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState<GoogleContact[]>([])
  const [totalPeople, setTotalPeople] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<GoogleContact[] | null>(null)

  // Sync state
  const [syncPreview, setSyncPreview] = useState<ContactSyncPreview | null>(null)
  const [syncResult, setSyncResult] = useState<ContactSyncResult | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const checkConnection = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const s = await api.getGoogleStatus(token)
      setStatus(s)
      return s.connected
    } catch {
      setStatus({ connected: false, email: "", scopes: [] })
      return false
    }
  }, [getToken])

  const fetchContacts = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const result = await api.listGoogleContacts(undefined, 200, token)
      setContacts(result.contacts || [])
      setTotalPeople(result.total_people)
    } catch {
      // Handle error
    }
  }, [getToken])

  useEffect(() => {
    async function init() {
      const connected = await checkConnection()
      if (connected) {
        await fetchContacts()
      }
      setLoading(false)
    }
    init()
  }, [checkConnection, fetchContacts])

  const handleSearch = async () => {
    if (!searchQuery) {
      setSearchResults(null)
      return
    }
    try {
      const token = (await getToken()) ?? undefined
      const results = await api.searchGoogleContacts(searchQuery, token)
      setSearchResults(results)
    } catch {
      setSearchResults([])
    }
  }

  const handlePreview = async () => {
    setPreviewing(true)
    setSyncPreview(null)
    setSyncResult(null)
    try {
      const token = (await getToken()) ?? undefined
      const preview = await api.syncContactsPreview(token)
      setSyncPreview(preview)
    } catch {
      // Handle error
    } finally {
      setPreviewing(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const token = (await getToken()) ?? undefined
      const result = await api.syncContacts(token)
      setSyncResult(result)
      setSyncPreview(null)
    } catch {
      // Handle error
    } finally {
      setSyncing(false)
    }
  }

  const handleConnect = async () => {
    try {
      const token = (await getToken()) ?? undefined
      const result = await api.getGoogleAuthURL(token)
      window.location.href = result.url
    } catch {
      // Handle error
    }
  }

  const displayContacts = searchResults !== null ? searchResults : contacts

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground text-sm animate-pulse">Loading contacts...</div>
  }

  // Not connected
  if (!status?.connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Google Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect Google to sync contacts into your outreach pipeline.</p>
        </div>
        <div className="plaid-card text-center py-12 max-w-md mx-auto">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Connect Google</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Link your Google account to import contacts into the outreach pipeline.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Users className="w-4 h-4" />
            Connect Google Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Google Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {status.email} &middot; {totalPeople} contacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            disabled={previewing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            {previewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Preview Sync
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Sync Now
          </button>
        </div>
      </div>

      {/* Sync Preview */}
      {syncPreview && (
        <div className="plaid-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">Sync Preview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-brand-green tabular-nums">{syncPreview.to_create.length}</div>
              <div className="text-xs text-muted-foreground">New contacts to create</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-500 tabular-nums">{syncPreview.to_update.length}</div>
              <div className="text-xs text-muted-foreground">Existing matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-muted-foreground tabular-nums">{syncPreview.skipped}</div>
              <div className="text-xs text-muted-foreground">Skipped (no name/email)</div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              Execute Sync
            </button>
          </div>
        </div>
      )}

      {/* Sync Result */}
      {syncResult && (
        <div className="plaid-card border-brand-green/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-brand-green" />
            <h3 className="text-sm font-semibold text-foreground">Sync Complete</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {syncResult.created} created, {syncResult.updated} matched, {syncResult.skipped} skipped out of {syncResult.total} total contacts.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="plaid-input pl-9"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
        >
          Search
        </button>
        {searchResults !== null && (
          <button
            onClick={() => { setSearchResults(null); setSearchQuery("") }}
            className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Contacts Table */}
      {displayContacts.length === 0 ? (
        <div className="plaid-card text-center py-12">
          <p className="text-muted-foreground text-sm">
            {searchResults !== null ? "No contacts match your search." : "No contacts found in your Google account."}
          </p>
        </div>
      ) : (
        <div className="plaid-card p-0 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 px-5 py-2.5 border-b border-border text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
            <div>Name</div>
            <div>Email</div>
            <div>Organization</div>
            <div>Phone</div>
          </div>

          <div className="divide-y divide-border">
            {displayContacts.map((contact, i) => (
              <div key={contact.resource_name || i} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 px-5 py-3 items-center hover:bg-muted/30 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{contact.name || "—"}</div>
                  {contact.title && <div className="text-xs text-muted-foreground truncate">{contact.title}</div>}
                </div>
                <div className="text-sm text-muted-foreground truncate">{contact.email || "—"}</div>
                <div className="text-sm text-muted-foreground truncate">{contact.org || "—"}</div>
                <div className="text-sm text-muted-foreground truncate">{contact.phone || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
