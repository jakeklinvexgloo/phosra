"use client"

import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Globe,
  ExternalLink,
  Smartphone,
  DollarSign,
  Cpu,
  Code2,
  Scale,
  Users,
} from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst } from "@/components/marketing/shared"
import { CapabilityMatrix } from "./CapabilityMatrix"
import { DeviceBadges } from "./DeviceBadges"
import { PhosraFeatureCard } from "@/components/marketing/compliance-page/PhosraFeatureCard"
import { SOURCE_CATEGORY_META, PRICING_LABELS, API_LABELS } from "@/lib/parental-controls/types"
import type { ParentalControlEntry } from "@/lib/parental-controls/types"
import {
  generateConnectSnippet,
  generateSyncSnippet,
  generateCapabilitySnippet,
  getCategoryFeature,
} from "@/lib/parental-controls/snippet-generator"
import { LAW_REGISTRY } from "@/lib/compliance"
import type { LawEntry } from "@/lib/compliance"
import { JURISDICTION_META, STATUS_META } from "@/lib/compliance"
import { MOVEMENTS_REGISTRY } from "@/lib/movements"
import type { MovementEntry } from "@/lib/movements"

function getRelatedLaws(control: ParentalControlEntry): LawEntry[] {
  const controlCategories = new Set(control.capabilities.map((c) => c.category))
  return LAW_REGISTRY
    .filter((law) => law.ruleCategories.some((c) => controlCategories.has(c)))
    .sort((a, b) => {
      const aOverlap = a.ruleCategories.filter((c) => controlCategories.has(c)).length
      const bOverlap = b.ruleCategories.filter((c) => controlCategories.has(c)).length
      return bOverlap - aOverlap
    })
    .slice(0, 6)
}

function getRelatedStandards(control: ParentalControlEntry): MovementEntry[] {
  const controlCategories = new Set(control.capabilities.map((c) => c.category))
  return MOVEMENTS_REGISTRY
    .filter((m) => m.rules.some((r) => controlCategories.has(r.category)))
    .sort((a, b) => {
      const aOverlap = a.rules.filter((r) => controlCategories.has(r.category)).length
      const bOverlap = b.rules.filter((r) => controlCategories.has(r.category)).length
      return bOverlap - aOverlap
    })
    .slice(0, 6)
}

