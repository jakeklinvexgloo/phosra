"use client"

import { useState, useEffect, Suspense, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useStytch, useStytchSession } from "@stytch/nextjs"
import { Terminal, ChevronRight, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { PLATFORM_STATS } from "@/lib/platforms"

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F8F8]" />}>
      <LoginPage />
    </Suspense>
  )
}

function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stytch = useStytch()
  const { session } = useStytchSession()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Email code OTP state
  const [authMode, setAuthMode] = useState<"password" | "email-code">("password")
  const [otpMethodId, setOtpMethodId] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  // Persist the "from" param so we know to deep-link back after auth
  const fromParam = searchParams.get("from")
  const fromBrowser = fromParam === "phosra-browser"
  const fromApp = fromParam === "phosra-app"
  useEffect(() => {
    if (fromBrowser) {
      sessionStorage.setItem("phosra-login-from", "phosra-browser")
    } else if (fromApp) {
      sessionStorage.setItem("phosra-login-from", "phosra-app")
    }
  }, [fromBrowser, fromApp])

  // If user is already signed in, build a deep-link URL or redirect to dashboard.
  const [redirecting, setRedirecting] = useState(false)
  const [deepLinkURL, setDeepLinkURL] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return

    const storedFrom = sessionStorage.getItem("phosra-login-from")
    const wantsBrowser = fromBrowser || storedFrom === "phosra-browser"
    const wantsApp = fromApp || storedFrom === "phosra-app"

    if (wantsBrowser || wantsApp) {
      const scheme = wantsApp ? "phosra-app" : "phosra-browser"

      // Retry up to 5 times to get tokens, then show manual button
      let attempt = 0
      const maxAttempts = 5

      const tryDeepLink = () => {
        attempt++
        const tokens = stytch.session.getTokens()
        if (tokens?.session_token) {
          sessionStorage.removeItem("phosra-login-from")
          const params = new URLSearchParams({ session_token: tokens.session_token })
          if (email) params.set("email", email)
          const url = `${scheme}://auth?${params.toString()}`
          setDeepLinkURL(url)
          // Try automatic redirect — Safari may block this for custom schemes
          window.location.href = url
          return
        }
        if (attempt < maxAttempts) {
          setTimeout(tryDeepLink, attempt * 500)
        }
        // If all attempts fail, deepLinkURL stays null and we show the login form
      }

      tryDeepLink()
    } else {
      router.push("/dashboard")
    }
  }, [session, fromBrowser, fromApp, stytch, router, email])

  // Show a "Return to Phosra" button when already logged in and deep-link is ready
  const storedLoginFrom = typeof window !== "undefined" ? sessionStorage.getItem("phosra-login-from") : null
  const wantsNativeApp = fromApp || storedLoginFrom === "phosra-app" || fromBrowser || storedLoginFrom === "phosra-browser"

  if (session && wantsNativeApp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F8F8] px-8 gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Signed In</h1>
          <p className="text-gray-500">Tap below to return to the Phosra app.</p>
        </div>
        {deepLinkURL ? (
          <a
            href={deepLinkURL}
            className="w-full max-w-sm flex items-center justify-center gap-2 bg-black text-white font-semibold py-4 px-6 rounded-2xl text-lg"
          >
            Open Phosra App
          </a>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="animate-spin w-5 h-5" />
            <span>Preparing session...</span>
          </div>
        )}
      </div>
    )
  }

  if (redirecting || (session && !wantsNativeApp)) {
    return null
  }

  const deepLinkOrRedirect = (authSessionToken?: string) => {
    const storedFrom = sessionStorage.getItem("phosra-login-from")
    if (storedFrom === "phosra-browser" || storedFrom === "phosra-app") {
      const scheme = storedFrom === "phosra-app" ? "phosra-app" : "phosra-browser"
      // Use the token from the auth response first, fall back to SDK
      const token = authSessionToken || stytch.session.getTokens()?.session_token
      if (token) {
        sessionStorage.removeItem("phosra-login-from")
        const params = new URLSearchParams({ session_token: token })
        if (email) params.set("email", email)
        window.location.href = `${scheme}://auth?${params.toString()}`
        return
      }
    }
    router.push("/dashboard")
  }

  const handleEmailPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let resp: any
      if (isSignUp) {
        resp = await stytch.passwords.create({
          email,
          password,
          session_duration_minutes: 60 * 24 * 7,
        })
      } else {
        resp = await stytch.passwords.authenticate({
          email,
          password,
          session_duration_minutes: 60 * 24 * 7,
        })
      }
      deepLinkOrRedirect(resp?.session_token)
    } catch (err: any) {
      setError(
        err?.message || (isSignUp ? "Failed to create account" : "Invalid email or password")
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const resp = await stytch.otps.email.loginOrCreate(email, {
        expiration_minutes: 5,
      })
      setOtpMethodId(resp.method_id)
      setOtpSent(true)
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const otpResp = await stytch.otps.authenticate(otpCode, otpMethodId, {
        session_duration_minutes: 60 * 24 * 7,
      })
      deepLinkOrRedirect((otpResp as any)?.session_token)
    } catch (err: any) {
      setError(err?.message || "Invalid or expired code")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleOAuth = () => {
    const redirectUrl = `${window.location.origin}/auth/callback`
    stytch.oauth.google.start({
      login_redirect_url: redirectUrl,
      signup_redirect_url: redirectUrl,
    })
  }

  const handleDevLogin = () => {
    localStorage.setItem("sandbox-session", "default")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark branded panel */}
      <div className="hidden lg:flex w-[40%] bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A] flex-col justify-center px-8 xl:px-16 relative overflow-hidden">
        {/* Ambient background layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 20% 80%, rgba(0,212,126,0.08) 0%, transparent 55%),
              radial-gradient(ellipse 50% 40% at 80% 20%, rgba(38,168,201,0.06) 0%, transparent 50%)
            `,
          }}
        />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center mb-12">
            <img src="/logo-white.svg" alt="Phosra" className="h-8" />
          </div>

          <h1 className="text-white text-3xl xl:text-[44px] font-bold leading-tight mb-6">
            Define once, protect everywhere
          </h1>

          <p className="text-white/60 text-base mb-10 leading-relaxed">
            With a free Phosra account, set up parental controls across every platform and device
          </p>

          <div className="space-y-4">
            {[
              `One spec for ${PLATFORM_STATS.marketingTotal} platforms`,
              "One policy, enforced everywhere automatically",
              "Full compliance with KOSA, COPPA 2.0 & more",
            ].map((text) => (
              <div key={text} className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="none">
                  <path d="M5 10l3 3 7-7" stroke="hsl(157,100%,42%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — auth actions */}
      <div className="flex-1 bg-[#F8F8F8] flex items-center justify-center px-6 py-6 sm:py-12">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex items-center mb-8 lg:hidden">
            <img src="/logo.svg" alt="Phosra" className="h-6" />
          </div>

          <div className="bg-white rounded-sm p-8 sm:p-10" style={{ boxShadow: "rgba(18,18,18,0.08) 0px 8px 16px" }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Phosra</h1>
            <p className="text-muted-foreground text-sm mb-8">
              {authMode === "email-code"
                ? "Sign in with a verification code sent to your email."
                : `${isSignUp ? "Create an account" : "Sign in"} to manage parental controls across all platforms.`}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">
                {error}
              </div>
            )}

            {authMode === "password" ? (
              <>
                <form onSubmit={handleEmailPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-3 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-foreground text-white py-4 text-sm font-medium flex items-center justify-between px-6 rounded-sm hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isSignUp ? "Creating Account..." : "Signing In..."}
                        <span className="w-4" />
                      </>
                    ) : (
                      <>
                        {isSignUp ? "Create Account" : "Sign In"}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-muted-foreground">or</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleOAuth}
                  disabled={loading}
                  className="w-full border border-border bg-white text-foreground py-4 text-sm font-medium flex items-center justify-center gap-3 px-6 rounded-sm hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode("email-code"); setError(null); setOtpSent(false); setOtpCode(""); }}
                  className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition"
                >
                  Sign in with email code
                </button>
              </>
            ) : (
              <>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-foreground text-white py-4 text-sm font-medium flex items-center justify-between px-6 rounded-sm hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending code...
                          <span className="w-4" />
                        </>
                      ) : (
                        <>
                          Send verification code
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      required
                      autoFocus
                      className="w-full px-4 py-3 border border-border rounded-sm text-sm text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
                    />

                    <button
                      type="submit"
                      disabled={loading || otpCode.length < 6}
                      className="w-full bg-foreground text-white py-4 text-sm font-medium flex items-center justify-between px-6 rounded-sm hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                          <span className="w-4" />
                        </>
                      ) : (
                        <>
                          Verify & sign in
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode(""); setError(null); }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition"
                    >
                      Resend code
                    </button>
                  </form>
                )}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => { setAuthMode("password"); setError(null); setOtpSent(false); setOtpCode(""); }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition"
                  >
                    Back to password sign in
                  </button>
                </div>
              </>
            )}

            <p className="text-muted-foreground text-xs mt-6 text-center leading-relaxed">
              {authMode === "password" && (
                <>
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
                  </button>
                  <br />
                </>
              )}
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms</a>
              {" "}and{" "}
              <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>.
            </p>
          </div>

          {process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" && (
            <button
              onClick={handleDevLogin}
              className="w-full mt-4 flex items-center justify-center gap-2 border border-dashed border-border bg-white/50 py-3 rounded-sm text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition"
            >
              <Terminal className="w-4 h-4" />
              Continue as Dev User
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
