import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Child Safety Compliance Hub — 67+ Laws | Phosra",
  description: "Track COPPA, KOSA, EU DSA, and 67+ child safety laws worldwide. Filter by jurisdiction, status, and platform impact.",
  openGraph: {
    title: "Child Safety Compliance Hub — 67+ Laws | Phosra",
    description: "Track COPPA, KOSA, EU DSA, and 67+ child safety laws worldwide. Filter by jurisdiction, status, and platform impact.",
  },
}

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
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
