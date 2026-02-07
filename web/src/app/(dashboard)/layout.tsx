"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Users, ShieldCheck, Gavel, Settings, LogOut, Sun, Moon, Monitor, Shield, Zap } from "lucide-react"
import { isAuthenticated, logout } from "@/lib/auth"
import { api } from "@/lib/api"
import { useTheme } from "@/lib/theme"
import type { User } from "@/lib/types"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/children", label: "Children", icon: Users },
  { href: "/dashboard/platforms", label: "Platforms", icon: ShieldCheck },
  { href: "/dashboard/enforcement", label: "Enforcement", icon: Gavel },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/")
      return
    }
    api.me().then(setUser).catch(() => router.push("/"))
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ]

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Logo block with glass accent */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">GuardianGate</h1>
              <p className="text-xs text-muted-foreground">Child Safety Standard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}

          <div className="pt-3">
            <Link
              href="/dashboard/setup"
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === "/dashboard/setup"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {pathname === "/dashboard/setup" && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Zap className="w-5 h-5" />
              Quick Setup
            </Link>
          </div>
        </nav>

        {/* Theme toggle */}
        <div className="px-4 pb-3">
          <div className="flex items-center rounded-lg bg-muted/50 p-1">
            {themeOptions.map((opt) => {
              const Icon = opt.icon
              const isActive = theme === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={opt.label}
                >
                  {isActive && (
                    <motion.div
                      layoutId="theme-indicator"
                      className="absolute inset-0 rounded-md bg-card shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { api.logout().catch(() => {}); logout() }}
            className="mt-3 w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div key={pathname} {...pageTransition}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
