"use client"

import { Settings } from "lucide-react"
import type { OutreachConfig, AutopilotStats, GoogleAccountInfo } from "@/lib/admin/types"

interface OutreachHeaderProps {
  config: OutreachConfig | null
  stats: AutopilotStats | null
  googleAccounts: GoogleAccountInfo[]
  onToggle: () => void
  onManageAccounts: () => void
  onOpenSettings: () => void
}

export function OutreachHeader({
  config,
  stats,
  googleAccounts,
  onToggle,
  onManageAccounts,
  onOpenSettings,
}: OutreachHeaderProps) {
  const isActive = config?.autopilot_enabled ?? false

  return (
    <div className="plaid-card px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: title + Alex status toggle */}
        <div className="flex items-center gap-4">
          <h1 className="font-display text-xl font-semibold">Outreach</h1>
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 text-sm transition-colors"
          >
            {isActive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span className="text-green-600 font-medium">Alex Active</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="text-muted-foreground">Alex Paused</span>
              </>
            )}
          </button>
        </div>

        {/* Center: inline stats */}
        {stats && (
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
            <span>{stats.sent_today} sent today</span>
            <span>&middot;</span>
            <span>{stats.total_replies} replies</span>
            <span>&middot;</span>
            <span>{stats.total_meetings} meetings</span>
          </div>
        )}

        {/* Right: Accounts badge + settings gear */}
        <div className="flex items-center gap-3">
          {googleAccounts.length > 0 ? (
            <button
              onClick={onManageAccounts}
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {googleAccounts.length} account{googleAccounts.length !== 1 ? "s" : ""}
            </button>
          ) : (
            <button
              onClick={onManageAccounts}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Connect Accounts
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Outreach settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
