"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, Search, ChevronRight, Menu, X } from "lucide-react"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { signOut } from "@/lib/auth-actions"
import { DashboardSkeleton } from "@/components/ui/skeleton"
import { CommandPalette } from "@/components/ui/command-palette"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { EnvironmentBadge } from "@/components/dashboard/EnvironmentBadge"
import { navGroups } from "@/lib/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [isSandbox, setIsSandbox] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cmdkOpen, setCmdkOpen] = useState(false)

  useEffect(() => {
    const sandbox = localStorage.getItem("sandbox-session")
    if (sandbox) {
      setIsSandbox(true)
      return
    }
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Global Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdkOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  if (!isSandbox && (loading || !user)) {
    return <DashboardSkeleton />
  }

  const displayName = isSandbox ? "Dev User" : (user?.firstName || user?.email || "User")

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette open={cmdkOpen} onOpenChange={setCmdkOpen} />

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
      <header className="fixed top-0 left-0 lg:left-[320px] right-0 h-16 lg:h-24 border-b border-border bg-background z-20 flex items-center justify-between px-4 lg:px-8">
        {/* Mobile hamburger + Search trigger */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Command palette trigger */}
          <button
            onClick={() => setCmdkOpen(true)}
            className="relative w-full max-w-xs lg:max-w-sm hidden sm:flex items-center gap-3 pl-3.5 pr-3 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:border-foreground/20 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] font-mono rounded border border-border">
              ⌘K
            </kbd>
          </button>
          {/* Mobile logo (shown when sidebar is hidden) */}
          <div className="flex items-center sm:hidden">
            <img src="/logo.svg" alt="Phosra" className="h-5" />
          </div>
        </div>

        {/* Theme toggle + User info */}
        <div className="flex items-center gap-3 lg:gap-5">
          <ThemeToggle />
          <div className="flex items-center gap-2.5">
            {!isSandbox && user?.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-brand-green text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-foreground font-medium hidden sm:inline">{displayName}</span>
            <EnvironmentBadge isSandbox={isSandbox} />
          </div>
          <button
            onClick={async () => {
              if (isSandbox) {
                localStorage.removeItem("sandbox-session")
                router.push("/login")
              } else {
                await signOut()
                router.push("/login")
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
            <Breadcrumbs />
            {children}
          </div>
        )}
      </main>
    </div>
  )
}
