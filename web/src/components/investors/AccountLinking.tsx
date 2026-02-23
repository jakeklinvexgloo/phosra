"use client"

import { useStytchUser } from "@stytch/nextjs"
import { Mail, Phone, Check } from "lucide-react"

interface AccountLinkingProps {
  phone: string
}

export default function AccountLinking({ phone }: AccountLinkingProps) {
  const { user } = useStytchUser()

  const phones = user?.phone_numbers || []
  const emails = user?.emails || []
  const googleProviders = (user?.providers || []).filter(
    (p) => p.provider_type === "Google",
  )

  const hasLinkedIdentifiers = phones.length > 0 || emails.length > 0 || googleProviders.length > 0

  if (!hasLinkedIdentifiers) {
    return null
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-1">
        Linked Accounts
      </h3>
      <p className="text-xs text-white/40 mb-5">
        Your verified identifiers managed by Stytch.
      </p>

      <div className="space-y-3">
        {/* Phone numbers */}
        {phones.map((p) => (
          <div
            key={p.phone_id}
            className="flex items-center gap-3 py-2"
          >
            <Phone className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/70 flex-1">
              {p.phone_number}
            </span>
            {p.verified && (
              <span className="text-xs text-brand-green flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        ))}

        {/* Emails */}
        {emails.map((e) => (
          <div
            key={e.email_id}
            className="flex items-center gap-3 py-2 border-t border-white/5"
          >
            <Mail className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/70 flex-1">
              {e.email}
            </span>
            {e.verified && (
              <span className="text-xs text-brand-green flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        ))}

        {/* Google providers */}
        {googleProviders.map((g) => (
          <div
            key={g.provider_subject}
            className="flex items-center gap-3 py-2 border-t border-white/5"
          >
            <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm text-white/70 flex-1">
              Google
            </span>
            <span className="text-xs text-brand-green flex items-center gap-1">
              <Check className="w-3 h-3" /> Linked
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
