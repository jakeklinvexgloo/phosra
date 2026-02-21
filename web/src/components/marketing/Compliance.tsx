"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimatedSection, WaveTexture, GradientMesh } from "./shared"
import { JurisdictionSummaryRow } from "./compliance-section/JurisdictionSummaryRow"
import { HighlightLawCard } from "./compliance-section/HighlightLawCard"
import { LawCounter } from "./compliance-section/LawCounter"
import { LAW_REGISTRY, getRegistryStats } from "@/lib/compliance"
import { getLawById } from "@/lib/compliance"

const HIGHLIGHT_IDS = ["kosa", "coppa-2", "eu-dsa", "uk-aadc", "ca-sb-976", "au-osa"]

export function Compliance() {
  const stats = useMemo(() => getRegistryStats(), [])

  const highlightLaws = useMemo(
    () =>
      HIGHLIGHT_IDS.map((id) => getLawById(id)).filter(
        (l): l is NonNullable<typeof l> => l != null
      ),
    []
  )

  return (
    <section
      id="compliance"
      className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A]"
    >
      <WaveTexture colorStart="#00D47E" colorEnd="#7B5CB8" opacity={0.08} />
      <GradientMesh
        colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0D1B2A"]}
        className="opacity-20"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-10 sm:mb-14">
          <h2 className="font-display text-4xl sm:text-5xl text-white leading-tight mb-5">
            Parents shouldn{"'"}t need a law degree.{" "}
            <span className="bg-gradient-to-r from-[#00D47E] to-[#26A8C9] bg-clip-text text-transparent">
              Regulators agree.
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
            Governments worldwide are passing child safety laws because setting up parental controls across platforms is unreasonably hard. Phosra translates every regulation into enforceable rules {"\u2014"} so platforms stay compliant and parents stay&nbsp;sane.
          </p>

          <LawCounter
            totalLaws={stats.totalLaws}
            jurisdictions={stats.totalJurisdictions}
            categories={stats.totalCategories}
            enacted={stats.enacted}
          />
        </AnimatedSection>

        {/* Jurisdiction summary badges */}
        <AnimatedSection delay={0.1} className="mb-10">
          <JurisdictionSummaryRow />
        </AnimatedSection>

        {/* Highlight cards — 2x3 grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {highlightLaws.map((law) => (
            <HighlightLawCard key={law.id} law={law} />
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection delay={0.2} className="text-center">
          <Link
            href="/compliance"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-foreground text-sm font-semibold rounded-lg transition-all hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)]"
          >
            See all {stats.totalLaws}+ laws in the Compliance Hub
            <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}
