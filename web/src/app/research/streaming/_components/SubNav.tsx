"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { label: "Portal", href: "/research/streaming" },
  { label: "Compare", href: "/research/streaming/compare" },
  { label: "Categories", href: "/research/streaming/categories" },
  { label: "Methodology", href: "/research/streaming/methodology" },
] as const

export function SubNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-14 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px">
          {TABS.map((tab) => {
            const isActive =
              tab.href === "/research/streaming"
                ? pathname === "/research/streaming"
                : pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-shrink-0 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                  isActive
                    ? "border-brand-green text-brand-green"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
