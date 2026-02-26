"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Loader2,
  Building2,
  Layers,
  Target,
  Percent,
  LogOut,
} from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst, GradientMesh, StaggerChildren } from "@/components/marketing/shared"
import { useInvestorSession } from "@/lib/investors/investor-auth"
import InvestorLoginForm from "@/components/investors/InvestorLoginForm"

/* ------------------------------------------------------------------ */
/*  Financial Model Data                                               */
/* ------------------------------------------------------------------ */

// Revenue assumptions — modeled after Plaid/Twilio per-API pricing
const SCENARIOS = {
  conservative: {
    label: "Conservative",
    color: "text-blue-400",
    bgColor: "bg-blue-400",
    providers: {  // Parental control providers ($0.25–$0.50/user/mo)
      y1Customers: 3,
      y2Customers: 8,
      y3Customers: 18,
      avgUsersPerCustomer: [15_000, 25_000, 40_000],
      pricePerUser: 0.30,
    },
    platforms: {  // Technology platforms ($0.10–$0.25/minor/mo)
      y1Customers: 2,
      y2Customers: 6,
      y3Customers: 15,
      avgMinorsPerCustomer: [50_000, 100_000, 200_000],
      pricePerMinor: 0.12,
    },
  },
  moderate: {
    label: "Moderate",
    color: "text-brand-green",
    bgColor: "bg-brand-green",
    providers: {
      y1Customers: 5,
      y2Customers: 15,
      y3Customers: 35,
      avgUsersPerCustomer: [20_000, 35_000, 60_000],
      pricePerUser: 0.38,
    },
    platforms: {
      y1Customers: 3,
      y2Customers: 10,
      y3Customers: 25,
      avgMinorsPerCustomer: [75_000, 150_000, 300_000],
      pricePerMinor: 0.15,
    },
  },
  aggressive: {
    label: "Aggressive",
    color: "text-purple-400",
    bgColor: "bg-purple-400",
    providers: {
      y1Customers: 8,
      y2Customers: 22,
      y3Customers: 50,
      avgUsersPerCustomer: [25_000, 50_000, 80_000],
      pricePerUser: 0.45,
    },
    platforms: {
      y1Customers: 5,
      y2Customers: 15,
      y3Customers: 40,
      avgMinorsPerCustomer: [100_000, 250_000, 500_000],
      pricePerMinor: 0.20,
    },
  },
} as const

type ScenarioKey = keyof typeof SCENARIOS

function calcRevenue(scenario: ScenarioKey) {
  const s = SCENARIOS[scenario]
  const years = [0, 1, 2] // indices for Y1, Y2, Y3
  return years.map((i) => {
    const providerCustomers = [s.providers.y1Customers, s.providers.y2Customers, s.providers.y3Customers][i]
    const platformCustomers = [s.platforms.y1Customers, s.platforms.y2Customers, s.platforms.y3Customers][i]
    const providerRevenue = providerCustomers * s.providers.avgUsersPerCustomer[i] * s.providers.pricePerUser * 12
    const platformRevenue = platformCustomers * s.platforms.avgMinorsPerCustomer[i] * s.platforms.pricePerMinor * 12
    return {
      year: `Year ${i + 1}`,
      label: `${2026 + i}`,
      providerCustomers,
      platformCustomers,
      totalCustomers: providerCustomers + platformCustomers,
      providerRevenue,
      platformRevenue,
      totalRevenue: providerRevenue + platformRevenue,
    }
  })
}

// Cost structure
const COST_STRUCTURE = [
  {
    years: ["Year 1 (2026)", "Year 2 (2027)", "Year 3 (2028)"],
    categories: [
      { label: "Engineering (salaries + infra)", values: [320_000, 680_000, 1_400_000] },
      { label: "Go-to-Market (sales + marketing)", values: [100_000, 280_000, 650_000] },
      { label: "Compliance & Legal", values: [60_000, 120_000, 200_000] },
      { label: "Operations (G&A, tools, office)", values: [70_000, 150_000, 300_000] },
      { label: "Cloud infrastructure (AWS/GCP)", values: [30_000, 80_000, 180_000] },
    ],
  },
]

// Headcount plan
const HEADCOUNT = [
  { role: "Engineering", y1: 2, y2: 5, y3: 10 },
  { role: "Sales / BD", y1: 0, y2: 2, y3: 4 },
  { role: "Compliance / Legal", y1: 0, y2: 1, y3: 2 },
  { role: "Operations / Support", y1: 0, y2: 1, y3: 2 },
  { role: "Founder (CEO)", y1: 1, y2: 1, y3: 1 },
]

