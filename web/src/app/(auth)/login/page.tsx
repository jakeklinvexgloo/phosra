"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import { AnimatePresence, motion } from "framer-motion"
import { Shield, Users, Code, Terminal, ChevronRight } from "lucide-react"

type Mode = "signin" | "register-role" | "register-form" | "verify-email"
type Role = "parent" | "platform" | "developer"

const ROLES: { id: Role; icon: typeof Users; title: string; description: string }[] = [
  { id: "parent", icon: Users, title: "Parent or guardian", description: "I want to protect my children across platforms and devices" },
  { id: "platform", icon: Code, title: "Platform developer", description: "I want to integrate Phosra compliance into my platform" },
  { id: "developer", icon: Terminal, title: "API explorer", description: "I want to explore the PCSS API and test integrations" },
]

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn()
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInLoaded || !signIn) return
    setError("")
    setLoading(true)

    try {
      const result = await signIn.create({ identifier: email, password })

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        setError("Additional verification required. Please try again.")
      }
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid credentials"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpLoaded || !signUp) return
    setError("")
    setLoading(true)

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: name,
      })

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setMode("verify-email")
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Registration failed"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpLoaded || !signUp) return
    setError("")
    setLoading(true)

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode })

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        setError("Verification incomplete. Please try again.")
      }
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid verification code"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!signInLoaded || !signIn) return
    setError("")
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      })
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Google sign-in failed"
      setError(msg)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!signUpLoaded || !signUp) return
    setError("")
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      })
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Google sign-up failed"
      setError(msg)
    }
  }

  const handleDevLogin = () => {
    localStorage.setItem("sandbox-session", "default")
    router.push("/dashboard")
  }

  const switchTo = (m: Mode) => {
    setError("")
    setMode(m)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark branded panel */}
      <div className="hidden lg:flex w-[40%] bg-[#111111] flex-col justify-center px-12 xl:px-16">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <Shield className="w-8 h-8 text-[hsl(157,100%,42%)]" strokeWidth={1.5} />
            <span className="text-white text-xl font-semibold tracking-tight">Phosra</span>
          </div>

          <h1 className="text-white text-4xl xl:text-[44px] font-bold leading-tight mb-6">
            Define once, protect everywhere
          </h1>

          <p className="text-white/60 text-base mb-10 leading-relaxed">
            With a free Phosra account, set up parental controls across every platform and device
          </p>

          <div className="space-y-4">
            {[
              "Age-appropriate defaults across 15+ platforms",
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

      {/* Right panel — form area */}
      <div className="flex-1 bg-[#F8F8F8] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Shield className="w-6 h-6 text-[hsl(157,100%,42%)]" strokeWidth={1.5} />
            <span className="text-foreground text-lg font-semibold tracking-tight">Phosra</span>
          </div>

          <div className="bg-white rounded-sm p-8 sm:p-10" style={{ boxShadow: "rgba(18,18,18,0.08) 0px 8px 16px" }}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-destructive/10 text-destructive p-3 rounded mb-6 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* Sign In */}
              {mode === "signin" && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
                  <p className="text-muted-foreground text-sm mb-8">
                    Need an account?{" "}
                    <button onClick={() => switchTo("register-role")} className="text-foreground font-medium underline underline-offset-2 hover:opacity-70 transition">
                      Get started
                    </button>
                  </p>

                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 border border-border bg-white py-3.5 rounded-sm text-sm font-medium text-foreground hover:bg-gray-50 transition mb-6"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="plaid-input" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="plaid-input" required minLength={8} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-foreground text-white py-4 text-sm font-medium flex items-center justify-between px-6 rounded-sm hover:opacity-90 transition disabled:opacity-50">
                      {loading ? "Signing in..." : "Sign In"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>

                  <p className="text-muted-foreground text-sm mt-4">
                    <button className="underline underline-offset-2 hover:opacity-70 transition">Forgot password?</button>
                  </p>
                </motion.div>
              )}

              {/* Register Step 1: Role Selection */}
              {mode === "register-role" && (
                <motion.div
                  key="register-role"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome! How can we help you get started?</h1>
                  <p className="text-muted-foreground text-sm mb-8">
                    Tell us about your goals so we can get you to the right place.
                  </p>

                  <div className="space-y-3 mb-8">
                    {ROLES.map(({ id, icon: Icon, title, description }) => (
                      <button
                        key={id}
                        onClick={() => setSelectedRole(id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-sm border text-left transition ${
                          selectedRole === id
                            ? "border-foreground bg-white shadow-sm"
                            : "border-border bg-white hover:border-foreground/30"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${
                          selectedRole === id ? "bg-foreground" : "bg-[#F5F5F5]"
                        }`}>
                          <Icon className={`w-5 h-5 ${selectedRole === id ? "text-white" : "text-muted-foreground"}`} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => selectedRole && switchTo("register-form")}
                    disabled={!selectedRole}
                    className={`w-full py-4 text-sm font-medium flex items-center justify-between px-6 rounded-sm transition ${
                      selectedRole
                        ? "bg-foreground text-white hover:opacity-90"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <p className="text-muted-foreground text-sm mt-6 text-center">
                    Already have an account?{" "}
                    <button onClick={() => switchTo("signin")} className="text-foreground font-medium underline underline-offset-2 hover:opacity-70 transition">
                      Sign in
                    </button>
                  </p>
                </motion.div>
              )}

              {/* Register Step 2: Account Form */}
              {mode === "register-form" && (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
                  <p className="text-muted-foreground text-sm mb-8">
                    Already have an account?{" "}
                    <button onClick={() => switchTo("signin")} className="text-foreground font-medium underline underline-offset-2 hover:opacity-70 transition">
                      Sign in
                    </button>
                  </p>

                  <button
                    onClick={handleGoogleSignUp}
                    className="w-full flex items-center justify-center gap-3 border border-border bg-white py-3.5 rounded-sm text-sm font-medium text-foreground hover:bg-gray-50 transition mb-6"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign up with Google
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="plaid-input" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="plaid-input" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="plaid-input" required minLength={8} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-foreground text-white py-4 text-sm font-medium flex items-center justify-between px-6 rounded-sm hover:opacity-90 transition disabled:opacity-50">
                      {loading ? "Creating account..." : "Create Account"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Email Verification */}
              {mode === "verify-email" && (
                <motion.div
                  key="verify-email"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <h1 className="text-3xl font-bold text-foreground mb-2">Verify your email</h1>
                  <p className="text-muted-foreground text-sm mb-8">
                    We sent a verification code to <span className="font-medium text-foreground">{email}</span>
                  </p>

                  <form onSubmit={handleVerifyEmail} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Verification code</label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="plaid-input text-center text-lg tracking-widest"
                        required
                        maxLength={6}
                        placeholder="000000"
                        autoFocus
                      />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-foreground text-white py-4 text-sm font-medium flex items-center justify-between px-6 rounded-sm hover:opacity-90 transition disabled:opacity-50">
                      {loading ? "Verifying..." : "Verify Email"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
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
