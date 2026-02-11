"use client"

import Link from "next/link"
import { ArrowRight, Download, FileText, Shield, Globe, Layers, TrendingUp } from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst, GradientMesh, StaggerChildren } from "@/components/marketing/shared"
import { getRecentNews, CATEGORY_CONFIG } from "@/lib/newsroom"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const METRICS = [
  { value: "190+", label: "Platforms Connected" },
  { value: "67", label: "Child Safety Laws Tracked" },
  { value: "28", label: "Community Standards" },
  { value: "50K+", label: "Families" },
  { value: "2K+", label: "Schools" },
  { value: "25+", label: "Jurisdictions" },
]

const MARKET_CARDS = [
  {
    icon: TrendingUp,
    title: "The Compliance Wave",
    description:
      "67 child safety laws across 25+ jurisdictions. KOSA passed the Senate 91-3. Twenty-two states are legislating. The EU, UK, and Australia have already enacted. Every new law creates platform compliance demand — and infrastructure demand.",
  },
  {
    icon: Layers,
    title: "The Infrastructure Gap",
    description:
      "No interoperability standard exists for parental controls. Parents configure each platform separately. Developers rebuild enforcement logic from scratch. Phosra is the missing infrastructure layer — the standard the ecosystem needs.",
  },
  {
    icon: Globe,
    title: "The Platform Demand",
    description:
      "Platforms need compliance solutions. Parental control apps need broader reach. Schools need enforcement behind their pledges. Phosra serves all three through a single API — creating network effects as each new connection makes the platform more valuable.",
  },
]

