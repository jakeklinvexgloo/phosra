"use client"

import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { useState } from "react"

const TIERS = [
  {
    name: "Family",
    price: "Free",
    period: "",
    description: "Everything a family needs to protect their children across all platforms.",
    cta: "Get Started Free",
    ctaStyle: "border border-foreground text-foreground hover:bg-muted",
    features: [
      "Up to 5 children",
      "All 35 policy categories",
      "3 platform integrations",
      "Content rating enforcement",
      "Time limits & scheduled hours",
      "Web filtering & safe search",
      "Community support",
    ],
  },
  {
    name: "Developer",
    price: "$49",
    period: "/mo",
    description: "Build parental control features into your platform with the PCSS API.",
    cta: "Start Building",
    ctaStyle: "bg-brand-green text-foreground hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)]",
    popular: true,
    features: [
      "Everything in Family",
      "Full REST API access",
      "MCP tool integration",
      "Webhook notifications",
      "Unlimited platform connections",
      "Sandbox + production environments",
      "Compliance verification",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For platforms requiring regulatory compliance and dedicated support.",
    cta: "Talk to Sales",
    ctaStyle: "border border-foreground text-foreground hover:bg-muted",
    features: [
      "Everything in Developer",
      "KOSA & COPPA 2.0 compliance",
      "EU DSA Article 28e",
      "Custom policy templates",
      "SSO & team management",
      "99.99% SLA",
      "Dedicated account manager",
      "Custom integration support",
    ],
  },
]

const FAQ = [
  {
    q: "Is Phosra really free for families?",
    a: "Yes. The Family plan is completely free and includes full parental controls across up to 3 platform integrations. We believe every family deserves access to child safety tools.",
  },
  {
    q: "What's the difference between Family and Developer plans?",
    a: "The Family plan is for parents managing their children's digital safety. The Developer plan is for platform operators who want to integrate PCSS into their products via our REST API and MCP tools.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. The Family plan requires no payment method at all. Developer plans include a 14-day free trial before billing begins.",
  },
  {
    q: "What compliance standards does Phosra cover?",
    a: "Enterprise plans include built-in compliance with KOSA, COPPA 2.0, EU DSA Article 28e, and Australia's Online Safety Act. Our compliance engine maps your policies to regulatory requirements automatically.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time. When upgrading, you'll get immediate access to new features. When downgrading, your current billing period remains active.",
  },
]

const COMPARISON = [
  { feature: "Children profiles", family: "Up to 5", developer: "Unlimited", enterprise: "Unlimited" },
  { feature: "Policy categories", family: "35", developer: "35", enterprise: "35 + custom" },
  { feature: "Platform integrations", family: "3", developer: "Unlimited", enterprise: "Unlimited" },
  { feature: "REST API access", family: "\u2014", developer: "\u2713", enterprise: "\u2713" },
  { feature: "MCP tools", family: "\u2014", developer: "\u2713", enterprise: "\u2713" },
  { feature: "Webhooks", family: "\u2014", developer: "\u2713", enterprise: "\u2713" },
  { feature: "Compliance verification", family: "\u2014", developer: "\u2713", enterprise: "\u2713" },
  { feature: "Regulatory compliance", family: "\u2014", developer: "\u2014", enterprise: "\u2713" },
  { feature: "SSO & teams", family: "\u2014", developer: "\u2014", enterprise: "\u2713" },
  { feature: "SLA", family: "\u2014", developer: "99.9%", enterprise: "99.99%" },
  { feature: "Support", family: "Community", developer: "Priority email", enterprise: "Dedicated manager" },
]

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-16 sm:py-20 px-4">
        <h1 className="text-4xl sm:text-5xl font-display text-foreground mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Free for families. Pay only when you build. No hidden fees, no surprises.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 grid md:grid-cols-3 gap-6 mb-20">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-xl border p-8 flex flex-col ${
              tier.popular
                ? "border-brand-green shadow-[0_0_30px_-8px_rgba(0,212,126,0.3)] bg-card"
                : "border-border bg-card"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-green text-foreground text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-foreground mb-1">{tier.name}</h3>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-4xl font-display text-foreground">{tier.price}</span>
              {tier.period && (
                <span className="text-muted-foreground text-sm">{tier.period}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

            <Link
              href="/login"
              className={`inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold transition-all mb-8 ${tier.ctaStyle}`}
            >
              {tier.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <ul className="space-y-3 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Feature comparison table */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 mb-20">
        <h2 className="text-2xl font-display text-foreground text-center mb-8">Feature Comparison</h2>
        <div className="plaid-card !p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Family</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Developer</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-border last:border-0">
                  <td className="px-6 py-3 text-sm text-foreground">{row.feature}</td>
                  <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                    {row.family === "\u2713" ? <Check className="w-4 h-4 text-brand-green mx-auto" /> : row.family}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                    {row.developer === "\u2713" ? <Check className="w-4 h-4 text-brand-green mx-auto" /> : row.developer}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                    {row.enterprise === "\u2713" ? <Check className="w-4 h-4 text-brand-green mx-auto" /> : row.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
