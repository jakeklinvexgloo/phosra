import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { Ecosystem } from "@/components/marketing/Ecosystem"
import { Stats } from "@/components/marketing/Stats"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { DevSection } from "@/components/marketing/DevSection"
import { Compliance } from "@/components/marketing/Compliance"
import { PlatformIntegration } from "@/components/marketing/PlatformIntegration"
import { Movements } from "@/components/marketing/Movements"
import { ParentalControlsCallout } from "@/components/marketing/ParentalControlsCallout"
import { CTASection } from "@/components/marketing/CTASection"
import { Footer } from "@/components/marketing/Footer"
import { AISafetyCallout } from "@/components/marketing/AISafetyCallout"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"

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
