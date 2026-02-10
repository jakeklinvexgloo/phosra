"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { List, X } from "lucide-react"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { DashboardSkeleton } from "@/components/ui/skeleton"
import { CommandPalette } from "@/components/ui/command-palette"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { PublicPageHeader } from "@/components/layout/PublicPageHeader"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"

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

  const isPlayground = pathname.startsWith("/dashboard/playground")

  return (
    <div className={isPlayground ? "h-dvh flex flex-col bg-background" : "min-h-screen bg-background"}>
      {/* Shared header — same as docs/compliance pages */}
      <PublicPageHeader onSearchClick={() => setCmdkOpen(true)} />

      {/* Command Palette */}
      <CommandPalette open={cmdkOpen} onOpenChange={setCmdkOpen} />

      {/* Content area below fixed header */}
      <div className={isPlayground ? "flex-1 pt-14 overflow-hidden" : "pt-14"}>
        {isPlayground ? (
          /* Playground: full-width, no sidebar, fills available height */
          children
        ) : (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-8 py-6 sm:py-10">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 mb-4 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
              {sidebarOpen ? "Close" : "Dashboard Menu"}
            </button>

            <div className="flex gap-6 xl:gap-8">
              {/* Sidebar — hidden on mobile unless toggled */}
              <div className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
                <DashboardSidebar isSandbox={isSandbox} />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 max-w-[960px]">
                <Breadcrumbs />
                {children}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