// Key SaaS metrics (moderate scenario)
const SAAS_METRICS = {
  grossMargin: [78, 80, 82],
  netRevenueRetention: [null, 135, 140],
  cacPayback: [null, 14, 10],
  ltv: [null, 18_000, 24_000],
  cac: [null, 8_000, 6_500],
  ltvCacRatio: [null, 2.3, 3.7],
  churnRate: [null, 3.5, 2.8],
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function fmtFull(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

/* ------------------------------------------------------------------ */
/*  Financial Model Content                                            */
/* ------------------------------------------------------------------ */

function FinancialModelContent() {
  const { state, investor, signOut, refreshSession } = useInvestorSession()
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("moderate")

  if (state === "checking") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    )
  }

  if (state === "unauthenticated" || !investor) {
    return <InvestorLoginForm onAuthenticated={refreshSession} />
  }

  const revenue = calcRevenue(activeScenario)
  const scenario = SCENARIOS[activeScenario]
  const yearlyTotalCost = [0, 1, 2].map((yi) =>
    COST_STRUCTURE[0].categories.reduce((sum, cat) => sum + cat.values[yi], 0)
  )

  return (
    <div className="bg-[#060D16] min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────── */}
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
                <Link
                  href="/investors/portal"
                  className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-6"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Data Room
                </Link>
                <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
                  Financial Model
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight max-w-3xl">
                  3-Year Revenue Projection
                </h1>
                <p className="text-base text-white/40 mt-4 max-w-xl">
                  Plaid-style usage-based economics applied to the $5-8B child safety compliance market.
                </p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/20 rounded-lg transition-colors text-sm flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Model Approach ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Revenue Model
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-white mb-6">
            Two-sided usage-based pricing
          </h2>
          <p className="text-sm text-white/40 leading-relaxed max-w-2xl mb-10">
            Like Plaid charges per bank connection and Twilio charges per API call, Phosra charges per user per month — creating revenue that scales with customer growth and compounds with regulatory expansion.
          </p>
        </AnimatedSection>

        <StaggerChildren className="grid sm:grid-cols-2 gap-4" staggerDelay={0.06}>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Parental Controls Providers</h3>
                <p className="text-xs text-white/30">Bark, Qustodio, Net Nanny, Circle</p>
              </div>
            </div>
            <div className="text-2xl font-display text-white mb-1">$0.25–$0.50</div>
            <p className="text-xs text-white/40">per user / month</p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/30 leading-relaxed">
              Cross-platform enforcement API, &quot;Phosra Verified&quot; badge, pre-qualified leads, regulatory future-proofing
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Technology Platforms</h3>
                <p className="text-xs text-white/30">Netflix, YouTube, Roblox, Discord</p>
              </div>
            </div>
            <div className="text-2xl font-display text-white mb-1">$0.10–$0.25</div>
            <p className="text-xs text-white/40">per minor / month</p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/30 leading-relaxed">
              &quot;Phosra Certified&quot; badge, automated regulatory reporting, compliance dashboard, audit trail
            </div>
          </div>
        </StaggerChildren>
      </section>

      {/* ── Scenario Toggle ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
                Projections
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-white">
                Revenue by scenario
              </h2>
            </div>
            <div className="flex items-center bg-white/5 rounded-lg p-0.5">
              {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveScenario(key)}
                  className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                    activeScenario === key
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {SCENARIOS[key].label}
                </button>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Revenue summary cards */}
        <StaggerChildren className="grid sm:grid-cols-3 gap-4 mb-8" staggerDelay={0.06}>
          {revenue.map((r) => (
            <div key={r.year} className="glass-card rounded-xl p-6">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1">{r.year} ({r.label})</p>
              <p className={`text-3xl font-display ${scenario.color}`}>{fmt(r.totalRevenue)}</p>
              <p className="text-xs text-white/40 mt-1">ARR</p>
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Providers ({r.providerCustomers})</span>
                  <span className="text-white/70 font-mono">{fmt(r.providerRevenue)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Platforms ({r.platformCustomers})</span>
                  <span className="text-white/70 font-mono">{fmt(r.platformRevenue)}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                  <span className="text-white/50">Total customers</span>
                  <span className="text-white font-mono font-semibold">{r.totalCustomers}</span>
                </div>
              </div>
            </div>
          ))}
        </StaggerChildren>

        {/* Detailed revenue table */}
        <AnimatedSection delay={0.2}>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Metric</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 1 (2026)</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 2 (2027)</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 3 (2028)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-5 text-white/70">Provider customers</td>
                    {revenue.map((r) => <td key={r.year} className="py-3 px-5 text-right text-white font-mono">{r.providerCustomers}</td>)}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-5 text-white/70">Avg users per provider</td>
                    {scenario.providers.avgUsersPerCustomer.map((v, i) => <td key={i} className="py-3 px-5 text-right text-white/60 font-mono">{v.toLocaleString()}</td>)}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-5 text-white/70">Provider revenue</td>
                    {revenue.map((r) => <td key={r.year} className="py-3 px-5 text-right text-white font-mono">{fmt(r.providerRevenue)}</td>)}
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-5 text-white/40 text-xs" colSpan={4}></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-5 text-white/70">Platform customers</td>
                    {revenue.map((r) => <td key={r.year} className="py-3 px-5 text-right text-white font-mono">{r.platformCustomers}</td>)}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-5 text-white/70">Avg minors per platform</td>
                    {scenario.platforms.avgMinorsPerCustomer.map((v, i) => <td key={i} className="py-3 px-5 text-right text-white/60 font-mono">{v.toLocaleString()}</td>)}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-5 text-white/70">Platform revenue</td>
                    {revenue.map((r) => <td key={r.year} className="py-3 px-5 text-right text-white font-mono">{fmt(r.platformRevenue)}</td>)}
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-5 text-white/40 text-xs" colSpan={4}></td>
                  </tr>
                  <tr className="bg-white/[0.03]">
                    <td className="py-3 px-5 text-white font-semibold">Total ARR</td>
                    {revenue.map((r) => <td key={r.year} className={`py-3 px-5 text-right font-display text-lg ${scenario.color}`}>{fmt(r.totalRevenue)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Cost Structure ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Cost Structure
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-white mb-8">
            Operating expenses
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Category</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 1</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 2</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 3</th>
                  </tr>
                </thead>
                <tbody>
                  {COST_STRUCTURE[0].categories.map((cat) => (
                    <tr key={cat.label} className="border-b border-white/5">
                      <td className="py-3 px-5 text-white/70">{cat.label}</td>
                      {cat.values.map((v, i) => (
                        <td key={i} className="py-3 px-5 text-right text-white/60 font-mono">{fmtFull(v)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-white/[0.03]">
                    <td className="py-3 px-5 text-white font-semibold">Total OpEx</td>
                    {yearlyTotalCost.map((v, i) => (
                      <td key={i} className="py-3 px-5 text-right text-white font-mono font-semibold">{fmtFull(v)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>

        {/* P&L Summary */}
        <AnimatedSection delay={0.2}>
          <div className="glass-card rounded-xl overflow-hidden mt-6">
            <div className="px-5 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm">P&L Summary ({scenario.label} Scenario)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Line Item</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 1</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 2</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-5 text-white/70">Revenue</td>
                    {revenue.map((r, i) => <td key={i} className="py-3 px-5 text-right text-brand-green font-mono">{fmt(r.totalRevenue)}</td>)}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-5 text-white/70">COGS (est. 20%)</td>
                    {revenue.map((r, i) => <td key={i} className="py-3 px-5 text-right text-white/60 font-mono">({fmt(r.totalRevenue * 0.20)})</td>)}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-5 text-white/70 font-medium">Gross Profit</td>
                    {revenue.map((r, i) => <td key={i} className="py-3 px-5 text-right text-white font-mono">{fmt(r.totalRevenue * 0.80)}</td>)}
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-5 text-white/70">Operating Expenses</td>
                    {yearlyTotalCost.map((v, i) => <td key={i} className="py-3 px-5 text-right text-white/60 font-mono">({fmtFull(v)})</td>)}
                  </tr>
                  <tr className="bg-white/[0.03]">
                    <td className="py-3 px-5 text-white font-semibold">Net Income / (Loss)</td>
                    {revenue.map((r, i) => {
                      const net = (r.totalRevenue * 0.80) - yearlyTotalCost[i]
                      return (
                        <td key={i} className={`py-3 px-5 text-right font-mono font-semibold ${net >= 0 ? "text-brand-green" : "text-red-400"}`}>
                          {net >= 0 ? fmt(net) : `(${fmt(Math.abs(net))})`}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Headcount Plan ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Team
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-white mb-8">
            Headcount plan
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Role</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 1</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 2</th>
                    <th className="text-right py-3 px-5 text-white/30 font-medium text-xs uppercase tracking-wider">Year 3</th>
                  </tr>
                </thead>
                <tbody>
                  {HEADCOUNT.map((h) => (
                    <tr key={h.role} className="border-b border-white/5">
                      <td className="py-3 px-5 text-white/70">{h.role}</td>
                      <td className="py-3 px-5 text-right text-white font-mono">{h.y1}</td>
                      <td className="py-3 px-5 text-right text-white font-mono">{h.y2}</td>
                      <td className="py-3 px-5 text-right text-white font-mono">{h.y3}</td>
                    </tr>
                  ))}
                  <tr className="bg-white/[0.03]">
                    <td className="py-3 px-5 text-white font-semibold">Total</td>
                    <td className="py-3 px-5 text-right text-white font-mono font-semibold">{HEADCOUNT.reduce((s, h) => s + h.y1, 0)}</td>
                    <td className="py-3 px-5 text-right text-white font-mono font-semibold">{HEADCOUNT.reduce((s, h) => s + h.y2, 0)}</td>
                    <td className="py-3 px-5 text-right text-white font-mono font-semibold">{HEADCOUNT.reduce((s, h) => s + h.y3, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Key SaaS Metrics ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Unit Economics
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-white mb-8">
            Key SaaS metrics (moderate scenario)
          </h2>
        </AnimatedSection>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.06}>
          <div className="glass-card rounded-xl p-5">
            <Percent className="w-4 h-4 text-brand-green mb-3" />
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Gross Margin</p>
            <div className="flex items-baseline gap-2">
              {SAAS_METRICS.grossMargin.map((v, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-display text-white">{v}%</p>
                  <p className="text-[10px] text-white/30">Y{i + 1}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <TrendingUp className="w-4 h-4 text-brand-green mb-3" />
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Net Revenue Retention</p>
            <div className="flex items-baseline gap-2">
              {SAAS_METRICS.netRevenueRetention.map((v, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-display text-white">{v ? `${v}%` : "—"}</p>
                  <p className="text-[10px] text-white/30">Y{i + 1}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <Target className="w-4 h-4 text-brand-green mb-3" />
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">LTV:CAC Ratio</p>
            <div className="flex items-baseline gap-2">
              {SAAS_METRICS.ltvCacRatio.map((v, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-display text-white">{v ? `${v}x` : "—"}</p>
                  <p className="text-[10px] text-white/30">Y{i + 1}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <Users className="w-4 h-4 text-brand-green mb-3" />
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Monthly Churn</p>
            <div className="flex items-baseline gap-2">
              {SAAS_METRICS.churnRate.map((v, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-display text-white">{v ? `${v}%` : "—"}</p>
                  <p className="text-[10px] text-white/30">Y{i + 1}</p>
                </div>
              ))}
            </div>
          </div>
        </StaggerChildren>
      </section>

      {/* ── Key Assumptions ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 pb-32">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Assumptions
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-white mb-8">
            Key model assumptions
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-xl p-6">
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider">Revenue Drivers</h3>
                <div className="space-y-3 text-white/50 leading-relaxed">
                  <p><span className="text-white/80 font-medium">FTC COPPA Rule deadline (Apr 2026)</span> — Creates compliance urgency; platforms must adopt solutions or face penalties up to $50K per violation</p>
                  <p><span className="text-white/80 font-medium">Land and expand</span> — Customers start with 1-2 compliance use cases, expand as new laws take effect (modeled at 130-140% NRR)</p>
                  <p><span className="text-white/80 font-medium">Usage compounds</span> — Per-user pricing means revenue grows as customer platforms grow their user base</p>
                  <p><span className="text-white/80 font-medium">Regulatory tailwind</span> — 67+ child safety laws create non-discretionary demand; market growth is mandate-driven, not budget-driven</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider">Cost Assumptions</h3>
                <div className="space-y-3 text-white/50 leading-relaxed">
                  <p><span className="text-white/80 font-medium">80% gross margin</span> — Software-only delivery with no interchange or physical costs; comparable to Plaid (~80%) and superior to Stripe (~45%)</p>
                  <p><span className="text-white/80 font-medium">Eng-heavy early spend</span> — 45% of pre-seed funds to engineering; shifts to 35% by Year 3 as GTM scales</p>
                  <p><span className="text-white/80 font-medium">Developer-led GTM</span> — Low initial CAC via compliance urgency, open-source PCSS spec, and developer community (similar to Plaid/Stripe early motion)</p>
                  <p><span className="text-white/80 font-medium">Path to profitability</span> — Moderate scenario reaches cash-flow positive in Year 3; conservative extends to early Year 4</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="glass-card rounded-xl p-6 mt-6 border border-brand-green/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Comparable Benchmarks</h3>
                <div className="text-sm text-white/50 leading-relaxed space-y-2">
                  <p><span className="text-white/80">Plaid:</span> $2.8M seed → ~$100M ARR in 6 years. Per-connection pricing, 80% gross margins, 130%+ NRR.</p>
                  <p><span className="text-white/80">Twilio:</span> $3.7M Series A → $166M ARR in 5 years. Per-API-call pricing, 50% gross margins, 123% NRR.</p>
                  <p><span className="text-white/80">Phosra advantage:</span> Regulatory mandate creates forcing function absent in Plaid/Twilio&apos;s early days. The FTC&apos;s amended COPPA Rule alone affects every platform with minor users.</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page Export                                                         */
/* ------------------------------------------------------------------ */

export default function FinancialModelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#060D16] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        </div>
      }
    >
      <FinancialModelContent />
    </Suspense>
  )
}
