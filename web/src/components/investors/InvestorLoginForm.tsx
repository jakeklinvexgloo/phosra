"use client"

import { useState, useCallback, useEffect } from "react"
import { ArrowLeft, Loader2, Shield, UserPlus } from "lucide-react"
import PhoneInput from "./PhoneInput"
import OtpInput from "./OtpInput"

type LoginState = "phone_input" | "otp_sent" | "verifying" | "invite_loading" | "invite_claim" | "claiming"

interface InvestorLoginFormProps {
  onAuthenticated: () => void
  inviteCode?: string | null
}

export default function InvestorLoginForm({
  onAuthenticated,
  inviteCode,
}: InvestorLoginFormProps) {
  const [loginState, setLoginState] = useState<LoginState>(inviteCode ? "invite_loading" : "phone_input")
  const [phone, setPhone] = useState("")
  const [otpValue, setOtpValue] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  // Invite state
  const [referrerName, setReferrerName] = useState("")
  const [referrerCompany, setReferrerCompany] = useState("")
  const [claimName, setClaimName] = useState("")
  const [claimCompany, setClaimCompany] = useState("")
  const [claimEmail, setClaimEmail] = useState("")

  // Validate invite code on mount
  useEffect(() => {
    if (!inviteCode) return
    let cancelled = false

    async function validateInvite() {
      try {
        const res = await fetch(`/api/investors/portal/invite/${inviteCode}`)
        const data = await res.json()
        if (cancelled) return
        if (data.valid) {
          setReferrerName(data.referrerName || "An investor")
          setReferrerCompany(data.referrerCompany || "")
          setLoginState("invite_claim")
        } else {
          setLoginState("phone_input")
        }
      } catch {
        if (!cancelled) setLoginState("phone_input")
      }
    }

    validateInvite()
    return () => { cancelled = true }
  }, [inviteCode])

  const handleRequestOtp = useCallback(async () => {
    if (phone.length !== 10) {
      setError("Enter a 10-digit phone number")
      return
    }
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/investors/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+1${phone}` }),
      })
      if (res.ok) {
        setLoginState("otp_sent")
      } else {
        const data = await res.json()
        setError(data.message || "Failed to send code")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSending(false)
    }
  }, [phone])

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      setLoginState("verifying")
      setError("")
      try {
        const res = await fetch("/api/investors/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ phone: `+1${phone}`, code }),
        })
        const data = await res.json()
        if (res.ok) {
          onAuthenticated()
        } else {
          setError(data.error || "Verification failed")
          setLoginState("otp_sent")
        }
      } catch {
        setError("Network error. Please try again.")
        setLoginState("otp_sent")
      }
    },
    [phone, onAuthenticated],
  )

  const handleClaimInvite = useCallback(async () => {
    if (!claimName.trim()) {
      setError("Please enter your name")
      return
    }
    setLoginState("claiming")
    setError("")
    try {
      const res = await fetch(`/api/investors/portal/invite/${inviteCode}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: claimName.trim(),
          company: claimCompany.trim(),
          email: claimEmail.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        onAuthenticated()
      } else {
        setError(data.error || "Failed to claim invite")
        setLoginState("invite_claim")
      }
    } catch {
      setError("Network error. Please try again.")
      setLoginState("invite_claim")
    }
  }, [inviteCode, claimName, claimCompany, claimEmail, onAuthenticated])

  const handleBack = useCallback(() => {
    setLoginState("phone_input")
    setOtpValue("")
    setError("")
  }, [])

  if (loginState === "invite_loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/40">Loading invite...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
            {loginState === "invite_claim" || loginState === "claiming" ? (
              <UserPlus className="w-6 h-6 text-brand-green" />
            ) : (
              <Shield className="w-6 h-6 text-brand-green" />
            )}
          </div>
          <h1 className="text-xl font-display text-white mb-1">
            Investor Portal
          </h1>
          <p className="text-sm text-white/40">
            {loginState === "invite_claim" || loginState === "claiming"
              ? `You've been invited to view the Phosra data room by ${referrerName}${referrerCompany ? ` from ${referrerCompany}` : ""}`
              : loginState === "phone_input"
                ? "Enter your phone number to sign in"
                : "Enter the 6-digit code we sent you"}
          </p>
        </div>

        {/* Invite Claim State */}
        {(loginState === "invite_claim" || loginState === "claiming") && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Your Name *</label>
              <input
                type="text"
                value={claimName}
                onChange={(e) => { setClaimName(e.target.value); setError("") }}
                placeholder="Jane Smith"
                disabled={loginState === "claiming"}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Company</label>
              <input
                type="text"
                value={claimCompany}
                onChange={(e) => setClaimCompany(e.target.value)}
                placeholder="Acme Ventures"
                disabled={loginState === "claiming"}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Email (optional)</label>
              <input
                type="email"
                value={claimEmail}
                onChange={(e) => setClaimEmail(e.target.value)}
                placeholder="jane@acme.vc"
                disabled={loginState === "claiming"}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            <button
              onClick={handleClaimInvite}
              disabled={loginState === "claiming" || !claimName.trim()}
              className="w-full py-3 bg-brand-green text-[#0D1B2A] font-semibold rounded-xl hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {loginState === "claiming" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Accessing...
                </>
              ) : (
                "Access Data Room"
              )}
            </button>

            <button
              onClick={() => { setLoginState("phone_input"); setError("") }}
              className="w-full text-xs text-white/30 hover:text-white/50 transition-colors text-center"
            >
              Already have an account? Sign in with phone
            </button>
          </div>
        )}

        {/* Phone Input State */}
        {loginState === "phone_input" && (
          <div className="space-y-4">
            <PhoneInput
              value={phone}
              onChange={(v) => {
                setPhone(v)
                setError("")
              }}
              onSubmit={handleRequestOtp}
              disabled={sending}
              error={error}
            />
            <button
              onClick={handleRequestOtp}
              disabled={sending || phone.length !== 10}
              className="w-full py-3 bg-brand-green text-[#0D1B2A] font-semibold rounded-xl hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </button>

            <p className="text-[11px] text-white/30 text-center leading-relaxed">
              By continuing, you confirm you have been invited
              <br />
              to the Phosra investor data room.
            </p>
          </div>
        )}

        {/* OTP Input State */}
        {(loginState === "otp_sent" || loginState === "verifying") && (
          <div className="space-y-5">
            <OtpInput
              value={otpValue}
              onChange={setOtpValue}
              onComplete={handleVerifyOtp}
              disabled={loginState === "verifying"}
              error={error}
            />

            {loginState === "verifying" && (
              <div className="flex justify-center">
                <Loader2 className="w-5 h-5 text-brand-green animate-spin" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Change number
              </button>
              <button
                onClick={() => {
                  setOtpValue("")
                  setError("")
                  handleRequestOtp()
                }}
                disabled={sending}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Resend code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
