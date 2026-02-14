"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, Search, X } from "lucide-react"
import { NEW_CATEGORIES, CATEGORY_REFERENCE, CATEGORY_GROUPS } from "@/lib/docs/categories"
import { LegislationSection } from "@/components/docs/LegislationSection"
import { LEGISLATION_REFERENCE } from "@/lib/compliance/adapters/to-legislation"
import { AGE_DEFAULTS_TABLE, AGE_RATING_TABLE } from "@/lib/docs/ratings"
import { RECIPES } from "@/lib/docs/recipes"
import { sections } from "@/lib/docs/sections"
import { ENDPOINTS, getEndpointsBySection } from "@/lib/docs/endpoints"
import { EndpointCard } from "@/components/docs/EndpointCard"
import type { PlatformSupport } from "@/lib/docs/types"
import { PLATFORM_NAMES } from "@/lib/docs/types"

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1`

function Keyword({ children }: { children: string }) {
  return <strong className="text-brand-green font-bold">{children}</strong>
}

function SupportBadge({ support }: { support: PlatformSupport }) {
  if (support === "full") return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Full</span>
  if (support === "partial") return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Partial</span>
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20">None</span>
}

function PlatformSupportIcon({ support }: { support: PlatformSupport }) {
  if (support === "full") return <span className="text-emerald-500" title="Full support">&#10003;</span>
  if (support === "partial") return <span className="text-amber-500" title="Partial support">&#9681;</span>
  return <span className="text-zinc-400" title="No support">&mdash;</span>
}

export function DocsContent({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const [docsTab, setDocsTab] = useState<"specification" | "recipes">("specification")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState("")
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set())
  const [expandedLegislation, setExpandedLegislation] = useState<Set<string>>(new Set())

  // Scroll-to-top & progress bar
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Cmd+K search
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Tab scroll position preservation
  const scrollPositions = useRef<Record<string, number>>({})

  // Scroll listener for scroll-to-top button and progress bar
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (scrollHeight > 0) {
        setScrollProgress(Math.min(window.scrollY / scrollHeight, 1))
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Listen for sidebar Recipes tab-switch event
  useEffect(() => {
    const handleTabSwitch = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail === "recipes") {
        scrollPositions.current[docsTab] = window.scrollY
        setDocsTab("recipes")
      }
    }
    window.addEventListener("docs-tab-switch", handleTabSwitch)
    return () => window.removeEventListener("docs-tab-switch", handleTabSwitch)
  }, [docsTab])

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
      if (e.key === "Escape") {
        setSearchOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus search input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
      setSearchQuery("")
    }
  }, [searchOpen])

  // Build search index
  const searchResults = searchQuery.trim().length < 2 ? [] : (() => {
    const q = searchQuery.toLowerCase()
    const results: { label: string; sublabel: string; id: string; tab: "specification" | "recipes" }[] = []
    // Sections
    for (const s of sections) {
      if (s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) {
        results.push({ label: s.title, sublabel: "Section", id: s.id, tab: "specification" })
      }
    }
    // Endpoints
    for (const ep of ENDPOINTS) {
      if (ep.path.toLowerCase().includes(q) || ep.summary.toLowerCase().includes(q) || ep.id.toLowerCase().includes(q)) {
        results.push({ label: `${ep.method} ${ep.path}`, sublabel: ep.summary, id: ep.id, tab: "specification" })
      }
    }
    // Categories
    for (const cat of CATEGORY_REFERENCE) {
      if (cat.id.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q)) {
        results.push({ label: cat.id, sublabel: cat.name, id: `rule-categories`, tab: "specification" })
      }
    }
    // Legislation
    for (const leg of LEGISLATION_REFERENCE) {
      if (leg.law.toLowerCase().includes(q) || leg.summary.toLowerCase().includes(q)) {
        results.push({ label: leg.law, sublabel: leg.jurisdiction, id: "legislation", tab: "specification" })
      }
    }
    // Recipes
    for (const r of RECIPES) {
      if (r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q)) {
        results.push({ label: r.title, sublabel: "Recipe", id: `recipe-${r.id}`, tab: "recipes" })
      }
    }
    return results.slice(0, 12)
  })()

  const handleSearchNavigate = (result: { id: string; tab: "specification" | "recipes" }) => {
    setSearchOpen(false)
    if (result.tab !== docsTab) {
      scrollPositions.current[docsTab] = window.scrollY
      setDocsTab(result.tab)
    }
    // Wait for tab switch animation to complete, then scroll
    setTimeout(() => {
      const el = document.getElementById(result.id)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 200)
  }

  // Tab switch with scroll position preservation
  const handleTabSwitch = useCallback((tab: "specification" | "recipes") => {
    scrollPositions.current[docsTab] = window.scrollY
    setDocsTab(tab)
    // Restore scroll position after animation
    setTimeout(() => {
      window.scrollTo(0, scrollPositions.current[tab] || 0)
    }, 200)
  }, [docsTab])

  const toggleRecipe = (id: string) => {
    setExpandedRecipes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const expandAllRecipes = () => setExpandedRecipes(new Set(RECIPES.map(r => r.id)))
  const collapseAllRecipes = () => setExpandedRecipes(new Set())

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const expandAll = () => setExpandedCategories(new Set(CATEGORY_REFERENCE.map(c => c.id)))
  const collapseAll = () => setExpandedCategories(new Set())

  const toggleLegislation = (id: string) => {
    setExpandedLegislation(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredReference = categoryFilter
    ? CATEGORY_REFERENCE.filter(c =>
        c.id.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        c.name.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        c.description.toLowerCase().includes(categoryFilter.toLowerCase())
      )
    : CATEGORY_REFERENCE

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-background"}>
      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-[hsl(var(--brand-green))] z-50 transition-[width] duration-150 ease-out"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* Cmd+K Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-lg mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search sections, endpoints, categories, laws..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            {searchResults.length > 0 ? (
              <div className="max-h-80 overflow-y-auto py-2">
                {searchResults.map((result, i) => (
                  <button
                    key={`${result.id}-${i}`}
                    onClick={() => handleSearchNavigate(result)}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{result.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.sublabel}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex-shrink-0">
                      {result.tab === "recipes" ? "Recipes" : "Spec"}
                    </span>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim().length >= 2 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header — only shown on public /docs page */}
      {!hideHeader && (
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">PCSS v1.0</h1>
              <p className="text-sm text-muted-foreground mt-1">
                The Phosra Child Safety Standard
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/dashboard" className="text-sm bg-foreground text-white rounded-full px-4 py-2 hover:opacity-90 transition">
                Dashboard
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Tab bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 overflow-x-hidden">
        <div className="relative flex items-center border-b border-border">
          {(["specification", "recipes"] as const).map(t => (
            <button key={t} onClick={() => handleTabSwitch(t)}
              className={`relative px-4 sm:px-5 py-3 text-sm font-medium transition-colors ${
                docsTab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t === "specification" ? "Specification" : "Recipes"}
              {docsTab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 border border-border rounded-md hover:bg-muted hover:text-foreground transition-colors"
          >
            <Search className="w-3 h-3" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline text-[10px] bg-background px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={docsTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="py-8"
        >
        {docsTab === "specification" ? (
          <>
        {/* Main content — sidebar is now in the docs layout */}
        <div className="space-y-12 overflow-x-hidden">
          {/* Preamble */}
          <section id="preamble">
            <div className="bg-accent/5 border border-accent/20 rounded p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Phosra Child Safety Standard (PCSS) v1.0</h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                This document defines the <strong className="text-foreground">Phosra Child Safety Standard (PCSS)</strong>, a mandatory regulatory framework
                for technology platforms that serve minors. All regulated platforms <Keyword>MUST</Keyword> implement this standard
                to achieve and maintain compliance certification.
              </p>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                PCSS establishes a universal policy framework spanning 45 safety categories across 12 domains: Content, Time, Purchase,
                Social, Web, Privacy, Monitoring, Algorithmic Safety, Notifications, Advertising &amp; Data, and Access Control.
                Platforms <Keyword>SHALL</Keyword> expose compliance endpoints that accept policy
                enforcement requests from the Phosra Enforcement Engine.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This standard is administered by Phosra in coordination with government child safety authorities.
                Non-compliance may result in regulatory action as defined in Section 10.
              </p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">45</p>
                  <p className="text-xs text-muted-foreground">Policy Categories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">5</p>
                  <p className="text-xs text-muted-foreground">Rating Systems</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">15</p>
                  <p className="text-xs text-muted-foreground">Regulated Platforms</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">3</p>
                  <p className="text-xs text-muted-foreground">Compliance Levels</p>
                </div>
              </div>
            </div>
          </section>

          {/* RFC 2119 */}
          <section id="rfc2119" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">RFC 2119 Keywords</h2>
            <div className="bg-card rounded border border-border p-6">
              <p className="text-sm text-muted-foreground mb-4">
                The key words &quot;MUST&quot;, &quot;MUST NOT&quot;, &quot;REQUIRED&quot;, &quot;SHALL&quot;, &quot;SHALL NOT&quot;, &quot;SHOULD&quot;,
                &quot;SHOULD NOT&quot;, &quot;RECOMMENDED&quot;, &quot;MAY&quot;, and &quot;OPTIONAL&quot; in this document are to be
                interpreted as described in <a href="https://www.rfc-editor.org/rfc/rfc2119" className="text-brand-green hover:underline" target="_blank" rel="noopener noreferrer">RFC 2119</a>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 p-3 rounded"><Keyword>MUST</Keyword> / <Keyword>REQUIRED</Keyword> / <Keyword>SHALL</Keyword> — Absolute requirement</div>
                <div className="bg-muted/50 p-3 rounded"><Keyword>SHOULD</Keyword> / <Keyword>RECOMMENDED</Keyword> — Strong recommendation, may be deviated from with justification</div>
                <div className="bg-muted/50 p-3 rounded"><Keyword>MAY</Keyword> / <Keyword>OPTIONAL</Keyword> — Truly optional behavior</div>
                <div className="bg-muted/50 p-3 rounded"><Keyword>MUST NOT</Keyword> / <Keyword>SHALL NOT</Keyword> — Absolute prohibition</div>
              </div>
            </div>
          </section>

          {/* Section 1: Platform Authentication */}
          <section id="auth" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">1. Platform Authentication</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                All regulated platforms <Keyword>MUST</Keyword> authenticate using JWT bearer tokens. The authentication system
                implements refresh token rotation with SHA-256 hashing for security.
              </p>
              <div className="space-y-3">
                <div className="bg-muted/30 rounded p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Access Token</h4>
                  <p className="text-xs text-muted-foreground">Platforms <Keyword>MUST</Keyword> include a valid JWT in the Authorization header. Tokens expire after 15 minutes.</p>
                  <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs overflow-x-auto mt-2">{`Authorization: Bearer <access_token>`}</pre>
                </div>
                <div className="bg-muted/30 rounded p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Token Rotation</h4>
                  <p className="text-xs text-muted-foreground">Platforms <Keyword>MUST</Keyword> implement token rotation. Each refresh request returns a new token pair and revokes the previous refresh token. Platforms <Keyword>MUST NOT</Keyword> reuse expired refresh tokens.</p>
                </div>
              </div>
            </div>
            {/* Auth endpoint cards */}
            <div className="mt-6">
              {getEndpointsBySection("Auth").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
          </section>

          {/* Section 2: Protected Families */}
          <section id="families" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">2. Protected Families</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                The family data model <Keyword>SHALL</Keyword> support multiple guardians per family unit with role-based access control.
                Child profiles <Keyword>MUST</Keyword> include birth date for age-based policy computation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/30 rounded p-4">
                  <h4 className="font-medium text-foreground mb-1">Owner</h4>
                  <p className="text-xs text-muted-foreground">Full administrative control. <Keyword>MAY</Keyword> delete the family unit.</p>
                </div>
                <div className="bg-muted/30 rounded p-4">
                  <h4 className="font-medium text-foreground mb-1">Parent</h4>
                  <p className="text-xs text-muted-foreground"><Keyword>MAY</Keyword> manage children, policies, and compliance links.</p>
                </div>
                <div className="bg-muted/30 rounded p-4">
                  <h4 className="font-medium text-foreground mb-1">Guardian</h4>
                  <p className="text-xs text-muted-foreground">Read-only access. <Keyword>MUST NOT</Keyword> modify policies or compliance links.</p>
                </div>
              </div>
            </div>
            {/* Families + Children endpoint cards */}
            <div className="mt-6">
              {getEndpointsBySection("Families").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
              {getEndpointsBySection("Children").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
          </section>

          {/* Section 2.1: Family Members */}
          <section id="members" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">2.1 Family Members</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Families support multi-guardian access with role-based permissions. Members <Keyword>MAY</Keyword> be
                added to share access to children, policies, and enforcement controls. The family data model supports
                co-parenting, caregiver delegation, and institutional use cases.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/30 rounded p-4">
                  <h4 className="font-medium text-foreground mb-1">Owner</h4>
                  <p className="text-xs text-muted-foreground">Full administrative control. <Keyword>MAY</Keyword> add/remove members, manage all policies, and delete the family.</p>
                </div>
                <div className="bg-muted/30 rounded p-4">
                  <h4 className="font-medium text-foreground mb-1">Parent</h4>
                  <p className="text-xs text-muted-foreground"><Keyword>MAY</Keyword> manage children, modify policies, trigger enforcement, and view reports.</p>
                </div>
                <div className="bg-muted/30 rounded p-4">
                  <h4 className="font-medium text-foreground mb-1">Guardian</h4>
                  <p className="text-xs text-muted-foreground">Read-only access. <Keyword>MAY</Keyword> view policies and reports. <Keyword>MUST NOT</Keyword> modify rules.</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              {getEndpointsBySection("Family Members").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
          </section>

          {/* Section 3: Safety Policies */}
          <section id="policies" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">3. Safety Policies</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Safety policies define protection rules for each child. Each policy contains rules across 45 categories spanning 12 domains.
                Platforms <Keyword>MUST</Keyword> implement enforcement for all categories they claim capability in.
                Rules are stored as JSONB with category-specific schemas.
              </p>
              <p className="text-sm text-muted-foreground">
                Policies transition through states: <code className="bg-muted px-1 rounded text-xs text-foreground">draft</code> →
                <code className="bg-muted px-1 rounded text-xs text-foreground">active</code> →
                <code className="bg-muted px-1 rounded text-xs text-foreground">paused</code>.
                Only <code className="bg-muted px-1 rounded text-xs text-foreground">active</code> policies <Keyword>SHALL</Keyword> be enforced on platforms.
              </p>
            </div>
            {/* Policies + Policy Rules endpoint cards */}
            <div className="mt-6">
              {getEndpointsBySection("Policies").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
              {getEndpointsBySection("Policy Rules").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
          </section>

          {/* Section 3.1: 40 Mandatory Policy Categories */}
          <section id="policy-categories" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">3.1 45 Mandatory Policy Categories</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                PCSS v1.0 defines 45 policy categories across 12 domains. The 19 new legislation-driven categories
                are backed by specific child safety laws and <Keyword>MUST</Keyword> be enforced by all compliant platforms.
              </p>
              <div className="space-y-3">
                {NEW_CATEGORIES.map((cat) => (
                  <div key={cat.name} className="bg-muted/30 rounded p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <div>
                        <code className="text-sm font-mono text-brand-green font-medium">{cat.name}</code>
                        <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:flex-shrink-0">
                        {cat.laws.split(", ").map(law => (
                          <span key={law} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20 whitespace-nowrap">
                            {law}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-accent/5 border border-accent/20 rounded p-4">
                <p className="text-sm text-foreground">
                  See the <a href="#rule-categories" className="text-brand-green font-medium hover:underline">complete API reference below</a> for full JSON schemas, field constraints, age-based defaults, platform support, and code examples for all 45 categories.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Regulated Platforms */}
          <section id="platforms" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Regulated Platforms</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                All technology platforms serving minors <Keyword>SHALL</Keyword> register with the Phosra platform registry.
                Each platform declares its category, compliance level, supported capabilities, and authentication mechanism.
              </p>
              {/* Provider endpoint cards */}
              <div className="my-4">
                {getEndpointsBySection("Providers").map((ep) => (
                  <EndpointCard key={ep.id} endpoint={ep} />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success/5 border border-success/20 rounded p-4">
                  <span className="inline-flex items-center gap-1.5 bg-success/10 text-success px-2 py-1 rounded-full text-xs font-bold border border-success/30">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    COMPLIANT
                  </span>
                  <p className="text-sm text-muted-foreground mt-3 mb-2">Full API enforcement. Real-time policy push.</p>
                  <ul className="text-xs text-foreground space-y-1">
                    <li>NextDNS</li>
                    <li>CleanBrowsing</li>
                    <li>Android / Google Family Link</li>
                  </ul>
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded p-4">
                  <span className="inline-flex items-center gap-1.5 bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-bold border border-warning/30">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    PROVISIONAL
                  </span>
                  <p className="text-sm text-muted-foreground mt-3 mb-2">Limited API. Partial enforcement capability.</p>
                  <ul className="text-xs text-foreground space-y-1">
                    <li>Microsoft Family Safety</li>
                    <li>Apple Screen Time (MDM)</li>
                  </ul>
                </div>
                <div className="bg-muted/50 border border-border rounded p-4">
                  <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-bold border border-border">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    PENDING COMPLIANCE
                  </span>
                  <p className="text-sm text-muted-foreground mt-3 mb-2">No API. Manual compliance instructions provided.</p>
                  <ul className="text-xs text-foreground space-y-1">
                    <li>Netflix, Disney+, Prime Video, YouTube</li>
                    <li>Hulu, Max, Roku</li>
                    <li>Xbox, PlayStation, Nintendo</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Compliance Verification */}
          <section id="compliance" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Compliance Verification</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Platforms <Keyword>MUST</Keyword> establish a compliance link to prove they can receive enforcement instructions.
                Credentials are encrypted with AES-256-GCM at rest. Platforms <Keyword>SHALL</Keyword> support periodic re-verification.
              </p>
              <div className="bg-accent/5 border border-accent/20 rounded p-4">
                <p className="text-sm text-foreground"><strong>Credential Security:</strong> All platform credentials <Keyword>MUST</Keyword> be encrypted using AES-256-GCM before storage. Plaintext credentials <Keyword>MUST NOT</Keyword> be logged or stored unencrypted at any point in the pipeline.</p>
              </div>
              {/* Connection endpoint cards */}
              <div className="mt-2">
                {getEndpointsBySection("Connections").map((ep) => (
                  <EndpointCard key={ep.id} endpoint={ep} />
                ))}
              </div>
            </div>
          </section>

          {/* Section 5.1: Compliance Links */}
          <section id="compliance-links" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">5.1 Compliance Links</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Compliance links connect a child to a specific platform for enforcement. Each link stores encrypted
                platform credentials (AES-256-GCM) and tracks verification status, supported capabilities, and enforcement history.
                Platforms <Keyword>MUST</Keyword> be re-verified when credentials are rotated.
              </p>
              <div className="bg-accent/5 border border-accent/20 rounded p-4">
                <p className="text-sm text-foreground"><strong>Lifecycle:</strong> Create link → Verify credentials → Enforce rules → Monitor health → Re-verify on rotation</p>
              </div>
            </div>
            <div className="mt-6">
              {getEndpointsBySection("Compliance Links").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
          </section>

          {/* Section 5.2: Quick Setup API */}
          <section id="quick-setup" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">5.2 Quick Setup API</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                The Quick Setup API provides a single-call onboarding flow that creates a family (if needed), registers a child,
                generates all 45 age-appropriate policy rules, and activates the policy. This endpoint <Keyword>SHOULD</Keyword> be
                the primary entry point for parent-facing applications.
              </p>
              <div className="bg-muted/30 rounded p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Endpoint</h4>
                <p className="text-xs font-mono text-muted-foreground"><span className="text-emerald-400">POST</span> /setup/quick</p>
              </div>
              <div className="bg-muted/30 rounded p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Request Body</h4>
                <pre className="bg-zinc-900 text-blue-400 rounded p-3 text-xs overflow-x-auto">
{`{
  "family_id": "uuid (optional — omit to create new family)",
  "family_name": "string (optional — used when creating new family)",
  "child_name": "string (required)",
  "birth_date": "YYYY-MM-DD (required)",
  "strictness": "recommended | strict | relaxed"
}`}
                </pre>
              </div>
              <div className="bg-muted/30 rounded p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Response</h4>
                <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs overflow-x-auto">
{`{
  "family": { "id": "...", "name": "..." },
  "child": { "id": "...", "name": "Emma", "birth_date": "2019-03-15" },
  "policy": { "id": "...", "status": "active" },
  "rules": [ ... ],  // ~20-25 enabled rules
  "age_group": "child",
  "max_ratings": { "mpaa": "PG", "tv": "TV-Y7", "esrb": "E" },
  "rule_summary": {
    "screen_time_minutes": 90,
    "bedtime_hour": 20,
    "web_filter_level": "strict",
    "content_rating": "PG",
    "total_rules_enabled": 22
  }
}`}
                </pre>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded p-4">
                <p className="text-sm text-foreground">
                  <strong>Strictness levels:</strong> <code className="bg-muted px-1 rounded text-xs">recommended</code> uses age-appropriate
                  defaults. <code className="bg-muted px-1 rounded text-xs">strict</code> reduces screen time by 30% and tightens timer intervals.
                  <code className="bg-muted px-1 rounded text-xs">relaxed</code> increases screen time by 30% and extends timer intervals.
                </p>
              </div>
            </div>
            <div className="mt-6">
              {getEndpointsBySection("Quick Setup").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
          </section>

          {/* Section 6: Policy Enforcement */}
          <section id="enforcement" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Policy Enforcement</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                The Phosra Enforcement Engine fans out policy rules to all verified platforms concurrently.
                Platforms <Keyword>MUST</Keyword> accept enforcement requests and report per-rule results.
                Enforcement jobs track status as: <code className="bg-muted px-1 rounded text-xs text-foreground">pending</code> →
                <code className="bg-muted px-1 rounded text-xs text-foreground">running</code> →
                <code className="bg-muted px-1 rounded text-xs text-foreground">completed</code> / <code className="bg-muted px-1 rounded text-xs text-foreground">partial</code> / <code className="bg-muted px-1 rounded text-xs text-foreground">failed</code>.
              </p>
              <div className="bg-accent/5 border border-accent/20 rounded p-4">
                <p className="text-sm text-foreground"><strong>Enforcement flow:</strong> Trigger enforcement → Job created → Fan out to platforms → Collect per-provider results → Retry failures</p>
              </div>
            </div>
            {/* Enforcement + Sync endpoint cards */}
            <div className="mt-6">
              {getEndpointsBySection("Enforcement").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
              {getEndpointsBySection("Sync").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
          </section>

          {/* Section 7: Content Rating Standard */}
          <section id="ratings" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Content Rating Standard</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                PCSS defines a unified content rating framework spanning 5 international rating systems.
                Platforms <Keyword>MUST</Keyword> map their internal content ratings to the nearest PCSS equivalent.
                Cross-system equivalences <Keyword>SHALL</Keyword> be computed with a confidence score (0-1).
              </p>
              {/* Ratings endpoint cards */}
              <div className="my-2">
                {getEndpointsBySection("Ratings").map((ep) => (
                  <EndpointCard key={ep.id} endpoint={ep} />
                ))}
              </div>
            </div>
          </section>

          {/* Section 8: Event Notifications */}
          <section id="webhooks" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">8. Event Notifications</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Platforms <Keyword>SHOULD</Keyword> register webhook endpoints to receive real-time enforcement notifications.
                All webhook payloads <Keyword>MUST</Keyword> be signed using HMAC-SHA256 with the webhook secret.
                Platforms <Keyword>MUST</Keyword> verify the <code className="bg-muted px-1 rounded text-xs text-foreground">X-Phosra-Signature</code> header before processing.
              </p>
              <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs overflow-x-auto">
{`# Signature verification
signature = HMAC-SHA256(webhook_secret, request_body)
# Compare with X-Phosra-Signature header (hex-encoded)`}
              </pre>
              <div className="bg-accent/5 border border-accent/20 rounded p-4">
                <p className="text-sm text-foreground"><strong>Supported events:</strong>{" "}
                  <code className="bg-muted px-1 rounded text-xs">enforcement.completed</code>{" "}
                  <code className="bg-muted px-1 rounded text-xs">enforcement.failed</code>{" "}
                  <code className="bg-muted px-1 rounded text-xs">policy.updated</code>{" "}
                  <code className="bg-muted px-1 rounded text-xs">policy.activated</code>{" "}
                  <code className="bg-muted px-1 rounded text-xs">compliance.verified</code>{" "}
                  <code className="bg-muted px-1 rounded text-xs">compliance.failed</code>
                </p>
              </div>
            </div>
            <div className="mt-6">
              {getEndpointsBySection("Webhooks").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
          </section>

          {/* Section 9: Compliance Levels */}
          <section id="levels" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">9. Compliance Levels</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Each platform is classified into one of three compliance levels. Platforms <Keyword>MUST</Keyword> progress toward
                full compliance. Regression from Compliant to a lower level <Keyword>SHALL</Keyword> trigger regulatory review.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success/5 border border-success/20 rounded p-5">
                  <span className="inline-flex items-center gap-1.5 bg-success/10 text-success px-2 py-1 rounded-full text-xs font-bold border border-success/30">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    COMPLIANT
                  </span>
                  <h3 className="font-medium text-foreground mt-3 mb-2">Full API Enforcement</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Platform <Keyword>MUST</Keyword> accept all enforcement requests via API</li>
                    <li>Platform <Keyword>MUST</Keyword> report per-rule enforcement results</li>
                    <li>Platform <Keyword>MUST</Keyword> support credential validation</li>
                    <li>Platform <Keyword>SHOULD</Keyword> support webhook notifications</li>
                  </ul>
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded p-5">
                  <span className="inline-flex items-center gap-1.5 bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-bold border border-warning/30">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    PROVISIONAL
                  </span>
                  <h3 className="font-medium text-foreground mt-3 mb-2">Limited API Access</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Platform <Keyword>MUST</Keyword> provide at least read access to safety settings</li>
                    <li>Platform <Keyword>SHOULD</Keyword> accept write requests for supported capabilities</li>
                    <li>Platform <Keyword>MUST</Keyword> document unsupported enforcement categories</li>
                  </ul>
                </div>
                <div className="bg-muted/50 border border-border rounded p-5">
                  <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-bold border border-border">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    PENDING COMPLIANCE
                  </span>
                  <h3 className="font-medium text-foreground mt-3 mb-2">Manual Compliance</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Platform <Keyword>MUST</Keyword> provide documented safety configuration steps</li>
                    <li>Platform <Keyword>SHALL</Keyword> publish a public API roadmap within 12 months</li>
                    <li>Platform <Keyword>MUST NOT</Keyword> remain at Pending level beyond 24 months</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 10: Enforcement Timeline */}
          <section id="timeline" className="border-t border-border/50 pt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">10. Enforcement Timeline</h2>
            <div className="bg-card rounded border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                The following timeline governs the transition to mandatory PCSS compliance for all regulated platforms.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="w-16 sm:w-24 flex-shrink-0 sm:text-right">
                    <span className="text-xs font-bold text-brand-green bg-accent/10 px-2 py-1 rounded">Phase 1</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Voluntary Adoption</h4>
                    <p className="text-xs text-muted-foreground">Platforms <Keyword>MAY</Keyword> register and begin compliance integration. Early adopters receive Compliant certification.</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="w-16 sm:w-24 flex-shrink-0 sm:text-right">
                    <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded">Phase 2</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Mandatory Registration</h4>
                    <p className="text-xs text-muted-foreground">All platforms serving minors <Keyword>MUST</Keyword> register with the PCSS platform registry. Pending Compliance status assigned.</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="w-16 sm:w-24 flex-shrink-0 sm:text-right">
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded">Phase 3</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Full Enforcement</h4>
                    <p className="text-xs text-muted-foreground">All platforms <Keyword>MUST</Keyword> achieve at least Provisional compliance. Platforms at Pending <Keyword>SHALL</Keyword> face regulatory review and potential enforcement action.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reference sections */}
          <div className="space-y-12">
            <section id="rule-categories" className="border-t border-border/50 pt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">45 Mandatory Policy Categories</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Complete API reference for all 45 policy categories. Each entry includes the JSON configuration schema,
                field constraints, age-based defaults, platform support, and usage examples. Platforms claiming capability
                in a category <Keyword>MUST</Keyword> implement enforcement for all rules within that category.
              </p>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="flex-1 bg-muted/50 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/50"
                />
                <div className="flex gap-2">
                  <button onClick={expandAll} className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 border border-border rounded hover:bg-muted transition-colors">
                    Expand All
                  </button>
                  <button onClick={collapseAll} className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 border border-border rounded hover:bg-muted transition-colors">
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Category Groups */}
              <div className="space-y-8">
                {CATEGORY_GROUPS.map(group => {
                  const groupCats = filteredReference.filter(c => c.group === group.key)
                  if (groupCats.length === 0) return null
                  return (
                    <div key={group.key} id={`cat-group-${group.key}`}>
                      {/* Group Header */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="text-lg font-bold text-foreground">{group.label}</h3>
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">{group.categories.length} categories</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">{group.description}</span>
                      </div>

                      {/* Category Cards */}
                      <div className="space-y-2">
                        {groupCats.map(cat => {
                          const globalIndex = CATEGORY_REFERENCE.findIndex(c => c.id === cat.id) + 1
                          const isExpanded = expandedCategories.has(cat.id)
                          return (
                            <div key={cat.id} className="bg-card rounded border border-border overflow-hidden">
                              {/* Collapsed Row */}
                              <button
                                onClick={() => toggleCategory(cat.id)}
                                className="w-full flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                              >
                                <span className="text-xs font-mono text-muted-foreground w-7 flex-shrink-0">#{globalIndex}</span>
                                <code className="text-xs sm:text-sm font-mono text-brand-green font-medium flex-shrink-0">{cat.id}</code>
                                <span className="text-xs sm:text-sm text-foreground font-medium">{cat.name}</span>
                                <span className="text-xs text-muted-foreground truncate flex-1 hidden md:inline">{cat.description.slice(0, 80)}...</span>
                                {cat.laws.length > 0 && (
                                  <div className="hidden sm:flex gap-1 flex-shrink-0">
                                    {cat.laws.slice(0, 2).map(law => (
                                      <span key={law} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20 whitespace-nowrap">{law}</span>
                                    ))}
                                    {cat.laws.length > 2 && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20">+{cat.laws.length - 2}</span>}
                                  </div>
                                )}
                                <svg className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ml-auto ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </button>

                              {/* Expanded Detail Panel */}
                              {isExpanded && (
                                <div className="border-t border-border px-4 py-5 space-y-5 bg-muted/10">
                                  {/* Why This Exists */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Why This Exists</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{cat.rationale}</p>
                                    {cat.laws.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {cat.laws.map(law => (
                                          <span key={law} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20">{law}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Configuration Schema */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Configuration Schema</h4>
                                    <div className="bg-card rounded border border-border overflow-x-auto">
                                      <table className="w-full text-xs min-w-[500px]">
                                        <thead><tr className="bg-muted/50"><th className="px-3 py-2 text-left text-muted-foreground">Field</th><th className="px-3 py-2 text-left text-muted-foreground">Type</th><th className="px-3 py-2 text-center text-muted-foreground">Required</th><th className="px-3 py-2 text-left text-muted-foreground">Default</th><th className="px-3 py-2 text-left text-muted-foreground">Constraints</th></tr></thead>
                                        <tbody className="divide-y divide-border">
                                          {cat.fields.map(f => (
                                            <tr key={f.name} className="hover:bg-muted/30">
                                              <td className="px-3 py-2 font-mono text-brand-green">{f.name}</td>
                                              <td className="px-3 py-2 font-mono text-foreground">{f.type}</td>
                                              <td className="px-3 py-2 text-center">{f.required ? <span className="text-emerald-500">Yes</span> : <span className="text-muted-foreground">No</span>}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{f.default}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{f.constraints}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  {/* Example Configuration */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Example Configuration</h4>
                                    <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs overflow-x-auto">{cat.exampleConfig}</pre>
                                  </div>

                                  {/* Age-Based Defaults */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Age-Based Defaults</h4>
                                    <div className="bg-card rounded border border-border overflow-x-auto">
                                      <table className="w-full text-xs">
                                        <thead><tr className="bg-muted/50"><th className="px-3 py-2 text-left text-muted-foreground">Age Range</th><th className="px-3 py-2 text-center text-muted-foreground">Enabled</th><th className="px-3 py-2 text-left text-muted-foreground">Default Settings</th></tr></thead>
                                        <tbody className="divide-y divide-border">
                                          {cat.ageDefaults.map(ad => (
                                            <tr key={ad.range} className="hover:bg-muted/30">
                                              <td className="px-3 py-2 font-medium text-foreground">{ad.range}</td>
                                              <td className="px-3 py-2 text-center">{ad.enabled ? <span className="text-emerald-500">Yes</span> : <span className="text-muted-foreground">No</span>}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{ad.summary}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  {/* Platform Support */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Platform Support</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {cat.platforms.map(p => (
                                        <div key={p.name} className="flex items-center gap-1.5">
                                          <span className="text-xs text-muted-foreground">{p.name}:</span>
                                          <SupportBadge support={p.support} />
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* API Usage */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">API Usage</h4>
                                    <pre className="bg-zinc-900 text-blue-400 rounded p-3 text-xs overflow-x-auto">{`PUT /policies/{policyID}/rules/bulk
Content-Type: application/json

{
  "rules": [
    {
      "category": "${cat.id}",
      "enabled": true,
      "config": ${cat.exampleConfig.split('\n').map((l, i) => i === 0 ? l : '      ' + l).join('\n')}
    }
  ]
}`}</pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Platform Support Matrix */}
            <section id="platform-support" className="border-t border-border/50 pt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">Platform Support Matrix</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Overview of which category groups are supported by each platform adapter. <span className="text-emerald-500">&#10003;</span> = Full support,{" "}
                <span className="text-amber-500">&#9681;</span> = Partial support, <span className="text-zinc-400">&mdash;</span> = No support.
              </p>
              <div className="bg-card rounded-none sm:rounded border border-border overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-3 sm:px-4 py-3 text-left text-xs text-muted-foreground sticky left-0 bg-muted/50 z-10">Category Group</th>
                      {PLATFORM_NAMES.map(name => (
                        <th key={name} className="px-2 sm:px-4 py-3 text-center text-xs text-muted-foreground whitespace-nowrap">{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {CATEGORY_GROUPS.map(group => {
                      const groupCats = CATEGORY_REFERENCE.filter(c => c.group === group.key)
                      const platformSummary = PLATFORM_NAMES.map(pName => {
                        const supports = groupCats.map(c => c.platforms.find(p => p.name === pName)?.support || "none")
                        if (supports.every(s => s === "none")) return "none" as PlatformSupport
                        if (supports.every(s => s === "full")) return "full" as PlatformSupport
                        return "partial" as PlatformSupport
                      })
                      return (
                        <tr key={group.key} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">
                            <a href={`#cat-group-${group.key}`} className="hover:text-brand-green transition-colors">{group.label}</a>
                            <span className="text-xs text-muted-foreground ml-2">({group.categories.length})</span>
                          </td>
                          {platformSummary.map((support, i) => (
                            <td key={PLATFORM_NAMES[i]} className="px-4 py-3 text-center text-lg">
                              <PlatformSupportIcon support={support} />
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="age-ratings" className="border-t border-border/50 pt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">Age-to-Rating Standard</h2>
              <p className="text-sm text-muted-foreground mb-4">Platforms <Keyword>MUST</Keyword> use the following age-to-rating mappings when computing content restrictions. Used by <code className="bg-muted px-1 rounded text-xs text-foreground">GET /ratings/by-age</code> and <code className="bg-muted px-1 rounded text-xs text-foreground">POST /policies/:id/generate-from-age</code>.</p>
              <div className="bg-card rounded border border-border overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-sm min-w-[500px]">
                  <thead><tr className="bg-muted/50"><th className="px-3 sm:px-4 py-3 text-left text-xs text-muted-foreground">Age</th><th className="px-3 sm:px-4 py-3 text-center text-xs text-muted-foreground">MPAA</th><th className="px-3 sm:px-4 py-3 text-center text-xs text-muted-foreground">TV</th><th className="px-3 sm:px-4 py-3 text-center text-xs text-muted-foreground">ESRB</th><th className="px-3 sm:px-4 py-3 text-center text-xs text-muted-foreground">PEGI</th><th className="px-3 sm:px-4 py-3 text-center text-xs text-muted-foreground">CSM</th></tr></thead>
                  <tbody className="divide-y divide-border">
                    {AGE_RATING_TABLE.map((row) => (
                      <tr key={row.range} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{row.range}</td>
                        <td className="px-4 py-3 text-center"><span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-medium">{row.mpaa}</span></td>
                        <td className="px-4 py-3 text-center"><span className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 px-2 py-0.5 rounded text-xs font-medium">{row.tv}</span></td>
                        <td className="px-4 py-3 text-center"><span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-medium">{row.esrb}</span></td>
                        <td className="px-4 py-3 text-center"><span className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 px-2 py-0.5 rounded text-xs font-medium">{row.pegi}</span></td>
                        <td className="px-4 py-3 text-center"><span className="bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400 px-2 py-0.5 rounded text-xs font-medium">{row.csm}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Age-Based Defaults */}
            <section id="age-defaults" className="border-t border-border/50 pt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">Age-Based Default Policies</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Default policy values generated by <code className="bg-muted px-1 rounded text-xs text-foreground">POST /policies/:id/generate-from-age</code> and the Quick Setup API.
                These defaults represent the &quot;recommended&quot; strictness level. Values are computed from the child&apos;s age at policy creation time.
              </p>
              <div className="bg-card rounded border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs text-muted-foreground whitespace-nowrap">Setting</th>
                      <th className="px-4 py-3 text-center text-xs text-muted-foreground">0-6</th>
                      <th className="px-4 py-3 text-center text-xs text-muted-foreground">7-9</th>
                      <th className="px-4 py-3 text-center text-xs text-muted-foreground">10-12</th>
                      <th className="px-4 py-3 text-center text-xs text-muted-foreground">13-16</th>
                      <th className="px-4 py-3 text-center text-xs text-muted-foreground">17+</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {AGE_DEFAULTS_TABLE.map(row => (
                      <tr key={row.key} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                          <a href={`#rule-categories`} className="hover:text-brand-green transition-colors">{row.setting}</a>
                        </td>
                        {row.values.map((val, i) => (
                          <td key={i} className="px-4 py-3 text-center text-xs text-muted-foreground whitespace-nowrap">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="api-base" className="border-t border-border/50 pt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">API Base URL</h2>
              <div className="bg-card rounded border border-border p-6">
                <p className="text-sm text-muted-foreground mb-4">All PCSS API endpoints are served under:</p>
                <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs overflow-x-auto">{API_BASE}</pre>
                <p className="text-sm text-muted-foreground mt-4">Platforms <Keyword>MUST</Keyword> use HTTPS in production environments. HTTP <Keyword>MAY</Keyword> be used only in development.</p>
              </div>
            </section>

            {/* Section 11: Legislative Compliance Matrix */}
            <section id="legislation" className="border-t border-border/50 pt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">11. Legislative Compliance Matrix</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The following legislation maps to PCSS policy categories. Platforms operating in jurisdictions
                covered by these laws <Keyword>MUST</Keyword> implement the corresponding categories.
                Click any entry to see key provisions, jurisdiction details, and legislative status.
              </p>

              <div className="space-y-2">
                {LEGISLATION_REFERENCE.map(leg => {
                  const isExpanded = expandedLegislation.has(leg.id)
                  const stageColor = leg.stage.startsWith("In force") || leg.stage.startsWith("Enacted") || leg.stage.startsWith("Signed")
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : leg.stage.startsWith("Passed")
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    : leg.stage.includes("paused") || leg.stage.includes("injunction")
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"

                  return (
                    <div key={leg.id} className="bg-card rounded border border-border overflow-hidden">
                      {/* Collapsed Row */}
                      <button
                        onClick={() => toggleLegislation(leg.id)}
                        className="w-full text-left px-3 sm:px-4 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-foreground">{leg.law}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${stageColor} whitespace-nowrap`}>
                                {leg.stage.split(";")[0]}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{leg.jurisdiction}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{leg.summary}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                            <div className="hidden sm:flex flex-wrap gap-1 justify-end">
                              {leg.categories.map(cat => (
                                <code key={cat} className="text-[10px] bg-accent/5 text-brand-green px-1.5 py-0.5 rounded font-mono whitespace-nowrap">{cat}</code>
                              ))}
                            </div>
                            <svg className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </button>

                      {/* Expanded Detail Panel */}
                      {isExpanded && (
                        <div className="border-t border-border px-4 py-5 space-y-4 bg-muted/10">
                          {/* Metadata Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-muted/30 rounded p-3">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Jurisdiction</p>
                              <p className="text-sm text-foreground">{leg.jurisdiction}</p>
                            </div>
                            <div className="bg-muted/30 rounded p-3">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Introduced</p>
                              <p className="text-sm text-foreground">{leg.introduced}</p>
                            </div>
                            <div className="bg-muted/30 rounded p-3">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Status</p>
                              <p className="text-sm text-foreground">{leg.stage}</p>
                            </div>
                          </div>

                          {/* Key Provisions */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Key Provisions</h4>
                            <ul className="space-y-1.5">
                              {leg.keyProvisions.map((provision, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <span className="text-brand-green mt-0.5 flex-shrink-0">&#8226;</span>
                                  <span className="leading-relaxed">{provision}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Required PCSS Categories */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Required PCSS Categories</h4>
                            <div className="flex flex-wrap gap-2">
                              {leg.categories.map(catId => {
                                const cat = CATEGORY_REFERENCE.find(c => c.id === catId)
                                return (
                                  <a key={catId} href="#rule-categories" onClick={() => { setExpandedCategories(prev => new Set(prev).add(catId)) }} className="flex items-center gap-1.5 bg-accent/5 border border-accent/20 rounded px-2.5 py-1.5 hover:bg-accent/10 transition-colors">
                                    <code className="text-xs font-mono text-brand-green">{catId}</code>
                                    {cat && <span className="text-[10px] text-muted-foreground">{cat.name}</span>}
                                  </a>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Section 12: Parent Experience */}
            <section id="parent-experience" className="border-t border-border/50 pt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">12. Parent Experience</h2>
              <div className="bg-card rounded border border-border p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Phosra provides a guided Quick Setup flow that enables parents to protect their children across
                  all regulated platforms in under one minute. The three-step wizard handles family creation, age-based
                  policy generation, and platform verification.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-accent/5 border border-accent/20 rounded p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-accent/10 text-foreground font-bold text-lg flex items-center justify-center mx-auto mb-3">1</div>
                    <h4 className="font-medium text-foreground mb-1">Tell Us About Your Child</h4>
                    <p className="text-xs text-muted-foreground">Enter name, birth date, and choose a protection level (Recommended, Strict, or Relaxed).</p>
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-accent/10 text-foreground font-bold text-lg flex items-center justify-center mx-auto mb-3">2</div>
                    <h4 className="font-medium text-foreground mb-1">Review Protections</h4>
                    <p className="text-xs text-muted-foreground">See plain-language summary cards for screen time, content ratings, web filtering, social controls, privacy, and algorithm safety.</p>
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-accent/10 text-foreground font-bold text-lg flex items-center justify-center mx-auto mb-3">3</div>
                    <h4 className="font-medium text-foreground mb-1">Connect Platforms</h4>
                    <p className="text-xs text-muted-foreground">Verify compliance on platforms with a progress indicator. Enforce with one click after connecting.</p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">What Gets Created</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Family (if not already created)</li>
                    <li>Child profile with age computation</li>
                    <li>Active safety policy with ~20-25 enabled rules across all 45 categories</li>
                    <li>Age-appropriate content ratings across 5 rating systems</li>
                    <li>Legislation-compliant rules for algorithmic safety, notifications, advertising, and data privacy</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 13: Community Standards */}
            <section id="standards" className="border-t border-border/50 pt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">13. Community Standards</h2>
              <div className="bg-card rounded border border-border p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Phosra supports <strong className="text-foreground">community standards</strong> (also called movements) — curated rule sets based
                  on expert guidance, research, and advocacy organizations. Parents <Keyword>MAY</Keyword> adopt one or
                  more standards for each child to automatically generate matching policy rules.
                </p>
                <p className="text-sm text-muted-foreground">
                  Standards provide a &quot;one-click&quot; way to align with community guidelines like the
                  <strong className="text-foreground"> Four Norms</strong> from Jonathan Haidt&apos;s Anxious Generation,
                  <strong className="text-foreground"> Wait Until 8th</strong>, or
                  <strong className="text-foreground"> Common Sense Media</strong> age ratings.
                  When adopted, the standard&apos;s rules are merged into the child&apos;s active policy.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-muted/30 rounded p-4">
                    <h4 className="font-medium text-foreground mb-1">Expert Standards</h4>
                    <p className="text-xs text-muted-foreground">Research-backed rule sets from child development experts and psychologists.</p>
                  </div>
                  <div className="bg-muted/30 rounded p-4">
                    <h4 className="font-medium text-foreground mb-1">Community Pledges</h4>
                    <p className="text-xs text-muted-foreground">Grassroots movements like Wait Until 8th and Smartphone Free Childhood.</p>
                  </div>
                  <div className="bg-muted/30 rounded p-4">
                    <h4 className="font-medium text-foreground mb-1">Organization Guidelines</h4>
                    <p className="text-xs text-muted-foreground">Recommendations from AAP, Common Sense Media, and other organizations.</p>
                  </div>
                </div>
                <div className="bg-accent/5 border border-accent/20 rounded p-4">
                  <p className="text-sm text-foreground">
                    Browse all available standards at <a href="/standards" className="text-brand-green font-medium hover:underline">/standards</a>.
                    The Phosra API currently includes <strong>21 community standards</strong> spanning expert guidance, parenting pledges, and organizational recommendations.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                {getEndpointsBySection("Community Standards").map((ep) => (
                  <EndpointCard key={ep.id} endpoint={ep} />
                ))}
              </div>
            </section>

            {/* Section 14: Parental Control Sources */}
            <section id="sources" className="border-t border-border/50 pt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">14. Parental Control Sources</h2>
              <div className="bg-card rounded border border-border p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Phosra maintains a registry of <strong className="text-foreground">21 parental control applications and services</strong> that
                  can be connected as <em>sources</em> — apps parents already use to manage their children&apos;s devices.
                  Unlike target platforms that Phosra pushes rules <em>to</em>, sources are apps that Phosra integrates
                  <em> with</em> to push rules <em>through</em>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-success/5 border border-success/20 rounded p-4">
                    <span className="inline-flex items-center gap-1.5 bg-success/10 text-success px-2 py-1 rounded-full text-xs font-bold border border-success/30">Public API</span>
                    <p className="text-xs text-muted-foreground mt-2">Direct API integration. Phosra pushes rules automatically via documented REST endpoints.</p>
                    <p className="text-xs text-foreground mt-1">Qustodio, Apple Screen Time (MDM), Google Family Link</p>
                  </div>
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded p-4">
                    <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full text-xs font-bold border border-blue-500/30">Partner API</span>
                    <p className="text-xs text-muted-foreground mt-2">Integration via partnership agreement. Automated rule enforcement with partner credentials.</p>
                    <p className="text-xs text-foreground mt-1">Bark, Securly, Canopy</p>
                  </div>
                  <div className="bg-muted/50 border border-border rounded p-4">
                    <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-bold border border-border">No API</span>
                    <p className="text-xs text-muted-foreground mt-2">Guided setup mode. Phosra generates step-by-step instructions for manual configuration.</p>
                    <p className="text-xs text-foreground mt-1">Net Nanny, Norton Family, Kaspersky, Circle</p>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded p-4">
                    <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full text-xs font-bold border border-amber-500/30">Undocumented</span>
                    <p className="text-xs text-muted-foreground mt-2">Identified integration points. Availability may vary.</p>
                    <p className="text-xs text-foreground mt-1">Bark Phone</p>
                  </div>
                </div>
                <div className="bg-accent/5 border border-accent/20 rounded p-4">
                  <p className="text-sm text-foreground">
                    Each source is mapped to Phosra&apos;s 45 rule categories with <strong>full</strong>, <strong>partial</strong>, or <strong>none</strong> support
                    per capability. Browse all sources with their capability matrices at{" "}
                    <a href="/parental-controls" className="text-brand-green font-medium hover:underline">/parental-controls</a>.
                  </p>
                </div>
                <div className="bg-muted/30 rounded p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Source API Pattern</h4>
                  <div className="text-xs font-mono space-y-1 text-muted-foreground">
                    <p><span className="text-emerald-400">POST</span> /v1/sources — Connect a parental control app to a child</p>
                    <p><span className="text-emerald-400">POST</span> /v1/sources/{'{'}sourceID{'}'}/sync — Push all rules to source</p>
                    <p><span className="text-emerald-400">POST</span> /v1/sources/{'{'}sourceID{'}'}/rules — Push individual capability</p>
                    <p><span className="text-blue-400">GET</span> /v1/sources/{'{'}sourceID{'}'}/guide/{'{'}category{'}'} — Get guided setup steps (no-API sources)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 15: Family Reports */}
            <section id="reports" className="border-t border-border/50 pt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">15. Family Reports</h2>
              <div className="bg-card rounded border border-border p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  The reporting API provides family-level overviews of enforcement status, compliance health, and
                  per-child statistics. Reports <Keyword>SHOULD</Keyword> be used by parent-facing applications to
                  surface the current protection state at a glance.
                </p>
              </div>
              <div className="mt-6">
                {getEndpointsBySection("Reports").map((ep) => (
                  <EndpointCard key={ep.id} endpoint={ep} />
                ))}
              </div>
            </section>

          </div>

          {/* Page footer */}
          <div className="border-t border-border/50 mt-12 pt-8 pb-4 text-center text-xs text-muted-foreground">
            Phosra Child Safety Standard (PCSS) v1.0
          </div>
        </div>
          </>
        ) : (
          <>
        {/* Recipes content — sidebar is now in the docs layout */}
        <div className="space-y-12 overflow-x-hidden">
          <section id="recipes">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Real-World Recipes</h2>
              <div className="flex gap-2">
                <button onClick={expandAllRecipes} className="text-xs px-3 py-1.5 rounded bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Expand All</button>
                <button onClick={collapseAllRecipes} className="text-xs px-3 py-1.5 rounded bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Collapse All</button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              End-to-end walkthroughs showing how the API pieces fit together for real scenarios — from a parent&apos;s action through the API to platform enforcement.
            </p>
            <div className="space-y-3">
              {RECIPES.map((recipe, index) => {
                const isExpanded = expandedRecipes.has(recipe.id)
                return (
                  <div key={recipe.id} id={`recipe-${recipe.id}`} className="bg-card rounded border border-border overflow-hidden">
                    <button
                      onClick={() => toggleRecipe(recipe.id)}
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-xl flex-shrink-0">{recipe.icon}</span>
                      <span className="text-xs text-muted-foreground font-mono flex-shrink-0">#{index + 1}</span>
                      <span className="font-semibold text-foreground text-sm truncate">{recipe.title}</span>
                      <span className="text-xs text-muted-foreground hidden lg:inline truncate">{recipe.summary}</span>
                      <div className="hidden sm:flex gap-1.5 ml-auto flex-shrink-0">
                        {recipe.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/5 text-brand-green border border-accent/10">{tag}</span>
                        ))}
                      </div>
                      <svg className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ml-auto sm:ml-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border bg-muted/10 px-3 sm:px-5 py-4 sm:py-5 space-y-5 sm:space-y-6">
                        {/* Scenario */}
                        <div className="bg-accent/5 border border-accent/20 rounded p-4">
                          <h4 className="text-xs font-semibold text-brand-green uppercase tracking-wider mb-2">Scenario</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{recipe.scenario}</p>
                        </div>

                        {/* Flow Diagram */}
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Flow Diagram</h4>
                          <div className="flex gap-2 mb-2 flex-wrap">
                            {recipe.actors.map(actor => (
                              <span key={actor} className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-foreground border border-border">{actor}</span>
                            ))}
                          </div>
                          <div className="overflow-x-auto">
                            <pre className="bg-zinc-900 text-green-400 rounded p-4 text-xs font-mono leading-relaxed whitespace-pre">{recipe.flowDiagram}</pre>
                          </div>
                        </div>

                        {/* Steps */}
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Step-by-Step</h4>
                          <div className="space-y-4">
                            {recipe.steps.map(step => (
                              <div key={step.number} className="bg-muted/30 rounded p-4">
                                <div className="flex items-start gap-3 mb-2">
                                  <span className="w-6 h-6 rounded-full bg-accent/10 text-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.number}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                                        step.method === "POST" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                        step.method === "GET" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                                        step.method === "PUT" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                        "bg-red-500/10 text-red-600 dark:text-red-400"
                                      }`}>{step.method}</span>
                                      <code className="text-xs font-mono text-foreground">{step.endpoint}</code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                  </div>
                                </div>
                                {step.requestBody && (
                                  <div className="mt-3 sm:ml-9">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Request</p>
                                    <pre className="bg-zinc-900 text-blue-400 rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre">{step.requestBody}</pre>
                                  </div>
                                )}
                                {step.responseBody && (
                                  <div className="mt-3 sm:ml-9">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Response</p>
                                    <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre">{step.responseBody}</pre>
                                  </div>
                                )}
                                <div className="mt-3 sm:ml-9 flex items-start gap-2">
                                  <span className="text-muted-foreground mt-0.5">&rarr;</span>
                                  <p className="text-xs text-muted-foreground italic leading-relaxed">{step.whatHappens}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Takeaway */}
                        <div className="bg-accent/5 border border-accent/20 rounded p-4">
                          <h4 className="text-xs font-semibold text-brand-green uppercase tracking-wider mb-1">Key Takeaway</h4>
                          <p className="text-sm text-foreground">{recipe.keyTeachingPoint}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
          </>
        )}

        </motion.div>
      </AnimatePresence>

      {/* Scroll-to-top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-[hsl(var(--brand-green))] text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  )
}
