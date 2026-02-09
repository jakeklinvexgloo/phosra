"use client"

import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { AnimatedSection } from "@/components/marketing/shared"
import { ComplianceHero } from "@/components/marketing/compliance-page/ComplianceHero"
import { ComplianceChecklist } from "@/components/marketing/compliance-page/ComplianceChecklist"
import { PhosraFeatureCard } from "@/components/marketing/compliance-page/PhosraFeatureCard"
import { COMPLIANCE_PAGES } from "@/lib/compliance-pages"

const page = COMPLIANCE_PAGES.kosa

export default function KosaPage() {
  return (
    <div>
      {/* Hero */}
      <ComplianceHero {...page.hero} />

      {/* What KOSA Requires */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="mb-10">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
              What KOSA Requires
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Key provisions of the Kids Online Safety Act
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

      {/* How Phosra Helps */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="mb-10">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
                How Phosra Helps
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                KOSA provisions mapped to Phosra features
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl">
                Each KOSA requirement is addressed by a specific Phosra capability.
                Integrate once, and your platform is covered.
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
        </div>
      </section>

      {/* Compliance Checklist */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="mb-10">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
              Coverage Assessment
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              KOSA compliance checklist
            </h2>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="max-w-3xl">
            <ComplianceChecklist items={page.checklist} />
          </div>
        </AnimatedSection>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-display text-white mb-4">
              Start building KOSA-compliant features today
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Phosra handles the complexity of multi-platform compliance so you
              can focus on building great products for families.
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
