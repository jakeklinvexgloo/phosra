import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { Compliance } from "@/components/marketing/Compliance"
import { Stats } from "@/components/marketing/Stats"
import { AISafetyCallout } from "@/components/marketing/AISafetyCallout"
import { ParentalControlsCallout } from "@/components/marketing/ParentalControlsCallout"
import { Footer } from "@/components/marketing/Footer"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"

/* Below-fold heavy components — lazy-loaded to reduce initial JS bundle */
const Ecosystem = dynamic(() => import("@/components/marketing/Ecosystem").then(m => ({ default: m.Ecosystem })))
const HowItWorks = dynamic(() => import("@/components/marketing/HowItWorks").then(m => ({ default: m.HowItWorks })))
const DevSection = dynamic(() => import("@/components/marketing/DevSection").then(m => ({ default: m.DevSection })))
const PlatformIntegration = dynamic(() => import("@/components/marketing/PlatformIntegration").then(m => ({ default: m.PlatformIntegration })))
const Movements = dynamic(() => import("@/components/marketing/Movements").then(m => ({ default: m.Movements })))
const CTASection = dynamic(() => import("@/components/marketing/CTASection").then(m => ({ default: m.CTASection })))

export const metadata: Metadata = {
  title: "Phosra — Child Safety Compliance Platform",
  description: "The infrastructure layer for child safety compliance. One API to enforce parental controls across 320+ platforms and track 67+ global regulations.",
  openGraph: {
    title: "Phosra — Child Safety Compliance Platform",
    description: "The infrastructure layer for child safety compliance. One API to enforce parental controls across 320+ platforms and track 67+ global regulations.",
  },
}

export default async function MarketingPage() {
  const allResearch = await loadAllChatbotResearch()

  const platforms = allResearch.map((r) => ({
    id: r.platformId,
    name: r.platformName,
    grade: r.chatbotData?.safetyTesting?.scorecard?.overallGrade ?? "—",
  }))

  return (
    <div className="min-h-screen scroll-smooth overflow-x-hidden">
      <SiteHeader variant="transparent" />
      <Hero />
      <Compliance />
      <Features />
      <Ecosystem />
      <Stats />
      <AISafetyCallout platforms={platforms} />
      <HowItWorks />
      <PlatformIntegration />
      <Movements />
      <ParentalControlsCallout />
      <DevSection />
      <CTASection />
      <Footer />
    </div>
  )
}
