"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (isLogin) {
        const data = await api.login(email, password)
        localStorage.setItem("access_token", data.tokens.access_token)
        localStorage.setItem("refresh_token", data.tokens.refresh_token)
      } else {
        const data = await api.register(email, password, name)
        localStorage.setItem("access_token", data.tokens.access_token)
        localStorage.setItem("refresh_token", data.tokens.refresh_token)
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="relative glass rounded-2xl shadow-xl p-8 w-full max-w-md border border-border/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            GuardianGate
          </h1>
          <p className="text-muted-foreground mt-2">Universal Parental Controls</p>
        </div>

        {/* Sliding tab indicator */}
        <div className="relative flex mb-6 border-b border-border">
          <button
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${isLogin ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${!isLogin ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
          <motion.div
            className="absolute bottom-0 h-0.5 bg-primary rounded-full"
            animate={{ left: isLogin ? "0%" : "50%", width: "50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            className="w-full gradient-primary text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/25"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
