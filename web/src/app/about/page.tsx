"use client"

import Link from "next/link"
import { Shield, Globe, Scale, Code, ArrowRight, Lock, Zap, Eye, Cpu, Users, Linkedin, ExternalLink } from "lucide-react"
import Image from "next/image"
import { AnimatedSection, WaveTexture, PhosraBurst, GradientMesh, StaggerChildren } from "@/components/marketing/shared"
import { PLATFORM_STATS } from "@/lib/platforms"

const METRICS = [
  { value: "45", label: "Rule Categories" },
  { value: PLATFORM_STATS.marketingTotal, label: "Platform Integrations" },
  { value: "5", label: "Rating Systems" },
  { value: "50+", label: "Compliance Laws" },
]

const VALUES = [
  {
    icon: Lock,
    title: "Privacy First",
    description: "AES-256-GCM encryption for all sensitive data. Zero-knowledge policy handling — we enforce rules without exposing child identities to platforms.",
  },
  {
    icon: Globe,
    title: "Universal Coverage",
    description: "One API call enforces policies across DNS providers, streaming platforms, gaming services, device management, and browser extensions.",
  },
  {
    icon: Scale,
    title: "Compliance Built In",
    description: "KOSA, COPPA 2.0, EU DSA, and 49 more child safety laws mapped to policy categories automatically. Stay compliant as regulations evolve.",
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "REST API, MCP tool integration, webhooks, sandbox environments. Build child safety features in hours, not months.",
  },
]

const TRUST_BADGES = [
  { label: "SOC 2 Type II", sublabel: "Compliant" },
  { label: "COPPA", sublabel: "Verified" },
  { label: "AES-256-GCM", sublabel: "Encryption" },
  { label: "GDPR", sublabel: "Ready" },
  { label: "TLS 1.3", sublabel: "In Transit" },
]

const STEPS = [
  {
    number: "01",
    icon: Eye,
    title: "Parents set rules",
    description: "Through your app or the Phosra dashboard, parents define rules across all 45 policy categories — screen time limits, content ratings, web filters, and more — for each child.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Phosra connects",
    description: "The Phosra API maps rules to platform-specific enforcement actions. One policy becomes Netflix parental controls, YouTube restricted mode, NextDNS filters, and more.",
  },
  {
    number: "03",
    icon: Zap,
    title: "Enforced everywhere",
    description: "Rules push to connected platforms automatically. Changes propagate in seconds. Parents see real-time enforcement status across every device and app.",
  },
]

const FOUNDERS = {
  names: "Jake & Susannah Klinvex",
  role: "CEO & Founders",
  image: "/logos/founders.jpg",
  linkedin: "https://www.linkedin.com/in/jakeklinvex/",
  bio: "Founded three companies, all acquired — including Personation (acquired by eMoney Advisor) which was then acquired by Fidelity, and LoyalTree (acquired by SessionM) which was then acquired by Mastercard. Jake spent five years at Mastercard working on technology partnerships and blockchain/digital assets strategy, then co-founded withSoul, an AI platform acquired by Gloo which IPO'd at the end of 2025 (GLOO). At Phosra, they are applying the infrastructure playbook from fintech to child safety — building the open standard that connects every parental control to every platform. Jake and Susannah are parents of five children — they built Phosra because they needed it themselves.",
  highlights: [
    { metric: "3", label: "Companies Founded & Acquired" },
    { metric: "5 yrs", label: "At Mastercard (Fintech Infrastructure)" },
    { metric: "IPO", label: "Gloo (GLOO) — 2025" },
  ],
  career: [
    { company: "Mastercard", logo: "/logos/mastercard.png" },
    { company: "SessionM", logo: "/logos/sessionm.png" },
    { company: "Gloo", logo: "/logos/gloo.svg" },
    { company: "Villanova University", logo: "/logos/villanova.svg" },
  ],
}

