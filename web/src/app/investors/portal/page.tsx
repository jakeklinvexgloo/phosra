"use client"

import { Suspense, useState, useCallback } from "react"
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
} from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst, GradientMesh, StaggerChildren } from "@/components/marketing/shared"
import { RAISE_DETAILS, DATA_ROOM_LINKS } from "@/lib/investors/config"
import type { DataRoomLink } from "@/lib/investors/config"
import { useInvestorSession } from "@/lib/investors/investor-auth"
import InvestorLoginForm from "@/components/investors/InvestorLoginForm"
import AccountLinking from "@/components/investors/AccountLinking"

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

function InviteModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [inviteUrl, setInviteUrl] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const generateInvite = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/investors/portal/invite", {
        method: "POST",
        credentials: "include",
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
  }, [])

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
          text: "You've been invited to view the Phosra investor data room.",
          url: inviteUrl,
        })
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    } else {
      handleCopy()
    }
  }, [inviteUrl, handleCopy])

  const shareMessage = `You've been invited to view the Phosra investor data room: ${inviteUrl}`

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
          <button
            onClick={generateInvite}
            disabled={loading}
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
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}

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
            <a
              href="/deck/phosra-pre-seed-deck.pdf"
              download
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-white font-medium rounded-lg hover:border-white/40 transition-colors text-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl overflow-hidden">
            <iframe
              src="/deck/phosra-pre-seed-deck.pdf"
              className="w-full h-[600px] sm:h-[700px] border-0"
              title="Phosra Pre-Seed Pitch Deck"
            />
          </div>
        </AnimatedSection>
      </section>

      {/* ============================================================ */}
      {/*  Section 3: SAFE Document                                     */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 lg:py-20">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Investment Agreement
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-white mb-6">
            SAFE Document
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Post-Money SAFE Agreement</h3>
                <p className="text-sm text-white/40 leading-relaxed max-w-md">
                  Standard YC post-money SAFE with a {RAISE_DETAILS.valuationCap} valuation cap. No discount, no pro-rata, MFN provision.
                </p>
              </div>
            </div>
            <a
              href="/investors/phosra-safe.pdf"
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download SAFE
            </a>
          </div>
        </AnimatedSection>
      </section>

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
