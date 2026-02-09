"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { AnimatedSection, WaveTexture, StaggerChildren } from "./shared"
import { JurisdictionTabBar, TABS } from "./compliance-section/JurisdictionTabBar"
import { FeaturedLawCard } from "./compliance-section/FeaturedLawCard"
import { CompactLawCard } from "./compliance-section/CompactLawCard"
import { LawCounter } from "./compliance-section/LawCounter"
import { LAW_REGISTRY, getRegistryStats } from "@/lib/compliance"
import type { LawEntry } from "@/lib/compliance/types"

/* IDs of the laws that get full-size cards on the "Featured" tab */
const FEATURED_IDS = new Set([
  "kosa",
  "coppa-2",
  "eu-dsa",
  "uk-aadc",
  "ca-sb-976",
  "india-dpdpa",
  "au-osa",
  "ftc-coppa",
])

export function Compliance() {
  const [activeTab, setActiveTab] = useState("featured")

  const stats = useMemo(() => getRegistryStats(), [])

  /* Counts per jurisdiction group for the tab bar badges */
  const jurisdictionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const law of LAW_REGISTRY) {
      counts[law.jurisdictionGroup] = (counts[law.jurisdictionGroup] || 0) + 1
    }
    return counts
  }, [])

  /* Featured laws — show on the "Featured" tab */
  const featuredLaws = useMemo(
    () => LAW_REGISTRY.filter((l) => FEATURED_IDS.has(l.id)),
    []
  )

  /* Laws for a jurisdiction tab */
  const tabLaws = useMemo(() => {
    if (activeTab === "featured") return featuredLaws
    const tab = TABS.find((t) => t.id === activeTab)
    if (!tab) return []
    return LAW_REGISTRY.filter((l) =>
      tab.jurisdictions.includes(l.jurisdictionGroup)
    )
  }, [activeTab, featuredLaws])

  return (
    <section
      id="compliance"
      className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-white to-[#FAFAFA]"
    >
      {/* Subtle texture */}
      <WaveTexture colorStart="#00D47E" colorEnd="#7B5CB8" opacity={0.02} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-10 sm:mb-14">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-tight mb-5">
            Built for the laws that protect children
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Phosra maps every rule category to specific legislative
            requirements across 25+ jurisdictions worldwide. Explore by
            region or browse our featured coverage.
          </p>

          {/* Animated counter row */}
          <LawCounter
            totalLaws={stats.totalLaws}
            jurisdictions={stats.totalJurisdictions}
            categories={stats.totalCategories}
            enacted={stats.enacted}
          />
        </AnimatedSection>

        {/* Jurisdiction tab bar */}
        <div className="mb-8">
          <JurisdictionTabBar
            active={activeTab}
            onSelect={setActiveTab}
            counts={jurisdictionCounts}
          />
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === "featured" ? (
              /* Featured tab: larger cards with MCP snippets */
              <StaggerChildren staggerDelay={0.06} className="grid md:grid-cols-2 gap-5">
                {featuredLaws.map((law) => (
                  <FeaturedLawCard key={law.id} law={law} />
                ))}
              </StaggerChildren>
            ) : (
              /* Jurisdiction tabs: compact card grid */
              <>
                {tabLaws.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">
                      No laws tracked for this jurisdiction yet.
                    </p>
                  </div>
                ) : (
                  <StaggerChildren staggerDelay={0.04} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tabLaws.map((law) => (
                      <CompactLawCard key={law.id} law={law} />
                    ))}
                  </StaggerChildren>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA link to compliance hub */}
        <AnimatedSection delay={0.3} className="text-center mt-12">
          <Link
            href="/compliance"
            className="inline-flex items-center gap-2 text-brand-green font-medium hover:gap-3 transition-all"
          >
            See all {stats.totalLaws}+ laws in the Compliance Hub
            <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}
