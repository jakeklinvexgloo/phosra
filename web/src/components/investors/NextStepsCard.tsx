"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useStytch, useStytchUser } from "@stytch/nextjs"
import { UserPlus, Mail, ChevronRight, Check, Loader2 } from "lucide-react"

interface NextStepsCardProps {
  onInviteClick: () => void
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function NextStepsCard({ onInviteClick }: NextStepsCardProps) {
  const stytch = useStytch()
  const { user } = useStytchUser()

  const [emailInput, setEmailInput] = useState("")
  const [emailState, setEmailState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [emailError, setEmailError] = useState("")
  const [showEmailInput, setShowEmailInput] = useState(false)

  const linkedEmails = user?.emails || []
  const googleProviders = (user?.providers || []).filter(
    (p) => p.provider_type === "Google",
  )
  const hasLinkedAccount = linkedEmails.length > 0 || googleProviders.length > 0 || emailState === "saved"

  // Sync Google/email providers to our DB when detected
  const syncedRef = useRef(false)
  useEffect(() => {
    if (syncedRef.current) return
    if (googleProviders.length > 0) {
      syncedRef.current = true
      fetch("/api/investors/portal/link-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          provider: "google",
          providerId: googleProviders[0].provider_subject,
        }),
      }).catch(() => {})
    } else if (linkedEmails.length > 0 && linkedEmails[0].verified) {
      syncedRef.current = true
      fetch("/api/investors/portal/link-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: linkedEmails[0].email }),
      }).catch(() => {})
    }
  }, [googleProviders, linkedEmails])

  // Display text for linked account
  const linkedDisplay = googleProviders.length > 0
    ? `Google account linked`
    : linkedEmails[0]?.email || emailInput

  const handleLinkEmail = useCallback(async () => {
    const trimmed = emailInput.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email address")
      return
    }
    setEmailState("saving")
    setEmailError("")
    try {
      const res = await fetch("/api/investors/portal/link-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to link email")
      }
      setEmailState("saved")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setEmailError(message)
      setEmailState("error")
    }
  }, [emailInput])

  const handleGoogleLink = useCallback(() => {
    const redirectUrl = `${window.location.origin}/auth/callback?return_to=${encodeURIComponent("/investors/portal")}`
    stytch.oauth.google.start({
      login_redirect_url: redirectUrl,
      signup_redirect_url: redirectUrl,
    })
  }, [stytch])

  return (
    <div className="cta-gradient-border rounded-2xl">
      <div className="relative bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-6">
        <p className="text-sm font-semibold text-white mb-4">Next steps</p>

        <div className="space-y-2.5">
          {/* Step 1: Invite an investor */}
          <button
            onClick={onInviteClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-3.5 h-3.5 text-brand-green" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Invite an investor</p>
              <p className="text-[11px] text-white/30">Share a private data room link</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
          </button>

          {/* Step 2: Link email / Google */}
          {hasLinkedAccount ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-brand-green/20">
              <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                {googleProviders.length > 0 ? (
                  <GoogleIcon className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-brand-green" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  {googleProviders.length > 0 ? "Google linked" : "Email linked"}
                </p>
                <p className="text-[11px] text-brand-green/60 truncate">{linkedDisplay}</p>
              </div>
              <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
            </div>
          ) : showEmailInput ? (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-white/40" />
                </div>
                <p className="text-sm font-medium text-white">Link your email</p>
              </div>

              {/* Google OAuth button */}
              <button
                onClick={handleGoogleLink}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-white border border-white/20 rounded-lg text-sm text-[#1f1f1f] font-medium hover:bg-white/90 transition-colors"
              >
                <GoogleIcon className="w-4 h-4" />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-white/[0.06]" />
                <span className="text-[10px] text-white/20">or enter manually</span>
                <div className="flex-1 border-t border-white/[0.06]" />
              </div>

              {/* Manual email input */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailError("") }}
                  placeholder="you@company.com"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleLinkEmail()}
                />
                <button
                  onClick={handleLinkEmail}
                  disabled={emailState === "saving"}
                  className="px-4 py-2 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg text-sm hover:bg-brand-green/90 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {emailState === "saving" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Link"
                  )}
                </button>
              </div>
              {emailError && <p className="text-xs text-red-400">{emailError}</p>}
            </div>
          ) : (
            <button
              onClick={() => setShowEmailInput(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                <Mail className="w-3.5 h-3.5 text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Link your email</p>
                <p className="text-[11px] text-white/30">For platform evaluation updates</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
            </button>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${hasLinkedAccount ? "bg-brand-green" : "bg-brand-green animate-pulse"}`} />
          <p className="text-[10px] text-white/30">
            {hasLinkedAccount ? "1 of 2 complete" : "Get started with your next steps"}
          </p>
        </div>
      </div>
    </div>
  )
}
