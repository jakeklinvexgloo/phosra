import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Globe,
  Scale,
  Shield,
  Users,
} from "lucide-react"
import { LAW_REGISTRY, JURISDICTION_META } from "@/lib/compliance"
import type { Jurisdiction, LawStatus } from "@/lib/compliance"
import { MOVEMENTS_REGISTRY } from "@/lib/movements"
import { PARENTAL_CONTROLS_REGISTRY } from "@/lib/parental-controls"

/* ── Metadata ──────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "State of Child Safety 2026 | Annual Report | Phosra",
  description:
    "Comprehensive analysis of global child safety legislation, community standards, and parental controls. Covering 67+ laws across 25+ jurisdictions.",
  openGraph: {
    title: "State of Child Safety 2026",
    description:
      "Comprehensive analysis of global child safety legislation, community standards, and parental controls. Covering 67+ laws across 25+ jurisdictions.",
    type: "article",
  },
  alternates: {
    canonical: "https://www.phosra.com/reports/state-of-child-safety-2026",
  },
}

/* ── Computed Stats ────────────────────────────────────────────── */

const totalLaws = LAW_REGISTRY.length
const enacted = LAW_REGISTRY.filter((l) => l.status === "enacted").length
const passed = LAW_REGISTRY.filter((l) => l.status === "passed").length
const pending = LAW_REGISTRY.filter((l) => l.status === "pending").length
const proposed = LAW_REGISTRY.filter((l) => l.status === "proposed").length
const injunction = LAW_REGISTRY.filter(
  (l) => l.status === "injunction"
).length

const jurisdictionGroups = (
  Object.keys(JURISDICTION_META) as Jurisdiction[]
).map((group) => {
  const laws = LAW_REGISTRY.filter((l) => l.jurisdictionGroup === group)
  return {
    group,
    label: JURISDICTION_META[group].label,
    total: laws.length,
    enacted: laws.filter((l) => l.status === "enacted").length,
    passed: laws.filter((l) => l.status === "passed").length,
    pending: laws.filter(
      (l) => l.status === "pending" || l.status === "proposed"
    ).length,
  }
})

const uniqueJurisdictions = new Set(LAW_REGISTRY.map((l) => l.jurisdiction))
  .size
const uniqueCountries = new Set(LAW_REGISTRY.map((l) => l.country)).size
const allRuleCategories = new Set(LAW_REGISTRY.flatMap((l) => l.ruleCategories))
const totalCategories = allRuleCategories.size

const totalMovements = MOVEMENTS_REGISTRY.length
const activeMovements = MOVEMENTS_REGISTRY.filter(
  (m) => m.status === "active"
).length
const totalAdoptions = MOVEMENTS_REGISTRY.reduce(
  (sum, m) => sum + m.adoptionCount,
  0
)
const totalSchools = MOVEMENTS_REGISTRY.reduce(
  (sum, m) => sum + m.schoolCount,
  0
)

const totalControls = PARENTAL_CONTROLS_REGISTRY.length
const controlsWithApi = PARENTAL_CONTROLS_REGISTRY.filter(
  (p) => p.apiAvailability === "public_api" || p.apiAvailability === "partner_api"
).length
const parentalApps = PARENTAL_CONTROLS_REGISTRY.filter(
  (p) => p.sourceCategory === "parental_apps"
).length
const builtinControls = PARENTAL_CONTROLS_REGISTRY.filter(
  (p) => p.sourceCategory === "builtin_controls"
).length

