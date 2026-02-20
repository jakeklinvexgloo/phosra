"use client"

import { Search, LayoutGrid, Table2, Download, X } from "lucide-react"
import type { OutreachContactType, OutreachStatus, EmailStatus, OutreachContact } from "@/lib/admin/types"
import { OUTREACH_STATUS_META, EMAIL_STATUS_META, CONTACT_TYPE_LABELS } from "@/lib/admin/types"

export type ViewMode = "table" | "kanban"

const ALL_TYPES: (OutreachContactType | "all")[] = ["all", "advocacy", "tech_company", "legislator", "academic", "other"]
const ALL_STATUSES: (OutreachStatus | "all")[] = ["all", "not_contacted", "draft_ready", "reached_out", "in_conversation", "partnership", "declined"]
const ALL_EMAIL_STATUSES: (EmailStatus | "all")[] = ["all", "none", "draft_ready", "emailed", "awaiting_reply", "replied", "bounced"]

interface OutreachFiltersProps {
  typeFilter: OutreachContactType | "all"
  setTypeFilter: (v: OutreachContactType | "all") => void
  statusFilter: OutreachStatus | "all"
  setStatusFilter: (v: OutreachStatus | "all") => void
  emailStatusFilter: EmailStatus | "all"
  setEmailStatusFilter: (v: EmailStatus | "all") => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  activeTags: string[]
  onTagRemove: (tag: string) => void
  onClearTags: () => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  filteredContacts: OutreachContact[]
}

function exportCSV(contacts: OutreachContact[]) {
  const headers = ["Name", "Org", "Title", "Email", "Type", "Status", "Email Status", "Priority", "Relevance", "Tags", "Last Contact", "Next Follow-up", "Notes"]
  const rows = contacts.map((c) => [
    c.name, c.org, c.title, c.email || "", c.contact_type, c.status, c.email_status,
    String(c.priority_tier), c.relevance_score != null ? String(c.relevance_score) : "",
    (c.tags || []).join("; "), c.last_contact_at || "", c.next_followup_at || "", c.notes || "",
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `outreach-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function OutreachFilters({
  typeFilter, setTypeFilter,
  statusFilter, setStatusFilter,
  emailStatusFilter, setEmailStatusFilter,
  searchQuery, setSearchQuery,
  activeTags, onTagRemove, onClearTags,
  viewMode, setViewMode,
  filteredContacts,
}: OutreachFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Type pills */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              typeFilter === t
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "all" ? "All Types" : CONTACT_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-foreground/10 text-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "all" ? "All Statuses" : OUTREACH_STATUS_META[s].label}
          </button>
        ))}
      </div>

      {/* Email status pills */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider self-center mr-1">Email:</span>
        {ALL_EMAIL_STATUSES.map((es) => (
          <button
            key={es}
            onClick={() => setEmailStatusFilter(es)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              emailStatusFilter === es
                ? "bg-foreground/10 text-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {es === "all" ? "All" : EMAIL_STATUS_META[es].label}
          </button>
        ))}
      </div>

      {/* Active tag chips */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mr-1">Tags:</span>
          {activeTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 bg-foreground/10 text-foreground text-xs px-2.5 py-1 rounded-full">
              {tag}
              <button onClick={() => onTagRemove(tag)} className="hover:opacity-70 transition">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button onClick={onClearTags} className="text-xs text-muted-foreground hover:text-foreground transition">
            Clear all
          </button>
        </div>
      )}

      {/* Search + view toggle + CSV */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="plaid-input pl-9"
          />
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 transition-colors ${viewMode === "table" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            title="Table view"
          >
            <Table2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-2 transition-colors ${viewMode === "kanban" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            title="Kanban view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => exportCSV(filteredContacts)}
          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Export CSV"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
