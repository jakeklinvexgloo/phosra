"use client"

import { X } from "lucide-react"
import type { OutreachStatus, EmailStatus } from "@/lib/admin/types"
import { OUTREACH_STATUS_META, EMAIL_STATUS_META } from "@/lib/admin/types"

const ALL_STATUSES: OutreachStatus[] = ["not_contacted", "draft_ready", "reached_out", "in_conversation", "partnership", "declined"]
const ALL_EMAIL_STATUSES: EmailStatus[] = ["none", "draft_ready", "emailed", "awaiting_reply", "replied", "bounced"]

interface BulkActionsProps {
  selectedCount: number
  onBulkStatusUpdate: (status: OutreachStatus) => void
  onBulkEmailStatusUpdate: (emailStatus: EmailStatus) => void
  onClear: () => void
  updating: boolean
}

export function BulkActions({ selectedCount, onBulkStatusUpdate, onBulkEmailStatusUpdate, onClear, updating }: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-xl shadow-lg">
        <span className="text-sm font-medium tabular-nums">{selectedCount} selected</span>
        <div className="w-px h-5 bg-background/20" />
        <select
          onChange={(e) => {
            if (e.target.value) onBulkStatusUpdate(e.target.value as OutreachStatus)
            e.target.value = ""
          }}
          disabled={updating}
          className="text-xs bg-background/10 text-background border-0 rounded-lg px-2 py-1.5 cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>Set status...</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{OUTREACH_STATUS_META[s].label}</option>
          ))}
        </select>
        <select
          onChange={(e) => {
            if (e.target.value) onBulkEmailStatusUpdate(e.target.value as EmailStatus)
            e.target.value = ""
          }}
          disabled={updating}
          className="text-xs bg-background/10 text-background border-0 rounded-lg px-2 py-1.5 cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>Set email...</option>
          {ALL_EMAIL_STATUSES.map((s) => (
            <option key={s} value={s}>{EMAIL_STATUS_META[s].label}</option>
          ))}
        </select>
        <button
          onClick={onClear}
          className="p-1 rounded-md hover:bg-background/10 transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
