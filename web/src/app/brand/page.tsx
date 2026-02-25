"use client"

import { useState } from "react"
import { Download, Check, Copy } from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst, StaggerChildren } from "@/components/marketing/shared"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const LOGOS = [
  {
    label: "Wordmark",
    variants: [
      { name: "Dark", src: "/logo.svg", bg: "bg-white", dl: "/logo.svg" },
      { name: "White", src: "/logo-white.svg", bg: "bg-[#0D1B2A]", dl: "/logo-white.svg" },
    ],
  },
  {
    label: "Burst Mark",
    variants: [
      { name: "Dark", src: "/mark.svg", bg: "bg-white", dl: "/mark.svg" },
      { name: "White", src: "/mark-white.svg", bg: "bg-[#0D1B2A]", dl: "/mark-white.svg" },
    ],
  },
  {
    label: "Favicon",
    variants: [
      { name: "SVG", src: "/favicon.svg", bg: "bg-white", dl: "/favicon.svg" },
      { name: "PNG 64px", src: "/brand/favicon-64.png", bg: "bg-[#0D1B2A]", dl: "/brand/favicon-64.png" },
    ],
  },
  {
    label: "Full Logo PNG",
    variants: [
      { name: "512px", src: "/brand/logo-full-512.png", bg: "bg-white", dl: "/brand/logo-full-512.png" },
      { name: "Icon 256px", src: "/brand/logo-icon-256.png", bg: "bg-[#0D1B2A]", dl: "/brand/logo-icon-256.png" },
    ],
  },
]

const COLORS = [
  { name: "Brand Green", hex: "#00D47E", rgb: "0, 212, 126" },
  { name: "Navy", hex: "#0D1B2A", rgb: "13, 27, 42" },
  { name: "Accent Teal", hex: "#26A8C9", rgb: "38, 168, 201" },
  { name: "Accent Purple", hex: "#7B5CB8", rgb: "123, 92, 184" },
  { name: "Light Gray", hex: "#FAFAFA", rgb: "250, 250, 250" },
  { name: "Dark", hex: "#060D16", rgb: "6, 13, 22" },
]

const TYPOGRAPHY = [
  {
    name: "DM Serif Display",
    role: "Display & Headings",
    className: "font-display",
    specimens: [
      { size: "text-5xl", label: "48px", text: "Protect every child" },
      { size: "text-3xl", label: "30px", text: "Define once, enforce everywhere" },
      { size: "text-xl", label: "20px", text: "Universal parental controls infrastructure" },
    ],
  },
  {
    name: "Inter",
    role: "Body & UI",
    className: "font-sans",
    specimens: [
      { size: "text-lg", label: "18px", text: "Parents set rules once, and those rules enforce across every platform their children use." },
      { size: "text-sm", label: "14px", text: "Phosra maps 78 child safety laws to enforcement actions across 320+ platforms in the kids' ecosystem." },
    ],
  },
  {
    name: "JetBrains Mono",
    role: "Code & Data",
    className: "font-mono",
    specimens: [
      { size: "text-base", label: "16px", text: "phosra.policies.enforce({ childId, rules })" },
      { size: "text-sm", label: "14px", text: "POST /v1/policies/enforce  →  200 OK" },
    ],
  },
]

const DOS = [
  "Use on clean, uncluttered backgrounds",
  "Maintain minimum clear space around the mark",
  "Use the provided brand colors only",
  "Use white logo on dark backgrounds, dark logo on light",
]

