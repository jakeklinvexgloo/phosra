"use client"

import { Settings } from "lucide-react"
import type { OutreachConfig, AutopilotStats } from "@/lib/admin/types"

interface OutreachHeaderProps {
  config: OutreachConfig | null
  stats: AutopilotStats | null
  gmailConnected: boolean
  gmailEmail: string
  onToggle: () => void
  onConnectGmail: () => void
  onOpenSettings: () => void
}

export function OutreachHeader({
  config,
  stats,
  gmailConnected,
  gmailEmail,
  onToggle,
  onConnectGmail,
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

        {/* Right: Gmail badge + settings gear */}
        <div className="flex items-center gap-3">
          {gmailConnected ? (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {gmailEmail || "Gmail connected"}
            </span>
          ) : (
            <button
              onClick={onConnectGmail}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Connect Gmail
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
