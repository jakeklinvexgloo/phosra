"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { AutopilotStats, OutreachConfig } from "@/lib/admin/types"

interface AutopilotPanelProps {
  onOpenSettings: () => void
  onOpenPending: () => void
}

export function AutopilotPanel({ onOpenSettings, onOpenPending }: AutopilotPanelProps) {
  const { getToken } = useApi()
  const [config, setConfig] = useState<OutreachConfig | null>(null)
  const [stats, setStats] = useState<AutopilotStats | null>(null)
  const [outreachGmailConnected, setOutreachGmailConnected] = useState(false)
  const [outreachGmailEmail, setOutreachGmailEmail] = useState("")
  const [toggling, setToggling] = useState(false)

  const fetchData = useCallback(async () => {
    const token = (await getToken()) ?? undefined
    const [cfg, st, gStatus] = await Promise.allSettled([
      api.getAutopilotConfig(token),
      api.getAutopilotStats(token),
      api.getOutreachGoogleStatus(token),
    ])
    if (cfg.status === "fulfilled") setConfig(cfg.value)
    if (st.status === "fulfilled") setStats(st.value)
    if (gStatus.status === "fulfilled") {
      setOutreachGmailConnected(gStatus.value.connected)
      setOutreachGmailEmail(gStatus.value.email || "")
    }
  }, [getToken])

  useEffect(() => { fetchData() }, [fetchData])

  const handleToggle = useCallback(async () => {
    setToggling(true)
    try {
      const token = (await getToken()) ?? undefined
      const updated = await api.toggleAutopilot(token)
      setConfig(updated)
    } catch { /* ignore */ } finally {
      setToggling(false)
    }
  }, [getToken])

  const handleConnectOutreach = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const { url } = await api.getOutreachGoogleAuthURL(token)
      window.location.href = url
    } catch { /* ignore */ }
  }, [getToken])

  const isActive = config?.autopilot_enabled ?? false

  return (
    <div className={`plaid-card px-3 py-2.5 ${isActive ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Left: Toggle + Status */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
              isActive ? "bg-green-500" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                isActive ? "translate-x-[18px]" : "translate-x-[3px]"
              }`}
            />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium">Autopilot</span>
              {isActive && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {isActive ? "Running" : "Paused"}
              {config ? ` \u2014 ${config.sender_name}` : ""}
            </p>
          </div>
        </div>

        {/* Center: Stats */}
        {stats && (
          <div className="hidden md:flex items-center gap-4 text-[11px] flex-shrink-0">
            <StatBadge label="Active" value={stats.active_sequences} />
            <StatBadge label="Review" value={stats.pending_review} highlight={stats.pending_review > 0} onClick={onOpenPending} />
            <StatBadge label="Sent" value={stats.sent_today} />
            <StatBadge label="Replies" value={stats.total_replies} />
            <StatBadge label="Meets" value={stats.total_meetings} />
          </div>
        )}

        {/* Right: Gmail status + Settings */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {outreachGmailConnected ? (
            <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 max-w-[140px] truncate">
              <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              <span className="truncate">{outreachGmailEmail}</span>
            </span>
          ) : (
            <button onClick={handleConnectOutreach} className="text-[11px] text-blue-600 hover:underline whitespace-nowrap">
              Connect Gmail
            </button>
          )}
          <button onClick={onOpenSettings} className="p-1 rounded hover:bg-muted flex-shrink-0" title="Settings">
            <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function StatBadge({ label, value, highlight, onClick }: { label: string; value: number; highlight?: boolean; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div"
  return (
    <Tag onClick={onClick} className={`text-center ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}>
      <div className={`text-sm font-semibold tabular-nums leading-tight ${highlight ? "text-amber-600 dark:text-amber-400" : ""}`}>
        {value}
      </div>
      <div className="text-muted-foreground leading-tight">{label}</div>
    </Tag>
  )
}
