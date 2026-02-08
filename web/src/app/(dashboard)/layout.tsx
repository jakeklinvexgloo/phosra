"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, Shield, Home, Zap, BookOpen, Globe, Users, Settings, Search, ChevronRight, MessageSquare, Menu, X } from "lucide-react"
import { useUser, useClerk } from "@clerk/nextjs"

interface NavItem {
  href: string
  label: string
  icon: typeof Home
  exact?: boolean
  external?: boolean
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Home", icon: Home, exact: true },
      { href: "/dashboard/setup", label: "Quick Setup", icon: Zap },
      { href: "/dashboard/docs", label: "API Docs", icon: BookOpen },
      { href: "/dashboard/playground", label: "Playground", icon: MessageSquare },
    ],
  },
  {
    label: "Platform Compliance",
    items: [
      { href: "/dashboard/platforms", label: "Platforms", icon: Globe },
      { href: "/dashboard/enforcement", label: "Enforcement", icon: Shield },
    ],
  },
  {
    label: "Family Management",
    items: [
      { href: "/dashboard/children", label: "Children", icon: Users },
    ],
  },
  {
    label: "Settings & Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const [isSandbox, setIsSandbox] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const sandbox = localStorage.getItem("sandbox-session")
    if (sandbox) {
      setIsSandbox(true)
      return
    }
    if (isLoaded && !isSignedIn) {
      router.push("/login")
    }
  }, [isLoaded, isSignedIn, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (!isSandbox && (!isLoaded || !isSignedIn)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const displayName = isSandbox ? "Dev User" : (user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "User")

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-[280px] lg:w-[320px] border-r border-border bg-sidebar flex flex-col z-50 lg:z-30 transition-transform duration-200 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Sidebar header */}
        <div className="h-16 lg:h-24 flex items-center justify-between gap-2.5 px-6 border-b border-border">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Phosra" className="h-6" />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-6" : ""}>
              {group.label && (
                <p className="section-header px-3 mb-2">{group.label}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href, item.exact)
                  if (item.external) {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2 rounded text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Icon className="w-[18px] h-[18px]" />
                        {item.label}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
                      </Link>
                    )
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded text-[14px] transition-colors ${
                        active
                          ? "text-foreground font-medium bg-muted border-l-2 border-foreground -ml-px"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className={`w-[18px] h-[18px] ${active ? "text-brand-green" : ""}`} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Top bar */}
      <header className="fixed top-0 left-0 lg:left-[320px] right-0 h-16 lg:h-24 border-b border-border bg-white z-20 flex items-center justify-between px-4 lg:px-8">
        {/* Mobile hamburger + Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-xs lg:max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            />
          </div>
          {/* Mobile logo (shown when sidebar is hidden) */}
          <div className="flex items-center sm:hidden">
            <img src="/logo.svg" alt="Phosra" className="h-5" />
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 lg:gap-5">
          <div className="flex items-center gap-2.5">
            {!isSandbox && user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-brand-green text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-foreground font-medium hidden sm:inline">{displayName}</span>
            {isSandbox && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">DEV</span>}
          </div>
          <button
            onClick={() => {
              if (isSandbox) {
                localStorage.removeItem("sandbox-session")
                router.push("/login")
              } else {
                signOut({ redirectUrl: "/login" })
              }
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-[320px] pt-16 lg:pt-24">
        {pathname.startsWith("/dashboard/playground") ? (
          <div>{children}</div>
        ) : (
          <div className={pathname.startsWith("/dashboard/docs")
            ? "px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
            : "max-w-[960px] px-4 sm:px-8 lg:px-12 py-6 sm:py-10"}>
            {children}
          </div>
        )}
      </main>
    </div>
  )
}
