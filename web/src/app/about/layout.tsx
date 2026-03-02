import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "About Phosra — The Child Safety Infrastructure Layer",
  description: "Founded by parents who build platforms. Three exits in fintech, now building the open spec for universal child safety enforcement.",
  openGraph: {
    title: "About Phosra — The Child Safety Infrastructure Layer",
    description: "Founded by parents who build platforms. Three exits in fintech, now building the open spec for universal child safety enforcement.",
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
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
