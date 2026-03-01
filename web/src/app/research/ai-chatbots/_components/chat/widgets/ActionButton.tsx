"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const CTA_ROUTES: Record<string, string> = {
  "setup-chatgpt": "/research/ai-chatbots/chatgpt#parental-controls",
  "setup-claude": "/research/ai-chatbots/claude#parental-controls",
  "compare": "/research/ai-chatbots/compare",
  "learn-more": "/research/ai-chatbots",
  "sign-up": "/signup",
  "parental-controls": "/research/ai-chatbots/dimensions/parental-controls",
  "safety-testing": "/research/ai-chatbots/dimensions/safety-testing",
  "methodology": "/research/ai-chatbots/methodology",
}

interface ActionButtonProps {
  label: string
  action: string
}

export function ActionButton({ label, action }: ActionButtonProps) {
  const href = CTA_ROUTES[action] ?? "/research/ai-chatbots"

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-green/20 border border-brand-green/30 text-brand-green text-sm font-medium hover:bg-brand-green/30 hover:border-brand-green/50 transition-all group"
    >
      {label}
      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

/** Check if an href is a CTA link */
export function isCTALink(href: string): { label?: string; action: string } | null {
  const match = href.match(/^cta:(.+)$/)
  if (!match) return null
  return { action: match[1] }
}
