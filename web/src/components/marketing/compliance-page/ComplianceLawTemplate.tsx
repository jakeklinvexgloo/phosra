"use client"

import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { AnimatedSection } from "@/components/marketing/shared"
import { ComplianceHero } from "@/components/marketing/compliance-page/ComplianceHero"
import { ComplianceChecklist } from "@/components/marketing/compliance-page/ComplianceChecklist"
import { PhosraFeatureCard } from "@/components/marketing/compliance-page/PhosraFeatureCard"
import { StandardLawPage } from "@/components/marketing/compliance-page/StandardLawPage"
import type { LawEntry } from "@/lib/compliance/types"
import { getLawById } from "@/lib/compliance"

function mapStageColor(
  status: LawEntry["status"]
): "enacted" | "passed" | "pending" {
  if (status === "enacted") return "enacted"
  if (status === "passed") return "passed"
  return "pending"
}

function getRelatedLaws(law: LawEntry) {
  return law.relatedLawIds
    .map((id) => {
      const related = getLawById(id)
      if (!related) return null
      return {
        id: related.id,
        name: related.shortName,
        href: `/compliance/${related.id}`,
      }
    })
    .filter(
      (l): l is { id: string; name: string; href: string } => l != null
    )
}

interface ComplianceLawTemplateProps {
  law: LawEntry
}

export function ComplianceLawTemplate({ law }: ComplianceLawTemplateProps) {
  const stageColor = mapStageColor(law.status)
  const relatedLaws = getRelatedLaws(law)

  // Mode B: Standard template for laws without detailed page data
  if (!law.detailedPage) {
    return (
      <StandardLawPage
        law={law}
        stageColor={stageColor}
        relatedLaws={relatedLaws}
      />
    )
  }

  // Mode A: Full detail template
  const { provisions, phosraFeatures, checklist, customSections } =
    law.detailedPage

  return (
    <div>
      {/* Hero */}
      <ComplianceHero
        lawName={law.fullName}
        shortName={law.shortName}
        jurisdiction={law.jurisdiction}
        stage={law.statusLabel}
        stageColor={stageColor}
        description={law.summary}
      />

      {/* What [Law] Requires — Provisions Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="mb-10">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
              What {law.shortName} Requires
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Key provisions of {law.fullName}
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 gap-6">
          {provisions.map((provision, i) => (
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

      {/* Custom Sections (e.g., COPPA comparison table, DSA GDPR cards) */}
      {customSections?.map((section) => (
        <CustomSection key={section.id} section={section} law={law} />
      ))}

      {/* How Phosra Helps — Feature Cards */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="mb-10">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
                How Phosra Helps
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                {law.shortName} provisions mapped to Phosra features
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl">
                Each {law.shortName} requirement is addressed by a specific
                Phosra capability. Integrate once, and your platform is covered.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6">
            {phosraFeatures.map((feature, i) => (
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
              {law.shortName} compliance checklist
            </h2>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="max-w-3xl">
            <ComplianceChecklist items={checklist} />
          </div>
        </AnimatedSection>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-display text-white mb-4">
              Start building {law.shortName}-compliant features today
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
      {relatedLaws.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <AnimatedSection>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Related Legislation
            </h3>
            <div className="flex flex-wrap gap-3">
              {relatedLaws.map((related) => (
                <Link
                  key={related.id}
                  href={related.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:border-brand-green/30 transition-colors"
                >
                  {related.name}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </section>
      )}
    </div>
  )
}

// ── Custom section renderer ─────────────────────────────────────

import { Shield } from "lucide-react"

function CustomSection({
  section,
  law,
}: {
  section: { id: string; title: string; content: string }
  law: LawEntry
}) {
  // COPPA comparison table
  if (section.content === "comparison-table") {
    return (
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="mb-10">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
                What Changed
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                {section.title}
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
                    <td className="py-3 pr-6 text-muted-foreground">
                      Age coverage
                    </td>
                    <td className="py-3 pr-6 text-muted-foreground">
                      Under 13
                    </td>
                    <td className="py-3 text-foreground font-medium">
                      Under 17
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">
                      Targeted ads
                    </td>
                    <td className="py-3 pr-6 text-muted-foreground">
                      Consent required
                    </td>
                    <td className="py-3 text-foreground font-medium">
                      Banned entirely
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">
                      Data deletion
                    </td>
                    <td className="py-3 pr-6 text-muted-foreground">
                      On parent request
                    </td>
                    <td className="py-3 text-foreground font-medium">
                      Eraser button required
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">
                      Data minimization
                    </td>
                    <td className="py-3 pr-6 text-muted-foreground">
                      Not specified
                    </td>
                    <td className="py-3 text-foreground font-medium">
                      Mandatory
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">
                      Enforcement
                    </td>
                    <td className="py-3 pr-6 text-muted-foreground">
                      FTC general authority
                    </td>
                    <td className="py-3 text-foreground font-medium">
                      Dedicated FTC division
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-muted-foreground">
                      Penalties
                    </td>
                    <td className="py-3 pr-6 text-muted-foreground">
                      Up to $50k per violation
                    </td>
                    <td className="py-3 text-foreground font-medium">
                      Substantially increased
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>
    )
  }

  // DSA + GDPR intersection cards
  if (section.content === "gdpr-dsa-cards") {
    const cards = [
      {
        title: "GDPR Foundation",
        description:
          "The GDPR establishes the baseline for data protection in the EU, including lawful basis for processing, data subject rights, and mandatory Data Protection Impact Assessments. All platforms operating in the EU must comply with GDPR regardless of DSA obligations.",
      },
      {
        title: "DSA Layered On Top",
        description:
          "The DSA adds platform-specific obligations on top of GDPR, including the ban on ad profiling for minors, transparency reporting, risk assessments, and algorithmic accountability. Phosra\u2019s enforcement engine addresses both layers simultaneously through its unified policy framework.",
      },
      {
        title: "Data Processing",
        description:
          "Phosra operates as a data processor under GDPR Article 28. All child data is encrypted with AES-256-GCM at rest and TLS 1.3 in transit. Standard Contractual Clauses govern international transfers, and data minimization is enforced at the schema level.",
      },
      {
        title: "Unified Compliance",
        description:
          "A single Phosra policy definition satisfies both DSA platform-safety requirements and GDPR data-protection obligations. Rule categories like targeted_ad_block and algo_feed_control map directly to provisions in both regulations.",
      },
    ]

    return (
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="mb-10">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
                Regulatory Landscape
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                {section.title}
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6">
            {cards.map((card, i) => (
              <AnimatedSection key={card.title} delay={(i + 1) * 0.08}>
                <div className="plaid-card h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-brand-green" />
                    <h3 className="font-semibold text-foreground">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Generic fallback for future custom sections
  return null
}
