"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { Terminal, ChevronRight, Loader2 } from "lucide-react"
import { PLATFORM_STATS } from "@/lib/platforms"
import { signIn, signUp } from "@/lib/auth-actions"

export default function LoginPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [redirecting, setRedirecting] = useState(false)

  // If user is already signed in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [loading, user, router])

  const handleSignIn = async () => {
    setRedirecting(true)
    // Server action: generates WorkOS authorization URL and redirects
    await signIn()
  }

  const handleSignUp = async () => {
    setRedirecting(true)
    // Server action: generates WorkOS sign-up URL and redirects
    await signUp()
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
              `Age-appropriate defaults across ${PLATFORM_STATS.marketingTotal} platforms`,
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
              Sign in or create an account to manage parental controls across all platforms.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleSignIn}
                disabled={redirecting}
                className="w-full bg-foreground text-white py-4 text-sm font-medium flex items-center justify-between px-6 rounded-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {redirecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting...
                    <span className="w-4" />
                  </>
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={handleSignUp}
                disabled={redirecting}
                className="w-full border border-border bg-white text-foreground py-4 text-sm font-medium flex items-center justify-between px-6 rounded-sm hover:bg-gray-50 transition disabled:opacity-50"
              >
                Create Account
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-muted-foreground text-xs mt-6 text-center leading-relaxed">
              Supports email/password, Google, and enterprise SSO.
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
