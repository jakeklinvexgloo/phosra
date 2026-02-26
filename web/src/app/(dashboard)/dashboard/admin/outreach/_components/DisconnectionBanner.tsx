"use client"

import { AlertTriangle } from "lucide-react"
import type { GoogleAccountInfo, PersonaAccountMapping } from "@/lib/admin/types"
import { getPersonaConfig } from "./PersonaBadge"

interface DisconnectionBannerProps {
  googleAccounts: GoogleAccountInfo[]
  personaAccounts: PersonaAccountMapping[]
  onReconnect: (accountKey: string) => void
}

export function DisconnectionBanner({ googleAccounts, personaAccounts, onReconnect }: DisconnectionBannerProps) {
  const connectedKeys = new Set(googleAccounts.filter((a) => a.connected).map((a) => a.account_key))

  const disconnected = personaAccounts.filter(
    (p) => p.google_account_key && !connectedKeys.has(p.google_account_key),
  )

  if (disconnected.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
      <div className="flex flex-col gap-2">
        {disconnected.map((persona) => {
          const config = getPersonaConfig(persona.persona_key)
          return (
            <div key={persona.persona_key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  {config.label}&apos;s Gmail is disconnected &mdash; outreach emails can&apos;t be sent as {config.label}
                </span>
              </div>
              <button
                onClick={() => onReconnect(persona.google_account_key)}
                className="flex-shrink-0 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline underline-offset-2 transition-colors"
              >
                Reconnect
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