// Rule category coverage across parental controls
const categoryCapabilities = new Map<string, number>()
for (const ctrl of PARENTAL_CONTROLS_REGISTRY) {
  for (const cap of ctrl.capabilities) {
    if (cap.support === "full" || cap.support === "partial") {
      categoryCapabilities.set(
        cap.category,
        (categoryCapabilities.get(cap.category) ?? 0) + 1
      )
    }
  }
}
const topCategories = Array.from(categoryCapabilities.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
const bottomCategories = Array.from(categoryCapabilities.entries())
  .sort((a, b) => a[1] - b[1])
  .slice(0, 5)

/* ── Key laws to highlight ─────────────────────────────────────── */

const KEY_LAW_IDS = [
  "kosa",
  "coppa-2",
  "ftc-coppa",
  "eu-dsa",
  "uk-aadc",
  "ca-sb-976",
  "au-osa",
]
const keyLaws = KEY_LAW_IDS.map((id) =>
  LAW_REGISTRY.find((l) => l.id === id)
).filter(Boolean)

/* ── Helpers ───────────────────────────────────────────────────── */

const STATUS_COLORS: Record<LawStatus, string> = {
  enacted: "bg-foreground text-background",
  passed: "bg-foreground/80 text-background",
  pending: "bg-foreground/20 text-foreground",
  proposed: "bg-foreground/10 text-foreground",
  injunction: "bg-foreground/15 text-foreground",
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US")
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function StateOfChildSafety2026() {
  return (
    <div>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Report",
            name: "State of Child Safety 2026",
            author: { "@type": "Organization", name: "Phosra" },
            datePublished: "2026-03-01",
            description:
              "Comprehensive analysis of global child safety legislation, community standards, and parental controls covering 67+ laws across 25+ jurisdictions.",
            about: "child safety legislation and compliance",
          }),
        }}
      />

      {/* ─────────────────────────────────────────────────────────
          HERO
      ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,212,126,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(38,168,201,0.06),transparent_60%)]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-20 sm:py-28 lg:py-36">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-green/30 bg-brand-green/10 backdrop-blur-sm mb-8">
            <BarChart3 className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-bold tracking-wide text-brand-green uppercase">
              Annual Report — March 2026
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-tight max-w-4xl mb-6">
            State of Child Safety{" "}
            <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
              2026
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl leading-relaxed mb-12">
            A comprehensive analysis of global child safety legislation,
            community standards, and parental controls — compiled from
            Phosra&apos;s compliance database.
          </p>

          {/* Key stat highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: totalLaws, label: "Laws tracked" },
              { value: uniqueJurisdictions, label: "Jurisdictions" },
              { value: totalMovements, label: "Community standards" },
              { value: totalControls, label: "Parental controls" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5"
              >
                <p className="text-3xl sm:text-4xl font-display text-white tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-white/40 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          EXECUTIVE SUMMARY
      ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-8">
            <BookOpen className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-medium text-muted-foreground">
              Executive Summary
            </span>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Child safety legislation is accelerating at an unprecedented pace.
              As of March 2026, Phosra tracks{" "}
              <strong className="text-foreground">{totalLaws} laws</strong>{" "}
              across{" "}
              <strong className="text-foreground">
                {uniqueJurisdictions} jurisdictions
              </strong>{" "}
              in{" "}
              <strong className="text-foreground">
                {uniqueCountries} countries
              </strong>
              . Of these, {enacted} have been enacted into law and {passed} have
              passed at least one chamber. Another {pending + proposed} are
              actively pending or proposed.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Simultaneously, community-driven movements are reshaping norms
              around childhood technology use. The{" "}
              <strong className="text-foreground">
                {totalMovements} community standards
              </strong>{" "}
              in our registry represent{" "}
              <strong className="text-foreground">
                {formatNumber(totalAdoptions)} family adoptions
              </strong>{" "}
              and{" "}
              <strong className="text-foreground">
                {formatNumber(totalSchools)} schools
              </strong>
              . Meanwhile, the parental controls ecosystem spans{" "}
              <strong className="text-foreground">
                {totalControls} products
              </strong>{" "}
              covering {totalCategories} rule categories — though coverage
              remains uneven across regulatory requirements.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              This report synthesizes data from Phosra&apos;s compliance
              database to provide a snapshot of the child safety landscape as of
              early 2026 — a resource for policymakers, platforms, and families
              navigating this rapidly evolving space.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          LEGISLATIVE LANDSCAPE
      ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-8">
            <Scale className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-medium text-muted-foreground">
              Legislative Landscape
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-4">
            {totalLaws} Laws Across {uniqueCountries} Countries
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mb-12">
            The global regulatory response to child safety online has reached a
            tipping point. Every major jurisdiction now has enacted or pending
            legislation addressing minors&apos; digital wellbeing.
          </p>

          {/* Status breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-14">
            {(
              [
                { status: "enacted" as const, count: enacted, label: "Enacted" },
                { status: "passed" as const, count: passed, label: "Passed" },
                { status: "pending" as const, count: pending, label: "Pending" },
                {
                  status: "proposed" as const,
                  count: proposed,
                  label: "Proposed",
                },
                {
                  status: "injunction" as const,
                  count: injunction,
                  label: "Injunction",
                },
              ] as const
            ).map((item) => (
              <div
                key={item.status}
                className="rounded-xl border border-border bg-card p-5 text-center"
              >
                <p className="text-3xl font-display text-foreground tabular-nums">
                  {item.count}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span
                    className={`w-2 h-2 rounded-full ${STATUS_COLORS[item.status]}`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Jurisdiction breakdown table */}
          <h3 className="text-lg font-semibold text-foreground mb-4">
            By Jurisdiction
          </h3>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                      Jurisdiction
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      Enacted
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      Passed
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      Pending/Proposed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jurisdictionGroups
                    .filter((j) => j.total > 0)
                    .sort((a, b) => b.total - a.total)
                    .map((j) => (
                      <tr
                        key={j.group}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          {j.label}
                        </td>
                        <td className="text-center px-4 py-3 tabular-nums text-foreground">
                          {j.total}
                        </td>
                        <td className="text-center px-4 py-3 tabular-nums text-muted-foreground">
                          {j.enacted}
                        </td>
                        <td className="text-center px-4 py-3 tabular-nums text-muted-foreground">
                          {j.passed}
                        </td>
                        <td className="text-center px-4 py-3 tabular-nums text-muted-foreground">
                          {j.pending}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td className="px-5 py-3 font-semibold text-foreground">
                      Total
                    </td>
                    <td className="text-center px-4 py-3 font-semibold tabular-nums text-foreground">
                      {totalLaws}
                    </td>
                    <td className="text-center px-4 py-3 font-semibold tabular-nums text-muted-foreground">
                      {enacted}
                    </td>
                    <td className="text-center px-4 py-3 font-semibold tabular-nums text-muted-foreground">
                      {passed}
                    </td>
                    <td className="text-center px-4 py-3 font-semibold tabular-nums text-muted-foreground">
                      {pending + proposed}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          KEY LEGISLATION TO WATCH
      ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-8">
            <Shield className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-medium text-muted-foreground">
              Key Legislation
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-4">
            Legislation to Watch in 2026
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mb-12">
            These laws represent the most impactful regulatory developments for
            platforms operating services accessible to children.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {keyLaws.map((law) => (
              <Link
                key={law!.id}
                href={`/compliance/${law!.id}`}
                className="group rounded-xl border border-border bg-card p-6 hover:border-brand-green/30 hover:shadow-[0_0_24px_-8px_rgba(0,212,126,0.15)] transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-brand-green transition-colors">
                    {law!.shortName}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[law!.status]}`}
                  >
                    {law!.status.charAt(0).toUpperCase() +
                      law!.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {law!.jurisdiction}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {law!.summary}
                </p>
                <div className="flex items-center gap-1 mt-4 text-xs font-medium text-brand-green opacity-0 group-hover:opacity-100 transition-opacity">
                  View details
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/compliance"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-green hover:underline"
            >
              Explore all {totalLaws} laws in the compliance database
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          COMMUNITY STANDARDS
      ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-8">
            <Users className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-medium text-muted-foreground">
              Community Standards
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-4">
            {totalMovements} Community Movements
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mb-12">
            Beyond legislation, grassroots movements and community-driven
            standards are reshaping norms around children&apos;s technology use
            — from phone-free schools to screen time pledges.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { value: totalMovements, label: "Total standards" },
              { value: activeMovements, label: "Active" },
              {
                value: formatNumber(totalAdoptions),
                label: "Family adoptions",
              },
              {
                value: formatNumber(totalSchools),
                label: "Schools participating",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5 text-center"
              >
                <p className="text-2xl sm:text-3xl font-display text-foreground tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Community movements like{" "}
            <Link
              href="/movements/four-norms"
              className="text-brand-green hover:underline"
            >
              Four Norms
            </Link>
            ,{" "}
            <Link
              href="/movements/wait-until-8th"
              className="text-brand-green hover:underline"
            >
              Wait Until 8th
            </Link>
            , and{" "}
            <Link
              href="/movements/1000-hours-outside"
              className="text-brand-green hover:underline"
            >
              1000 Hours Outside
            </Link>{" "}
            are translating advocacy into enforceable digital rules that families
            can adopt through Phosra.
          </p>

          <div className="mt-6">
            <Link
              href="/movements"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-green hover:underline"
            >
              Explore all community standards
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          PARENTAL CONTROLS ECOSYSTEM
      ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-8">
            <Shield className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-medium text-muted-foreground">
              Parental Controls
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-4">
            {totalControls} Parental Control Products
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mb-12">
            The parental controls market spans dedicated apps, built-in platform
            tools, ISP-level solutions, and institutional products — with
            significant variation in capability coverage.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {[
              { value: parentalApps, label: "Dedicated apps" },
              { value: builtinControls, label: "Built-in controls" },
              { value: controlsWithApi, label: "API-accessible" },
              { value: totalCategories, label: "Rule categories" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5 text-center"
              >
                <p className="text-2xl sm:text-3xl font-display text-foreground tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/parental-controls"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-green hover:underline"
            >
              Explore all parental controls
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          RULE CATEGORY COVERAGE
      ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-8">
            <BarChart3 className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-medium text-muted-foreground">
              Coverage Analysis
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground mb-4">
            Rule Category Coverage
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mb-12">
            How well do existing parental control products cover the{" "}
            {totalCategories} rule categories defined across legislation and
            community standards?
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Most covered */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Most Covered Categories
              </h3>
              <div className="space-y-3">
                {topCategories.map(([category, count]) => {
                  const pct = Math.round((count / totalControls) * 100)
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {category}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {count}/{totalControls} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-green"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Least covered */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Least Covered Categories
              </h3>
              <div className="space-y-3">
                {bottomCategories.map(([category, count]) => {
                  const pct = Math.round((count / totalControls) * 100)
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {category}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {count}/{totalControls} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-foreground/30"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                These gaps represent opportunities for new tooling and
                regulatory guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          METHODOLOGY
      ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-8">
            <Globe className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-medium text-muted-foreground">
              Methodology
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-6">
            About This Report
          </h2>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              All data in this report is computed directly from Phosra&apos;s
              compliance database — the same dataset that powers the{" "}
              <Link
                href="/compliance"
                className="text-brand-green hover:underline"
              >
                Compliance Hub
              </Link>
              ,{" "}
              <Link
                href="/movements"
                className="text-brand-green hover:underline"
              >
                Community Standards
              </Link>
              , and{" "}
              <Link
                href="/parental-controls"
                className="text-brand-green hover:underline"
              >
                Parental Controls
              </Link>{" "}
              sections of the platform.
            </p>
            <p>
              The legislative database is maintained through a combination of
              automated monitoring (weekly scans using AI-powered bill tracking)
              and manual review by the Phosra compliance team. Laws are
              classified by jurisdiction, status, and the rule categories they
              address.
            </p>
            <p>
              Community standards are sourced from publicly available movement
              guidelines and pledges. Parental control capabilities are
              documented through product research and API testing. Coverage
              ratings (full, partial, none) reflect each product&apos;s ability
              to enforce specific rule categories.
            </p>
            <p>
              This report is published as of March 1, 2026. Data reflects the
              most recent updates to the Phosra compliance database.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          CTA
      ───────────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,126,0.08),transparent_60%)]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight mb-6">
            Navigate Child Safety{" "}
            <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
              Compliance
            </span>
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
            Explore the full compliance database, track legislation that impacts
            your platform, and get started with Phosra.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/compliance"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border border-white/20 text-white/80 hover:bg-white/5 transition"
            >
              Explore Compliance Database
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-brand-green text-foreground px-6 py-3 rounded-full font-medium hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)] transition"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
