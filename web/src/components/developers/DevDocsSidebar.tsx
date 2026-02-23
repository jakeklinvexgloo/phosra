"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { DOCS_NAV, type NavGroup } from "@/lib/developers/docs-nav"

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-600",
  POST: "text-blue-600",
  PUT: "text-amber-600",
  DELETE: "text-red-600",
  PATCH: "text-purple-600",
}

interface DevDocsSidebarProps {
  onNavigate?: () => void
}

export function DevDocsSidebar({ onNavigate }: DevDocsSidebarProps) {
  const pathname = usePathname()
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
      </div>
    </nav>
  )
}
