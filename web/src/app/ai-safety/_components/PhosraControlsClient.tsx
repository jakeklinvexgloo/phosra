"use client"

import Link from "next/link"
import {
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { AnimatedSection, WaveTexture } from "@/components/marketing/shared"
import { SubNav } from "./SubNav"
import type { CapabilitySummary } from "@/lib/platform-research/research-data-types"

interface PlatformGap {
  platformId: string
  platformName: string
  capabilities: CapabilitySummary
  gapStats: { label: string; value: number; color: string }[]
  gapOpportunities: {
    icon: string
    title: string
    ruleCategory: string
    gapLabel: string
    gap: string
    solutionLabel: string
    solution: string
  }[]
  enforcementSteps: {
    id: string
    icon: string
    title: string
    description: string
    color: string
  }[]
}

export function PhosraControlsClient({ platforms }: { platforms: PlatformGap[] }) {
  // Build a matrix of all unique rule categories
  const allRules = new Map<string, string>()
  for (const p of platforms) {
    for (const cap of [...p.capabilities.fullyEnforceable, ...p.capabilities.partiallyEnforceable]) {
      if (!allRules.has(cap.ruleCategory)) {
        allRules.set(cap.ruleCategory, cap.label)
      }
    }
  }
  const ruleCategories = Array.from(allRules.entries()).map(([id, label]) => ({ id, label }))

  return (
    <div>
      <SubNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0">
          <WaveTexture />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <AnimatedSection direction="up">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 border border-brand-green/30 mb-4">
                <Zap className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-xs text-brand-green font-medium">Phosra Enforcement</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
                Why Phosra Exists
              </h1>
              <p className="text-white/60 leading-relaxed">
                Every AI chatbot platform has safety gaps that leave children unprotected.
                Phosra fills those gaps with enforceable parental controls, time limits,
                content filtering, and real-time notifications &mdash; across all {platforms.length} platforms.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Controls Matrix */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Platform Controls Matrix
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Native platform controls vs. what Phosra adds
        </p>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-3 py-2.5 text-left font-medium text-foreground sticky left-0 bg-muted/30 z-10 min-w-[140px]">
                  Control
                </th>
                {platforms.map((p) => (
                  <th key={p.platformId} className="px-2 py-2.5 text-center font-medium text-foreground min-w-[90px]">
                    <Link href={`/ai-safety/${p.platformId}`} className="hover:text-brand-green transition-colors">
                      {p.platformName}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {ruleCategories.map((rule) => (
                <tr key={rule.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 font-medium text-foreground sticky left-0 bg-background z-10 whitespace-nowrap">
                    {rule.label}
                  </td>
                  {platforms.map((p) => {
                    const full = p.capabilities.fullyEnforceable.find((c) => c.ruleCategory === rule.id)
                    const partial = p.capabilities.partiallyEnforceable.find((c) => c.ruleCategory === rule.id)
                    const na = p.capabilities.notApplicable.find((c) => c.ruleCategory === rule.id)

                    if (full) {
                      return (
                        <td key={p.platformId} className="px-2 py-2 text-center">
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Full
                          </span>
                        </td>
                      )
                    }
                    if (partial) {
                      return (
                        <td key={p.platformId} className="px-2 py-2 text-center">
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            Partial
                          </span>
                        </td>
                      )
                    }
                    if (na) {
                      return (
                        <td key={p.platformId} className="px-2 py-2 text-center">
                          <span className="text-muted-foreground/40">N/A</span>
                        </td>
                      )
                    }
                    return (
                      <td key={p.platformId} className="px-2 py-2 text-center">
                        <XCircle className="w-3.5 h-3.5 text-red-400/50 mx-auto" />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Enforcement Architecture */}
      {platforms[0]?.enforcementSteps.length > 0 && (
        <section className="bg-muted/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <AnimatedSection direction="up">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Enforcement Architecture
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                How Phosra monitors, classifies, enforces, and notifies in real-time
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {platforms[0].enforcementSteps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div
                      className="rounded-xl border-2 p-5 text-center min-w-[130px]"
                      style={{
                        borderColor: step.color,
                        backgroundColor: `${step.color}08`,
                      }}
                    >
                      <div className="text-2xl mb-2">{step.icon}</div>
                      <div className="text-sm font-semibold text-foreground">{step.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{step.description}</div>
                    </div>
                    {i < platforms[0].enforcementSteps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">
          Ready to protect your child across all platforms?
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/parental-controls"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-green text-white font-medium text-sm hover:bg-brand-green/90 transition-colors"
          >
            Get Phosra
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ai-safety"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted/50 transition-colors"
          >
            View All Research
          </Link>
        </div>
      </section>
    </div>
  )
}
