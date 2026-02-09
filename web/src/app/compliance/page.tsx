"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst } from "@/components/marketing/shared"
import { ComplianceStats } from "@/components/marketing/compliance-hub/ComplianceStats"
import { JurisdictionTabs } from "@/components/marketing/compliance-hub/JurisdictionTabs"
import { ComplianceSearch } from "@/components/marketing/compliance-hub/ComplianceSearch"
import { StatusFilter } from "@/components/marketing/compliance-hub/StatusFilter"
import { LawCard } from "@/components/marketing/compliance-hub/LawCard"
import {
  LAW_REGISTRY,
  searchLaws,
  getLawsByJurisdiction,
  getLawsByStatus,
} from "@/lib/compliance/index"
import type { Jurisdiction, LawStatus, LawEntry } from "@/lib/compliance/index"

export default function ComplianceHubPage() {
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Compute jurisdiction tab counts
  const jurisdictionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: LAW_REGISTRY.length }

    // Individual jurisdiction groups
    const groups: Jurisdiction[] = [
      "us-federal",
      "us-state",
      "asia-pacific",
      "americas",
      "middle-east-africa",
    ]
    for (const g of groups) {
      counts[g] = getLawsByJurisdiction(g).length
    }

    // EU & UK combined tab
    counts["eu-uk"] =
      getLawsByJurisdiction("eu").length + getLawsByJurisdiction("uk").length

    return counts
  }, [])

  // Filter laws based on all three filters
  const filteredLaws = useMemo(() => {
    let laws: LawEntry[] = LAW_REGISTRY

    // Search filter
    if (searchQuery.trim()) {
      laws = searchLaws(searchQuery)
    }

    // Jurisdiction filter
    if (jurisdictionFilter !== "all") {
      if (jurisdictionFilter === "eu-uk") {
        laws = laws.filter(
          (l) => l.jurisdictionGroup === "eu" || l.jurisdictionGroup === "uk"
        )
      } else {
        laws = laws.filter(
          (l) => l.jurisdictionGroup === jurisdictionFilter
        )
      }
    }

    // Status filter
    if (statusFilter !== "all") {
      laws = laws.filter((l) => l.status === statusFilter)
    }

    return laws
  }, [searchQuery, jurisdictionFilter, statusFilter])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

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

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
                Compliance Hub
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight">
                Global Child Safety Compliance Hub
              </h1>
              <p className="text-base sm:text-lg text-white/60 mt-6 leading-relaxed">
                The most comprehensive database of child online safety
                legislation. Track, understand, and comply with regulations
                across every jurisdiction.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
                <BookOpen className="w-3.5 h-3.5" />
                Last updated February 2026 &middot; Monitored weekly
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <ComplianceStats />
          </AnimatedSection>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-4">
          <ComplianceSearch onSearch={handleSearch} />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <JurisdictionTabs
              active={jurisdictionFilter}
              onSelect={setJurisdictionFilter}
              counts={jurisdictionCounts}
            />
            <StatusFilter
              active={statusFilter}
              onSelect={setStatusFilter}
            />
          </div>
        </div>
      </section>

      {/* Law Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        {filteredLaws.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLaws.map((law, i) => (
              <LawCard key={law.id} law={law} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No laws found
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Try adjusting your search query or filters. We track 50+
              child safety laws across all major jurisdictions.
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-4">
              Can&apos;t find a law?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              We monitor global child safety legislation weekly and add new
              laws as they are introduced. If you know of a regulation we
              haven&apos;t covered, let us know.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-brand-green text-foreground px-6 py-3 rounded-full font-medium hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)] transition"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
