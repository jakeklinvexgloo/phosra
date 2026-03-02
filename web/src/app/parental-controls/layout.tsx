import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Parental Controls — One Policy, Every Platform | Phosra",
  description: "Browse parental control apps and built-in platform controls. See capabilities, API access, and how each integrates with Phosra.",
  openGraph: {
    title: "Parental Controls — One Policy, Every Platform | Phosra",
    description: "Browse parental control apps and built-in platform controls. See capabilities, API access, and how each integrates with Phosra.",
  },
}

export default function ParentalControlsLayout({ children }: { children: React.ReactNode }) {
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
