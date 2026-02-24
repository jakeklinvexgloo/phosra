"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Key, BarChart3, LayoutDashboard } from "lucide-react"
import { DOCS_NAV, type NavGroup } from "@/lib/developers/docs-nav"

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-600",
  POST: "text-blue-600",
  PUT: "text-amber-600",
  DELETE: "text-red-600",
  PATCH: "text-purple-600",
}

const DASHBOARD_LINKS = [
  { title: "Overview", href: "/dashboard/developers", icon: LayoutDashboard },
  { title: "API Keys", href: "/dashboard/developers/keys", icon: Key },
  { title: "Usage", href: "/dashboard/developers/usage", icon: BarChart3 },
]

interface DevDocsSidebarProps {
  onNavigate?: () => void
}

export function DevDocsSidebar({ onNavigate }: DevDocsSidebarProps) {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    DOCS_NAV.forEach((group) => {
      initial[group.title] = group.defaultOpen ?? false
      // Also open the group containing the current page
      if (group.items.some((item) => item.href === pathname)) {
        initial[group.title] = true
      }
    })
    return initial
  })

  // Detect auth state via Stytch session cookie or sandbox mode
  useEffect(() => {
    const hasCookie = document.cookie.includes("stytch_session")
    const hasSandbox = !!localStorage.getItem("sandbox-session")
    setIsAuthenticated(hasCookie || hasSandbox)
  }, [])

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <nav className="lg:sticky lg:top-[80px] overflow-y-auto max-h-[calc(100vh-100px)] pb-8 scrollbar-hide">
      <div className="space-y-1">
        {DOCS_NAV.map((group) => (
          <div key={group.title}>
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight
                className={`w-3 h-3 transition-transform ${openGroups[group.title] ? "rotate-90" : ""}`}
              />
              {group.title}
            </button>

            {/* Group items */}
            {openGroups[group.title] && (
              <div className="ml-3 border-l border-border/50 space-y-0.5 mb-2">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-2 px-3 py-1.5 text-[13px] transition-colors rounded-r-md ${
                        isActive
                          ? "text-foreground font-medium bg-muted border-l-2 border-foreground -ml-px"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {item.method && (
                        <span className={`text-[10px] font-bold font-mono w-9 flex-shrink-0 ${METHOD_COLORS[item.method] || ""}`}>
                          {item.method}
                        </span>
                      )}
                      <span className="truncate">{item.title}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {/* Dashboard links — shown when user is authenticated */}
        {isAuthenticated && (
          <div className="pt-3 mt-3 border-t border-border/50">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brand-green">
              Your Dashboard
            </div>
            <div className="ml-3 border-l border-brand-green/30 space-y-0.5 mb-2">
              {DASHBOARD_LINKS.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-r-md"
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
