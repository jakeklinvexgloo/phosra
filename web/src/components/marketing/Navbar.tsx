"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#developers", label: "Developers" },
  { href: "#compliance", label: "Compliance" },
  { href: "/dashboard/docs", label: "Docs" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="Phosra" className="h-6" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:opacity-70 transition px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-brand-green text-foreground px-5 py-2.5 rounded-sm hover:opacity-90 transition"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border space-y-2">
            <Link
              href="/login"
              className="block text-sm font-medium text-foreground py-2"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="block text-sm font-medium bg-brand-green text-foreground text-center px-5 py-2.5 rounded-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
