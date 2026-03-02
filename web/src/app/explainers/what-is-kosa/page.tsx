import type { Metadata } from "next"
import Link from "next/link"
import {
  Shield,
  ArrowRight,
  Scale,
  FileText,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Activity,
  Zap,
} from "lucide-react"
import { getLawById } from "@/lib/compliance"

/* ── Static data from registry ─────────────────────────────────── */

const kosa = getLawById("kosa")!

/* ── Metadata ──────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title:
    "What is KOSA? Complete Guide to the Kids Online Safety Act",
  description:
    "Learn what KOSA requires, its duty of care for platforms, how it differs from COPPA, and its current legislative status. Updated for 2026.",
  openGraph: {
    title:
      "What is KOSA? Complete Guide to the Kids Online Safety Act",
    description:
      "Learn what KOSA requires, its duty of care for platforms, how it differs from COPPA, and its current legislative status. Updated for 2026.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is KOSA? Complete Guide | Phosra",
    description:
      "Everything you need to know about the Kids Online Safety Act — duty of care, platform requirements, and compliance.",
  },
}

/* ── FAQ data ──────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    question: "What is the Kids Online Safety Act?",
    answer:
      "The Kids Online Safety Act (KOSA) is a proposed U.S. federal law that would establish a duty of care for online platforms to protect minors from harm. It requires platforms to enable the strongest privacy settings by default for minors, allow them to opt out of algorithmic recommendations, and disable addictive design features like autoplay, infinite scroll, and notification streaks.",
  },
  {
    question: "Has KOSA been signed into law?",
    answer:
      "As of early 2026, KOSA has not been signed into law. The bill passed the U.S. Senate with overwhelming bipartisan support (91-3) in July 2024 as part of KOSMA (combined with COPPA 2.0), but the House of Representatives did not vote on it before the 118th Congress ended in January 2025. Supporters are working to reintroduce the bill in the 119th Congress.",
  },
  {
    question: "What age does KOSA protect?",
    answer:
      "KOSA is designed to protect all minors, generally defined as individuals under 17. Unlike COPPA, which focuses on children under 13, KOSA takes a broader approach to cover teenagers who are active on social media and other online platforms.",
  },
  {
    question: "How is KOSA different from COPPA?",
    answer:
      "COPPA focuses on data privacy and requires parental consent before collecting personal information from children under 13. KOSA takes a different approach by establishing a duty of care for platforms, requiring them to proactively prevent harms to all minors (under 17) — including mental health harms, bullying, and addictive design. COPPA regulates data collection; KOSA regulates platform design and safety.",
  },
  {
    question: "What platforms does KOSA apply to?",
    answer:
      "KOSA would apply to commercial online platforms that are 'likely to be accessed by minors.' This includes social media platforms, video streaming services, gaming platforms, and other interactive online services. It covers major platforms like YouTube, TikTok, Instagram, Snapchat, and many others used by young people.",
  },
]

/* ── JSON-LD schemas ───────────────────────────────────────────── */

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "What is KOSA? Complete Guide to the Kids Online Safety Act",
  description:
    "Learn what KOSA requires, its duty of care for platforms, how it differs from COPPA, and its current legislative status.",
  author: { "@type": "Organization", name: "Phosra" },
  publisher: {
    "@type": "Organization",
    name: "Phosra",
    url: "https://www.phosra.com",
  },
  datePublished: "2026-01-15",
  dateModified: "2026-03-01",
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
}

/* ── KOSA Requirements data ────────────────────────────────────── */

const KOSA_REQUIREMENTS = [
  {
    icon: Shield,
    title: "Duty of Care",
    description:
      "Platforms must exercise reasonable care to prevent and mitigate harms to minors, including mental health harms, bullying, exploitation, and substance abuse promotion.",
  },
  {
    icon: Lock,
    title: "Strongest Default Settings",
    description:
      "All privacy and safety settings for minor users must default to the most restrictive options. Platforms cannot require minors to opt out of data collection or personalization.",
  },
  {
    icon: Activity,
    title: "Opt-Out of Algorithmic Feeds",
    description:
      "Minors must be able to opt out of personalized algorithmic recommendations. Chronological or non-personalized feeds must be the default experience.",
  },
  {
    icon: Zap,
    title: "Disable Addictive Features",
    description:
      "Platforms must disable features that drive compulsive usage: infinite scroll, autoplay, push notification streaks, and variable-reward engagement patterns.",
  },
  {
    icon: Eye,
    title: "Annual Independent Audits",
    description:
      "Covered platforms must conduct annual independent audits assessing compliance with duty-of-care obligations and make audit summaries publicly available.",
  },
  {
    icon: Scale,
    title: "FTC Enforcement",
    description:
      "The FTC would have authority to enforce KOSA provisions with civil penalties up to $50,000 per violation. State attorneys general may also bring enforcement actions.",
  },
]

