"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Scale,
  Loader2,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  ArrowRight,
} from "lucide-react"
import { AnimatedSection } from "@/components/marketing/shared"
import { RAISE_DETAILS } from "@/lib/investors/config"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SafeRecord {
  id: string
  investor_name: string
  investor_email: string
  investor_company: string
  investment_amount_cents: string
  valuation_cap_cents: string
  status: string
  investor_signed_at: string | null
  company_signed_at: string | null
  created_at: string
}

type ViewState =
  | "loading"
  | "no_safe"
  | "reviewing"
  | "signing"
  | "investor_signed"
  | "countersigned"
  | "voided"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SafeSection({
  investorPhone,
  investorName,
  investorCompany,
}: {
  investorPhone: string
  investorName: string
  investorCompany: string
}) {
  const [viewState, setViewState] = useState<ViewState>("loading")
  const [safe, setSafe] = useState<SafeRecord | null>(null)
  const [error, setError] = useState("")

  // Review form state
  const [legalName, setLegalName] = useState(investorName)
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState(investorCompany)
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Signing form state
  const [signatureName, setSignatureName] = useState("")
  const [consentElectronic, setConsentElectronic] = useState(false)
  const [consentAccredited, setConsentAccredited] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)
  const [signing, setSigning] = useState(false)

  const fetchSafe = useCallback(async () => {
    try {
      const res = await fetch("/api/investors/safe", { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      if (data.safe) {
        setSafe(data.safe)
        switch (data.safe.status) {
          case "pending_investor":
            setViewState("signing")
            setSignatureName(data.safe.investor_name)
            break
          case "investor_signed":
            setViewState("investor_signed")
            break
          case "countersigned":
            setViewState("countersigned")
            break
          case "voided":
            setViewState("voided")
            break
          default:
            setViewState("no_safe")
        }
      } else {
        setViewState("no_safe")
      }
    } catch {
      setViewState("no_safe")
    }
  }, [])

  useEffect(() => {
    fetchSafe()
  }, [fetchSafe])

  const handleCreateSafe = async () => {
    setError("")
    if (!legalName.trim()) { setError("Legal name is required"); return }
    if (!email.trim()) { setError("Email is required"); return }
    const amount = parseInt(investmentAmount.replace(/[^0-9]/g, ""), 10)
    if (!amount || amount < 25000) { setError("Minimum investment is $25,000"); return }

    setSubmitting(true)
    try {
      const res = await fetch("/api/investors/safe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          legalName: legalName.trim(),
          email: email.trim(),
          company: company.trim(),
          investmentAmount: amount,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSafe({ ...data.safe, investor_name: legalName.trim(), status: "pending_investor" } as SafeRecord)
        setSignatureName(legalName.trim())
        setViewState("signing")
        // Refetch to get full record
        await fetchSafe()
      } else {
        setError(data.error || "Failed to create SAFE")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSign = async () => {
    setError("")
    if (!signatureName.trim()) { setError("Please type your legal name"); return }
    if (!consentElectronic) { setError("Please consent to electronic signature"); return }
    if (!consentAccredited) { setError("Please confirm accredited investor status"); return }
    if (!consentTerms) { setError("Please agree to the SAFE terms"); return }

    if (!safe) return
    setSigning(true)
    try {
      const res = await fetch("/api/investors/safe/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          safeId: safe.id,
          legalName: signatureName.trim(),
          consentElectronic,
          consentAccredited,
          consentTerms,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setViewState("investor_signed")
        await fetchSafe()
      } else {
        setError(data.error || "Failed to sign SAFE")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSigning(false)
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 lg:py-20">
      <AnimatedSection>
        <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
          Investment Agreement
        </p>
        <h2 className="text-2xl sm:text-3xl font-display text-white mb-6">
          SAFE Document
        </h2>
      </AnimatedSection>

      {/* ── Loading ────────────────────────────────────────── */}
      {viewState === "loading" && (
        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl p-6 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-brand-green animate-spin" />
            <span className="text-sm text-white/50">Loading SAFE status...</span>
          </div>
        </AnimatedSection>
      )}

      {/* ── No SAFE — Overview Card ───────────────────────── */}
      {viewState === "no_safe" && (
        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Post-Money SAFE Agreement</h3>
                  <p className="text-sm text-white/40 leading-relaxed max-w-md">
                    Standard YC post-money SAFE with a {RAISE_DETAILS.valuationCap} valuation cap.
                    No discount, no pro-rata, MFN provision. Minimum check: {RAISE_DETAILS.minCheck}.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="text-xs text-white/30 bg-white/5 px-2.5 py-1 rounded-full">
                      Post-Money Cap
                    </span>
                    <span className="text-xs text-white/30 bg-white/5 px-2.5 py-1 rounded-full">
                      {RAISE_DETAILS.valuationCap} Cap
                    </span>
                    <span className="text-xs text-white/30 bg-white/5 px-2.5 py-1 rounded-full">
                      YC Standard
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewState("reviewing")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm flex-shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                Review &amp; Sign SAFE
              </button>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Reviewing — Fill in Details Modal ─────────────── */}
      {viewState === "reviewing" && (
        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-green" />
                SAFE Agreement — Review &amp; Submit
              </h3>
              <button
                onClick={() => setViewState("no_safe")}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SAFE Summary */}
            <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Agreement Terms</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-white/30">Instrument</p>
                  <p className="text-sm text-white font-medium">Post-Money SAFE</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30">Valuation Cap</p>
                  <p className="text-sm text-white font-medium">{RAISE_DETAILS.valuationCap}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30">Discount</p>
                  <p className="text-sm text-white font-medium">None</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30">Min Check</p>
                  <p className="text-sm text-white font-medium">{RAISE_DETAILS.minCheck}</p>
                </div>
              </div>
            </div>

            {/* Scrollable SAFE text preview */}
            <div className="px-6 py-4 border-b border-white/5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">SAFE Preview</p>
              <div className="max-h-64 overflow-y-auto bg-white/[0.02] border border-white/5 rounded-lg p-4 text-xs text-white/60 leading-relaxed space-y-3">
                <p className="font-semibold text-white/80">SAFE (Simple Agreement for Future Equity)</p>
                <p>
                  THIS CERTIFIES THAT in exchange for the payment by Investor of the Purchase Amount,
                  Phosra, Inc., a Delaware corporation (&quot;Company&quot;), hereby issues to the Investor the right
                  to certain shares of the Company&apos;s capital stock, subject to the terms set forth below.
                </p>
                <p className="font-semibold text-white/70">1. Events</p>
                <p>
                  <strong>(a) Equity Financing:</strong> If there is an Equity Financing, this Safe will
                  automatically convert into the greater of: (1) shares of Standard Preferred Stock equal to
                  Purchase Amount / lowest price per share, or (2) shares of Safe Preferred Stock equal to
                  Purchase Amount / Safe Price.
                </p>
                <p>
                  <strong>(b) Liquidity Event:</strong> Investor will receive either a cash payment equal to
                  the Purchase Amount or shares of Common Stock equal to Purchase Amount / Liquidity Price.
                </p>
                <p>
                  <strong>(c) Dissolution Event:</strong> Investor will be entitled to receive a portion of
                  Proceeds equal to the Cash-Out Amount.
                </p>
                <p className="font-semibold text-white/70">2. Definitions</p>
                <p>
                  Post-Money Valuation Cap, Safe Price, Liquidity Price, Company Capitalization, and other
                  terms as defined in the full YC Post-Money SAFE template.
                </p>
                <p className="font-semibold text-white/70">3. Company Representations</p>
                <p>
                  The Company is duly organized in Delaware, has authority to execute this Safe, and its
                  performance will not violate applicable laws.
                </p>
                <p className="font-semibold text-white/70">4. Investor Representations</p>
                <p>
                  The Investor has full authority, is an accredited investor per Rule 501 of Regulation D,
                  and is purchasing for investment purposes only.
                </p>
                <p className="font-semibold text-white/70">5. Miscellaneous</p>
                <p>
                  Governing law: Delaware. No stockholder rights granted to Safe holder. Tax treatment as
                  stock for federal/state purposes.
                </p>
                <p className="text-white/30 text-[10px] mt-4">
                  Full legal text will be included in the PDF upon signing. This is a standard YC
                  post-money SAFE (Cap, No Discount).
                </p>
              </div>
            </div>

            {/* Form fields */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Your Details</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Legal Name *</label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => { setLegalName(e.target.value); setError("") }}
                    placeholder="Full legal name"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError("") }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Company / Entity (optional)</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Ventures LLC"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Investment Amount (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={investmentAmount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "")
                        setInvestmentAmount(raw ? parseInt(raw, 10).toLocaleString() : "")
                        setError("")
                      }}
                      placeholder="25,000"
                      className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setViewState("no_safe")}
                  className="px-4 py-2.5 text-white/40 hover:text-white/60 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSafe}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3.5 h-3.5" />
                      Continue to Signing
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Signing ───────────────────────────────────────── */}
      {viewState === "signing" && safe && (
        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-green" />
                Sign SAFE Agreement
              </h3>
            </div>

            <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-white/30">Investor</p>
                  <p className="text-white font-medium">{safe.investor_name}</p>
                </div>
                <div>
                  <p className="text-white/30">Amount</p>
                  <p className="text-white font-medium">
                    {fmtDollars(parseInt(safe.investment_amount_cents, 10))}
                  </p>
                </div>
                <div>
                  <p className="text-white/30">Valuation Cap</p>
                  <p className="text-white font-medium">{RAISE_DETAILS.valuationCap}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">
                  Type your full legal name to sign *
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => { setSignatureName(e.target.value); setError("") }}
                  placeholder={safe.investor_name}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base font-medium placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors"
                  style={{ fontFamily: "cursive, serif" }}
                />
                <p className="text-[10px] text-white/20 mt-1.5">
                  Must exactly match: {safe.investor_name}
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentElectronic}
                    onChange={(e) => { setConsentElectronic(e.target.checked); setError("") }}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green/50"
                  />
                  <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                    I consent to signing this agreement electronically pursuant to the ESIGN Act
                    (15 U.S.C. § 7001) and UETA. I understand my electronic signature has the same
                    legal effect as a handwritten signature.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentAccredited}
                    onChange={(e) => { setConsentAccredited(e.target.checked); setError("") }}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green/50"
                  />
                  <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                    I confirm that I am an accredited investor as defined in Rule 501 of Regulation D
                    under the Securities Act of 1933.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentTerms}
                    onChange={(e) => { setConsentTerms(e.target.checked); setError("") }}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green/50"
                  />
                  <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                    I have reviewed the SAFE agreement terms and agree to be bound by all provisions
                    contained therein.
                  </span>
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSign}
                disabled={signing || !consentElectronic || !consentAccredited || !consentTerms || !signatureName.trim()}
                className="w-full py-3 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {signing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    Sign Agreement
                  </>
                )}
              </button>

              <p className="text-[10px] text-white/20 text-center">
                Your IP address, timestamp, and user agent will be recorded as part of the signing audit trail.
              </p>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Investor Signed — Awaiting Countersignature ───── */}
      {viewState === "investor_signed" && safe && (
        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">SAFE Agreement</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                      Signed — Awaiting Countersignature
                    </span>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed max-w-md">
                    You signed on{" "}
                    {safe.investor_signed_at
                      ? new Date(safe.investor_signed_at).toLocaleDateString()
                      : "—"}.
                    Waiting for Phosra to countersign.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                    <span>Amount: {fmtDollars(parseInt(safe.investment_amount_cents, 10))}</span>
                    <span>Cap: {RAISE_DETAILS.valuationCap}</span>
                  </div>
                </div>
              </div>
              <a
                href={`/api/investors/safe/${safe.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors text-sm flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Countersigned — Fully Executed ────────────────── */}
      {viewState === "countersigned" && safe && (
        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">SAFE Agreement</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green">
                      Fully Executed
                    </span>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed max-w-md">
                    Countersigned on{" "}
                    {safe.company_signed_at
                      ? new Date(safe.company_signed_at).toLocaleDateString()
                      : "—"}.
                    Your SAFE is fully executed.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                    <span>Amount: {fmtDollars(parseInt(safe.investment_amount_cents, 10))}</span>
                    <span>Cap: {RAISE_DETAILS.valuationCap}</span>
                  </div>
                </div>
              </div>
              <a
                href={`/api/investors/safe/${safe.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download Executed SAFE
              </a>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Voided ────────────────────────────────────────── */}
      {viewState === "voided" && (
        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">SAFE Agreement</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                    Voided
                  </span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  This SAFE agreement has been voided. Please contact us if you have questions.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}
    </section>
  )
}
