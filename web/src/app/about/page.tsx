"use client"

import Link from "next/link"
import { Shield, Globe, Scale, Code, ArrowRight, Lock, Zap, Eye, Cpu } from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst, GradientMesh, StaggerChildren } from "@/components/marketing/shared"

const METRICS = [
  { value: "40", label: "Rule Categories" },
  { value: "15+", label: "Platform Adapters" },
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
    description: "Through your app or the Phosra dashboard, parents define screen time limits, content ratings, web filters, and 35+ other policy categories for each child.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Phosra connects",
    description: "The PCSS API maps rules to platform-specific enforcement actions. One policy becomes Netflix parental controls, YouTube restricted mode, NextDNS filters, and more.",
  },
  {
    number: "03",
    icon: Zap,
    title: "Enforced everywhere",
    description: "Rules push to connected platforms automatically. Changes propagate in seconds. Parents see real-time enforcement status across every device and app.",
  },
]

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
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
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
                Phosra is an open standard and infrastructure API for child safety. Parent-facing apps like Bark, Qustodio, and Aura integrate once with the PCSS (Phosra Child Safety Standard) API. Phosra then translates and enforces policies across every connected platform — from Netflix parental locks to NextDNS web filters to Android device restrictions. One set of rules. Every platform. Always in sync.
              </p>
            </div>
          </AnimatedSection>
        </div>
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
