"use client"

import { useState } from "react"
import { Mail, Chrome, Check, Loader2 } from "lucide-react"

interface AccountLinkingProps {
  phone: string
}

export default function AccountLinking({ phone }: AccountLinkingProps) {
  const [emailInput, setEmailInput] = useState("")
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [googleLinked, setGoogleLinked] = useState(false)
  const [error, setError] = useState("")

  const handleLinkEmail = async () => {
    if (!emailInput || !emailInput.includes("@")) {
      setError("Enter a valid email address")
      return
    }
    setEmailSending(true)
    setError("")
    try {
      const res = await fetch("/api/investors/auth/link-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: emailInput }),
      })
      const data = await res.json()
      if (res.ok) {
        setEmailSent(true)
      } else {
        setError(data.error || "Failed to send link")
      }
    } catch {
      setError("Network error")
    } finally {
      setEmailSending(false)
    }
  }

  const handleLinkGoogle = async () => {
    setError("")
    // Note: Google OAuth would typically use the Google Identity Services library
    // This is a placeholder — in production, you'd load the Google GSI script
    // and get an id_token from the callback
    try {
      // @ts-expect-error — google.accounts.id is loaded via script tag
      if (typeof google !== "undefined" && google.accounts?.id) {
        // @ts-expect-error — google.accounts.id types
        google.accounts.id.initialize({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: async (response: any) => {
            const res = await fetch("/api/investors/auth/link-google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ idToken: response.credential }),
            })
            if (res.ok) {
              setGoogleLinked(true)
            } else {
              const data = await res.json()
              setError(data.error || "Failed to link Google")
            }
          },
        })
        // @ts-expect-error — google.accounts.id types
        google.accounts.id.prompt()
      } else {
        setError("Google Sign-In not available")
      }
    } catch {
      setError("Google linking failed")
    }
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-1">
        Link an Account (Optional)
      </h3>
      <p className="text-xs text-white/40 mb-5">
        Link your email or Google account for faster sign-in next time.
      </p>

      {/* Email linking */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-white/40" />
          <span className="text-xs text-white/60">Email</span>
          {emailSent && (
            <span className="text-xs text-brand-green flex items-center gap-1">
              <Check className="w-3 h-3" /> Link sent
            </span>
          )}
        </div>
        {!emailSent && (
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="you@company.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-brand-green/50"
            />
            <button
              onClick={handleLinkEmail}
              disabled={emailSending}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {emailSending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Send Link"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Google linking */}
      <div className="flex items-center justify-between py-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Chrome className="w-4 h-4 text-white/40" />
          <span className="text-xs text-white/60">Google</span>
          {googleLinked && (
            <span className="text-xs text-brand-green flex items-center gap-1">
              <Check className="w-3 h-3" /> Linked
            </span>
          )}
        </div>
        {!googleLinked && (
          <button
            onClick={handleLinkGoogle}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Link Google
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </div>
  )
}
