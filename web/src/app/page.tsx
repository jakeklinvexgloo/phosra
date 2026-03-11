import type { Metadata } from "next"
import dynamic from "next/dynamic"
import Link from "next/link"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { Compliance } from "@/components/marketing/Compliance"
import { Footer } from "@/components/marketing/Footer"

/* Below-fold heavy components — lazy-loaded to reduce initial JS bundle */
const Ecosystem = dynamic(() => import("@/components/marketing/Ecosystem").then(m => ({ default: m.Ecosystem })))
const HowItWorks = dynamic(() => import("@/components/marketing/HowItWorks").then(m => ({ default: m.HowItWorks })))
const DevSection = dynamic(() => import("@/components/marketing/DevSection").then(m => ({ default: m.DevSection })))
const CTASection = dynamic(() => import("@/components/marketing/CTASection").then(m => ({ default: m.CTASection })))

export const metadata: Metadata = {
  title: "Phosra — The Open Child Safety API",
  description: "Define once, protect everywhere. One API to enforce parental controls across live platforms — compliant with KOSA, COPPA 2.0, and 67+ global child safety laws.",
  openGraph: {
    title: "Phosra — The Open Child Safety API",
    description: "Define once, protect everywhere. One API to enforce parental controls across live platforms — compliant with KOSA, COPPA 2.0, and 67+ global child safety laws.",
  },
}

export default function MarketingPage() {
  return (
    <div className="min-h-screen scroll-smooth overflow-x-hidden">
      <SiteHeader variant="transparent" />
      <Hero />
      <Compliance />
      <Features />
      <Ecosystem />
      <HowItWorks />
      <DevSection />
      <CTASection />
      <Footer />

      {/* Sticky mobile CTA — visible on small screens after scrolling past hero */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden pointer-events-none">
        <div className="bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/95 to-transparent pt-6 pb-4 px-4 pointer-events-auto">
          <Link
            href="/login"
            className="flex items-center justify-center w-full px-6 py-3.5 bg-brand-green text-foreground text-sm font-bold rounded-lg shadow-[0_0_30px_-6px_rgba(0,212,126,0.4)]"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  )
}
