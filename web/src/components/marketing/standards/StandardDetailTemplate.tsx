"use client"

import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Users,
  School,
  Check,
  Clock,
  ExternalLink,
  Code2,
} from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst, StandardIcon } from "@/components/marketing/shared"
import { PhosraFeatureCard } from "@/components/marketing/compliance-page/PhosraFeatureCard"
import { STATUS_META } from "@/lib/standards/types"
import { generateFullStandardSnippet, generateRuleSnippet, getCategoryFeature } from "@/lib/standards/snippet-generator"
import type { StandardEntry } from "@/lib/standards"

export function StandardDetailTemplate({ standard }: { standard: StandardEntry }) {
  const statusMeta = STATUS_META[standard.status]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0">
          <WaveTexture />
        </div>
        <div className="absolute -bottom-20 -right-20">
          <PhosraBurst size={400} color="#ffffff" opacity={0.03} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-24 pb-16 sm:pb-24">
          <AnimatedSection>
            {/* Back link */}
            <Link
              href="/standards"
              className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              All Standards
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${standard.accentColor}20` }}
              >
                <StandardIcon standard={standard} size="xl" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl sm:text-4xl font-display text-white">
                    {standard.name}
                  </h1>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusMeta.bgColor} ${statusMeta.textColor}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <p className="text-sm text-white/50">
                    by{" "}
                    {standard.organizationUrl ? (
                      <a
                        href={standard.organizationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-white inline-flex items-center gap-1 transition-colors"
                      >
                        {standard.organization}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-white/70">{standard.organization}</span>
                    )}
                  </p>
                </div>

                <p className="text-base text-white/60 leading-relaxed max-w-2xl">
                  {standard.description}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-6 mt-6">
                  {standard.adoptionCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <Users className="w-4 h-4 text-brand-green" />
                      <span className="text-white font-semibold">
                        {standard.adoptionCount.toLocaleString()}
                      </span>{" "}
                      families
                    </div>
                  )}
                  {standard.schoolCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <School className="w-4 h-4 text-brand-green" />
                      <span className="text-white font-semibold">{standard.schoolCount}</span>{" "}
                      schools
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Shield className="w-4 h-4 text-brand-green" />
                    <span className="text-white font-semibold">{standard.rules.length}</span>{" "}
                    rules
                  </div>
                  {(standard.minAge !== undefined || standard.maxAge !== undefined) && (
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <Clock className="w-4 h-4 text-brand-green" />
                      Ages{" "}
                      <span className="text-white font-semibold">
                        {standard.minAge ?? 0}–{standard.maxAge ?? 18}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* About / Long Description */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
            <div className="md:col-span-2">
              <h2 className="text-xl sm:text-2xl font-display text-foreground mb-4">
                About this standard
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {standard.longDescription}
              </p>
            </div>

            {/* Adopt CTA sidebar */}
            <div>
              <div className="plaid-card sticky top-24">
                <h3 className="text-base font-semibold text-foreground mb-3">
                  {standard.status === "active"
                    ? "Adopt this standard"
                    : "Coming soon"}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {standard.status === "active"
                    ? "Add this standard to your child's profile. Phosra will automatically enforce all rules across every connected platform."
                    : "This standard is not yet available for adoption. Join the waitlist to be notified when it launches."}
                </p>
                <Link
                  href="/login"
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
                    standard.status === "active"
                      ? "bg-brand-green text-foreground hover:shadow-[0_0_24px_-4px_rgba(0,212,126,0.5)]"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {standard.status === "active" ? "Get Started Free" : "Join Waitlist"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* How Phosra Enforces */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <AnimatedSection>
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="w-5 h-5 text-brand-green" />
            <h2 className="text-xl sm:text-2xl font-display text-foreground">
              How Phosra Enforces {standard.name}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            {standard.name} rules mapped to the Phosra API — enforce them individually or adopt the entire standard in one call.
          </p>
        </AnimatedSection>

        {/* Hero card: adopt entire standard */}
        <AnimatedSection delay={0.05}>
          <div className="mb-6">
            <PhosraFeatureCard
              regulation={standard.name}
              phosraFeature="Adopt Entire Standard"
              description={`Enforce all ${standard.rules.length} rules from ${standard.name} across every connected platform with a single API call.`}
              codeExample={generateFullStandardSnippet(standard)}
            />
          </div>
        </AnimatedSection>

        {/* Per-rule cards */}
        <div className="space-y-4">
          {standard.rules.map((rule, i) => {
            const feat = getCategoryFeature(rule.category)
            return (
              <AnimatedSection key={rule.category} delay={0.1 + i * 0.05}>
                <PhosraFeatureCard
                  regulation={rule.label}
                  phosraFeature={feat.feature}
                  ruleCategory={rule.category}
                  description={feat.description}
                  codeExample={generateRuleSnippet(standard, rule)}
                />
              </AnimatedSection>
            )
          })}
        </div>
      </section>

      {/* Rules */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <AnimatedSection>
            <h2 className="text-xl sm:text-2xl font-display text-foreground mb-2">
              Included rules
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              When adopted, these rules are automatically enforced across all connected platforms.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-4">
            {standard.rules.map((rule, i) => (
              <AnimatedSection key={rule.category} delay={i * 0.05}>
                <div className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${standard.accentColor}15` }}
                  >
                    <Shield className="w-5 h-5" style={{ color: standard.accentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {rule.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">{rule.value}</p>
                    {rule.maxAge && (
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Until age {rule.maxAge}
                      </p>
                    )}
                  </div>
                  <Check className="w-4 h-4 text-brand-green flex-shrink-0 mt-1" />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Tags */}
      {standard.tags.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex flex-wrap gap-2">
            {standard.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border"
              >
                {tag.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0">
          <WaveTexture />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-display text-white mb-4">
              Ready to protect your family?
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Adopt {standard.name} and let Phosra enforce it across every device and platform automatically.
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
                href="/standards"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full font-medium hover:bg-white/5 transition"
              >
                Browse All Standards
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