export function ParentalControlDetailTemplate({ entry }: { entry: ParentalControlEntry }) {
  const categoryMeta = SOURCE_CATEGORY_META[entry.sourceCategory]
  const apiMeta = API_LABELS[entry.apiAvailability]
  const fullCount = entry.capabilities.filter((c) => c.support === "full").length
  const partialCount = entry.capabilities.filter((c) => c.support === "partial").length
  const deviceCount = Object.values(entry.devices).filter(Boolean).length

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
            <Link
              href="/parental-controls"
              className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              All Parental Controls
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${entry.accentColor}20` }}
              >
                {entry.iconUrl ? (
                  <img src={entry.iconUrl} alt="" className="w-10 h-10 rounded-lg object-contain" />
                ) : (
                  <span className="text-4xl">{entry.iconEmoji}</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl sm:text-4xl font-display text-white">
                    {entry.name}
                  </h1>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 ${apiMeta.color}`}>
                    {apiMeta.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-white/40">{categoryMeta.shortLabel}</span>
                  <span className="text-white/20">·</span>
                  <a
                    href={entry.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:text-white inline-flex items-center gap-1 transition-colors"
                  >
                    {entry.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-base text-white/60 leading-relaxed max-w-2xl">
                  {entry.description}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-6 mt-6">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Shield className="w-4 h-4 text-brand-green" />
                    <span className="text-white font-semibold">{fullCount}</span> full +{" "}
                    <span className="text-white font-semibold">{partialCount}</span> partial capabilities
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Smartphone className="w-4 h-4 text-brand-green" />
                    <span className="text-white font-semibold">{deviceCount}</span> platforms
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <DollarSign className="w-4 h-4 text-brand-green" />
                    <span className="text-white font-semibold">{PRICING_LABELS[entry.pricingTier]}</span>
                    <span className="text-white/40">— {entry.pricingDetails}</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* About + Sidebar */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
            <div className="md:col-span-2">
              <h2 className="text-xl sm:text-2xl font-display text-foreground mb-4">
                About {entry.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {entry.longDescription}
              </p>
            </div>

            {/* Sidebar info */}
            <div>
              <div className="plaid-card sticky top-24 space-y-5">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Device Support
                  </h3>
                  <DeviceBadges devices={entry.devices} size="md" />
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Pricing
                  </h3>
                  <p className="text-sm text-foreground font-medium">{PRICING_LABELS[entry.pricingTier]}</p>
                  <p className="text-xs text-muted-foreground">{entry.pricingDetails}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    API Integration
                  </h3>
                  <p className={`text-sm font-medium ${apiMeta.color}`}>{apiMeta.label}</p>
                  {entry.apiDetails && (
                    <p className="text-xs text-muted-foreground mt-1">{entry.apiDetails}</p>
                  )}
                </div>

                {(entry.minAge !== undefined || entry.maxAge !== undefined) && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Age Range
                    </h3>
                    <p className="text-sm text-foreground">
                      Ages {entry.minAge ?? 0}–{entry.maxAge ?? 18}
                    </p>
                  </div>
                )}

                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-green text-foreground rounded-lg text-sm font-semibold hover:shadow-[0_0_24px_-4px_rgba(0,212,126,0.5)] transition-all"
                >
                  Connect via Phosra
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* How Phosra Connects */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <AnimatedSection>
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="w-5 h-5 text-brand-green" />
            <h2 className="text-xl sm:text-2xl font-display text-foreground">
              How Phosra Connects to {entry.name}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            {entry.apiAvailability === "public_api" &&
              `${entry.name}'s public API lets Phosra push rules directly. Connect once, sync automatically.`}
            {entry.apiAvailability === "partner_api" &&
              `Phosra supports ${entry.name} rule translation. Connect your existing ${entry.name} account to push rules through Phosra's unified API.`}
            {entry.apiAvailability === "no_api" &&
              `${entry.name} doesn't offer an API. Phosra provides step-by-step guided setup that mirrors your active rules.`}
            {entry.apiAvailability === "undocumented" &&
              `Phosra has identified integration points with ${entry.name}. Availability may vary.`}
          </p>
        </AnimatedSection>

        {/* Hero card: connect source */}
        <AnimatedSection delay={0.05}>
          <div className="mb-6">
            <PhosraFeatureCard
              regulation={entry.name}
              phosraFeature={entry.apiAvailability === "no_api" ? "Guided Setup" : "Connect Source"}
              description={
                entry.apiAvailability === "no_api"
                  ? `Register ${entry.name} as a guided source and get step-by-step setup instructions for each capability.`
                  : `Link ${entry.name} to a child profile and enable automatic rule syncing across all supported capabilities.`
              }
              codeExample={generateConnectSnippet(entry)}
            />
          </div>
        </AnimatedSection>

        {/* Sync card */}
        <AnimatedSection delay={0.1}>
          <div className="mb-6">
            <PhosraFeatureCard
              regulation={entry.name}
              phosraFeature={entry.apiAvailability === "no_api" ? "Refresh Guide Steps" : "Sync All Rules"}
              description={
                entry.apiAvailability === "no_api"
                  ? `Refresh the guided setup steps for ${entry.name} to reflect any rule changes in your Phosra policy.`
                  : `Push all active Phosra rules to ${entry.name} in a single sync operation.`
              }
              codeExample={generateSyncSnippet(entry)}
            />
          </div>
        </AnimatedSection>

        {/* Per-capability cards (first 5 non-none) */}
        <div className="space-y-4">
          {entry.capabilities
            .filter((c) => c.support !== "none")
            .slice(0, 5)
            .map((cap, i) => {
              const feat = getCategoryFeature(cap.category)
              return (
                <AnimatedSection key={cap.category} delay={0.15 + i * 0.05}>
                  <PhosraFeatureCard
                    regulation={cap.label}
                    phosraFeature={feat.feature}
                    ruleCategory={cap.category}
                    description={feat.description}
                    codeExample={generateCapabilitySnippet(entry, cap)}
                  />
                </AnimatedSection>
              )
            })}
        </div>
      </section>

      {/* Capability Matrix */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="w-5 h-5 text-brand-green" />
              <h2 className="text-xl sm:text-2xl font-display text-foreground">
                Capability Matrix
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              How {entry.name} maps to Phosra&apos;s {entry.capabilities.length} rule categories.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="plaid-card">
              <CapabilityMatrix
                capabilities={entry.capabilities}
                accentColor={entry.accentColor}
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
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

      {/* Related Legislation */}
      {(() => {
        const relatedLaws = getRelatedLaws(entry)
        if (relatedLaws.length === 0) return null
        return (
          <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
            <AnimatedSection>
              <div className="flex items-center gap-3 mb-2">
                <Scale className="w-5 h-5 text-brand-green" />
                <h2 className="text-xl sm:text-2xl font-display text-foreground">
                  Related Legislation
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Laws and regulations that share rule categories with {entry.name}.
              </p>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedLaws.map((law, i) => {
                const statusMeta = STATUS_META[law.status]
                const jurisdictionMeta = JURISDICTION_META[law.jurisdictionGroup]
                const controlCategories = new Set(entry.capabilities.map((c) => c.category))
                const overlap = law.ruleCategories.filter((c) => controlCategories.has(c)).length
                return (
                  <AnimatedSection key={law.id} delay={0.05 * i}>
                    <Link
                      href={`/compliance/${law.id}`}
                      className="block plaid-card hover:border-brand-green/30 transition-colors h-full"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-foreground leading-tight">
                          {law.shortName}
                        </h3>
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusMeta.bgColor} ${statusMeta.textColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}`} />
                          {statusMeta.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {law.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {jurisdictionMeta.label}
                        </span>
                        <span className="text-[10px] text-brand-green font-medium">
                          {overlap} shared {overlap === 1 ? "category" : "categories"}
                        </span>
                      </div>
                    </Link>
                  </AnimatedSection>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* Related Community Standards */}
      {(() => {
        const relatedStandards = getRelatedStandards(entry)
        if (relatedStandards.length === 0) return null
        return (
          <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
            <AnimatedSection>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-brand-green" />
                <h2 className="text-xl sm:text-2xl font-display text-foreground">
                  Related Community Standards
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Community movements and standards that align with {entry.name}&apos;s capabilities.
              </p>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedStandards.map((std, i) => {
                const controlCategories = new Set(entry.capabilities.map((c) => c.category))
                const overlap = std.rules.filter((r) => controlCategories.has(r.category)).length
                return (
                  <AnimatedSection key={std.id} delay={0.05 * i}>
                    <Link
                      href={`/standards/${std.slug}`}
                      className="block plaid-card hover:border-brand-green/30 transition-colors h-full"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        {std.iconUrl ? (
                          <img src={std.iconUrl} alt="" className="w-8 h-8 rounded-lg object-contain" />
                        ) : (
                          <span className="text-xl">{std.iconEmoji}</span>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
                            {std.name}
                          </h3>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {std.organization}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {std.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {std.rules.length} rules
                        </span>
                        <span className="text-[10px] text-brand-green font-medium">
                          {overlap} shared {overlap === 1 ? "category" : "categories"}
                        </span>
                      </div>
                    </Link>
                  </AnimatedSection>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0">
          <WaveTexture />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-display text-white mb-4">
              Use {entry.name} with Phosra
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Connect {entry.name} through Phosra&apos;s API and enforce rules across every platform your child uses.
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
                href="/parental-controls"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full font-medium hover:bg-white/5 transition"
              >
                Browse All Apps
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
