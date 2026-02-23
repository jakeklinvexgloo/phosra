"use client"

import { useState, useCallback, useEffect } from "react"
import { useStytch, useStytchSession } from "@stytch/nextjs"
import { ArrowLeft, Loader2, Shield, UserPlus } from "lucide-react"
import PhoneInput from "./PhoneInput"
import OtpInput from "./OtpInput"

type LoginState = "phone_input" | "otp_sent" | "verifying" | "invite_loading"

interface InvestorLoginFormProps {
  onAuthenticated: () => void
  inviteCode?: string | null
}

export default function InvestorLoginForm({
  onAuthenticated,
  inviteCode: inviteCodeProp,
}: InvestorLoginFormProps) {
  const stytch = useStytch()
  const { session } = useStytchSession()

  const [resolvedInviteCode, setResolvedInviteCode] = useState<string | null>(inviteCodeProp || null)
  const [loginState, setLoginState] = useState<LoginState>("invite_loading")
  const [phone, setPhone] = useState("")
  const [otpValue, setOtpValue] = useState("")
  const [methodId, setMethodId] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  // Invite state
  const [referrerName, setReferrerName] = useState("")
  const [referrerCompany, setReferrerCompany] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const hasInvite = Boolean(referrerName)

  // If already authenticated via Stytch, notify parent
  useEffect(() => {
    if (session) onAuthenticated()
  }, [session, onAuthenticated])

  // Resolve invite code from prop or URL on mount
  useEffect(() => {
    const code = inviteCodeProp || new URLSearchParams(window.location.search).get("invite")
    if (code) {
      setResolvedInviteCode(code)
    } else {
      setLoginState("phone_input")
    }
  }, [inviteCodeProp])

  // Validate invite code
  useEffect(() => {
    if (!resolvedInviteCode) return
    let cancelled = false

    async function validateInvite() {
      try {
        const res = await fetch(`/api/investors/portal/invite/${resolvedInviteCode}`)
        const data = await res.json()
        if (cancelled) return
        if (data.valid) {
          setReferrerName(data.referrerName || "An investor")
          setReferrerCompany(data.referrerCompany || "")
          setRecipientName(data.recipientName || "")
        }
      } catch {
        // Invite invalid, fall through to normal login
      }
      if (!cancelled) setLoginState("phone_input")
    }

    validateInvite()
    return () => { cancelled = true }
  }, [resolvedInviteCode])

  const handleRequestOtp = useCallback(async () => {
    if (phone.length !== 10) {
      setError("Enter a 10-digit phone number")
      return
    }
    setSending(true)
    setError("")
    try {
      const e164 = `+1${phone}`

      // Check approval (anti-enumeration: same response either way)
      await fetch("/api/investors/auth/check-approved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: e164,
          ...(resolvedInviteCode ? { inviteCode: resolvedInviteCode } : {}),
        }),
      })

      // Send OTP via Stytch
      const resp = await stytch.otps.sms.loginOrCreate(e164, {
        expiration_minutes: 5,
      })
      setMethodId(resp.method_id)
      setLoginState("otp_sent")
    } catch {
      // If Stytch fails, still show OTP screen for anti-enumeration
      // (unapproved phones won't have a real method_id)
      setError("Something went wrong. Please try again.")
    } finally {
      setSending(false)
    }
  }, [stytch, phone, resolvedInviteCode])

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      if (!methodId) {
        setError("Please request a new code")
        return
      }
      setLoginState("verifying")
      setError("")
      try {
        await stytch.otps.authenticate(code, methodId, {
          session_duration_minutes: 60, // 1 hour
        })
        // Session cookie set automatically by Stytch SDK
        // Claim invite if applicable
        if (resolvedInviteCode) {
          fetch(`/api/investors/portal/invite/${resolvedInviteCode}/claim`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ phone: `+1${phone}` }),
          }).catch(() => {})
        }
        onAuthenticated()
      } catch {
        setError("Invalid code. Please try again.")
        setLoginState("otp_sent")
      }
    },
    [stytch, methodId, phone, resolvedInviteCode, onAuthenticated],
  )

  const handleBack = useCallback(() => {
    setLoginState("phone_input")
    setOtpValue("")
    setMethodId("")
    setError("")
  }, [])

  if (loginState === "invite_loading") {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-start pt-[20vh] justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/40">Loading invite...</p>
        </div>
      </div>
    )
  }

  // Header text based on state + invite context
  const getSubtitle = () => {
    if (loginState === "otp_sent" || loginState === "verifying") {
      if (hasInvite && recipientName) {
        return <>Welcome <span className="text-white font-semibold">{recipientName}</span> — enter your 6-digit code to access the investor portal</>
      }
      return "Enter the 6-digit code we sent you"
    }
    if (hasInvite && recipientName) {
      return <>Welcome <span className="text-white font-semibold">{recipientName}</span>, you've been invited by <span className="text-white font-semibold">{referrerName}</span>{referrerCompany ? ` from ${referrerCompany}` : ""} to view the Phosra data room</>
    }
    if (hasInvite) {
      return <>You've been invited by <span className="text-white font-semibold">{referrerName}</span>{referrerCompany ? ` from ${referrerCompany}` : ""} to view the Phosra data room</>
    }
    return "Enter your phone number to sign in"
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-start pt-[20vh] justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
            {hasInvite ? (
              <UserPlus className="w-6 h-6 text-brand-green" />
            ) : (
              <Shield className="w-6 h-6 text-brand-green" />
            )}
          </div>
          <h1 className="text-xl font-display text-white mb-1">
            Investor Portal
          </h1>
          <p className="text-sm text-white/40">
            {getSubtitle()}
          </p>
        </div>

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
              {hasInvite
                ? "Enter your phone number to verify your identity"
                : <>By continuing, you confirm you have been invited<br />to the Phosra investor data room.</>
              }
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
