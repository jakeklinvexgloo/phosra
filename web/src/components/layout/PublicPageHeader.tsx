"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/platforms", label: "Platforms" },
  { href: "/compliance", label: "Compliance" },
  { href: "/pricing", label: "Pricing" },
  { href: "/playground", label: "Playground" },
]

export function PublicPageHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-1 -ml-1 text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="Phosra" className="h-5" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    isActive
                      ? "font-medium text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium bg-brand-green text-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm transition-all hover:shadow-[0_0_20px_-4px_rgba(0,212,126,0.4)]"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="sm:hidden border-b border-border bg-background px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? "font-medium text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-border mt-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
