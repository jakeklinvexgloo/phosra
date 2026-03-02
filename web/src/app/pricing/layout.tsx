import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Pricing — Parental Controls & API Plans | Phosra",
  description: "Free for families. Developer API from $49/mo. Enterprise plans with COPPA, KOSA, and EU DSA compliance built in.",
  openGraph: {
    title: "Pricing — Parental Controls & API Plans | Phosra",
    description: "Free for families. Developer API from $49/mo. Enterprise plans with COPPA, KOSA, and EU DSA compliance built in.",
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
