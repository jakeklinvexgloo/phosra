"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Plus, Trash2, X } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { GoogleAccountInfo, PersonaAccountMapping } from "@/lib/admin/types"

interface GoogleAccountsManagerProps {
  open: boolean
  onClose: () => void
  onAccountsChanged: () => void
}

export function GoogleAccountsManager({ open, onClose, onAccountsChanged }: GoogleAccountsManagerProps) {
  const { getToken } = useApi()
  const [accounts, setAccounts] = useState<GoogleAccountInfo[]>([])
  const [personas, setPersonas] = useState<PersonaAccountMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [newAccountKey, setNewAccountKey] = useState("")
  const [adding, setAdding] = useState(false)
  const [savingPersona, setSavingPersona] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const token = (await getToken()) ?? undefined
      const [accts, personaList] = await Promise.all([
        api.listGoogleAccounts(token),
        api.listPersonaAccounts(token),
      ])
      setAccounts(accts as GoogleAccountInfo[])
      setPersonas(personaList as PersonaAccountMapping[])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    if (open) fetchData()
  }, [open, fetchData])

  const handleAddAccount = useCallback(async () => {
    if (!newAccountKey.trim()) return
    setAdding(true)
    try {
      const token = (await getToken()) ?? undefined
      const { url } = await api.getGoogleAccountAuthURL(newAccountKey.trim(), token)
      window.location.href = url
    } catch {
      // ignore
    } finally {
      setAdding(false)
    }
  }, [newAccountKey, getToken])

  const handleDisconnect = useCallback(async (accountKey: string) => {
    try {
      const token = (await getToken()) ?? undefined
      await api.disconnectGoogleAccount(accountKey, token)
      fetchData()
      onAccountsChanged()
    } catch {
      // ignore
    }
  }, [getToken, fetchData, onAccountsChanged])

  const handlePersonaAccountChange = useCallback(async (personaKey: string, field: "google_account_key" | "calendar_account_key", value: string) => {
    const persona = personas.find((p) => p.persona_key === personaKey)
    if (!persona) return
    setSavingPersona(personaKey)
    try {
      const token = (await getToken()) ?? undefined
      const updated = { ...persona, [field]: value }
      await api.upsertPersonaAccount(personaKey, {
        google_account_key: updated.google_account_key,
        calendar_account_key: updated.calendar_account_key,
        display_name: updated.display_name,
        sender_email: updated.sender_email,
      }, token)
      setPersonas((prev) => prev.map((p) => p.persona_key === personaKey ? { ...p, [field]: value } : p))
    } catch {
      // ignore
    } finally {
      setSavingPersona(null)
    }
  }, [personas, getToken])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background border rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Google Accounts</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Connected accounts */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Connected Accounts</h3>
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No outreach accounts connected.</p>
            ) : (
              <div className="space-y-2">
                {accounts.map((acct) => (
                  <div key={acct.account_key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium">{acct.account_key}</div>
                        <div className="text-xs text-muted-foreground">{acct.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect(acct.account_key)}
                      className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors"
                      title="Disconnect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new account */}
            <div className="flex items-center gap-2 pt-2">
              <input
                value={newAccountKey}
                onChange={(e) => setNewAccountKey(e.target.value)}
                placeholder="Account key (e.g. jake)"
                className="flex-1 text-sm border rounded px-3 py-2 bg-background"
                onKeyDown={(e) => e.key === "Enter" && handleAddAccount()}
              />
              <button
                onClick={handleAddAccount}
                disabled={adding || !newAccountKey.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border hover:bg-muted transition-colors disabled:opacity-50"
              >
                {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add
              </button>
            </div>
          </div>

          {/* Persona mapping */}
          {personas.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Persona Account Mapping</h3>
              <p className="text-xs text-muted-foreground">Which Google account sends emails and books calendar events for each persona.</p>
              <div className="space-y-3">
                {personas.map((persona) => (
                  <div key={persona.persona_key} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{persona.display_name}</span>
                      <span className="text-xs text-muted-foreground">({persona.sender_email})</span>
                      {savingPersona === persona.persona_key && (
                        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Gmail Account</label>
                        <select
                          value={persona.google_account_key}
                          onChange={(e) => handlePersonaAccountChange(persona.persona_key, "google_account_key", e.target.value)}
                          className="w-full text-sm border rounded px-2 py-1.5 mt-1 bg-background"
                        >
                          {accounts.map((a) => (
                            <option key={a.account_key} value={a.account_key}>
                              {a.account_key} ({a.email})
                            </option>
                          ))}
                          {/* Include current value even if not in accounts list */}
                          {!accounts.find((a) => a.account_key === persona.google_account_key) && (
                            <option value={persona.google_account_key}>
                              {persona.google_account_key} (not connected)
                            </option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Calendar Account</label>
                        <select
                          value={persona.calendar_account_key}
                          onChange={(e) => handlePersonaAccountChange(persona.persona_key, "calendar_account_key", e.target.value)}
                          className="w-full text-sm border rounded px-2 py-1.5 mt-1 bg-background"
                        >
                          {accounts.map((a) => (
                            <option key={a.account_key} value={a.account_key}>
                              {a.account_key} ({a.email})
                            </option>
                          ))}
                          {!accounts.find((a) => a.account_key === persona.calendar_account_key) && (
                            <option value={persona.calendar_account_key}>
                              {persona.calendar_account_key} (not connected)
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
