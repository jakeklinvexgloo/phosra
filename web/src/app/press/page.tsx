"use client"

import Link from "next/link"
import { ArrowRight, ExternalLink, Newspaper, FileText, Palette, Mail } from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst } from "@/components/marketing/shared"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface CoverageEntry {
  title: string
  publication: string
  date: string
  url: string
}

// Add press coverage entries here as they become available
const PRESS_COVERAGE: CoverageEntry[] = []

const PRESS_RELEASES = [
  {
    title: "Introducing Phosra \u2014 Universal Parental Controls Infrastructure",
    date: "2025",
    href: "/blog/introducing-phosra",
  },
  {
    title: "PCSS v1.0: An Open Specification for Parental Controls",
    date: "2025",
    href: "/blog/pcss-v1-specification",
  },
]

const KEY_FACTS = [
  { label: "Founded", value: "2025" },
  { label: "Focus", value: "Child safety compliance infrastructure" },
  { label: "Laws Tracked", value: "67" },
  { label: "Rule Categories", value: "45" },
  { label: "Platforms Mapped", value: "320+" },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PressPage() {
  return (
    <div>
      {/* ============================================================ */}
      {/*  Hero                                                        */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0D1B2A] to-[#060D16]">
        <div className="absolute inset-0">
          <WaveTexture opacity={0.08} />
        </div>
        <div className="absolute -bottom-16 -right-16">
          <PhosraBurst size={360} color="#ffffff" opacity={0.03} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
          <AnimatedSection>
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Press
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-tight max-w-3xl">
              Press
            </h1>
            <p className="text-base sm:text-lg text-white/50 mt-6 max-w-2xl leading-relaxed">
              Media resources, press releases, and coverage.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Press Coverage                                               */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-brand-green" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Press Coverage
            </h2>
          </div>

          {PRESS_COVERAGE.length > 0 ? (
            <div className="space-y-4">
              {PRESS_COVERAGE.map((entry) => (
                <a
                  key={entry.url}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="plaid-card flex items-center justify-between gap-4 group"
                >
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-brand-green transition-colors">
                      {entry.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {entry.publication} &middot; {entry.date}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-brand-green transition-colors" />
                </a>
              ))}
            </div>
          ) : (
            <div className="plaid-card text-center py-12">
              <Newspaper className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No press coverage yet. Check back soon.
              </p>
            </div>
          )}
        </AnimatedSection>
      </section>

      {/* ============================================================ */}
      {/*  Press Releases                                               */}
      {/* ============================================================ */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-brand-green" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                Press Releases
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {PRESS_RELEASES.map((release) => (
                <Link
                  key={release.href}
                  href={release.href}
                  className="plaid-card group flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                      {release.date}
                    </p>
                    <h3 className="font-semibold text-foreground group-hover:text-brand-green transition-colors leading-snug">
                      {release.title}
                    </h3>
                  </div>
                  <p className="text-sm text-brand-green font-medium mt-4 inline-flex items-center gap-1">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Media Kit                                                    */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-brand-green" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Media Kit
            </h2>
          </div>

          {/* Company description */}
          <div className="plaid-card mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              About Phosra
            </h3>
            <p className="text-foreground leading-relaxed">
              Phosra is the open specification and infrastructure API for child safety. Parents set rules once through any parent-facing app, and Phosra translates and enforces those rules across every connected platform &mdash; from streaming parental locks to DNS-level web filters to mobile device restrictions. One set of rules. Every platform. Always in sync.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3 text-sm">
              Founded by parents who build platforms, Phosra applies the infrastructure playbook from fintech to the most fragmented market in consumer technology: child safety compliance.
            </p>
          </div>

          {/* Key Facts */}
          <div className="plaid-card mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Key Facts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {KEY_FACTS.map((fact) => (
                <div key={fact.label}>
                  <p className="text-2xl font-display text-foreground">{fact.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{fact.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logo Downloads */}
          <div className="plaid-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Logos &amp; Brand Assets
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm mb-4">
              Logos, color palette, typography, and usage guidelines are available on our brand page.
            </p>
            <Link
              href="/brand"
              className="inline-flex items-center gap-2 text-sm text-brand-green font-medium hover:underline"
            >
              View brand assets <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* ============================================================ */}
      {/*  Contact                                                      */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0D1B2A] to-[#060D16]">
        <div className="absolute inset-0">
          <WaveTexture opacity={0.06} />
        </div>
        <div className="absolute -bottom-10 -right-10">
          <PhosraBurst size={300} color="#ffffff" opacity={0.03} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-brand-green" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display text-white">
                Contact
              </h2>
            </div>

            <div className="max-w-xl">
              <p className="text-white/60 leading-relaxed mb-6">
                For press inquiries, interview requests, or media resources, reach out to us directly.
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/40 uppercase tracking-wider mb-1">
                    Press Inquiries
                  </p>
                  <a
                    href="mailto:press@phosra.com"
                    className="text-brand-green hover:underline font-medium"
                  >
                    press@phosra.com
                  </a>
                </div>

                <div>
                  <p className="text-sm text-white/40 uppercase tracking-wider mb-1">
                    General Contact
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-brand-green hover:underline font-medium"
                  >
                    Contact page <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
