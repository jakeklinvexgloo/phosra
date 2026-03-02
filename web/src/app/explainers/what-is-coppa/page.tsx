import type { Metadata } from "next"
import Link from "next/link"
import {
  Shield,
  ArrowRight,
  Scale,
  Users,
  FileText,
  Lock,
  Eye,
  Database,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BookOpen,
} from "lucide-react"
import { getLawById } from "@/lib/compliance"

/* ── Static data from registry ─────────────────────────────────── */

const coppa = getLawById("ftc-coppa")!
const coppa2 = getLawById("coppa-2")!

/* ── Metadata ──────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title:
    "What is COPPA? Complete Guide to the Children's Online Privacy Protection Act",
  description:
    "Learn what COPPA requires, who must comply, penalties for violations, and how to ensure your platform is COPPA compliant. Updated for 2026.",
  openGraph: {
    title:
      "What is COPPA? Complete Guide to the Children's Online Privacy Protection Act",
    description:
      "Learn what COPPA requires, who must comply, penalties for violations, and how to ensure your platform is COPPA compliant. Updated for 2026.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is COPPA? Complete Guide | Phosra",
    description:
      "Everything you need to know about the Children's Online Privacy Protection Act — requirements, penalties, and compliance.",
  },
  alternates: {
    canonical: "https://www.phosra.com/explainers/what-is-coppa",
  },
}

/* ── FAQ data ──────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    question: "What age does COPPA protect?",
    answer:
      "COPPA protects children under 13 years of age. Any website, app, or online service that collects personal information from children under 13 must comply with COPPA's requirements, including obtaining verifiable parental consent before collection.",
  },
  {
    question: "Does COPPA apply to my app?",
    answer:
      "COPPA applies if your app or website is directed at children under 13, or if you have actual knowledge that you are collecting personal information from children under 13. This includes apps, games, social media platforms, and any online service. Even general-audience sites must comply if they knowingly collect data from children.",
  },
  {
    question: "What is verifiable parental consent?",
    answer:
      "Verifiable parental consent (VPC) is the mechanism by which operators confirm that a parent or guardian has authorized the collection of their child's personal information. Acceptable methods include signed consent forms, credit card verification, government ID checks, knowledge-based authentication, facial recognition matching, and text-plus verification (added in the 2025 amendments).",
  },
  {
    question: "What are the penalties for COPPA violations?",
    answer:
      "The FTC can impose civil penalties of up to $53,088 per violation under the amended COPPA Rule. Penalties are assessed per violation, per child, per instance. Major enforcement actions have resulted in settlements of $520 million (Epic Games), $170 million (YouTube/Google), and $5.7 million (TikTok).",
  },
  {
    question: "What is a COPPA safe harbor?",
    answer:
      "A COPPA safe harbor is an FTC-approved industry self-regulatory program. Organizations that participate in an approved safe harbor program and comply with its guidelines are deemed to be in compliance with COPPA. The 2025 amendments added new transparency requirements for safe harbor programs, including public reporting and accountability measures.",
  },
  {
    question: "What changed in the 2025 COPPA Rule amendments?",
    answer:
      "The FTC finalized major amendments in January 2025 that add mandatory information security programs, written data retention and deletion policies, enhanced direct notice requirements, expanded personal information definitions (biometrics, government IDs), new consent methods, and separate consent requirements for third-party data sharing. Full compliance is required by April 22, 2026.",
  },
]

/* ── JSON-LD schemas ───────────────────────────────────────────── */

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "What is COPPA? Complete Guide to the Children's Online Privacy Protection Act",
  description:
    "Learn what COPPA requires, who must comply, penalties for violations, and how to ensure your platform is COPPA compliant.",
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

/* ── Requirements data ─────────────────────────────────────────── */

