"use client"

import { useState, useCallback } from "react"
import { useStytchUser } from "@stytch/nextjs"
import { UserPlus, Mail, ChevronRight, Check, Loader2 } from "lucide-react"

interface NextStepsCardProps {
  onInviteClick: () => void
}

export default function NextStepsCard({ onInviteClick }: NextStepsCardProps) {
  const { user } = useStytchUser()

  const [emailInput, setEmailInput] = useState("")
  const [emailState, setEmailState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [emailError, setEmailError] = useState("")
  const [showEmailInput, setShowEmailInput] = useState(false)

  const linkedEmails = user?.emails || []
  const hasEmail = linkedEmails.length > 0 || emailState === "saved"

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

          {/* Step 2: Link email */}
          {hasEmail ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-brand-green/20">
              <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-brand-green" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Email linked</p>
                <p className="text-[11px] text-brand-green/60 truncate">
                  {linkedEmails[0]?.email || emailInput}
                </p>
              </div>
            </div>
          ) : showEmailInput ? (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-white/40" />
                </div>
                <p className="text-sm font-medium text-white">Link your email</p>
              </div>
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
          <span className={`w-1.5 h-1.5 rounded-full ${hasEmail ? "bg-brand-green" : "bg-brand-green animate-pulse"}`} />
          <p className="text-[10px] text-white/30">
            {hasEmail ? "1 of 2 complete" : "Get started with your next steps"}
          </p>
        </div>
      </div>
    </div>
  )
}
