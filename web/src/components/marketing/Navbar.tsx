"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/parental-controls", label: "Parental Controls" },
  { href: "/technology-services", label: "Services" },
  { href: "/compliance", label: "Compliance" },
  { href: "/movements", label: "Movements" },
  { href: "/pricing", label: "Pricing" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-black/[0.06] shadow-sm"
          : "bg-white/0 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src={scrolled ? "/logo.svg" : "/logo-white.svg"}
              alt="Phosra"
              className="h-6 transition-opacity"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  scrolled
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium transition px-4 py-2 ${
                scrolled
                  ? "text-foreground hover:opacity-70"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-brand-green text-foreground px-5 py-2.5 rounded-sm transition-all hover:shadow-[0_0_20px_-4px_rgba(0,212,126,0.4)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 ${scrolled ? "text-foreground" : "text-white"}`}
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
