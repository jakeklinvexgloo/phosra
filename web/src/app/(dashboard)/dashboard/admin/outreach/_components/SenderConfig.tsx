"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { OutreachConfig } from "@/lib/admin/types"

interface SenderConfigProps {
  open: boolean
  onClose: () => void
}

export function SenderConfig({ open, onClose }: SenderConfigProps) {
  const { getToken } = useApi()
  const [config, setConfig] = useState<OutreachConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!open) return
    async function load() {
      try {
        const token = (await getToken()) ?? undefined
        const cfg = await api.getAutopilotConfig(token)
        setConfig(cfg)
      } catch { /* ignore */ }
    }
    load()
  }, [open, getToken])

  const handleSave = useCallback(async () => {
    if (!config) return
    setSaving(true)
    try {
      const token = (await getToken()) ?? undefined
      const updated = await api.updateAutopilotConfig(config as unknown as Record<string, unknown>, token)
      setConfig(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }, [getToken, config])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background border rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Autopilot Settings</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {config && (
          <div className="p-4 space-y-4">
            {/* Sender Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Sender Persona</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <input
                    value={config.sender_name}
                    onChange={(e) => setConfig({ ...config, sender_name: e.target.value })}
                    className="w-full text-sm border rounded px-2 py-1.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Title</label>
                  <input
                    value={config.sender_title}
                    onChange={(e) => setConfig({ ...config, sender_title: e.target.value })}
                    className="w-full text-sm border rounded px-2 py-1.5 mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email (read-only)</label>
                <input value={config.sender_email} disabled className="w-full text-sm border rounded px-2 py-1.5 mt-1 bg-muted" />
              </div>
            </div>

            {/* Company Brief */}
            <div>
              <label className="text-xs text-muted-foreground">Company Brief</label>
              <textarea
                value={config.company_brief}
                onChange={(e) => setConfig({ ...config, company_brief: e.target.value })}
                rows={3}
                className="w-full text-sm border rounded px-2 py-1.5 mt-1"
              />
            </div>

            {/* Signature */}
            <div>
              <label className="text-xs text-muted-foreground">Email Signature</label>
              <textarea
                value={config.email_signature}
                onChange={(e) => setConfig({ ...config, email_signature: e.target.value })}
                rows={3}
                className="w-full text-sm border rounded px-2 py-1.5 mt-1 font-mono text-xs"
              />
            </div>

            {/* Scheduling */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Scheduling</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Send Hour (UTC)</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={config.send_hour_utc}
                    onChange={(e) => setConfig({ ...config, send_hour_utc: Number(e.target.value) })}
                    className="w-full text-sm border rounded px-2 py-1.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max Emails/Day</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={config.max_emails_per_day}
                    onChange={(e) => setConfig({ ...config, max_emails_per_day: Number(e.target.value) })}
                    className="w-full text-sm border rounded px-2 py-1.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Follow-up Delay (days)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={config.follow_up_delay_days}
                    onChange={(e) => setConfig({ ...config, follow_up_delay_days: Number(e.target.value) })}
                    className="w-full text-sm border rounded px-2 py-1.5 mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-foreground text-background text-sm px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
              {saved && <span className="text-sm text-green-600">Saved</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
