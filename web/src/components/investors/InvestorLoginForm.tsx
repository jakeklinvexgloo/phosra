"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, Loader2, Shield } from "lucide-react"
import PhoneInput from "./PhoneInput"
import OtpInput from "./OtpInput"

type LoginState = "phone_input" | "otp_sent" | "verifying"

interface InvestorLoginFormProps {
  onAuthenticated: () => void
}

export default function InvestorLoginForm({
  onAuthenticated,
}: InvestorLoginFormProps) {
  const [loginState, setLoginState] = useState<LoginState>("phone_input")
  const [phone, setPhone] = useState("")
  const [otpValue, setOtpValue] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

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

  const handleBack = useCallback(() => {
    setLoginState("phone_input")
    setOtpValue("")
    setError("")
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-6 h-6 text-brand-green" />
          </div>
          <h1 className="text-xl font-display text-white mb-1">
            Investor Portal
          </h1>
          <p className="text-sm text-white/40">
            {loginState === "phone_input"
              ? "Enter your phone number to sign in"
              : "Enter the 6-digit code we sent you"}
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
