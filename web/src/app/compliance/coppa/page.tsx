"use client"

import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { AnimatedSection } from "@/components/marketing/shared"
import { ComplianceHero } from "@/components/marketing/compliance-page/ComplianceHero"
import { ComplianceChecklist } from "@/components/marketing/compliance-page/ComplianceChecklist"
import { PhosraFeatureCard } from "@/components/marketing/compliance-page/PhosraFeatureCard"
import { COMPLIANCE_PAGES } from "@/lib/compliance-pages"

const page = COMPLIANCE_PAGES.coppa

export default function CoppaPage() {
  return (
    <div>
      {/* Hero */}
      <ComplianceHero {...page.hero} />

      {/* What COPPA 2.0 Requires */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="mb-10">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
              What COPPA 2.0 Requires
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Key provisions of COPPA 2.0
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

      {/* Original COPPA vs COPPA 2.0 Comparison */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="mb-10">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
                What Changed
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                Original COPPA vs COPPA 2.0
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-6 font-semibold text-foreground">
                      Provision
                    </th>
                    <th className="text-left py-3 pr-6 font-semibold text-foreground">
                      Original COPPA (1998)
                    </th>
                    <th className="text-left py-3 font-semibold text-foreground">
                      COPPA 2.0
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">Age coverage</td>
                    <td className="py-3 pr-6 text-muted-foreground">Under 13</td>
                    <td className="py-3 text-foreground font-medium">Under 17</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">Targeted ads</td>
                    <td className="py-3 pr-6 text-muted-foreground">Consent required</td>
                    <td className="py-3 text-foreground font-medium">Banned entirely</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">Data deletion</td>
                    <td className="py-3 pr-6 text-muted-foreground">On parent request</td>
                    <td className="py-3 text-foreground font-medium">Eraser button required</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">Data minimization</td>
                    <td className="py-3 pr-6 text-muted-foreground">Not specified</td>
                    <td className="py-3 text-foreground font-medium">Mandatory</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">Enforcement</td>
                    <td className="py-3 pr-6 text-muted-foreground">FTC general authority</td>
                    <td className="py-3 text-foreground font-medium">Dedicated FTC division</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">Penalties</td>
                    <td className="py-3 pr-6 text-muted-foreground">Up to $50k per violation</td>
                    <td className="py-3 text-foreground font-medium">Substantially increased</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AnimatedSection>
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
              COPPA 2.0 provisions mapped to Phosra features
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Phosra extends COPPA compliance from under-13 to under-17
              automatically, with purpose-built rule categories for every major
              provision.
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
                COPPA 2.0 compliance checklist
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
              Stay ahead of COPPA 2.0 requirements
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Build compliant children&apos;s privacy features with Phosra&apos;s
              purpose-built API. From data minimization to the eraser button —
              we handle it all.
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
