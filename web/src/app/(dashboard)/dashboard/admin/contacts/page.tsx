"use client"

import { useCallback, useEffect, useState } from "react"
import { Users, RefreshCw, Download, ArrowRight, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { GoogleConnectionStatus, GoogleContact, ContactSyncPreview, ContactSyncResult } from "@/lib/admin/types"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { EmptyState } from "@/components/ui/empty-state"
import {
  DataTable,
  DataTableHeader,
  DataTableRow,
  DataTableEmpty,
  DataTableFooter,
  useDataTable,
  type ColumnDef,
} from "@/components/ui/data-table"

const columns: ColumnDef<GoogleContact>[] = [
  {
    id: "name",
    accessor: "name",
    header: "Name",
    sortable: true,
    cell: (_, row) => (
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{row.name || "—"}</div>
        {row.title && <div className="text-xs text-muted-foreground truncate">{row.title}</div>}
      </div>
    ),
  },
  {
    id: "email",
    accessor: "email",
    header: "Email",
    sortable: true,
    cell: (v) => <span className="text-sm text-muted-foreground truncate">{(v as string) || "—"}</span>,
  },
  {
    id: "org",
    accessor: "org",
    header: "Organization",
    sortable: true,
    cell: (v) => <span className="text-sm text-muted-foreground truncate">{(v as string) || "—"}</span>,
  },
  {
    id: "phone",
    accessor: "phone",
    header: "Phone",
    cell: (v) => <span className="text-sm text-muted-foreground truncate">{(v as string) || "—"}</span>,
  },
]

export default function ContactSyncPage() {
  const { getToken } = useApi()
  const [status, setStatus] = useState<GoogleConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState<GoogleContact[]>([])
  const [totalPeople, setTotalPeople] = useState(0)
  const [searchResults, setSearchResults] = useState<GoogleContact[] | null>(null)

  // Sync state
  const [syncPreview, setSyncPreview] = useState<ContactSyncPreview | null>(null)
  const [syncResult, setSyncResult] = useState<ContactSyncResult | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const displayContacts = searchResults !== null ? searchResults : contacts

  const { rows, sort, toggleSort, search, setSearch } = useDataTable({
    data: displayContacts,
    columns,
    initialSort: { key: "name", direction: "asc" },
    searchKeys: ["name", "email", "org", "phone"],
  })

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
    if (!search) {
      setSearchResults(null)
      return
    }
    try {
      const token = (await getToken()) ?? undefined
      const results = await api.searchGoogleContacts(search, token)
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

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground text-sm animate-pulse">Loading contacts...</div>
  }

  // Not connected
  if (!status?.connected) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Google Contacts"
          description="Connect Google to sync contacts into your outreach pipeline."
        />
        <EmptyState
          icon={Users}
          title="Connect Google"
          description="Link your Google account to import contacts into the outreach pipeline."
          action={
            <Button onClick={handleConnect}>
              <Users className="w-4 h-4" />
              Connect Google Account
            </Button>
          }
          className="plaid-card max-w-md mx-auto"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Google Contacts"
        description={`${status.email} \u00b7 ${totalPeople} contacts`}
        actions={
          <>
            <Button variant="secondary" onClick={handlePreview} loading={previewing}>
              <RefreshCw className="w-3.5 h-3.5" />
              Preview Sync
            </Button>
            <Button onClick={handleSync} loading={syncing}>
              <Download className="w-3.5 h-3.5" />
              Sync Now
            </Button>
          </>
        }
      />

      {/* Sync Preview */}
      {syncPreview && (
        <div className="plaid-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">Sync Preview</h3>
          <div className="grid grid-cols-3 gap-4">
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
            <Button onClick={handleSync} loading={syncing}>
              <ArrowRight className="w-3.5 h-3.5" />
              Execute Sync
            </Button>
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
      <div className="flex gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearchResults(null)}
          placeholder="Search contacts..."
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button variant="secondary" onClick={handleSearch}>
          Search
        </Button>
        {searchResults !== null && (
          <Button
            variant="ghost"
            onClick={() => { setSearchResults(null); setSearch("") }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Contacts Table */}
      <DataTable>
        <DataTableHeader columns={columns} sort={sort} onSort={toggleSort} />
        <tbody>
          {rows.length === 0 ? (
            <DataTableEmpty
              icon={Users}
              description={searchResults !== null ? "No contacts match your search." : "No contacts found in your Google account."}
              colSpan={columns.length}
            />
          ) : (
            rows.map((contact, i) => (
              <DataTableRow
                key={contact.resource_name || i}
                row={contact}
                columns={columns}
              />
            ))
          )}
        </tbody>
      </DataTable>

      {rows.length > 0 && (
        <DataTableFooter showing={rows.length} total={displayContacts.length} />
      )}
    </div>
  )
}
