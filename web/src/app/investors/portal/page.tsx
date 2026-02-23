"use client"

import { Suspense, useState, useCallback, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Download,
  FileText,
  ExternalLink,
  Shield,
  DollarSign,
  BarChart3,
  Clock,
  Loader2,
  Scale,
  PieChart,
  LogOut,
  UserPlus,
  Copy,
  Share2,
  Mail,
  MessageSquare,
  Check,
  X,
  Eye,
  LinkIcon,
  Maximize,
} from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst, GradientMesh, StaggerChildren } from "@/components/marketing/shared"
import { RAISE_DETAILS, DATA_ROOM_LINKS } from "@/lib/investors/config"
import type { DataRoomLink } from "@/lib/investors/config"
import { useInvestorSession } from "@/lib/investors/investor-auth"
import InvestorLoginForm from "@/components/investors/InvestorLoginForm"
import AccountLinking from "@/components/investors/AccountLinking"
import SafeSection from "@/components/investors/SafeSection"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const CATEGORY_ICONS: Record<DataRoomLink["category"], typeof FileText> = {
  legal: Scale,
  financial: PieChart,
  product: FileText,
  diligence: Shield,
}

const CATEGORY_LABELS: Record<DataRoomLink["category"], string> = {
  legal: "Legal",
  financial: "Financial",
  product: "Product",
  diligence: "Due Diligence",
}

/* ------------------------------------------------------------------ */
/*  Invite Modal                                                       */
/* ------------------------------------------------------------------ */

function InviteModal({ onClose, investorName }: { onClose: () => void; investorName: string }) {
  const [loading, setLoading] = useState(false)
  const [inviteUrl, setInviteUrl] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [nameInput, setNameInput] = useState(investorName)
  const [recipientName, setRecipientName] = useState("")
  const needsName = !investorName.trim()

  const generateInvite = useCallback(async () => {
    if (!nameInput.trim()) {
      setError("Please enter your full name")
      return
    }
    if (!recipientName.trim()) {
      setError("Please enter the recipient's name")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/investors/portal/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: nameInput.trim(), recipientName: recipientName.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setInviteUrl(data.url)
      } else {
        setError(data.error || "Failed to generate invite")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [nameInput, recipientName])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [inviteUrl])

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Phosra Investor Portal",
          text: `You've been invited by ${nameInput} to view the Phosra data room.`,
          url: inviteUrl,
        })
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    } else {
      handleCopy()
    }
  }, [inviteUrl, handleCopy, nameInput])

  const shareMessage = `You've been invited by ${nameInput} to view the Phosra data room: ${inviteUrl}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0D1B2A] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-brand-green" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Invite an Investor</h3>
            <p className="text-xs text-white/40">Generate a one-time access link</p>
          </div>
        </div>

        {!inviteUrl && !error && (
          <div className="space-y-3">
            {needsName && (
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Your Full Name *</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => { setNameInput(e.target.value); setError("") }}
                  placeholder="Alex Phosra"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Recipient&apos;s Name *</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => { setRecipientName(e.target.value); setError("") }}
                placeholder="Jane Smith"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors"
              />
            </div>
            <button
              onClick={generateInvite}
              disabled={loading || !nameInput.trim() || !recipientName.trim()}
              className="w-full py-3 bg-brand-green text-[#0D1B2A] font-semibold rounded-xl hover:bg-brand-green/90 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Generate Invite Link
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-xs text-red-400 mb-3">{error}</p>
            <button
              onClick={generateInvite}
              className="text-xs text-brand-green hover:text-brand-green/80 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {inviteUrl && (
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-xs text-white/60 break-all font-mono">{inviteUrl}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`sms:&body=${encodeURIComponent(shareMessage)}`}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Messages
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent("Phosra Investor Portal Access")}&body=${encodeURIComponent(shareMessage)}`}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </a>
            </div>

            <p className="text-[10px] text-white/20 text-center">
              This link is single-use and expires in 7 days.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Deck Share Panel                                                   */
/* ------------------------------------------------------------------ */

interface DeckShare {
  id: string
  token: string
  recipientHint: string
  createdAt: string
  isActive: boolean
  viewCount: number
  lastViewed: string | null
  url: string
}

