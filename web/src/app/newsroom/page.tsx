"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst, StaggerChildren } from "@/components/marketing/shared"
import { NEWSROOM, CATEGORY_CONFIG, getFeaturedNews, type NewsCategory } from "@/lib/newsroom"

type FilterCategory = "all" | NewsCategory

export default function NewsroomPage() {
  const [filter, setFilter] = useState<FilterCategory>("all")
  const featured = getFeaturedNews()

  const filtered = filter === "all"
    ? NEWSROOM.filter((e) => e.slug !== featured?.slug)
    : NEWSROOM.filter((e) => e.category === filter && e.slug !== featured?.slug)

  return (
    <div>
      {/* Hero */}
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
              Newsroom
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-tight max-w-3xl">
              News & Announcements
            </h1>
            <p className="text-base sm:text-lg text-white/50 mt-6 max-w-2xl leading-relaxed">
              Company news, product launches, and press coverage.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        {/* Featured */}
        {featured && filter === "all" && (
          <AnimatedSection className="mb-16">
            <Link href={`/newsroom/${featured.slug}`} className="group block">
              <div className="plaid-card p-8 sm:p-10 transition-shadow hover:shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <time className="text-xs text-muted-foreground font-mono">
                    {new Date(featured.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${CATEGORY_CONFIG[featured.category].bg} ${CATEGORY_CONFIG[featured.category].text}`}>
                    {CATEGORY_CONFIG[featured.category].label}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-green/10 text-brand-green">
                    Featured
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-3 group-hover:text-brand-green transition-colors">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-3xl">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-1.5 mt-5 text-sm text-brand-green font-medium">
                  Read more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </AnimatedSection>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1">
          {(["all", "product", "company", "press", "milestone"] as const).map((cat) => {
            const label = cat === "all" ? "All" : CATEGORY_CONFIG[cat].label
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === cat
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <StaggerChildren className="grid sm:grid-cols-2 gap-6" staggerDelay={0.06}>
          {filtered.map((entry) => {
            const cat = CATEGORY_CONFIG[entry.category]
            return (
              <Link key={entry.slug} href={`/newsroom/${entry.slug}`} className="group block">
                <div className="plaid-card p-6 h-full flex flex-col transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <time className="text-xs text-muted-foreground font-mono">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cat.bg} ${cat.text}`}>
                      {cat.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-brand-green transition-colors leading-snug">
                    {entry.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                    {entry.excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 mt-4 text-xs text-brand-green font-medium">
                    Read more <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            )
          })}
        </StaggerChildren>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No announcements match this filter.
          </p>
        )}

        {/* Press contact */}
        <AnimatedSection className="mt-20">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              For press inquiries, contact{" "}
              <a href="mailto:press@phosra.com" className="text-brand-green hover:underline">
                press@phosra.com
              </a>
              {" "}&middot;{" "}
              <Link href="/brand" className="text-brand-green hover:underline">
                Brand assets &rarr;
              </Link>
            </p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
