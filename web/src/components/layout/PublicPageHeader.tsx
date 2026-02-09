"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/platforms", label: "Platforms" },
  { href: "/playground", label: "Playground" },
  { href: "/pricing", label: "Pricing" },
  { href: "/changelog", label: "Changelog" },
]

export function PublicPageHeader() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 h-14 border-b border-border bg-background z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Phosra" className="h-5" />
        </Link>
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
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium bg-brand-green text-foreground px-4 py-2 rounded-sm transition-all hover:shadow-[0_0_20px_-4px_rgba(0,212,126,0.4)]"
        >
          Get Started
        </Link>
      </div>
    </header>
  )
}