/* ── Comparison data ───────────────────────────────────────────── */

const COMPARISON_ROWS = [
  { aspect: "Primary focus", coppa: "Data privacy and collection", kosa: "Platform safety and design" },
  { aspect: "Age threshold", coppa: "Under 13", kosa: "Under 17 (all minors)" },
  { aspect: "Core mechanism", coppa: "Parental consent for data collection", kosa: "Duty of care for platforms" },
  { aspect: "Status", coppa: "Enacted (1998, amended 2025)", kosa: "Passed Senate (Jul 2024)" },
  { aspect: "Enforced by", coppa: "FTC", kosa: "FTC + State AGs" },
  { aspect: "Scope", coppa: "Child-directed sites + sites with knowledge of child users", kosa: "All platforms likely accessed by minors" },
]

/* ── Page ───────────────────────────────────────────────────────── */

export default function WhatIsKOSAPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(38,168,201,0.08),transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-20 sm:py-28 lg:py-36">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-teal/20 bg-accent-teal/5 backdrop-blur-sm mb-8">
            <Shield className="w-3.5 h-3.5 text-accent-teal" />
            <span className="text-xs font-medium text-accent-teal/80 uppercase tracking-wide">
              Explainer Guide
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-tight mb-6">
            What is{" "}
            <span className="bg-gradient-to-r from-accent-teal to-brand-green bg-clip-text text-transparent">
              KOSA?
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-display text-white/80 mb-4">
            The Kids Online Safety Act explained
          </p>

          <p className="text-base sm:text-lg text-white/50 max-w-2xl leading-relaxed">
            A comprehensive guide to the landmark legislation that would require
            platforms to protect minors from online harms through a duty of care,
            default safety settings, and algorithmic controls.
          </p>
        </div>
      </section>

      {/* ─── Quick Answer (Featured Snippet) ───────────────────── */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="rounded-xl border border-accent-teal/20 bg-accent-teal/5 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-accent-teal" />
              <span className="text-sm font-semibold text-accent-teal">
                Quick Answer
              </span>
            </div>
            <p className="text-base sm:text-lg text-foreground leading-relaxed">
              <strong>KOSA</strong> (the Kids Online Safety Act) is a proposed
              U.S. federal law that would establish a{" "}
              <strong>duty of care</strong> for online platforms, requiring them
              to protect minors from harmful content and addictive design
              features. Passed by the Senate 91-3 in July 2024, KOSA would
              require platforms to enable the strongest safety settings by
              default for users under 17 and allow minors to opt out of
              algorithmic recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Key Facts ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <h2 className="text-2xl sm:text-3xl font-display text-foreground text-center mb-10">
            KOSA at a Glance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Introduced", value: "2023" },
              { label: "Status", value: "Passed Senate" },
              { label: "Senate vote", value: "91-3" },
              { label: "Age threshold", value: "Under 17" },
              { label: "Penalty", value: "$50,000/violation" },
              { label: "Sponsors", value: "Bipartisan" },
            ].map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-border bg-card/80 p-4 text-center"
              >
                <p className="text-lg sm:text-xl font-display text-foreground">
                  {fact.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fact.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What Does KOSA Require? ───────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-6">
              <FileText className="w-3.5 h-3.5 text-accent-teal" />
              <span className="text-xs font-medium text-muted-foreground">
                Requirements
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              What Does KOSA Require?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              KOSA takes a comprehensive approach to online safety by addressing
              both platform design and content practices that affect minors.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {KOSA_REQUIREMENTS.map((req) => {
              const Icon = req.icon
              return (
                <div
                  key={req.title}
                  className="rounded-xl border border-border bg-card/80 p-6 hover:border-accent-teal/30 hover:shadow-[0_0_24px_-8px_rgba(38,168,201,0.15)] transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-teal/10 mb-4">
                    <Icon className="w-5 h-5 text-accent-teal" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    {req.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {req.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Additional key provisions from registry */}
          <div className="mt-12 rounded-xl border border-border bg-card/80 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Full List of Key Provisions
            </h3>
            <ul className="space-y-3">
              {kosa.keyProvisions.map((provision, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-accent-teal flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {provision}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Who Must Comply? ──────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              Who Must Comply with KOSA?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              KOSA applies broadly to commercial platforms that are
              &quot;likely to be accessed by minors.&quot;
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card/80 p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">
                Social Media Platforms
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Major social media platforms like Instagram, TikTok, Snapchat,
                and YouTube would be subject to KOSA&apos;s duty of care
                requirements. These platforms would need to enable the strongest
                safety settings by default and disable addictive features for
                minor users.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">
                Video Streaming Services
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Streaming platforms including Netflix, YouTube, and other video
                services would need to disable autoplay, limit algorithmic
                recommendations, and provide parental tools for minor accounts.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">
                Gaming and Interactive Platforms
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Online gaming platforms, virtual worlds, and interactive
                services frequented by minors would be covered. This includes
                in-game communication features, notification systems, and
                engagement mechanics designed to drive usage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KOSA vs COPPA ─────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-6">
              <Scale className="w-3.5 h-3.5 text-brand-green" />
              <span className="text-xs font-medium text-muted-foreground">
                Comparison
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              KOSA vs COPPA: What&apos;s the Difference?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              While both laws aim to protect children online, they take
              fundamentally different approaches.
            </p>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
              <div className="p-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Aspect
                </span>
              </div>
              <div className="p-4 border-l border-border">
                <span className="text-xs font-semibold text-brand-green uppercase tracking-wide">
                  COPPA
                </span>
              </div>
              <div className="p-4 border-l border-border">
                <span className="text-xs font-semibold text-accent-teal uppercase tracking-wide">
                  KOSA
                </span>
              </div>
            </div>

            {/* Table rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.aspect}
                className={`grid grid-cols-3 ${i < COMPARISON_ROWS.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="p-4">
                  <span className="text-sm font-medium text-foreground">
                    {row.aspect}
                  </span>
                </div>
                <div className="p-4 border-l border-border">
                  <span className="text-sm text-muted-foreground">
                    {row.coppa}
                  </span>
                </div>
                <div className="p-4 border-l border-border">
                  <span className="text-sm text-muted-foreground">
                    {row.kosa}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Current Status ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Legislative Status
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              Current Status of KOSA
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                date: "2023",
                event: "KOSA introduced in the 118th Congress",
                detail:
                  "Introduced as S. 1409 by Senators Blumenthal (D-CT) and Blackburn (R-TN) with broad bipartisan support.",
              },
              {
                date: "Jul 2024",
                event: "Passed the Senate 91-3",
                detail:
                  "KOSA was combined with COPPA 2.0 into the Kids Online Safety and Privacy Act (KOSMA) and passed the Senate with overwhelming bipartisan support.",
              },
              {
                date: "Jan 2025",
                event: "118th Congress expired without House vote",
                detail:
                  "Despite Senate passage, the House of Representatives did not vote on KOSMA before the 118th Congress adjourned, and the bill expired.",
              },
              {
                date: "2025+",
                event: "Expected reintroduction in the 119th Congress",
                detail:
                  "Supporters of KOSA have indicated plans to reintroduce the legislation. Given the strong Senate support, the bill is expected to be a priority in the new Congress.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-xl border border-border bg-card/80 p-5"
              >
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="text-sm font-semibold text-accent-teal">
                    {item.date}
                  </span>
                </div>
                <div className="flex-1 border-l border-border pl-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {item.event}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How Phosra Helps ──────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(38,168,201,0.08),transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-teal/20 bg-accent-teal/5 backdrop-blur-sm mb-6">
            <Shield className="w-3.5 h-3.5 text-accent-teal" />
            <span className="text-xs font-medium text-accent-teal/80">
              Phosra Platform
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-white mb-4">
            How Phosra Helps with KOSA Compliance
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Even before KOSA becomes law, Phosra lets you enforce its core
            safety requirements across platforms through a single API — so
            you&apos;re ready when it passes.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left">
            {[
              "Algorithmic feed control (disable personalized feeds)",
              "Addictive design control (autoplay, streaks, infinite scroll)",
              "Targeted ad blocking across all platforms",
              "Algorithmic audit compliance tracking",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]"
              >
                <CheckCircle2 className="w-4 h-4 text-accent-teal flex-shrink-0" />
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/compliance/kosa"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border border-white/20 text-white/80 hover:bg-white/5 transition"
            >
              View Full KOSA Compliance Details
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

      {/* ─── FAQ ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-6">
              <HelpCircle className="w-3.5 h-3.5 text-accent-teal" />
              <span className="text-xs font-medium text-muted-foreground">
                FAQ
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card/80 p-6"
              >
                <h3 className="text-base font-semibold text-foreground mb-3">
                  {item.question}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Related Resources ─────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-display text-foreground mb-8">
            Related Resources
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/compliance/kosa"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-accent-teal/30 transition"
            >
              KOSA Compliance Details
            </Link>
            <Link
              href="/explainers/what-is-coppa"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-accent-teal/30 transition"
            >
              What is COPPA?
            </Link>
            <Link
              href="/compliance/coppa-2"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-accent-teal/30 transition"
            >
              COPPA 2.0 Details
            </Link>
            <Link
              href="/compliance"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-accent-teal/30 transition"
            >
              Full Compliance Hub
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
