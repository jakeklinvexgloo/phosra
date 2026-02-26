"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Search, LogOut, ChevronDown, LayoutDashboard } from "lucide-react"
import { useStytchUser, useStytch } from "@stytch/nextjs"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const NAV_LINKS = [
  { href: "/developers", label: "Developers" },
  { href: "/parental-controls", label: "Parental Controls" },
  { href: "/technology-services", label: "Services" },
  { href: "/compliance", label: "Compliance" },
  { href: "/movements", label: "Movements" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
]

interface PublicPageHeaderProps {
  /** When true, shows Cmd+K search trigger and passes onSearchClick */
  onSearchClick?: () => void
}

export function PublicPageHeader({ onSearchClick }: PublicPageHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, isInitialized } = useStytchUser()
  const stytchClient = useStytch()

  // Check sandbox mode (dev only)
  const [isSandbox, setIsSandbox] = useState(false)
  useEffect(() => {
    setIsSandbox(process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" && !!localStorage.getItem("sandbox-session"))
  }, [])

  const isAuthenticated = isInitialized && (!!user || isSandbox)
  const displayName = isSandbox ? "Dev User" : (user?.name?.first_name || user?.emails?.[0]?.email || "User")

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Determine active link — dashboard pages highlight nothing in the top nav
  const isNavActive = (href: string) => {
    if (pathname.startsWith("/dashboard")) return false
    return pathname.startsWith(href)
  }

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
              const isActive = isNavActive(link.href)
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
          {/* Cmd+K search trigger (only when a handler is provided, i.e. dashboard) */}
          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 border border-border rounded-lg text-sm text-muted-foreground hover:border-foreground/20 hover:bg-muted/50 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <kbd className="text-[10px] font-mono text-muted-foreground/60">⌘K</kbd>
            </button>
          )}

          <ThemeToggle />

          {isAuthenticated ? (
            /* Authenticated: avatar dropdown */
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-brand-green text-xs font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-foreground font-medium hidden sm:inline max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                  {!pathname.startsWith("/dashboard") && (
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      setUserMenuOpen(false)
                      if (isSandbox) {
                        localStorage.removeItem("sandbox-session")
                        router.push("/login")
                      } else {
                        await stytchClient.session.revoke()
                        router.push("/login")
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated: Log in + Get Started */
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="sm:hidden border-b border-border bg-background px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = isNavActive(link.href)
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
          {isAuthenticated ? (
            <div className="pt-2 border-t border-border mt-2 space-y-1">
              {!pathname.startsWith("/dashboard") && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={async () => {
                  setMobileOpen(false)
                  if (isSandbox) {
                    localStorage.removeItem("sandbox-session")
                    router.push("/login")
                  } else {
                    await stytchClient.session.revoke()
                    router.push("/login")
                  }
                }}
                className="block w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-border mt-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
