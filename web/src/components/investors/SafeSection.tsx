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
  ArrowLeft,
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
/*  Full SAFE Document Preview (inline, with highlighted fields)       */
/* ------------------------------------------------------------------ */

function V({ children }: { children: React.ReactNode }) {
  return <span className="text-brand-green font-medium bg-brand-green/10 px-1 rounded">{children}</span>
}

function SafeDocumentPreview({
  investorName,
  investorCompany,
  investorEmail,
  purchaseAmount,
  valuationCap,
  date,
}: {
  investorName: string
  investorCompany: string
  investorEmail: string
  purchaseAmount: string
  valuationCap: string
  date: string
}) {
  const investorLine = investorCompany
    ? `${investorName} (${investorCompany})`
    : investorName

  return (
    <div className="max-h-[600px] overflow-y-auto bg-white/[0.02] border border-white/5 rounded-lg p-6 sm:p-8 text-xs text-white/60 leading-relaxed space-y-4 scroll-smooth">
      {/* Title */}
      <div className="text-center space-y-1 pb-4 border-b border-white/5">
        <p className="text-base font-bold text-white">SAFE</p>
        <p className="text-sm text-white/50">(Simple Agreement for Future Equity)</p>
      </div>

      {/* Preamble */}
      <p>
        THIS CERTIFIES THAT in exchange for the payment by <V>{investorLine}</V> (the
        &ldquo;<strong className="text-white/80">Investor</strong>&rdquo;) of <V>{purchaseAmount}</V> (the
        &ldquo;<strong className="text-white/80">Purchase Amount</strong>&rdquo;) on or about <V>{date}</V>,
        Phosra, Inc., a Delaware corporation (the &ldquo;<strong className="text-white/80">Company</strong>&rdquo;),
        hereby issues to the Investor the right to certain shares of the Company&apos;s capital stock,
        subject to the terms set forth below.
      </p>
      <p>
        The &ldquo;<strong className="text-white/80">Valuation Cap</strong>&rdquo; is <V>{valuationCap}</V>.
      </p>
      <p>
        See <strong className="text-white/80">Section 2</strong> for certain additional defined terms.
      </p>

      {/* Section 1 */}
      <p className="text-sm font-bold text-white/90 pt-3">1. Events</p>

      <p className="font-semibold text-white/70">(a) Equity Financing.</p>
      <p className="ml-4">
        If there is an Equity Financing before the termination of this Safe, on the initial
        closing of such Equity Financing, this Safe will automatically convert into the greater
        of: (1) the number of shares of Standard Preferred Stock equal to the Purchase Amount
        divided by the lowest price per share of the Standard Preferred Stock; or (2) the number
        of shares of Safe Preferred Stock equal to the Purchase Amount divided by the Safe Price.
      </p>
      <p className="ml-4">
        In connection with the automatic conversion of this Safe into shares of Safe Preferred
        Stock, the Company will create a new series of preferred stock having the identical
        rights, privileges, preferences and restrictions as the shares of Standard Preferred
        Stock issued in the Equity Financing, except that the Post-Money Valuation Cap will be
        used for determining the price per share, the liquidation preference, and the conversion
        price for purposes of price-based anti-dilution protection.
      </p>
      <p className="ml-4">
        In the event of an Equity Financing, the initial closing of which occurs within ninety (90)
        days of the issuance of this Safe, the Company will, at the option of the Investor, either
        (a) apply the Purchase Amount to the purchase of shares of Standard Preferred Stock at the
        price per share paid by the other investors in the Equity Financing, or (b) convert this
        Safe into shares of Safe Preferred Stock as described above.
      </p>

      <p className="font-semibold text-white/70">(b) Liquidity Event.</p>
      <p className="ml-4">
        If there is a Liquidity Event before the termination of this Safe, the Investor will, at
        its option, either (i) receive a cash payment equal to the Purchase Amount (the
        &ldquo;<strong className="text-white/80">Cash-Out Amount</strong>&rdquo;) or (ii)
        automatically receive from the Company a number of shares of Common Stock equal to the
        Purchase Amount divided by the Liquidity Price, if the Investor fails to select the cash
        option.
      </p>

      <p className="font-semibold text-white/70">(c) Dissolution Event.</p>
      <p className="ml-4">
        If there is a Dissolution Event before the termination of this Safe, the Investor will
        automatically be entitled to receive a portion of the Proceeds equal to the Cash-Out
        Amount, due and payable to the Investor immediately prior to, or concurrent with, the
        consummation of the Dissolution Event.
      </p>

      <p className="font-semibold text-white/70">(d) Termination.</p>
      <p className="ml-4">
        This Safe will automatically terminate (without relieving the Company of any obligations
        arising from a prior breach of or non-compliance with this Safe) immediately following
        the earliest to occur of: (i) the issuance of Capital Stock to the Investor pursuant to
        the automatic conversion of this Safe under Section 1(a); or (ii) the payment, or
        setting aside for payment, of amounts due the Investor pursuant to Section 1(b) or
        Section 1(c).
      </p>

      {/* Section 2 */}
      <p className="text-sm font-bold text-white/90 pt-3">2. Definitions</p>

      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Capital Stock</strong>&rdquo; means the capital stock of the Company,
        including, without limitation, the Common Stock and Preferred Stock.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Change of Control</strong>&rdquo; means (i) a transaction or
        series of related transactions in which any &ldquo;person&rdquo; or &ldquo;group&rdquo; (within the
        meaning of Sections 13(d) and 14(d) of the Securities Exchange Act of 1934, as amended),
        becomes the &ldquo;beneficial owner&rdquo; (as defined in Rule 13d-3 under the Securities
        Exchange Act of 1934, as amended), directly or indirectly, of more than 50% of the
        outstanding voting securities of the Company having the right to vote for members of the
        Company&apos;s board of directors, (ii) any reorganization, merger or consolidation of the
        Company, other than a transaction or series of related transactions in which the holders of
        the voting securities of the Company outstanding immediately prior to such transaction or
        series of related transactions retain, immediately after such transaction or series of
        related transactions, at least a majority of the total voting power represented by the
        outstanding voting securities of the Company or such other surviving or resulting entity,
        or (iii) a sale, lease or other disposition of all or substantially all of the assets of
        the Company.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Common Stock</strong>&rdquo; means the common stock of the Company.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Company Capitalization</strong>&rdquo; is calculated as of
        immediately prior to the Equity Financing and (without double-counting, in each case
        calculated on an as-converted to Common Stock basis):
      </p>
      <p className="ml-8">(i) All shares of Capital Stock issued and outstanding;</p>
      <p className="ml-8">
        (ii) All outstanding stock options or similar rights to purchase shares, whether vested or
        unvested, and including any shares reserved and available for future grant under any equity
        incentive or similar plan;
      </p>
      <p className="ml-8">
        (iii) The shares of Capital Stock issuable upon conversion of all outstanding convertible
        securities (other than SAFEs);
      </p>
      <p className="ml-8">
        (iv) The shares reserved for issuance pursuant to all SAFEs and convertible notes outstanding.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Dissolution Event</strong>&rdquo; means (i) a voluntary
        termination of operations, (ii) a general assignment for the benefit of the Company&apos;s
        creditors, or (iii) any other liquidation, dissolution, or winding up of the Company
        (excluding a Liquidity Event), whether voluntary or involuntary.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Equity Financing</strong>&rdquo; means a bona fide transaction
        or series of transactions with the principal purpose of raising capital, pursuant to which
        the Company issues and sells Preferred Stock at a fixed valuation, including but not
        limited to, a pre-money or post-money valuation.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Initial Public Offering</strong>&rdquo; means the closing of the
        Company&apos;s first firm commitment underwritten initial public offering of Common Stock
        pursuant to a registration statement filed under the Securities Act.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Liquidity Capitalization</strong>&rdquo; is calculated as of
        immediately prior to the Liquidity Event, and (without double-counting, in each case
        calculated on an as-converted to Common Stock basis):
      </p>
      <p className="ml-8">(i) All shares of Capital Stock issued and outstanding;</p>
      <p className="ml-8">(ii) All outstanding stock options or similar rights, whether vested or unvested;</p>
      <p className="ml-8">
        (iii) The shares issuable upon conversion of all outstanding convertible securities (other
        than SAFEs);
      </p>
      <p className="ml-8">(iv) The shares reserved for issuance pursuant to all SAFEs and convertible notes.</p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Liquidity Event</strong>&rdquo; means a Change of Control or an
        Initial Public Offering.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Liquidity Price</strong>&rdquo; means the price per share equal to
        the Valuation Cap divided by the Liquidity Capitalization.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Post-Money Valuation Cap</strong>&rdquo; means the Valuation Cap.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Preferred Stock</strong>&rdquo; means the preferred stock of the Company.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Proceeds</strong>&rdquo; means cash and other assets (including
        without limitation stock consideration) that are proceeds from the Dissolution Event.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Safe</strong>&rdquo; means this instrument.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Safe Preferred Stock</strong>&rdquo; means the shares of a series
        of Preferred Stock issued to the Investor in an Equity Financing, having the identical
        rights, privileges, preferences and restrictions as the Standard Preferred Stock, other than
        with respect to: (i) the per share liquidation preference, which will equal the Safe Price;
        and (ii) the conversion price for purposes of price-based anti-dilution protection, which
        will be based on the Safe Price.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Safe Price</strong>&rdquo; means the price per share equal to the
        Post-Money Valuation Cap divided by the Company Capitalization.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Securities Act</strong>&rdquo; means the Securities Act of 1933, as
        amended.
      </p>
      <p className="ml-4">
        &ldquo;<strong className="text-white/80">Standard Preferred Stock</strong>&rdquo; means the shares of the
        series of Preferred Stock issued to the investors investing new money in the Company in
        connection with the initial closing of the Equity Financing.
      </p>

      {/* Section 3 */}
      <p className="text-sm font-bold text-white/90 pt-3">3. Company Representations</p>

      <p className="font-semibold text-white/70">(a)</p>
      <p className="ml-4">
        The Company is a corporation duly organized, validly existing, and in good standing under
        the laws of the state of Delaware, and has the power and authority to own, lease, and
        operate its properties and carry on its business as now conducted.
      </p>

      <p className="font-semibold text-white/70">(b)</p>
      <p className="ml-4">
        The execution, delivery, and performance by the Company of this Safe is within the power
        of the Company and has been duly authorized by all necessary actions on the part of the
        Company. This Safe constitutes a legal, valid, and binding obligation of the Company,
        enforceable against the Company in accordance with its terms, except as limited by
        bankruptcy, insolvency, or other laws of general application relating to or affecting the
        enforcement of creditors&apos; rights generally and general principles of equity.
      </p>

      <p className="font-semibold text-white/70">(c)</p>
      <p className="ml-4">
        The performance and consummation of the transactions contemplated by this Safe do not and
        will not: (i) violate any material judgment, statute, rule, or regulation applicable to the
        Company; (ii) result in the acceleration of any material indebtedness owed by the Company;
        or (iii) result in the creation or imposition of any lien on any property, asset, or
        revenue of the Company or the suspension, forfeiture, or nonrenewal of any material permit,
        license, or authorization applicable to the Company, its business, or operations.
      </p>

      <p className="font-semibold text-white/70">(d)</p>
      <p className="ml-4">
        No consents or approvals are required in connection with the performance of this Safe,
        other than: (i) the Company&apos;s corporate approvals; (ii) any qualifications or filings
        under applicable securities laws; and (iii) necessary corporate approvals for the
        authorization of Capital Stock issuable pursuant to Section 1.
      </p>

      {/* Section 4 */}
      <p className="text-sm font-bold text-white/90 pt-3">4. Investor Representations</p>

      <p className="font-semibold text-white/70">(a)</p>
      <p className="ml-4">
        The Investor has full legal capacity, power, and authority to execute and deliver this Safe
        and to perform its obligations hereunder. This Safe constitutes valid and binding obligation
        of the Investor, enforceable in accordance with its terms, except as limited by bankruptcy,
        insolvency, or other laws of general application relating to or affecting the enforcement of
        creditors&apos; rights generally and general principles of equity.
      </p>

      <p className="font-semibold text-white/70">(b)</p>
      <p className="ml-4">
        The Investor is an accredited investor as such term is defined in Rule 501 of Regulation D
        under the Securities Act of 1933, as amended. The Investor has been advised that this Safe
        and the underlying securities have not been registered under the Securities Act, or any
        state securities laws, and are being offered and sold pursuant to an exemption from such
        registration. The Investor acknowledges that it can bear the economic risk of this investment.
      </p>

      <p className="font-semibold text-white/70">(c)</p>
      <p className="ml-4">
        The Investor is purchasing this Safe and the securities to be acquired by the Investor
        hereunder for its own account for investment, not as a nominee or agent, and not with a
        view to, or for resale in connection with, the distribution thereof, and the Investor has
        no present intention of selling, granting any participation in, or otherwise distributing
        the same.
      </p>

      <p className="font-semibold text-white/70">(d)</p>
      <p className="ml-4">
        The Investor has had an opportunity to ask questions and receive answers from the Company
        regarding the terms and conditions of this Safe and the business, properties, prospects, and
        financial condition of the Company.
      </p>

      {/* Section 5 */}
      <p className="text-sm font-bold text-white/90 pt-3">5. Miscellaneous</p>

      <p className="font-semibold text-white/70">(a) Amendment.</p>
      <p className="ml-4">
        Any provision of this Safe may be amended, waived, or modified by written consent of the
        Company and either (i) the Investor or (ii) the majority-in-interest of all then-outstanding
        SAFEs with the same &ldquo;Post-Money Valuation Cap&rdquo; and &ldquo;Discount Rate&rdquo; as this
        Safe (the &ldquo;Requisite Majority&rdquo;), provided that with the different consent specified
        for different SAFEs, each SAFE may be separately amended.
      </p>

      <p className="font-semibold text-white/70">(b) No Stockholder Rights.</p>
      <p className="ml-4">
        The Investor is not entitled, as a Safe holder, to vote or receive dividends or be deemed
        the holder of Capital Stock for any purpose, nor will anything contained herein be construed
        to confer on the Investor, as such, any of the rights of a stockholder of the Company or
        any right to vote for the election of directors or upon any matter submitted to stockholders
        at any meeting thereof, or to give or withhold consent to any corporate action or to receive
        notice of meetings, or to receive subscription rights or otherwise.
      </p>

      <p className="font-semibold text-white/70">(c) Tax Treatment.</p>
      <p className="ml-4">
        This Safe is intended to be treated as stock for U.S. federal and state income tax purposes.
        To the maximum extent permissible, the Company and the Investor will file all tax returns
        and will take all financial reporting and other positions in a manner consistent with such
        treatment.
      </p>

      <p className="font-semibold text-white/70">(d) Notices.</p>
      <p className="ml-4">
        Any notice required or permitted by this Safe will be deemed sufficient when delivered
        personally or by overnight courier service or sent by email to the relevant address listed
        on the signature page, as subsequently modified by written notice.
      </p>

      <p className="font-semibold text-white/70">(e) Governing Law.</p>
      <p className="ml-4">
        This Safe will be governed by and construed under the laws of the State of Delaware,
        without regard to the conflicts of law provisions of such jurisdiction.
      </p>

      <p className="font-semibold text-white/70">(f) Successors and Assigns.</p>
      <p className="ml-4">
        The terms and conditions of this Safe will inure to the benefit of and be binding upon the
        respective successors and assigns of the parties. Neither the Company nor the Investor may
        assign this Safe or any rights under this Safe without the prior written consent of the other.
        Notwithstanding the foregoing, the Investor may assign this Safe to an affiliate of the
        Investor without the Company&apos;s consent.
      </p>

      <p className="font-semibold text-white/70">(g) Severability.</p>
      <p className="ml-4">
        If one or more provisions of this Safe are held to be unenforceable under applicable law,
        the parties agree to renegotiate such provision in good faith. In the event that the parties
        cannot reach a mutually agreeable and enforceable replacement for such provision, then (i)
        such provision will be excluded from this Safe, (ii) the balance of this Safe will be
        interpreted as if such provision were so excluded and (iii) the balance of this Safe will be
        enforceable in accordance with its terms.
      </p>

      <p className="font-semibold text-white/70">(h) Entire Agreement.</p>
      <p className="ml-4">
        This Safe comprises the entire agreement between the Company and the Investor with regard
        to the subject matter herein, and no party has relied on any other agreements or
        representations.
      </p>

      <p className="font-semibold text-white/70">(i) Counterparts.</p>
      <p className="ml-4">
        This Safe may be executed in one or more counterparts, each of which will be deemed an
        original and all of which together will constitute one and the same instrument. Electronic
        signatures will be deemed original signatures for all purposes.
      </p>

      {/* Signature Page */}
      <div className="pt-6 border-t border-white/5 space-y-6">
        <p className="text-sm font-bold text-white/90">SIGNATURE PAGE</p>
        <p>
          IN WITNESS WHEREOF, the undersigned have caused this Safe to be duly executed and
          delivered as of <V>{date}</V>.
        </p>

        <div className="space-y-1">
          <p className="font-bold text-white/80">COMPANY:</p>
          <p className="text-white/70">Phosra, Inc., a Delaware corporation</p>
          <div className="border-b border-white/20 w-64 mt-4 mb-1" />
          <p className="text-[10px] text-white/30">Name: Jake Klinvex</p>
          <p className="text-[10px] text-white/30">Title: Chief Executive Officer</p>
        </div>

        <div className="space-y-1">
          <p className="font-bold text-white/80">INVESTOR:</p>
          <div className="border-b border-white/20 w-64 mt-4 mb-1" />
          <p className="text-[10px] text-white/30">Name: <V>{investorName}</V></p>
          {investorCompany && (
            <p className="text-[10px] text-white/30">Entity: <V>{investorCompany}</V></p>
          )}
          <p className="text-[10px] text-white/30">Email: <V>{investorEmail}</V></p>
          <p className="text-[10px] text-white/30">Purchase Amount: <V>{purchaseAmount}</V></p>
        </div>
      </div>
    </div>
  )
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
      } else if (res.status === 409 && safe) {
        // SAFE already exists (user went back from signing) — just go to signing
        setSignatureName(safe.investor_name || legalName.trim())
        setViewState("signing")
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
          <div className="glass-card rounded-xl p-6 space-y-5">
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

            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-white/30 leading-relaxed max-w-2xl">
                <strong className="text-white/50">About the SAFE.</strong>{" "}
                The SAFE (Simple Agreement for Future Equity) was introduced by Y Combinator in 2013
                and has become the most widely used instrument for early-stage fundraising. Unlike
                convertible notes, SAFEs have no interest rate, no maturity date, and no repayment
                obligation — they simply convert into equity at a future priced round. The post-money
                variant (used here) gives investors clarity on their ownership percentage at the time
                of signing, making it the preferred standard for pre-seed and seed rounds. Over $100B+
                in startup funding has been raised using SAFEs.
              </p>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Reviewing — Fill in Details + Full SAFE Preview ── */}
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

            {/* Form fields — fill these in and the document below updates live */}
            <div className="px-6 py-5 border-b border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/40 uppercase tracking-wider">Your Details</p>
                <p className="text-[10px] text-white/20">Fields update the document below in real time</p>
              </div>

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
            </div>

            {/* Full SAFE document with pre-populated fields */}
            <div className="px-6 py-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/40 uppercase tracking-wider">Full Agreement — Post-Money SAFE (Valuation Cap, No Discount)</p>
                {safe && (
                  <a
                    href={`/api/investors/safe/${safe.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-[11px] font-medium transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download PDF
                  </a>
                )}
              </div>
              <SafeDocumentPreview
                investorName={legalName.trim() || "______________________"}
                investorCompany={company.trim()}
                investorEmail={email.trim() || "______________________"}
                purchaseAmount={investmentAmount ? `$${investmentAmount}` : "$______________________"}
                valuationCap={RAISE_DETAILS.valuationCap}
                date={new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              />
            </div>

            {/* Actions */}
            <div className="px-6 py-5 space-y-3">
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
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
              <button
                onClick={() => {
                  setError("")
                  setLegalName(safe.investor_name || legalName)
                  setEmail(safe.investor_email || email)
                  setCompany(safe.investor_company || company)
                  setInvestmentAmount(
                    safe.investment_amount_cents
                      ? (parseInt(safe.investment_amount_cents, 10) / 100).toLocaleString()
                      : investmentAmount,
                  )
                  setViewState("reviewing")
                }}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Review
              </button>
            </div>

            <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs flex-1">
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
                <a
                  href={`/api/investors/safe/${safe.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-[11px] font-medium transition-colors flex-shrink-0 ml-4"
                >
                  <Download className="w-3 h-3" />
                  Download PDF
                </a>
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