const DONTS = [
  "Stretch, skew, or distort the logo",
  "Rotate or flip the logo or burst mark",
  "Add drop shadows, glows, or other effects",
  "Place on busy photographs or patterned backgrounds",
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title={`Copy ${text}`}
    >
      {copied ? <Check className="w-3 h-3 text-brand-green" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BrandPage() {
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
              Brand
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-tight max-w-3xl">
              Brand Guidelines
            </h1>
            <p className="text-base sm:text-lg text-white/50 mt-6 max-w-2xl leading-relaxed">
              Logos, colors, typography, and usage guidelines for press, partners, and developers.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Logo Suite                                                   */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Logos
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-3">
            Logo suite
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mb-12">
            Use the wordmark for primary brand placements. The burst mark works as an icon or favicon. Always maintain the provided proportions.
          </p>
        </AnimatedSection>

        <StaggerChildren className="grid sm:grid-cols-2 gap-6" staggerDelay={0.08}>
          {LOGOS.map((group) => (
            <div key={group.label} className="plaid-card p-0 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-border">
                {group.variants.map((v) => (
                  <div key={v.name} className="flex flex-col">
                    <div
                      className={`${v.bg} flex items-center justify-center h-32 p-6`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.src}
                        alt={`${group.label} — ${v.name}`}
                        className="max-h-12 max-w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">{v.name}</span>
                      <a
                        href={v.dl}
                        download
                        className="inline-flex items-center gap-1 text-xs text-brand-green hover:text-brand-green/80 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </StaggerChildren>
      </section>

      {/* ============================================================ */}
      {/*  Color Palette                                                */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-[#0D1B2A] to-[#060D16] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
          <AnimatedSection>
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Colors
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-white mb-3">
              Color palette
            </h2>
            <p className="text-white/50 leading-relaxed max-w-2xl mb-12">
              Our palette balances trust and energy. Navy grounds the brand. Green signals action and safety.
            </p>
          </AnimatedSection>

          <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6" staggerDelay={0.06}>
            {COLORS.map((c) => {
              const isLight = c.hex === "#FAFAFA"
              return (
                <div key={c.hex} className="group">
                  <div
                    className="aspect-[4/3] rounded-xl mb-3 ring-1 ring-white/10 transition-transform group-hover:scale-[1.02]"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="space-y-1">
                    <p className={`text-sm font-medium ${isLight ? "text-white/70" : "text-white"}`}>
                      {c.name}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40 font-mono">{c.hex}</span>
                      <CopyButton text={c.hex} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40 font-mono">rgb({c.rgb})</span>
                      <CopyButton text={`rgb(${c.rgb})`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Typography                                                   */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Typography
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-3">
            Type system
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mb-12">
            Three fonts, each with a clear purpose. DM Serif Display for headlines. Inter for everything else. JetBrains Mono for code.
          </p>
        </AnimatedSection>

        <div className="space-y-16">
          {TYPOGRAPHY.map((family) => (
            <AnimatedSection key={family.name}>
              <div className="flex items-baseline gap-3 mb-6">
                <h3 className={`text-xl font-semibold text-foreground ${family.className}`}>
                  {family.name}
                </h3>
                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                  {family.role}
                </span>
              </div>
              <div className="space-y-4 border-l-2 border-border pl-6">
                {family.specimens.map((spec, i) => (
                  <div key={i}>
                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                      {spec.label}
                    </span>
                    <p className={`${spec.size} ${family.className} text-foreground leading-tight mt-1`}>
                      {spec.text}
                    </p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Brand Mark                                                   */}
      {/* ============================================================ */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
          <AnimatedSection>
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
              Brand Mark
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-3">
              The Phosra Burst
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mb-12">
              A 12-petal starburst representing interconnection across platforms. Use it as an icon, watermark, or decorative element alongside the wordmark.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="grid sm:grid-cols-3 gap-6">
              {/* Green on white */}
              <div className="plaid-card flex flex-col items-center justify-center py-10 bg-white">
                <div className="flex items-end gap-4">
                  <PhosraBurst size={64} color="#00D47E" opacity={1} />
                  <PhosraBurst size={96} color="#00D47E" opacity={1} />
                  <PhosraBurst size={128} color="#00D47E" opacity={1} />
                </div>
                <p className="text-xs text-muted-foreground mt-5 font-mono">Brand Green on White</p>
              </div>

              {/* White on navy */}
              <div className="rounded-xl border border-white/10 flex flex-col items-center justify-center py-10 bg-[#0D1B2A]">
                <div className="flex items-end gap-4">
                  <PhosraBurst size={64} color="#ffffff" opacity={1} />
                  <PhosraBurst size={96} color="#ffffff" opacity={1} />
                  <PhosraBurst size={128} color="#ffffff" opacity={1} />
                </div>
                <p className="text-xs text-white/40 mt-5 font-mono">White on Navy</p>
              </div>

              {/* Navy on light gray */}
              <div className="plaid-card flex flex-col items-center justify-center py-10 bg-[#FAFAFA]">
                <div className="flex items-end gap-4">
                  <PhosraBurst size={64} color="#0D1B2A" opacity={1} />
                  <PhosraBurst size={96} color="#0D1B2A" opacity={1} />
                  <PhosraBurst size={128} color="#0D1B2A" opacity={1} />
                </div>
                <p className="text-xs text-muted-foreground mt-5 font-mono">Navy on Light</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Usage Guidelines                                             */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
        <AnimatedSection>
          <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            Usage
          </p>
          <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-3">
            Usage guidelines
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mb-12">
            Follow these rules to keep the Phosra brand clear and consistent across all contexts.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="grid sm:grid-cols-2 gap-8">
            {/* Do */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-brand-green" />
                </div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Do</h3>
              </div>
              <ul className="space-y-3">
                {DOS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-brand-green mt-0.5 flex-shrink-0">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Don't */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-destructive text-xs font-bold">&times;</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Don&apos;t</h3>
              </div>
              <ul className="space-y-3">
                {DONTS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-destructive mt-0.5 flex-shrink-0">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ============================================================ */}
      {/*  Download All                                                 */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-[#0D1B2A] to-[#060D16] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
          <AnimatedSection>
            <div className="text-center max-w-xl mx-auto">
              <PhosraBurst size={48} color="#00D47E" opacity={0.8} className="mx-auto mb-6" />
              <h2 className="text-2xl sm:text-3xl font-display text-white mb-4">
                Download brand assets
              </h2>
              <p className="text-white/50 leading-relaxed mb-8">
                All logos, marks, and brand assets in SVG and PNG formats. For press inquiries, reach out to{" "}
                <a href="mailto:press@phosra.com" className="text-brand-green hover:underline">
                  press@phosra.com
                </a>
                .
              </p>
              <a
                href="/brand/phosra-brand-kit.zip"
                download
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download Brand Kit
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
