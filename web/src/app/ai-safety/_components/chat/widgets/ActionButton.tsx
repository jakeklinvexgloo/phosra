"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const CTA_ROUTES: Record<string, string> = {
  "setup-chatgpt": "/ai-safety/chatgpt#parental-controls",
  "setup-claude": "/ai-safety/claude#parental-controls",
  "compare": "/ai-safety/compare",
  "learn-more": "/ai-safety",
  "sign-up": "/signup",
  "parental-controls": "/ai-safety/dimensions/parental-controls",
  "safety-testing": "/ai-safety/dimensions/safety-testing",
  "methodology": "/ai-safety/methodology",
}

interface ActionButtonProps {
  label: string
  action: string
}

export function ActionButton({ label, action }: ActionButtonProps) {
  const href = CTA_ROUTES[action] ?? "/ai-safety"

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
