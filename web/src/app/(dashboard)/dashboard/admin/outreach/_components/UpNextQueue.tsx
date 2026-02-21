"use client"

import { ChevronRight } from "lucide-react"
import type { OutreachContact } from "@/lib/admin/types"

const PRIORITY_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  3: "bg-muted text-muted-foreground",
}
const PRIORITY_LABELS: Record<number, string> = { 1: "P1", 2: "P2", 3: "P3" }

interface UpNextQueueProps {
  contacts: OutreachContact[]
  open: boolean
  onToggle: () => void
}

export function UpNextQueue({ contacts, open, onToggle }: UpNextQueueProps) {
  return (
    <div className="plaid-card p-0 overflow-hidden">
      {/* Header — always visible, clickable */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
          <span className="text-sm font-semibold">Queue</span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full tabular-nums">
            {contacts.length}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t divide-y divide-border">
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No contacts queued.</p>
          ) : (
            <>
              {contacts.slice(0, 25).map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  <span className="text-sm text-muted-foreground truncate">{c.org}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto flex-shrink-0 ${
                      PRIORITY_COLORS[c.priority_tier] ?? PRIORITY_COLORS[3]
                    }`}
                  >
                    {PRIORITY_LABELS[c.priority_tier] ?? "P3"}
                  </span>
                </div>
              ))}
              <div className="px-4 py-3 text-xs text-muted-foreground">
                Alex will draft these next based on priority.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
