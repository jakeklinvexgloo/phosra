"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Shield } from "lucide-react"
import { AnimatedSection } from "@/components/marketing/shared"
import { ComplianceHero } from "@/components/marketing/compliance-page/ComplianceHero"
import { ComplianceChecklist } from "@/components/marketing/compliance-page/ComplianceChecklist"
import { PhosraFeatureCard } from "@/components/marketing/compliance-page/PhosraFeatureCard"
import { COMPLIANCE_PAGES } from "@/lib/compliance-pages"

const page = COMPLIANCE_PAGES.dsa

export default function DsaPage() {
  return (
    <div>
      {/* Hero */}
      <ComplianceHero {...page.hero} />

      {/* What the DSA Requires */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="mb-10">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
              What the DSA Requires
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Key provisions of the EU Digital Services Act
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 gap-6">
          {page.provisions.map((provision, i) => (
            <AnimatedSection key={provision.title} delay={i * 0.08}>
              <div className="plaid-card h-full">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <h3 className="font-semibold text-foreground text-sm">
                    {provision.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {provision.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* GDPR Intersection */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="mb-10">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
                Regulatory Landscape
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                DSA and GDPR: how they work together
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6">
            <AnimatedSection delay={0.08}>
              <div className="plaid-card h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-brand-green" />
                  <h3 className="font-semibold text-foreground">GDPR Foundation</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The GDPR establishes the baseline for data protection in the EU,
                  including lawful basis for processing, data subject rights, and
                  mandatory Data Protection Impact Assessments. All platforms
                  operating in the EU must comply with GDPR regardless of DSA
                  obligations.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.16}>
              <div className="plaid-card h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-brand-green" />
                  <h3 className="font-semibold text-foreground">DSA Layered On Top</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The DSA adds platform-specific obligations on top of GDPR,
                  including the ban on ad profiling for minors, transparency
                  reporting, risk assessments, and algorithmic accountability.
                  Phosra&apos;s enforcement engine addresses both layers
                  simultaneously through its unified policy framework.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.24}>
              <div className="plaid-card h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-brand-green" />
                  <h3 className="font-semibold text-foreground">Data Processing</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Phosra operates as a data processor under GDPR Article 28. All
                  child data is encrypted with AES-256-GCM at rest and TLS 1.3 in
                  transit. Standard Contractual Clauses govern international
                  transfers, and data minimization is enforced at the schema level.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.32}>
              <div className="plaid-card h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-brand-green" />
                  <h3 className="font-semibold text-foreground">Unified Compliance</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A single Phosra policy definition satisfies both DSA
                  platform-safety requirements and GDPR data-protection
                  obligations. Rule categories like targeted_ad_block and
                  algo_feed_control map directly to provisions in both regulations.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How Phosra Helps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="mb-10">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
              How Phosra Helps
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              DSA provisions mapped to Phosra features
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Phosra&apos;s enforcement engine addresses the DSA&apos;s strictest
              requirements for protecting minors on very large online platforms.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 gap-6">
          {page.phosraFeatures.map((feature, i) => (
            <AnimatedSection key={feature.regulation} delay={i * 0.08}>
              <PhosraFeatureCard {...feature} />
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Compliance Checklist */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="mb-10">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
                Coverage Assessment
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                EU DSA compliance checklist
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="max-w-3xl">
              <ComplianceChecklist items={page.checklist} />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-display text-white mb-4">
              Achieve DSA compliance across the EU
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              From ad profiling bans to algorithmic transparency — Phosra
              enforces DSA requirements across every connected platform with a
              single integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-brand-green text-foreground px-6 py-3 rounded-full font-medium hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)] transition"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full font-medium hover:bg-white/5 transition"
              >
                Read the Docs
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Related Laws */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <AnimatedSection>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Related Legislation
          </h3>
          <div className="flex flex-wrap gap-3">
            {page.relatedLaws.map((law) => (
              <Link
                key={law.id}
                href={law.href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:border-brand-green/30 transition-colors"
              >
                {law.name}
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
