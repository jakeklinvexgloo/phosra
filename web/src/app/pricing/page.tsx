"use client"

import Link from "next/link"
import { Check, ArrowRight, Shield, Cpu, Users } from "lucide-react"
import { useState } from "react"

/* ── Pricing tiers ─────────────────────────────────────────────── */

const PROVIDER_TIERS = [
  { label: "Starter", users: "Up to 1,000 users", price: "$0.25", unit: "/user/mo" },
  { label: "Growth", users: "1,000 \u2013 50,000 users", price: "$0.15", unit: "/user/mo" },
  { label: "Scale", users: "50,000+ users", price: "$0.08", unit: "/user/mo" },
]

const PROVIDER_FEATURES = [
  "Full REST API access",
  "All 45 policy categories",
  "Unlimited platform connections",
  "MCP tool integration",
  "Webhook notifications",
  "Sandbox + production environments",
  "Compliance verification",
  "Priority support",
]

const PLATFORM_FEATURES = [
  "Phosra Certified\u2122 badge & assets",
  "KOSA, COPPA 2.0 & EU DSA compliance",
  "Automated regulatory reporting",
  "Audit trail & enforcement logs",
  "Compliance dashboard",
  "Custom policy templates",
  "Dedicated account manager",
  "99.99% SLA",
]

const FAQ = [
  {
    q: "Is Phosra free for parents?",
    a: "Always. Parents never pay for Phosra. They get protection through any app or platform that integrates with us. Look for the Phosra Certified badge.",
  },
  {
    q: "How does per-user pricing work for parental controls apps?",
    a: "You pay based on your monthly active users who have at least one Phosra-enforced rule. Volume discounts kick in automatically as you scale. There\u2019s a 14-day free trial with no credit card required.",
  },
  {
    q: "What does the Phosra Certified badge mean?",
    a: "It means the platform has integrated Phosra\u2019s enforcement layer and meets compliance requirements for child safety legislation like KOSA, COPPA 2.0, and the EU DSA. Parents can trust that apps displaying the badge have verified, enforceable parental controls.",
  },
  {
    q: "What compliance standards does Phosra cover?",
    a: "Our compliance engine maps to 50+ child safety laws across 25+ jurisdictions including KOSA, COPPA 2.0, EU DSA Article 28e, UK AADC, Australia\u2019s Online Safety Act, and California SB 976. Compliance updates automatically as regulations evolve.",
  },
  {
    q: "What if I need a custom plan?",
    a: "Platforms with more than 100,000 monthly active minors or unique compliance requirements should talk to our team. We offer custom pricing, dedicated integration support, and SLA guarantees.",
  },
]

/* ── Component ─────────────────────────────────────────────────── */

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-16 sm:py-20 px-4">
        <h1 className="text-4xl sm:text-5xl font-display text-foreground mb-4">
          Pricing that scales with your&nbsp;impact
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Free for parents, always. Per-user pricing for the apps and platforms that protect them.
        </p>
      </div>

      {/* Two audience tracks */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 grid lg:grid-cols-2 gap-6 mb-12">
        {/* Parental Controls Providers */}
        <div className="relative rounded-xl border border-brand-green shadow-[0_0_30px_-8px_rgba(0,212,126,0.3)] bg-card p-8 flex flex-col">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-green text-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            Most Popular
          </span>
          <div className="flex items-center gap-2.5 mb-4">
            <Cpu className="w-5 h-5 text-brand-green" />
            <h3 className="text-lg font-semibold text-foreground">Parental Controls Apps</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Integrate Phosra{"'"}s API into your app. Your users get universal cross-platform enforcement {"\u2014"} you get compliance built&nbsp;in.
          </p>

          {/* Tiered pricing */}
          <div className="space-y-3 mb-8">
            {PROVIDER_TIERS.map((t) => (
              <div key={t.label} className="flex items-baseline justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-foreground">{t.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{t.users}</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-display text-foreground">{t.price}</span>
                  <span className="text-xs text-muted-foreground">{t.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold transition-all mb-8 bg-brand-green text-foreground hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)]"
          >
            Start Building
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>

          <ul className="space-y-3 flex-1">
            {PROVIDER_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Technology Platforms */}
        <div className="rounded-xl border border-border bg-card p-8 flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <Shield className="w-5 h-5 text-[#26A8C9]" />
            <h3 className="text-lg font-semibold text-foreground">Technology Platforms</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Earn the Phosra Certified{"\u2122"} badge. Show parents your platform meets the highest child safety standards {"\u2014"} and stay compliant as laws&nbsp;evolve.
          </p>

          {/* Pricing */}
          <div className="space-y-3 mb-8">
            <div className="flex items-baseline justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div>
                <span className="text-sm font-medium text-foreground">Standard</span>
                <span className="text-xs text-muted-foreground ml-2">Up to 100K monthly active minors</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-display text-foreground">$0.10</span>
                <span className="text-xs text-muted-foreground">/minor/mo</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div>
                <span className="text-sm font-medium text-foreground">Enterprise</span>
                <span className="text-xs text-muted-foreground ml-2">100K+ monthly active minors</span>
              </div>
              <span className="text-sm font-medium text-foreground">Custom</span>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold transition-all mb-8 border border-foreground text-foreground hover:bg-muted"
          >
            Talk to Sales
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>

          <ul className="space-y-3 flex-1">
            {PLATFORM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-[#26A8C9] flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Parents — Always Free */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 mb-20">
        <div className="rounded-xl border border-border bg-card p-8 sm:p-10 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">For Parents &amp; Families</h3>
          </div>
          <div className="flex items-baseline justify-center gap-1 mb-3">
            <span className="text-4xl font-display text-foreground">Free</span>
            <span className="text-muted-foreground text-sm">forever</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
            Parents never pay for Phosra. You get protection through the apps and platforms your family already uses. Look for the{" "}
            <span className="font-semibold text-foreground">Phosra Certified{"\u2122"}</span> badge {"\u2014"} it means the app enforces your rules everywhere, automatically.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold border border-foreground text-foreground hover:bg-muted transition-all"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-4 sm:px-8 pb-20">
        <h2 className="text-2xl font-display text-foreground text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                {item.q}
                <span className="text-muted-foreground ml-4 flex-shrink-0">
                  {expandedFaq === i ? "\u2212" : "+"}
                </span>
              </button>
              {expandedFaq === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
