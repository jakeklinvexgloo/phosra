"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Layers, Monitor, Terminal } from "lucide-react"
import { AnimatedSection } from "@/components/marketing/shared"
import { ComplianceHero } from "@/components/marketing/compliance-page/ComplianceHero"
import { ComplianceSidebarTOC } from "@/components/marketing/compliance-page/ComplianceSidebarTOC"
import { getCategoryMeta, getGroupColor } from "@/lib/compliance/category-meta"
import type { LawEntry } from "@/lib/compliance/types"

// ── Simple syntax coloring for MCP snippets ───────────────────
function colorizeSnippet(snippet: string) {
  return snippet.split("\n").map((line, i) => {
    // Comments
    if (line.trimStart().startsWith("//")) {
      return (
        <span key={i} className="text-emerald-400">
          {line}
          {"\n"}
        </span>
      )
    }
    // Result lines (arrows)
    if (line.trimStart().startsWith("\u2192")) {
      return (
        <span key={i} className="text-white/50">
          {line}
          {"\n"}
        </span>
      )
    }
    // Tool/input keywords
    if (line.trimStart().startsWith("tool:") || line.trimStart().startsWith("input:")) {
      const [keyword, ...rest] = line.split(":")
      return (
        <span key={i}>
          <span className="text-sky-400">{keyword}</span>
          <span className="text-white/70">:{rest.join(":")}</span>
          {"\n"}
        </span>
      )
    }
    // String values in quotes
    if (line.includes('"')) {
      const parts = line.split(/(".*?")/g)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('"') ? (
              <span key={j} className="text-amber-300">
                {part}
              </span>
            ) : (
              <span key={j} className="text-white/70">
                {part}
              </span>
            )
          )}
          {"\n"}
        </span>
      )
    }
    // Default
    return (
      <span key={i} className="text-white/70">
        {line}
        {"\n"}
      </span>
    )
  })
}

const STANDARD_TOC = [
  { id: "provisions", label: "Provisions" },
  { id: "categories", label: "Categories" },
  { id: "platforms", label: "Platforms" },
  { id: "mcp-snippet", label: "MCP Snippet" },
  { id: "related", label: "Related" },
]

// ── Standard Law Page Component ───────────────────────────────

interface StandardLawPageProps {
  law: LawEntry
  stageColor: "enacted" | "passed" | "pending"
  relatedLaws: { id: string; name: string; href: string }[]
}

export function StandardLawPage({
  law,
  stageColor,
  relatedLaws,
}: StandardLawPageProps) {
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

      {/* Main content with sidebar TOC */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-10 py-16 sm:py-20">
          {/* Sidebar TOC */}
          <ComplianceSidebarTOC items={STANDARD_TOC} />

          {/* Content */}
          <div>
            {/* Key Provisions */}
            <section id="provisions">
              <AnimatedSection initiallyVisible>
                <div className="mb-10">
                  <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
                    Key Provisions
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                    What {law.shortName} requires
                  </h2>
                </div>
              </AnimatedSection>

              <div className="space-y-4">
                {law.keyProvisions.map((provision, i) => (
                  <div key={i} className="plaid-card flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-brand-green font-mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <BookOpen className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">
                        {provision}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="border-t border-border my-12" />

            {/* Rule Categories Covered */}
            <section id="categories">
              <AnimatedSection initiallyVisible>
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-brand-green" />
                    <p className="text-brand-green text-sm font-semibold tracking-wider uppercase">
                      Rule Categories Covered
                    </p>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                    Phosra enforcement categories for {law.shortName}
                  </h2>
                </div>
              </AnimatedSection>

              <div className="grid sm:grid-cols-2 gap-6">
                {law.ruleCategories.map((catId) => {
                  const meta = getCategoryMeta(catId)
                  const colors = getGroupColor(meta.group)
                  return (
                    <div key={catId} className="plaid-card h-full border-l-4 border-brand-green">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-sm">
                          {meta.name}
                        </h3>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                        >
                          {meta.group.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="inline-block text-[10px] font-mono bg-muted px-2 py-0.5 rounded mb-2">
                        {catId}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {meta.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            <div className="border-t border-border my-12" />

            {/* Platforms Affected */}
            <section id="platforms">
              <AnimatedSection initiallyVisible>
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="w-4 h-4 text-brand-green" />
                    <p className="text-brand-green text-sm font-semibold tracking-wider uppercase">
                      Platforms Affected
                    </p>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                    Platforms covered by {law.shortName}
                  </h2>
                </div>
              </AnimatedSection>

              <div className="flex flex-wrap gap-3">
                {law.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="inline-flex items-center px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground"
                  >
                    {platform}
                  </span>
                ))}
              </div>

              {/* Additional metadata badges */}
              <div className="flex flex-wrap gap-3 mt-6">
                {law.ageThreshold && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-xs font-medium">
                    Age: {law.ageThreshold}
                  </span>
                )}
                {law.penaltyRange && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                    Penalty: {law.penaltyRange}
                  </span>
                )}
                {law.effectiveDate && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                    Effective: {law.effectiveDate}
                  </span>
                )}
              </div>
            </section>

            <div className="border-t border-border my-12" />

            {/* MCP Enforcement Snippet */}
            <section id="mcp-snippet">
              <AnimatedSection initiallyVisible>
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-4 h-4 text-brand-green" />
                    <p className="text-brand-green text-sm font-semibold tracking-wider uppercase">
                      MCP Enforcement
                    </p>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                    Enforce {law.shortName} with a single API call
                  </h2>
                </div>
              </AnimatedSection>

              <div className="rounded-xl overflow-hidden border border-white/5">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0D1B2A] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-[10px] text-white/30 font-mono ml-2">
                    mcp-enforcement
                  </span>
                </div>
                <pre className="bg-[#0D1B2A] p-5 text-sm font-mono leading-relaxed overflow-x-auto">
                  <code>{colorizeSnippet(law.mcpSnippet)}</code>
                </pre>
              </div>
            </section>
          </div>
        </div>
      </div>

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
        <section id="related" className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <AnimatedSection initiallyVisible>
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