const PRODUCT_LINKS = [
  { href: "/docs", label: "API Documentation", sublabel: "PCSS v1.0 specification and integration guides" },
  { href: "/compliance", label: "Compliance Hub", sublabel: "67 laws mapped to enforcement actions" },
  { href: "/standards", label: "Community Standards", sublabel: "28 standards, 50K families, 2K schools" },
  { href: "/platforms", label: "Platform Coverage", sublabel: "190+ connected platforms and growing" },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InvestorsPage() {
  const recentNews = getRecentNews(3)

  return (
    <div>
      {/* ============================================================ */}
      {/*  Hero                                                        */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0D1B2A] to-[#060D16]">
        <GradientMesh colors={["#00D47E", "#26A8C9", "#7B5CB8", "#00D47E"]} />
        <div className="absolute inset-0">
          <WaveTexture opacity={0.06} />
        </div>
        <div className="absolute -bottom-24 -right-24">
          <PhosraBurst size={480} color="#ffffff" opacity={0.03} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-24 sm:py-32">
          <AnimatedSection>
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Investor Relations
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-tight max-w-4xl">
              Building the infrastructure for a safer internet
            </h1>
            <p className="text-base sm:text-lg text-white/50 mt-6 max-w-2xl leading-relaxed">
              The universal standard for child safety enforcement across every digital platform.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Founder's Letter                                             */}
      {/* ============================================================ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-6">
            Letter from the Founder
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            <p>
              My wife Susannah and I have five children. Like every parent we know, we&apos;ve spent
              countless hours configuring parental controls — one app at a time, one device at a time,
              one child at a time. Netflix has one system. YouTube has another. TikTok, Roblox,
              Instagram, Discord — each with its own settings screen, its own mental model, its own
              gaps. A family like ours is managing 30+ separate configurations. Most parents give up
              after two or three.
            </p>

            <p>
              That&apos;s not a parenting failure. It&apos;s a systems failure.
            </p>

            <blockquote className="border-l-3 border-brand-green pl-6 py-3 my-10">
              <p className="text-xl sm:text-2xl font-display text-foreground italic leading-snug">
                Just as open banking required banks to let consumers manage their financial data from one place,
                child safety requires platforms to support standardized parental controls.
              </p>
            </blockquote>

            <p>
              The open banking movement proved a powerful principle: consumers shouldn&apos;t be locked into
              each institution&apos;s proprietary interface to manage their own data. Banks were required to
              expose standardized APIs. Consumers got control. Innovation flourished. The same principle
              applies to how parents protect their children online.
            </p>

            <p>
              Phosra is the infrastructure that makes this possible. We&apos;re not another parental control
              app — we&apos;re the layer underneath. Parents set rules once. Apps like Bark and Qustodio
              plug in to extend their reach. Platforms connect to offer compliant, interoperable controls.
              Rules enforce across 190+ services automatically.
            </p>

            <p>
              The timing is not accidental. We&apos;re building at an inflection point. KOSA passed the
              U.S. Senate 91-3. Twenty-two states have introduced or passed child safety legislation.
              The EU Digital Services Act, the UK Online Safety Act, and Australia&apos;s Online Safety
              Act are creating compliance obligations that platforms cannot ignore. The U.S. Surgeon
              General has called social media a &ldquo;profound risk of harm&rdquo; to children and
              proposed warning labels. The momentum is bipartisan, global, and accelerating.
            </p>

            <p>
              Today, Phosra tracks 67 of these child safety laws across 25+ jurisdictions and maps each
              one to specific enforcement actions. We support 28 community standards — from Four Norms to
              Wait Until 8th — adopted by over 50,000 families and 2,000 schools. We&apos;ve published PCSS
              v1.0, the open specification for how parental controls should work across platforms. The
              technical standard exists. The infrastructure is live.
            </p>

            <p>
              What we&apos;re building next is simple: we&apos;re making Phosra the default way parental
              controls work. Not by replacing the apps parents use, but by connecting all of them. Not
              by lobbying for specific laws, but by making every law enforceable. Not by building another
              walled garden, but by building the open standard that makes walled gardens unnecessary.
            </p>

            <p className="text-foreground font-medium">
              The infrastructure for a safer internet should be open, universal, and built to last.
              That&apos;s what we&apos;re building.
            </p>

            <div className="pt-6">
              <p className="text-foreground font-medium">Jake Klinvex</p>
              <p className="text-sm text-muted-foreground">Founder & CEO, Phosra</p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ============================================================ */}
      {/*  By the Numbers                                               */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-[#0D1B2A] to-[#060D16] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
          <AnimatedSection>
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Traction
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-white mb-12">
              By the numbers
            </h2>
          </AnimatedSection>

          <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10" staggerDelay={0.08}>
            {METRICS.map((m) => (
              <div key={m.label}>
                <p className="text-3xl sm:text-4xl font-display text-white">
                  {m.value}
                </p>
                <p className="text-sm text-white/40 mt-1">{m.label}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Market Opportunity                                           */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Market
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-3">
            Market opportunity
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mb-12">
            Three converging forces are creating an infrastructure-scale opportunity in child safety.
          </p>
        </AnimatedSection>

        <StaggerChildren className="grid md:grid-cols-3 gap-6" staggerDelay={0.08}>
          {MARKET_CARDS.map((card) => (
            <div key={card.title} className="plaid-card p-6">
              <card.icon className="w-5 h-5 text-brand-green mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
            </div>
          ))}
        </StaggerChildren>
      </section>

      {/* ============================================================ */}
      {/*  Product Overview                                             */}
      {/* ============================================================ */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
          <AnimatedSection>
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Product
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-12">
              Explore the platform
            </h2>
          </AnimatedSection>

          <StaggerChildren className="grid sm:grid-cols-2 gap-4" staggerDelay={0.06}>
            {PRODUCT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="group block">
                <div className="plaid-card p-5 flex items-center justify-between transition-shadow hover:shadow-md">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors">
                      {link.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{link.sublabel}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-green transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Press & Coverage                                             */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
                Press
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                Recent announcements
              </h2>
            </div>
            <Link href="/newsroom" className="hidden sm:flex items-center gap-1.5 text-sm text-brand-green hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </AnimatedSection>

        <StaggerChildren className="grid sm:grid-cols-3 gap-6" staggerDelay={0.08}>
          {recentNews.map((entry) => {
            const cat = CATEGORY_CONFIG[entry.category]
            return (
              <Link key={entry.slug} href={`/newsroom/${entry.slug}`} className="group block">
                <div className="plaid-card p-5 h-full flex flex-col transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <time className="text-xs text-muted-foreground font-mono">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </time>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cat.bg} ${cat.text}`}>
                      {cat.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors leading-snug flex-1">
                    {entry.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-3 text-xs text-brand-green">
                    Read <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            )
          })}
        </StaggerChildren>

        <Link href="/newsroom" className="sm:hidden flex items-center justify-center gap-1.5 text-sm text-brand-green mt-8">
          View all announcements <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* ============================================================ */}
      {/*  Pitch Deck                                                   */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-[#0D1B2A] to-[#060D16] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-brand-green" strokeWidth={1.5} />
                  <p className="text-brand-green text-sm font-semibold tracking-wider uppercase">
                    Pitch Deck
                  </p>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display text-white mb-3">
                  Pre-seed deck
                </h2>
                <p className="text-white/50 leading-relaxed max-w-lg">
                  12 slides covering the problem, product, market, traction, and team. Available as an interactive HTML deck or downloadable PDF.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/deck/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm"
                >
                  View Deck <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="/deck/phosra-pre-seed-deck.pdf"
                  download
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white font-medium rounded-lg hover:border-white/40 transition-colors text-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Contact                                                      */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
        <AnimatedSection>
          <div className="text-center max-w-xl mx-auto">
            <PhosraBurst size={48} color="#00D47E" opacity={0.8} className="mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-4">
              Interested in learning more?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We&apos;re building the infrastructure for a safer internet. If you&apos;re an investor, partner, or policy maker, we&apos;d love to connect.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:investors@phosra.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm"
              >
                Contact Us <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                General inquiries &rarr;
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