function DeckSection({ investorPhone, investorName, investorCompany }: { investorPhone: string; investorName: string; investorCompany: string }) {
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [shares, setShares] = useState<DeckShare[]>([])
  const [recipientHint, setRecipientHint] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState("")
  const [error, setError] = useState("")
  const [loadingShares, setLoadingShares] = useState(false)
  const [deckHeight, setDeckHeight] = useState(750)
  const deckRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "deck-height" && typeof e.data.height === "number") {
        setDeckHeight(e.data.height)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const handleFullscreen = useCallback(() => {
    const el = deckRef.current
    if (!el) return
    // Try native fullscreen (works on desktop + iPad)
    if (el.requestFullscreen) {
      el.requestFullscreen()
    } else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen()
    } else {
      // Fallback for iPhone and other browsers without fullscreen API
      window.open("/deck/index.html", "_blank")
    }
  }, [])

  const fetchShares = useCallback(async () => {
    setLoadingShares(true)
    try {
      const res = await fetch("/api/investors/deck/shares", { credentials: "include" })
      if (res.ok) {
        setShares(await res.json())
      }
    } catch {
      // silent
    } finally {
      setLoadingShares(false)
    }
  }, [])

  useEffect(() => {
    if (showSharePanel) fetchShares()
  }, [showSharePanel, fetchShares])

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setError("")
    setGeneratedLink("")
    try {
      const res = await fetch("/api/investors/deck/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientHint: recipientHint.trim() || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setGeneratedLink(data.url)
        setRecipientHint("")
        fetchShares()
      } else {
        setError(data.error || "Failed to generate link")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setGenerating(false)
    }
  }, [recipientHint, fetchShares])

  const handleCopy = useCallback(async (url: string, id: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(""), 2000)
  }, [])

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 lg:py-20">
      <AnimatedSection>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Pitch Deck
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-white">
              Pre-seed deck
            </h2>
          </div>
          <button
            onClick={() => setShowSharePanel(!showSharePanel)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-white font-medium rounded-lg hover:border-white/40 transition-colors text-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Deck
          </button>
        </div>
      </AnimatedSection>

      {showSharePanel && (
        <AnimatedSection>
          <div className="glass-card rounded-xl p-6 mb-6 space-y-5">
            {/* Generate a new share link */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-brand-green" />
                Generate Share Link
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={recipientHint}
                  onChange={(e) => { setRecipientHint(e.target.value); setError("") }}
                  placeholder="Sharing with (optional) — e.g. John at Sequoia"
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-5 py-2.5 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Link"
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>

            {/* Just-generated link */}
            {generatedLink && (
              <div className="bg-white/5 border border-brand-green/20 rounded-lg p-4">
                <p className="text-xs text-white/40 mb-2">Share this link:</p>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-white/70 break-all font-mono flex-1">{generatedLink}</p>
                  <button
                    onClick={() => handleCopy(generatedLink, "new")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white text-xs rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                  >
                    {copied === "new" ? <Check className="w-3 h-3 text-brand-green" /> : <Copy className="w-3 h-3" />}
                    {copied === "new" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            {/* Existing shares list */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-green" />
                Your Shares
              </h3>
              {loadingShares ? (
                <div className="flex items-center gap-2 text-white/30 text-sm py-4">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading...
                </div>
              ) : shares.length === 0 ? (
                <p className="text-xs text-white/30 py-2">No shares yet. Generate a link above to get started.</p>
              ) : (
                <div className="space-y-2">
                  {shares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-lg px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 truncate">
                          {share.recipientHint || "General link"}
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          Created {new Date(share.createdAt).toLocaleDateString()}
                          {share.lastViewed && ` · Last viewed ${new Date(share.lastViewed).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full flex-shrink-0">
                        <Eye className="w-3 h-3 text-white/40" />
                        <span className="text-xs font-mono text-white/60">{share.viewCount}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(share.url, share.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white text-xs rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                      >
                        {copied === share.id ? <Check className="w-3 h-3 text-brand-green" /> : <Copy className="w-3 h-3" />}
                        {copied === share.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection delay={0.1}>
        <div ref={deckRef} className="glass-card rounded-xl overflow-hidden relative group">
          <button
            onClick={handleFullscreen}
            className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-black/50 text-white/60 sm:opacity-0 sm:group-hover:opacity-100 hover:text-white hover:bg-black/70 transition-all"
            title="View fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <iframe
            src="/deck/"
            className="w-full border-0"
            style={{ height: deckHeight }}
            title="Phosra Pre-Seed Pitch Deck"
          />
        </div>
      </AnimatedSection>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Portal Page                                                        */
/* ------------------------------------------------------------------ */

function InvestorPortalContent() {
  const { state, investor, signOut, refreshSession } = useInvestorSession()
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get("invite")
  const [showInviteModal, setShowInviteModal] = useState(false)

  if (state === "checking") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    )
  }

  if (state === "unauthenticated" || !investor) {
    return <InvestorLoginForm onAuthenticated={refreshSession} inviteCode={inviteCode} />
  }

  const displayName = investor.name || investor.phone

  return (
    <div className="bg-[#060D16] min-h-screen">
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} investorName={investor.name || ""} />}

      {/* ============================================================ */}
      {/*  Hero                                                        */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0D1B2A] to-[#060D16]">
        <GradientMesh colors={["#00D47E", "#26A8C9", "#7B5CB8", "#00D47E"]} />
        <div className="absolute inset-0">
          <WaveTexture opacity={0.04} />
        </div>
        <div className="absolute -bottom-32 -right-32">
          <PhosraBurst size={520} color="#00D47E" opacity={0.04} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
          <AnimatedSection>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
                  Investor Portal
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight max-w-3xl">
                  Data Room
                </h1>
                <p className="text-base text-white/40 mt-4 max-w-xl">
                  Welcome, {displayName}. Confidential materials for approved investors.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-green/10 border border-brand-green/20 text-brand-green hover:bg-brand-green/20 hover:border-brand-green/30 rounded-lg transition-colors text-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/20 rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Section 1: Raise Overview                                    */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 lg:py-20">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Raise Details
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-white mb-10">
            Pre-seed round
          </h2>
        </AnimatedSection>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.06}>
          <div className="glass-card rounded-xl p-5">
            <DollarSign className="w-4 h-4 text-brand-green mb-3" />
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Target Raise</p>
            <p className="text-xl font-display text-white">{RAISE_DETAILS.targetAmount}</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <BarChart3 className="w-4 h-4 text-brand-green mb-3" />
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Valuation Cap</p>
            <p className="text-xl font-display text-white">{RAISE_DETAILS.valuationCap}</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <Shield className="w-4 h-4 text-brand-green mb-3" />
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Min Check</p>
            <p className="text-xl font-display text-white">{RAISE_DETAILS.minCheck}</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <Clock className="w-4 h-4 text-brand-green mb-3" />
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Status</p>
            <p className="text-xl font-display text-white">{RAISE_DETAILS.roundStatus}</p>
          </div>
        </StaggerChildren>

        <AnimatedSection delay={0.3}>
          <div className="glass-card rounded-xl p-6 mt-6">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Instrument</p>
            <p className="text-sm text-white/70 mb-5">{RAISE_DETAILS.instrument}</p>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Use of Funds</p>
            <div className="space-y-3">
              {RAISE_DETAILS.useOfFunds.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white/70">{item.label}</span>
                      <span className="text-sm font-mono text-white/50">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-green/60 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ============================================================ */}
      {/*  Section 2: Pitch Deck Viewer                                 */}
      {/* ============================================================ */}
      <DeckSection investorPhone={investor.phone} investorName={investor.name || ""} investorCompany={investor.company || ""} />

      {/* ============================================================ */}
      {/*  Section 3: SAFE Document                                     */}
      {/* ============================================================ */}
      <SafeSection investorPhone={investor.phone} investorName={investor.name || ""} investorCompany={investor.company || ""} />

      {/* ============================================================ */}
      {/*  Section 4: Data Room Links                                   */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 lg:py-20">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Due Diligence
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-white mb-10">
            Data room
          </h2>
        </AnimatedSection>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.06}>
          {DATA_ROOM_LINKS.map((link) => {
            const Icon = CATEGORY_ICONS[link.category]
            return (
              <a
                key={link.label}
                href={link.url}
                target={link.url.startsWith("/") ? undefined : "_blank"}
                rel={link.url.startsWith("/") ? undefined : "noopener noreferrer"}
                className="group block"
              >
                <div className="glass-card rounded-xl p-5 h-full flex flex-col transition-all hover:bg-white/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-brand-green" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                        {CATEGORY_LABELS[link.category]}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-brand-green transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-brand-green transition-colors mb-1">
                    {link.label}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed flex-1">
                    {link.description}
                  </p>
                </div>
              </a>
            )
          })}
        </StaggerChildren>
      </section>

      {/* ============================================================ */}
      {/*  Section 5: Account Linking                                   */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 lg:py-20 pb-32">
        <AnimatedSection>
          <AccountLinking phone={investor.phone} />
        </AnimatedSection>
      </section>
    </div>
  )
}

export default function InvestorPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        </div>
      }
    >
      <InvestorPortalContent />
    </Suspense>
  )
}
