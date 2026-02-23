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

  // DEBUG state
  const [debugLog, setDebugLog] = useState<string[]>([])
  const addDebug = useCallback((msg: string) => {
    setDebugLog((prev) => [...prev, `[${new Date().toISOString().slice(11, 23)}] ${msg}`])
  }, [])

  // If already authenticated via Stytch, notify parent
  useEffect(() => {
    if (session) onAuthenticated()
  }, [session, onAuthenticated])

  // Resolve invite code from prop or URL on mount
  useEffect(() => {
    addDebug(`inviteCodeProp=${JSON.stringify(inviteCodeProp)}`)
    addDebug(`window.location.search=${window.location.search}`)
    const urlCode = new URLSearchParams(window.location.search).get("invite")
    addDebug(`URL invite param=${JSON.stringify(urlCode)}`)
    const code = inviteCodeProp || urlCode
    addDebug(`resolved code=${JSON.stringify(code)}`)
    if (code) {
      setResolvedInviteCode(code)
    } else {
      addDebug("No invite code found, going to phone_input")
      setLoginState("phone_input")
    }
  }, [inviteCodeProp, addDebug])

  // Validate invite code
  useEffect(() => {
    if (!resolvedInviteCode) {
      addDebug("validateInvite: no resolvedInviteCode, skipping")
      return
    }
    let cancelled = false
    addDebug(`validateInvite: fetching /api/investors/portal/invite/${resolvedInviteCode}`)

    async function validateInvite() {
      try {
        const url = `/api/investors/portal/invite/${resolvedInviteCode}`
        addDebug(`fetch GET ${url}`)
        const res = await fetch(url)
        addDebug(`fetch response: status=${res.status} ok=${res.ok}`)
        const text = await res.text()
        addDebug(`fetch body: ${text}`)
        const data = JSON.parse(text)
        if (cancelled) {
          addDebug("validateInvite: cancelled, ignoring response")
          return
        }
        addDebug(`data.valid=${data.valid} referrerName=${data.referrerName} recipientName=${data.recipientName}`)
        if (data.valid) {
          setReferrerName(data.referrerName || "An investor")
          setReferrerCompany(data.referrerCompany || "")
          setRecipientName(data.recipientName || "")
          addDebug("invite validated successfully!")
        } else {
          addDebug("invite NOT valid (data.valid is false)")
        }
      } catch (err) {
        addDebug(`validateInvite error: ${err instanceof Error ? err.message : String(err)}`)
      }
      if (!cancelled) {
        addDebug("setting loginState=phone_input")
        setLoginState("phone_input")
      }
    }

    validateInvite()
    return () => { cancelled = true }
  }, [resolvedInviteCode, addDebug])

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
    } catch (err) {
      // If Stytch fails, still show OTP screen for anti-enumeration
      // (unapproved phones won't have a real method_id)
      const msg = err instanceof Error ? err.message : String(err)
      addDebug(`OTP send error: ${msg}`)
      addDebug(`Full error: ${JSON.stringify(err, Object.getOwnPropertyNames(err instanceof Error ? err : {}), 2)}`)
      setError(`DEBUG: ${msg}`)
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
          session_duration_minutes: 60 * 24, // 24 hours
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
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        addDebug(`OTP verify error: ${msg}`)
        setError(`DEBUG: ${msg}`)
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
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-center justify-center px-4">
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
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-center justify-center px-4">
      {/* DEBUG PANEL */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 text-green-400 text-[10px] font-mono p-3 max-h-[40vh] overflow-y-auto border-b border-green-800">
        <div className="font-bold text-green-300 mb-1">DEBUG — Invite Flow</div>
        <div className="mb-2 text-yellow-300 space-y-0.5">
          <div>inviteCodeProp: {JSON.stringify(inviteCodeProp)}</div>
          <div>resolvedInviteCode: {JSON.stringify(resolvedInviteCode)}</div>
          <div>loginState: {loginState}</div>
          <div>hasInvite: {String(hasInvite)}</div>
          <div>referrerName: {JSON.stringify(referrerName)}</div>
          <div>recipientName: {JSON.stringify(recipientName)}</div>
          <div>error: {JSON.stringify(error)}</div>
          <div>methodId: {methodId ? "set" : "empty"}</div>
        </div>
        <div className="border-t border-green-800 pt-1">
          {debugLog.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          {debugLog.length === 0 && <div className="text-white/30">Waiting for logs...</div>}
        </div>
      </div>

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