export default function AboutPage() {
  return (
    <div>
      {/* Mission Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0">
          <WaveTexture />
        </div>
        <div className="absolute -bottom-20 -right-20">
          <PhosraBurst size={400} color="#ffffff" opacity={0.03} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
          <AnimatedSection>
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Our Mission
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight max-w-3xl">
              Every child deserves consistent protection across every app and device
            </h1>
            <p className="text-base sm:text-lg text-white/60 mt-6 max-w-2xl leading-relaxed">
              Parents shouldn&apos;t have to configure parental controls separately on Netflix, YouTube, TikTok, Roblox, and dozens more. Phosra is the infrastructure layer that makes &ldquo;set it once, enforce everywhere&rdquo; possible.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* The Problem */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 xl:gap-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-4">
                The problem
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Children use an average of 7 different apps and platforms daily. Each has its own parental control system — different settings, different terminology, different enforcement levels. Most parents give up after configuring two or three.
              </p>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-4">
                The cost
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A child with strict YouTube filters can still access unfiltered content on TikTok. A bedtime enforced on one device doesn&apos;t apply to another. Every platform gap is a protection gap — and children find them faster than parents can close them.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* The Vision */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
                Our Approach
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-6">
                Define once, protect everywhere
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                Phosra is an open standard and infrastructure API for child safety. Parent-facing apps like Bark, Qustodio, and Aura integrate once with the Phosra API. Phosra then translates and enforces policies across every connected platform — from Netflix parental locks to NextDNS web filters to Android device restrictions. One set of rules. Every platform. Always in sync.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Community Standards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Community Standards
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-6">
              The enforcement engine behind the movements parents trust
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              Phosra isn&apos;t just infrastructure — it&apos;s the technology that makes social pledges stick. When Wait Until 8th says &ldquo;no smartphones before 8th grade,&rdquo; Phosra is the enforcement layer that makes that promise real at the device level. When The Anxious Generation defines Four Norms for phone-free childhood, Phosra translates those norms into verified, cross-platform protection.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: "Movements define",
                description: "Organizations like Wait Until 8th and The Anxious Generation define standards — packaged rule sets based on their values and research.",
              },
              {
                title: "Families adopt",
                description: "One click to adopt a community standard. Rules generate automatically based on the standard definition and your child\u2019s age.",
              },
              {
                title: "Phosra enforces",
                description: "Standards push to every connected platform. Families earn verified badges. Schools see cohort adoption. Pledges become protection.",
              },
            ].map((item) => (
              <div key={item.title} className="plaid-card text-center">
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Metrics Bar */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0D1B2A] to-[#0A1628]">
        <div className="absolute inset-0">
          <GradientMesh colors={["#00D47E", "#0D1B2A", "#0F2035", "#0A1628"]} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {METRICS.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-display text-white">{metric.value}</p>
                <p className="text-sm text-white/50 mt-1">{metric.label}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              How It Works
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Three steps to universal protection
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <AnimatedSection key={step.number} delay={i * 0.15}>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-display text-brand-green/30">{step.number}</span>
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-green" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-5 -right-4 w-5 h-5 text-border" />
                  )}
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </section>

      {/* Values Grid */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="text-center mb-12">
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
                Our Values
              </p>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                Built on principles, not compromises
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((value, i) => {
              const Icon = value.icon
              return (
                <AnimatedSection key={value.title} delay={i * 0.1}>
                  <div className="plaid-card h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-brand-green" />
                      </div>
                      <h3 className="font-semibold text-foreground">{value.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team & Leadership */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Leadership
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Built by parents who build platforms
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Three companies founded and acquired. Five years of platform infrastructure at Mastercard. Now building the open standard for child safety.
            </p>
          </div>
        </AnimatedSection>

        {/* Founders card — premium layout */}
        <AnimatedSection>
          <div className="plaid-card p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              {/* Photo */}
              <div className="flex-shrink-0 flex justify-center sm:justify-start">
                <Image
                  src={FOUNDERS.image}
                  alt={FOUNDERS.names}
                  width={160}
                  height={160}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-2 border-border"
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-foreground text-xl">{FOUNDERS.names}</h3>
                <p className="text-brand-green text-sm font-medium mt-0.5">{FOUNDERS.role}</p>
                <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
                  {FOUNDERS.bio}
                </p>

                {/* Highlights / metrics */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {FOUNDERS.highlights.map((h) => (
                    <div key={h.label} className="text-center sm:text-left">
                      <p className="text-xl sm:text-2xl font-display text-foreground">{h.metric}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{h.label}</p>
                    </div>
                  ))}
                </div>

                {/* Previously at — logo strip */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-4">Previously at</p>
                  <div className="flex items-center gap-8">
                    {FOUNDERS.career.map((c) => (
                      <div key={c.company} className="flex flex-col items-center gap-1.5">
                        <div className="h-8 flex items-center">
                          <Image
                            src={c.logo}
                            alt={c.company}
                            width={120}
                            height={32}
                            className="h-7 w-auto opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground/60">{c.company}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Link
                    href={FOUNDERS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Why this team */}
        <AnimatedSection delay={0.15} className="mt-10">
          <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Three exits in fintech and loyalty infrastructure. Five years building platform APIs at Mastercard. Now applying the same infrastructure playbook to the most fragmented market in consumer technology: child safety.
          </p>
        </AnimatedSection>
      </section>

      {/* Trust Badges */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="text-center mb-10">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Trust & Security
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Enterprise-grade security by default
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center px-6 py-4 rounded-lg border border-border bg-card hover:border-brand-green/30 transition-colors"
              >
                <Shield className="w-5 h-5 text-brand-green mb-2" />
                <p className="text-sm font-semibold text-foreground">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.sublabel}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0">
          <WaveTexture />
        </div>
        <div className="absolute -bottom-10 -right-10">
          <PhosraBurst size={300} color="#ffffff" opacity={0.03} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-display text-white mb-4">
              Join us in building the child safety standard
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Whether you&apos;re a parent, a developer, or an enterprise — Phosra gives you the tools to protect children everywhere they go online.
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
    </div>
  )
}
