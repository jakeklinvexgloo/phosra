"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Search,
  Shield,
  Users,
  School,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst, StandardIcon } from "@/components/marketing/shared"
import {
  STANDARDS_REGISTRY,
  getStandardsStats,
  searchStandards,
  getActiveStandards,
} from "@/lib/standards"
import { STATUS_META } from "@/lib/standards/types"
import type { StandardEntry } from "@/lib/standards"

function StandardHubCard({ standard }: { standard: StandardEntry }) {
  const statusMeta = STATUS_META[standard.status]

  return (
    <Link href={`/standards/${standard.slug}`} className="group block h-full">
      <div className="relative h-full rounded-xl border border-border bg-card p-6 hover:border-brand-green/30 hover:shadow-[0_0_24px_-8px_rgba(0,212,126,0.15)] transition-all duration-300">
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{ background: `linear-gradient(90deg, ${standard.accentColor}60, ${standard.accentColor}20)` }}
        />

        <div className="flex items-start justify-between mb-4 mt-1">
          <div className="flex items-center gap-3">
            <StandardIcon standard={standard} size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-brand-green transition-colors">
                {standard.name}
              </h3>
              <p className="text-xs text-muted-foreground">{standard.organization}</p>
            </div>
          </div>
          <span
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusMeta.bgColor} ${statusMeta.textColor}`}
          >
            {statusMeta.label}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
          {standard.description}
        </p>

        {/* Rules preview */}
        <div className="space-y-2 mb-5">
          {standard.rules.slice(0, 3).map((rule) => (
            <div
              key={rule.category}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Shield className="w-3 h-3 text-brand-green flex-shrink-0" />
              <span className="font-medium text-foreground">{rule.label}</span>
              <span className="text-muted-foreground/60">{rule.value}</span>
            </div>
          ))}
          {standard.rules.length > 3 && (
            <p className="text-xs text-muted-foreground/50 pl-5">
              +{standard.rules.length - 3} more rules
            </p>
          )}
        </div>

        {/* Stats footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {standard.adoptionCount > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {standard.adoptionCount.toLocaleString()} families
              </span>
            )}
            {standard.schoolCount > 0 && (
              <span className="flex items-center gap-1">
                <School className="w-3.5 h-3.5" />
                {standard.schoolCount} schools
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-brand-green transition-colors" />
        </div>
      </div>
    </Link>
  )
}

export default function StandardsHubPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const stats = useMemo(() => getStandardsStats(), [])

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    STANDARDS_REGISTRY.forEach((s) => s.tags.forEach((t) => tags.add(t)))
    return Array.from(tags).sort()
  }, [])

  // Filter standards
  const filteredStandards = useMemo(() => {
    let results = searchQuery.trim()
      ? searchStandards(searchQuery)
      : STANDARDS_REGISTRY

    if (tagFilter) {
      results = results.filter((s) => s.tags.includes(tagFilter))
    }

    return results
  }, [searchQuery, tagFilter])

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

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
              <Sparkles className="w-3 h-3 text-brand-green" />
              <span className="text-xs font-medium text-white/70">Community Standards</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight max-w-3xl mb-6">
              Standards that protect,{" "}
              <span className="bg-gradient-to-r from-accent-purple to-brand-green bg-clip-text text-transparent">
                not just promise
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl leading-relaxed mb-10">
              Browse {stats.total} community standards from the AAP, WHO, US Surgeon General, Common Sense Media,
              Fairplay, Thorn, and more. Adopt a standard for your child, and Phosra enforces it across every
              connected platform.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { value: stats.totalAdoptions.toLocaleString(), label: "Families" },
                { value: `${stats.totalSchools}+`, label: "Schools" },
                { value: `${stats.active}`, label: "Active Standards" },
                { value: `${stats.total}`, label: "Total Standards" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-display text-white">{stat.value}</p>
                  <p className="text-xs text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search standards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-all"
            />
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !tagFilter
                  ? "bg-brand-green/15 text-brand-green border border-brand-green/30"
                  : "bg-muted text-muted-foreground border border-border hover:border-brand-green/20"
              }`}
            >
              All
            </button>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  tagFilter === tag
                    ? "bg-brand-green/15 text-brand-green border border-brand-green/30"
                    : "bg-muted text-muted-foreground border border-border hover:border-brand-green/20"
                }`}
              >
                {tag.replace(/-/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Standards Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-12">
        {filteredStandards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No standards match your search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {filteredStandards.map((standard) => (
              <StandardHubCard key={standard.id} standard={standard} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="text-center mb-12">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
                How It Works
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                From pledge to protection in three steps
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Movements define",
                description:
                  "Organizations from the AAP and WHO to grassroots movements like Wait Until 8th define standards — packaged rule sets based on their values and research.",
              },
              {
                number: "02",
                title: "Families adopt",
                description:
                  "One click to adopt a community standard. Rules generate automatically based on the standard definition and your child's age.",
              },
              {
                number: "03",
                title: "Phosra enforces",
                description:
                  "Standards push to every connected platform. Families earn verified badges. Pledges become real, enforceable protection.",
              },
            ].map((step, i) => (
              <AnimatedSection key={step.number} delay={i * 0.15}>
                <div className="text-center sm:text-left">
                  <span className="text-3xl font-display text-brand-green/30">{step.number}</span>
                  <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizations CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="plaid-card text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-display text-foreground mb-3">
              Want to define your own standard?
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-lg mx-auto">
              If you represent a child safety organization or school, you can define a community standard
              that families adopt and Phosra enforces across every platform.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-foreground text-sm font-semibold rounded-lg hover:shadow-[0_0_24px_-4px_rgba(0,212,126,0.5)] transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
