"use client"

import { useState, useRef, useEffect, useCallback, FormEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ChevronDown, Search, LogOut, LayoutDashboard, ArrowRight } from "lucide-react"
import { useStytchUser, useStytch } from "@stytch/nextjs"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { MegaMenuPanel, MegaMenuContent } from "./mega-menu"
import { MobileNav } from "./MobileNav"
import { NAV_ENTRIES, isDropdownActive } from "@/lib/nav-config"
import type { NavDropdown } from "@/lib/nav-config"

/* ── Typewriter prompts ─────────────────────────────────────────────── */
const CYCLING_PROMPTS = [
  "Check if my app complies with COPPA...",
  "What age-gating do I need for the UK?",
  "Scan my privacy policy for COPPA gaps...",
  "How does KOSA affect social platforms?",
  "Generate a parental consent flow...",
]

const QUICK_CHIPS = [
  "Protect kids on streaming",
  "Implement 4 Norms",
  "Set 1 hour screen limit for all kids",
]

interface SiteHeaderProps {
  /** "transparent" for homepage hero; defaults to solid/light */
  variant?: "transparent" | "solid"
  /** Cmd+K search callback (dashboard) */
  onSearchClick?: () => void
}

export function SiteHeader({ variant: variantProp, onSearchClick }: SiteHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isInitialized } = useStytchUser()
  const stytchClient = useStytch()

  // Sandbox mode (dev only)
  const [isSandbox, setIsSandbox] = useState(false)
  useEffect(() => {
    setIsSandbox(
      process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" &&
        !!localStorage.getItem("sandbox-session")
    )
  }, [])

  const isAuthenticated = isInitialized && (!!user || isSandbox)
  const displayName = isSandbox
    ? "Dev User"
    : user?.name?.first_name || user?.emails?.[0]?.email || "User"

  // Scroll state — only relevant when variant === "transparent"
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (variantProp !== "transparent") return
    const handleScroll = () => setScrolled(window.scrollY > 50)
    handleScroll() // check on mount
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [variantProp])

  // Mobile menu
  const [mobileOpen, setMobileOpen] = useState(false)

  // Compute visual mode: dark (transparent hero not scrolled, or mobile nav open) or light (everything else)
  const isDark = (variantProp === "transparent" && !scrolled) || mobileOpen

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navContainerRef = useRef<HTMLDivElement>(null)

  const openMenu = useCallback((label: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setOpenDropdown(label)
  }, [])

  const closeMenu = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 150)
  }, [])

  const closeMenuImmediate = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setOpenDropdown(null)
  }, [])

  // User menu
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

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

  // Close dropdowns on route change
  useEffect(() => {
    closeMenuImmediate()
    setMobileOpen(false)
  }, [pathname, closeMenuImmediate])

  const handleSignOut = async () => {
    if (isSandbox) {
      localStorage.removeItem("sandbox-session")
      router.push("/login")
    } else {
      await stytchClient.session.revoke()
      router.push("/login")
    }
  }

  /* ── Prompt strip state ───────────────────────────────────────────── */
  const showPromptStrip = variantProp === "transparent" && !scrolled
  const [promptValue, setPromptValue] = useState("")
  const [promptFocused, setPromptFocused] = useState(false)
  const [typewriterIndex, setTypewriterIndex] = useState(0)
  const [typewriterText, setTypewriterText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const promptInputRef = useRef<HTMLInputElement>(null)

  // Typewriter effect
  useEffect(() => {
    if (promptFocused || promptValue) return
    const target = CYCLING_PROMPTS[typewriterIndex]
    const speed = isDeleting ? 30 : 55

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typewriterText.length < target.length) {
          setTypewriterText(target.slice(0, typewriterText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 1800)
        }
      } else {
        if (typewriterText.length > 0) {
          setTypewriterText(typewriterText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setTypewriterIndex((i) => (i + 1) % CYCLING_PROMPTS.length)
        }
      }
    }, speed)

    return () => clearTimeout(timeout)
  }, [typewriterText, isDeleting, typewriterIndex, promptFocused, promptValue])

  const handlePromptSubmit = (text: string) => {
    if (!text.trim()) return
    window.dispatchEvent(
      new CustomEvent("phosra-playground-prompt", { detail: text.trim() })
    )
    setPromptValue("")
    setPromptFocused(false)
    promptInputRef.current?.blur()
    router.push("/developers/playground")
  }

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    handlePromptSubmit(promptValue)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Centered pill container */}
        <div className="flex justify-center pt-3 px-4 relative z-20">
          <div
            ref={navContainerRef}
            className={`relative flex items-center h-12 px-1.5 rounded-full transition-all duration-300 ${
              isDark
                ? "bg-[rgba(13,27,42,0.4)] backdrop-blur-[24px] saturate-[140%] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "bg-white/[0.85] backdrop-blur-[24px] saturate-[180%] border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)]"
            }`}
          >
            {/* Green accent line at bottom */}
            <div
              className={`absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full ${
                isDark
                  ? "bg-gradient-to-r from-transparent via-[#00D47E]/40 to-transparent"
                  : "bg-gradient-to-r from-transparent via-[#00D47E]/30 to-transparent"
              }`}
            />

            {/* Logo */}
            <Link href="/" className="flex items-center h-9 px-4 rounded-full">
              <img
                src={isDark ? "/logo-white.svg" : "/logo.svg"}
                alt="Phosra"
                className="h-5"
                width={80}
                height={20}
              />
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-0.5 px-1">
              {NAV_ENTRIES.map((entry) => {
                if (entry.type === "link") {
                  const isActive = pathname.startsWith(entry.data.href)
                  return (
                    <Link
                      key={entry.data.href}
                      href={entry.data.href}
                      className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors whitespace-nowrap ${
                        isActive
                          ? "text-[#00D47E]"
                          : isDark
                          ? "text-white/55 hover:text-white/90 hover:bg-white/[0.06]"
                          : "text-slate-500 hover:text-slate-900 hover:bg-black/[0.03]"
                      }`}
                    >
                      {entry.data.label}
                    </Link>
                  )
                }

                const dropdown = entry.data as NavDropdown
                const isActive = isDropdownActive(dropdown, pathname)
                const isOpen = openDropdown === dropdown.label

                return (
                  <div
                    key={dropdown.label}
                    onMouseEnter={() => openMenu(dropdown.label)}
                    onMouseLeave={closeMenu}
                    className="relative"
                  >
                    <Link
                      href={dropdown.href}
                      className={`flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors whitespace-nowrap ${
                        isActive
                          ? "text-[#00D47E]"
                          : isDark
                          ? "text-white/55 hover:text-white/90 hover:bg-white/[0.06]"
                          : "text-slate-500 hover:text-slate-900 hover:bg-black/[0.03]"
                      }`}
                    >
                      {dropdown.label}
                      <ChevronDown
                        className={`w-2.5 h-2.5 opacity-40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </Link>
                  </div>
                )
              })}
            </nav>

            {/* Divider */}
            <div
              className={`hidden lg:block w-px h-5 mx-1.5 ${
                isDark ? "bg-white/[0.12]" : "bg-black/[0.08]"
              }`}
            />

            {/* Right side: search, theme, auth, CTAs */}
            <div className="flex items-center gap-1">
              {/* Cmd+K search trigger (dashboard only) */}
              {onSearchClick && (
                <button
                  onClick={onSearchClick}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-colors ${
                    isDark
                      ? "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                      : "text-slate-400 border border-black/[0.06] hover:border-black/[0.12] hover:bg-black/[0.02]"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <kbd className="text-[10px] font-mono opacity-60">⌘K</kbd>
                </button>
              )}

              <ThemeToggle />

              {isAuthenticated ? (
                <div ref={userMenuRef} className="relative hidden lg:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 px-2 py-1 rounded-full transition-colors ${
                      isDark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.03]"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#00D47E]/15 flex items-center justify-center text-[#00D47E] text-xs font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`text-sm font-medium max-w-[100px] truncate ${
                        isDark ? "text-white/80" : "text-slate-700"
                      }`}
                    >
                      {displayName}
                    </span>
                    <ChevronDown className={`w-3 h-3 ${isDark ? "text-white/40" : "text-slate-400"}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-black/[0.06] rounded-xl shadow-lg py-1 z-50">
                      {!pathname.startsWith("/dashboard") && (
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false)
                          await handleSignOut()
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`hidden lg:block px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors ${
                      isDark
                        ? "text-white/55 hover:text-white"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/login"
                    className="hidden lg:block px-4 py-1.5 text-[13px] font-semibold bg-[#00D47E] text-slate-900 rounded-full transition-all hover:shadow-[0_0_20px_-2px_rgba(0,212,126,0.5)] hover:-translate-y-[1px]"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden p-2 rounded-full ${
                  isDark ? "text-white" : "text-slate-700"
                }`}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Mega-menu dropdown panels (positioned inside pill container for proper relative positioning) */}
            {NAV_ENTRIES.filter((e) => e.type === "dropdown").map((entry) => {
              const dropdown = entry.data as NavDropdown
              return (
                <MegaMenuPanel
                  key={dropdown.label}
                  open={openDropdown === dropdown.label}
                  variant={isDark ? "dark" : "light"}
                  columns={dropdown.columns ?? 2}
                  onMouseEnter={() => openMenu(dropdown.label)}
                  onMouseLeave={closeMenu}
                >
                  <MegaMenuContent
                    dropdown={dropdown}
                    variant={isDark ? "dark" : "light"}
                    onClose={closeMenuImmediate}
                  />
                </MegaMenuPanel>
              )
            })}
          </div>
        </div>

        {/* ── Prompt sub-strip (homepage only, not scrolled) ──────────── */}
        <div
          className={`relative z-10 flex justify-center px-4 transition-all duration-300 ${
            showPromptStrip
              ? "opacity-100 translate-y-0 pointer-events-auto mt-2"
              : "opacity-0 -translate-y-2 pointer-events-none mt-0 h-0 overflow-hidden"
          }`}
        >
          <div className="relative flex items-center h-[44px] w-full max-w-[640px] rounded-full bg-[rgba(13,27,42,0.35)] backdrop-blur-[20px] saturate-[140%] border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.04)] px-3 gap-2.5">
            {/* TRY API badge */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D47E] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D47E]" />
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-white/60">
                Try API
              </span>
            </div>

            {/* Thin separator */}
            <div className="hidden sm:block w-px h-5 bg-white/[0.1] shrink-0" />

            {/* Prompt input */}
            <form onSubmit={handleFormSubmit} className="flex-1 flex items-center min-w-0">
              <div className="relative flex-1 min-w-0">
                <input
                  ref={promptInputRef}
                  type="text"
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  onFocus={() => setPromptFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setPromptFocused(false), 200)
                  }}
                  className="w-full bg-transparent text-[13px] text-white/90 placeholder-transparent outline-none caret-[#00D47E]"
                  placeholder="Ask Phosra anything..."
                />
                {!promptValue && !promptFocused && (
                  <span className="absolute inset-0 flex items-center text-[13px] text-white/35 pointer-events-none truncate">
                    {typewriterText}
                    <span className="animate-pulse ml-px">|</span>
                  </span>
                )}
              </div>

              {/* Submit arrow */}
              <button
                type="submit"
                disabled={!promptValue.trim()}
                className="shrink-0 w-7 h-7 rounded-full bg-[#00D47E] flex items-center justify-center transition-all hover:shadow-[0_0_14px_-2px_rgba(0,212,126,0.5)] hover:scale-105 disabled:opacity-30 disabled:hover:shadow-none disabled:hover:scale-100"
              >
                <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
              </button>
            </form>
          </div>

          {/* Quick-prompt chips (fade in on focus) */}
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 flex items-center gap-2 mt-2 transition-all duration-300 ease-out ${
              promptFocused
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            {QUICK_CHIPS.map((chip, i) => (
              <button
                key={chip}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handlePromptSubmit(chip)
                }}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium text-white/70 bg-[rgba(13,27,42,0.45)] backdrop-blur-[16px] border border-white/[0.08] hover:bg-[rgba(13,27,42,0.6)] hover:text-white/90 transition-all whitespace-nowrap"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile navigation overlay */}
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
        displayName={displayName}
        onSignOut={handleSignOut}
      />
    </>
  )
}
