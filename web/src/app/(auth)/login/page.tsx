"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useStytch, useStytchSession } from "@stytch/nextjs"
import { Terminal, ChevronRight, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { PLATFORM_STATS } from "@/lib/platforms"

export default function LoginPage() {
  const router = useRouter()
  const stytch = useStytch()
  const { session } = useStytchSession()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If user is already signed in, redirect to dashboard
  if (session) {
    router.push("/dashboard")
    return null
  }

  const handleEmailPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        await stytch.passwords.create({
          email,
          password,
          session_duration_minutes: 60 * 24 * 7,
        })
      } else {
        await stytch.passwords.authenticate({
          email,
          password,
          session_duration_minutes: 60 * 24 * 7,
        })
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(
        err?.message || (isSignUp ? "Failed to create account" : "Invalid email or password")
      )
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
              {isSignUp ? "Create an account" : "Sign in"} to manage parental controls across all platforms.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">
                {error}
              </div>
            )}

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

            <p className="text-muted-foreground text-xs mt-6 text-center leading-relaxed">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
                className="underline underline-offset-2 hover:text-foreground"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
              </button>
              <br />
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
