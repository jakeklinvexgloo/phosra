"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Search,
  Shield,
  Sparkles,
  Smartphone,
  Cpu,
} from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst } from "@/components/marketing/shared"
import {
  PARENTAL_CONTROLS_REGISTRY,
  getParentalControlsStats,
  searchParentalControls,
} from "@/lib/parental-controls"
import { SOURCE_CATEGORY_META } from "@/lib/parental-controls/types"
import type { SourceCategory } from "@/lib/parental-controls/types"
import { HUB_CARDS } from "@/lib/parental-controls/adapters/to-hub-page"
import { ParentalControlCard } from "@/components/parental-controls/ParentalControlCard"

type TabKey = "all" | SourceCategory

export default function ParentalControlsHubPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabKey>("all")
  const stats = useMemo(() => getParentalControlsStats(), [])

  const tabs: { key: TabKey; label: string; count: number }[] = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const card of HUB_CARDS) {
      counts[card.sourceCategory] = (counts[card.sourceCategory] ?? 0) + 1
    }
    return [
      { key: "all" as TabKey, label: "All", count: HUB_CARDS.length },
      { key: "parental_apps" as TabKey, label: "Parental Apps", count: counts["parental_apps"] ?? 0 },
      { key: "builtin_controls" as TabKey, label: "Built-in Controls", count: counts["builtin_controls"] ?? 0 },
      { key: "isp_carrier" as TabKey, label: "ISP & Carrier", count: counts["isp_carrier"] ?? 0 },
      { key: "school_institutional" as TabKey, label: "School", count: counts["school_institutional"] ?? 0 },
    ].filter((t) => t.count > 0)
  }, [])

  const filteredCards = useMemo(() => {
    let results = HUB_CARDS

    if (searchQuery.trim()) {
      const matchIds = new Set(searchParentalControls(searchQuery).map((p) => p.id))
      results = results.filter((c) => matchIds.has(c.id))
    }

    if (activeTab !== "all") {
      results = results.filter((c) => c.sourceCategory === activeTab)
    }

    return results
  }, [searchQuery, activeTab])

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
              <span className="text-xs font-medium text-white/70">Parental Controls</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight max-w-3xl mb-6">
              Every parental control,{" "}
              <span className="bg-gradient-to-r from-accent-purple to-brand-green bg-clip-text text-transparent">
                one API
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl leading-relaxed mb-10">
              Browse {stats.total} parental control apps and built-in platform controls.
              See what each one can do, how it integrates with Phosra, and which
              capabilities they support.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { value: `${stats.total}`, label: "Control Apps" },
                { value: `${stats.apps}`, label: "Parental Apps" },
                { value: `${stats.builtin}`, label: "Built-in Controls" },
                { value: `${stats.withApi}`, label: "With API Access" },
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

      {/* Search & Tabs */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search parental control apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-all"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full flex-shrink-0 transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-brand-green/15 text-brand-green border border-brand-green/30"
                    : "bg-muted text-muted-foreground border border-border hover:border-brand-green/20"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-60">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-12">
        {filteredCards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No parental controls match your search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCards.map((card) => (
              <ParentalControlCard key={card.id} card={card} />
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
                Parental controls, unified through Phosra
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                icon: Smartphone,
                title: "Connect your apps",
                description:
                  "Link your existing parental control apps — Bark, Qustodio, Apple Screen Time, and more — to Phosra via API or guided setup.",
              },
              {
                number: "02",
                icon: Shield,
                title: "Define rules once",
                description:
                  "Set your family's rules in one place. Phosra translates them into the native format each app understands.",
              },
              {
                number: "03",
                icon: Cpu,
                title: "Enforce everywhere",
                description:
                  "Rules push to every connected app and platform automatically. One dashboard, total coverage.",
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

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="plaid-card text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-display text-foreground mb-3">
              Ready to unify your parental controls?
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-lg mx-auto">
              Connect your existing apps through Phosra and manage all your children&apos;s
              safety settings from a single dashboard.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-foreground text-sm font-semibold rounded-lg hover:shadow-[0_0_24px_-4px_rgba(0,212,126,0.5)] transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