const COPPA_REQUIREMENTS = [
  {
    icon: Users,
    title: "Verifiable Parental Consent",
    description:
      "Operators must obtain verifiable parental consent before collecting, using, or disclosing personal information from children under 13.",
  },
  {
    icon: FileText,
    title: "Clear Privacy Policy",
    description:
      "Post a comprehensive, clearly written privacy policy describing data practices for children, including what is collected and how it is used.",
  },
  {
    icon: Lock,
    title: "Data Security Program",
    description:
      "Maintain a written information security program to protect the confidentiality, security, and integrity of children's personal data.",
  },
  {
    icon: Database,
    title: "Data Retention & Deletion",
    description:
      "Implement written data retention policies with defined limits. Delete children's data when no longer necessary for its collected purpose.",
  },
  {
    icon: Eye,
    title: "Parental Review Rights",
    description:
      "Parents can review all personal information collected from their child, request deletion, and refuse further collection at any time.",
  },
  {
    icon: Scale,
    title: "Data Minimization",
    description:
      "Cannot condition a child's participation in an activity on providing more personal information than is reasonably necessary.",
  },
]

/* ── Page ───────────────────────────────────────────────────────── */

export default function WhatIsCOPPAPage() {
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,212,126,0.08),transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-20 sm:py-28 lg:py-36">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-green/20 bg-brand-green/5 backdrop-blur-sm mb-8">
            <Shield className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-medium text-brand-green/80 uppercase tracking-wide">
              Explainer Guide
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-tight mb-6">
            What is{" "}
            <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
              COPPA?
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-display text-white/80 mb-4">
            The Children&apos;s Online Privacy Protection Act explained
          </p>

          <p className="text-base sm:text-lg text-white/50 max-w-2xl leading-relaxed">
            Everything you need to know about the federal law that protects
            children&apos;s privacy online — from requirements and enforcement to
            the latest 2025 amendments.
          </p>
        </div>
      </section>

      {/* ─── Quick Answer (Featured Snippet) ───────────────────── */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-brand-green" />
              <span className="text-sm font-semibold text-brand-green">
                Quick Answer
              </span>
            </div>
            <p className="text-base sm:text-lg text-foreground leading-relaxed">
              <strong>COPPA</strong> (the Children&apos;s Online Privacy Protection
              Act) is a United States federal law enacted in 1998 that requires
              websites, apps, and online services to obtain verifiable parental
              consent before collecting personal information from children under
              13. Enforced by the Federal Trade Commission (FTC), COPPA imposes
              civil penalties of up to <strong>$53,088 per violation</strong> and
              was significantly updated in 2025 with new requirements for data
              security, retention policies, and third-party data sharing.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Key Facts ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <h2 className="text-2xl sm:text-3xl font-display text-foreground text-center mb-10">
            COPPA at a Glance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Enacted", value: "1998" },
              { label: "Enforced by", value: "FTC" },
              { label: "Age threshold", value: "Under 13" },
              { label: "Status", value: coppa.statusLabel },
              { label: "Penalty", value: "$53,088/violation" },
              { label: "Last amended", value: "2025" },
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

      {/* ─── What Does COPPA Require? ──────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-6">
              <FileText className="w-3.5 h-3.5 text-brand-green" />
              <span className="text-xs font-medium text-muted-foreground">
                Requirements
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              What Does COPPA Require?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              COPPA places specific obligations on operators of websites and
              online services directed at children under 13, or that knowingly
              collect personal information from children.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COPPA_REQUIREMENTS.map((req) => {
              const Icon = req.icon
              return (
                <div
                  key={req.title}
                  className="rounded-xl border border-border bg-card/80 p-6 hover:border-brand-green/30 hover:shadow-[0_0_24px_-8px_rgba(0,212,126,0.15)] transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-green/10 mb-4">
                    <Icon className="w-5 h-5 text-brand-green" />
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
              {coppa.keyProvisions.map((provision, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
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
              Who Must Comply with COPPA?
            </h2>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card/80 p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">
                Operators of Child-Directed Services
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Any commercial website, online service, or mobile app that is
                directed to children under 13 must comply with COPPA. The FTC
                considers factors like subject matter, visual content, use of
                animated characters, child-oriented activities, age of models,
                music, and whether advertising on the site or service is
                directed to children.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">
                General Audience Sites with Actual Knowledge
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                General audience websites and services that do not specifically
                target children must still comply with COPPA if they have{" "}
                <strong>actual knowledge</strong> that they are collecting
                personal information from a child under 13. This includes
                platforms where users can disclose their age during registration.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">
                Third-Party Plug-ins and Ad Networks
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Third-party services such as advertising networks, analytics
                providers, and social media plug-ins that collect personal
                information from users of child-directed sites are also subject
                to COPPA. The 2025 amendments added requirements for written
                confirmation from service providers regarding security measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COPPA 2.0 ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Proposed Legislation
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              COPPA 2.0: What&apos;s Changing?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              {coppa2.summary}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/80 p-6 sm:p-8 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Status: {coppa2.statusLabel}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Key Changes in COPPA 2.0
            </h3>
            <ul className="space-y-3">
              {coppa2.keyProvisions.map((provision, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {provision}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card/80 p-5 text-center">
              <p className="text-2xl font-display text-foreground">Under 13</p>
              <p className="text-xs text-muted-foreground mt-1">
                Current COPPA age threshold
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
              <p className="text-2xl font-display text-foreground">Under 17</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                COPPA 2.0 proposed age threshold
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Penalties ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                Enforcement
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              Penalties for Non-Compliance
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              The FTC actively enforces COPPA, with penalties reaching hundreds
              of millions of dollars in recent years.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {[
              { amount: "$520M", label: "Epic Games (2022)", detail: "Fortnite privacy practices and dark patterns" },
              { amount: "$170M", label: "YouTube / Google (2019)", detail: "Tracking children without parental consent" },
              { amount: "$5.7M", label: "TikTok (2019)", detail: "Collecting data from children under 13" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card/80 p-6 text-center hover:border-red-500/20 transition-all duration-300"
              >
                <p className="text-3xl sm:text-4xl font-display text-foreground mb-2">
                  {stat.amount}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {stat.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-base sm:text-lg text-foreground">
              Under the amended COPPA Rule, the FTC can impose fines of up to{" "}
              <strong className="text-red-600 dark:text-red-400">
                $53,088 per violation, per child, per instance.
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* ─── COPPA Safe Harbor ─────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              COPPA Safe Harbor Programs
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              The FTC allows industry groups to establish self-regulatory
              programs that provide a &quot;safe harbor&quot; for participating
              operators.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card/80 p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">
                How Safe Harbors Work
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Industry self-regulatory organizations can submit their
                guidelines to the FTC for approval. If approved, operators who
                comply with the safe harbor program&apos;s guidelines are deemed
                to be in compliance with COPPA. The FTC currently recognizes
                several approved safe harbor programs, including CARU
                (Children&apos;s Advertising Review Unit), ESRB Privacy Certified,
                kidSAFE Seal, Privo, and TrustArc.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">
                2025 Safe Harbor Updates
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The 2025 COPPA Rule amendments introduce new transparency
                requirements for safe harbor programs. Approved programs must now
                publicly report on their compliance monitoring activities,
                enforcement actions, and member adherence. This is intended to
                increase accountability and ensure that safe harbor designation
                reflects genuine compliance efforts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How Phosra Helps ──────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,212,126,0.08),transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-green/20 bg-brand-green/5 backdrop-blur-sm mb-6">
            <Shield className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-medium text-brand-green/80">
              Phosra Platform
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-white mb-4">
            How Phosra Helps with COPPA Compliance
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Phosra provides a single API to enforce COPPA requirements across
            all connected platforms, from parental consent management to data
            deletion and ad blocking.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left">
            {[
              "Parental consent gate enforcement",
              "Targeted advertising block across platforms",
              "Data deletion request automation",
              "Parental event notifications",
              "Screen time reporting for parents",
              "Commercial data sharing ban",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/compliance/ftc-coppa"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border border-white/20 text-white/80 hover:bg-white/5 transition"
            >
              View Full COPPA Compliance Details
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
              <HelpCircle className="w-3.5 h-3.5 text-brand-green" />
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
              href="/compliance/ftc-coppa"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-brand-green/30 transition"
            >
              COPPA Compliance Details
            </Link>
            <Link
              href="/compliance/coppa-2"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-brand-green/30 transition"
            >
              COPPA 2.0 Details
            </Link>
            <Link
              href="/coppa-deadline"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-brand-green/30 transition"
            >
              COPPA Deadline Countdown
            </Link>
            <Link
              href="/explainers/what-is-kosa"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-brand-green/30 transition"
            >
              What is KOSA?
            </Link>
            <Link
              href="/compliance"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-brand-green/30 transition"
            >
              Full Compliance Hub
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
