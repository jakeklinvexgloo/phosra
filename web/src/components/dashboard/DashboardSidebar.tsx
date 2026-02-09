"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navGroups } from "@/lib/navigation"
import { EnvironmentBadge } from "./EnvironmentBadge"

interface DashboardSidebarProps {
  isSandbox: boolean
}

export function DashboardSidebar({ isSandbox }: DashboardSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:block w-[220px] flex-shrink-0">
      <nav className="lg:sticky lg:top-[88px] space-y-6">
        {/* Environment badge */}
        <div className="px-1">
          <EnvironmentBadge isSandbox={isSandbox} />
        </div>

        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded text-[13px] transition-colors ${
                      active
                        ? "text-foreground font-medium bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-brand-green" : ""}`} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
