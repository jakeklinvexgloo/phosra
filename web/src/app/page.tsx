import { Navbar } from "@/components/marketing/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { Stats } from "@/components/marketing/Stats"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { DevSection } from "@/components/marketing/DevSection"
import { Compliance } from "@/components/marketing/Compliance"
import { CTASection } from "@/components/marketing/CTASection"
import { Footer } from "@/components/marketing/Footer"

export default function MarketingPage() {
  return (
    <div className="min-h-screen scroll-smooth">
      <Navbar />
      <Hero />
      <Compliance />
      <Features />
      <Stats />
      <HowItWorks />
      <DevSection />
      <CTASection />
      <Footer />
    </div>
  )
}
